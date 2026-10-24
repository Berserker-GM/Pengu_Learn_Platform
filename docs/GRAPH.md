# FalkorDB graph (graph name `pengu`) · implemented in `backend/src/store/falkor.js`

## Model (priority order)
1. **Causal (MUST, done)** `(:Attempt)-[:MADE_MISTAKE {evidence, concept}]->(:Mistake {id: type})-[:CAUSED_BY_GAP_IN]->(:Concept {id})`
2. **Temporal (MUST, done)** `(:Attempt)-[:PREVIOUS_ATTEMPT]->(:Attempt)` per student; head pointer `(:Student)-[:LAST_ATTEMPT]->(:Attempt)`
3. **Entity (SHOULD, done)** `(:Student)-[:MADE]->(:Attempt)-[:ON_LESSON]->(:Lesson)-[:TEACHES]->(:Concept)`,
   `(:Student)-[:MASTERED {score 0..1}]->(:Concept)`, `(:Concept)-[:REQUIRES]->(:Concept)` (seeded from `prompts/concepts.json` + `content/manifest.json`)
4. **Semantic (SKIP today)** `(:Chunk {embedding: vecf32(768)})`, `CREATE VECTOR INDEX FOR (c:Chunk) ON (c.embedding) OPTIONS {dimension:768, similarityFunction:'cosine'}`

Node props: `Attempt {id, userId, courseId, filePath, languageId, trigger, contentHash, severity, question, ts, tsMs, promptVersion}`,
`Lesson {id: "<courseId>/<lessonFolder>", courseId, title}`, `Concept {id, name}`, `Student {id, createdAt}`, `Mistake {id}`.
Mastery: mistake on a concept −0.15; clean review (severity none) +0.10 for each concept the lesson teaches; start 0.5.

## Schema
```cypher
CREATE INDEX FOR (s:Student) ON (s.id)
CREATE INDEX FOR (a:Attempt) ON (a.id)
CREATE INDEX FOR (m:Mistake) ON (m.id)
CREATE INDEX FOR (c:Concept) ON (c.id)
CREATE INDEX FOR (l:Lesson)  ON (l.id)
```

## Write path (one reviewed snapshot = 3-5 queries, best-effort)
```cypher
MERGE (s:Student {id:$userId}) ON CREATE SET s.createdAt=$ts
MERGE (l:Lesson {id:$lessonId}) ON CREATE SET l.courseId=$courseId
CREATE (at:Attempt {id:$attemptId, ..., ts:$ts, tsMs:$tsMs})
CREATE (s)-[:MADE]->(at) CREATE (at)-[:ON_LESSON]->(l);

MATCH (s:Student {id:$userId})-[lp:LAST_ATTEMPT]->(prev:Attempt), (at:Attempt {id:$attemptId})
CREATE (at)-[:PREVIOUS_ATTEMPT]->(prev) DELETE lp;
MATCH (s:Student {id:$userId}), (at:Attempt {id:$attemptId}) CREATE (s)-[:LAST_ATTEMPT]->(at);

MATCH (at:Attempt {id:$attemptId}) UNWIND $mistakes AS m
MERGE (mk:Mistake {id:m.type}) MERGE (c:Concept {id:m.concept}) MERGE (mk)-[:CAUSED_BY_GAP_IN]->(c)
CREATE (at)-[:MADE_MISTAKE {evidence:m.evidence, concept:m.concept}]->(mk);

MATCH (s:Student {id:$userId}) UNWIND $deltas AS d
MERGE (c:Concept {id:d.concept}) MERGE (s)-[r:MASTERED]->(c) ON CREATE SET r.score=0.5
WITH r, d, r.score + d.delta AS next
SET r.score = CASE WHEN next > 1.0 THEN 1.0 WHEN next < 0.0 THEN 0.0 ELSE next END;
```

## Audit queries (Progress page)
```cypher
// recurring mistakes
MATCH (:Student {id:$userId})-[:MADE]->(a:Attempt)-[r:MADE_MISTAKE]->(m:Mistake)
RETURN m.id AS type, r.concept AS concept, count(*) AS count, max(a.tsMs) AS lastSeenMs ORDER BY count DESC LIMIT 20

// weakest concepts
MATCH (s:Student {id:$userId})-[:MADE]->(:Attempt)-[r:MADE_MISTAKE]->(:Mistake)
WITH s, r.concept AS concept, count(*) AS mistakes
OPTIONAL MATCH (s)-[ms:MASTERED]->(:Concept {id:concept})
RETURN concept, mistakes, coalesce(ms.score, 0.5) AS mastery

// recent attempts (repeated-bug streaks are computed from these in JS, per file)
MATCH (:Student {id:$userId})-[:MADE]->(a:Attempt) WITH a ORDER BY a.tsMs DESC LIMIT 50
OPTIONAL MATCH (a)-[r:MADE_MISTAKE]->(m:Mistake)
RETURN a.id, a.filePath, a.tsMs, collect({type:m.id, concept:r.concept}) AS mistakes

// same bug repeating across the temporal chain (pure-Cypher variant, for demos)
MATCH (s:Student {id:$userId})-[:LAST_ATTEMPT]->(head:Attempt)
MATCH p=(head)-[:PREVIOUS_ATTEMPT*1..5]->(:Attempt)
WHERE all(x IN nodes(p) WHERE (x)-[:MADE_MISTAKE]->(:Mistake {id:$type}))
RETURN length(p) + 1 AS streak ORDER BY streak DESC LIMIT 1

// root-cause prerequisite for a weak concept
MATCH (c:Concept {id:$concept})-[:REQUIRES*1..3]->(pre:Concept) RETURN DISTINCT pre.id
```
