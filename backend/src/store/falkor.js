// FalkorDB store. Graph model (docs/GRAPH.md):
//   Causal:   (:Attempt)-[:MADE_MISTAKE {evidence, concept}]->(:Mistake)-[:CAUSED_BY_GAP_IN]->(:Concept)
//   Temporal: (:Attempt)-[:PREVIOUS_ATTEMPT]->(:Attempt), (:Student)-[:LAST_ATTEMPT]->(:Attempt) head pointer
//   Entity:   (:Student)-[:MADE]->(:Attempt)-[:ON_LESSON]->(:Lesson)-[:TEACHES]->(:Concept),
//             (:Student)-[:MASTERED {score}]->(:Concept), (:Concept)-[:REQUIRES]->(:Concept)
const { FalkorDB } = require('falkordb');
const config = require('../config');
const content = require('../content');

const kind = 'falkordb';
const iso = (ms) => (ms == null ? null : new Date(Number(ms)).toISOString());
let graph = null;

const SCHEMA = [
  'CREATE INDEX FOR (s:Student) ON (s.id)',
  'CREATE INDEX FOR (a:Attempt) ON (a.id)',
  'CREATE INDEX FOR (m:Mistake) ON (m.id)',
  'CREATE INDEX FOR (c:Concept) ON (c.id)',
  'CREATE INDEX FOR (l:Lesson) ON (l.id)',
];

async function q(query, params = {}) {
  const res = await graph.query(query, { params, TIMEOUT: 5000 });
  return rows(res);
}

// The client returns rows as objects keyed by column; older versions return arrays + headers.
function rows(res) {
  const data = res?.data || [];
  if (!data.length || !Array.isArray(data[0])) return data;
  const headers = (res.headers || []).map((h) => (Array.isArray(h) ? h[1] : h));
  return data.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

async function init() {
  const { url, host, port, username, password } = config.falkor;
  const opts = url
    ? { url }
    : { socket: { host, port, ...(process.env.FALKORDB_TLS === '1' ? { tls: true } : {}) }, username, password };
  const db = await FalkorDB.connect(opts);
  db.on?.('error', (err) => console.warn('[falkor] client error:', err.message));
  graph = db.selectGraph(config.falkor.graph);

  for (const stmt of SCHEMA) {
    try {
      await graph.query(stmt);
    } catch (err) {
      if (!/already (exists|indexed)/i.test(err.message)) console.warn('[falkor] schema:', err.message);
    }
  }

  // Seed the concept prerequisite graph and lesson->concept edges (idempotent MERGEs).
  const requires = Object.entries(content.concepts).flatMap(([id, c]) => c.requires.map((r) => ({ id, r })));
  await q(
    `UNWIND $concepts AS c MERGE (n:Concept {id: c.id}) SET n.name = c.name`,
    { concepts: Object.entries(content.concepts).map(([id, c]) => ({ id, name: c.name })) },
  );
  await q(
    `UNWIND $edges AS e MATCH (a:Concept {id: e.id}), (b:Concept {id: e.r}) MERGE (a)-[:REQUIRES]->(b)`,
    { edges: requires },
  );
  const teaches = content.manifest.courses.flatMap((course) =>
    course.lessons.map((l) => ({ id: `${course.id}/${l.folder}`, courseId: course.id, title: l.title, concepts: l.concepts })),
  );
  await q(
    `UNWIND $lessons AS l
     MERGE (n:Lesson {id: l.id}) SET n.courseId = l.courseId, n.title = l.title
     WITH n, l UNWIND l.concepts AS cid
     MERGE (c:Concept {id: cid})
     MERGE (n)-[:TEACHES]->(c)`,
    { lessons: teaches },
  );
}

async function recordAttempt(a) {
  await q(
    `MERGE (s:Student {id: $userId}) ON CREATE SET s.createdAt = $ts
     MERGE (l:Lesson {id: $lessonId}) ON CREATE SET l.courseId = $courseId
     CREATE (at:Attempt {id: $attemptId, userId: $userId, courseId: $courseId, filePath: $filePath,
       languageId: $languageId, trigger: $trigger, contentHash: $contentHash, severity: $severity,
       question: $question, ts: $ts, tsMs: $tsMs, promptVersion: $promptVersion})
     CREATE (s)-[:MADE]->(at)
     CREATE (at)-[:ON_LESSON]->(l)`,
    {
      userId: a.userId, ts: a.ts, lessonId: a.lessonId, courseId: a.courseId, attemptId: a.attemptId,
      filePath: a.filePath, languageId: a.languageId, trigger: a.trigger, contentHash: a.contentHash,
      severity: a.severity, question: a.question || '', promptVersion: a.promptVersion, tsMs: Date.parse(a.ts),
    },
  );
  // Temporal chain: link to the previous head, then move the head pointer.
  await q(
    `MATCH (s:Student {id: $userId})-[lp:LAST_ATTEMPT]->(prev:Attempt), (at:Attempt {id: $attemptId})
     CREATE (at)-[:PREVIOUS_ATTEMPT]->(prev)
     DELETE lp`,
    { userId: a.userId, attemptId: a.attemptId },
  );
  await q(
    `MATCH (s:Student {id: $userId}), (at:Attempt {id: $attemptId}) CREATE (s)-[:LAST_ATTEMPT]->(at)`,
    { userId: a.userId, attemptId: a.attemptId },
  );
  if (a.mistakes.length) {
    await q(
      `MATCH (at:Attempt {id: $attemptId})
       UNWIND $mistakes AS m
       MERGE (mk:Mistake {id: m.type})
       MERGE (c:Concept {id: m.concept})
       MERGE (mk)-[:CAUSED_BY_GAP_IN]->(c)
       CREATE (at)-[:MADE_MISTAKE {evidence: m.evidence, concept: m.concept}]->(mk)`,
      { attemptId: a.attemptId, mistakes: a.mistakes },
    );
  }
  if (a.masteryDeltas.length) {
    await q(
      `MATCH (s:Student {id: $userId})
       UNWIND $deltas AS d
       MERGE (c:Concept {id: d.concept})
       MERGE (s)-[r:MASTERED]->(c) ON CREATE SET r.score = 0.5
       WITH r, d, r.score + d.delta AS next
       SET r.score = CASE WHEN next > 1.0 THEN 1.0 WHEN next < 0.0 THEN 0.0 ELSE next END, r.updatedAt = $ts`,
      { userId: a.userId, ts: a.ts, deltas: a.masteryDeltas.map(([concept, delta]) => ({ concept, delta })) },
    );
  }
}

async function recentAttempts(userId, limit = 20) {
  const out = await q(
    `MATCH (:Student {id: $userId})-[:MADE]->(a:Attempt)
     WITH a ORDER BY a.tsMs DESC LIMIT $limit
     OPTIONAL MATCH (a)-[r:MADE_MISTAKE]->(m:Mistake)
     WITH a, collect({type: m.id, concept: r.concept}) AS mistakes
     RETURN a.id AS attemptId, a.courseId AS courseId, a.filePath AS filePath, a.ts AS ts,
            a.severity AS severity, a.tsMs AS tsMs, mistakes
     ORDER BY tsMs DESC`,
    { userId, limit },
  );
  return out.map((r) => ({ ...r, mistakes: (r.mistakes || []).filter((m) => m && m.type) }));
}

async function mistakeCounts(userId) {
  const out = await q(
    `MATCH (:Student {id: $userId})-[:MADE]->(a:Attempt)-[r:MADE_MISTAKE]->(m:Mistake)
     RETURN m.id AS type, r.concept AS concept, count(*) AS count, max(a.tsMs) AS lastSeenMs
     ORDER BY count DESC LIMIT 20`,
    { userId },
  );
  return out.map(({ lastSeenMs, ...r }) => ({ ...r, lastSeen: iso(lastSeenMs) }));
}

async function conceptStats(userId) {
  return q(
    `MATCH (s:Student {id: $userId})-[:MADE]->(:Attempt)-[r:MADE_MISTAKE]->(:Mistake)
     WITH s, r.concept AS concept, count(*) AS mistakes
     OPTIONAL MATCH (s)-[ms:MASTERED]->(:Concept {id: concept})
     RETURN concept, mistakes, coalesce(ms.score, 0.5) AS mastery`,
    { userId },
  );
}

async function courseStats(userId) {
  const out = await q(
    `MATCH (:Student {id: $userId})-[:MADE]->(a:Attempt)
     RETURN a.courseId AS courseId, count(DISTINCT a.filePath) AS filesTouched, count(a) AS attempts, max(a.tsMs) AS lastActivityMs`,
    { userId },
  );
  return Object.fromEntries(out.map((r) => [r.courseId, { filesTouched: r.filesTouched, attempts: r.attempts, lastActivity: iso(r.lastActivityMs) }]));
}

module.exports = { kind, init, recordAttempt, recentAttempts, mistakeCounts, conceptStats, courseStats };
