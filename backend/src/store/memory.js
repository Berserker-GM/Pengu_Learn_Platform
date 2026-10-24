// In-memory store with the same interface as the FalkorDB store. Used when FalkorDB is not configured
// or unreachable. Data is lost on restart; fine for the stub and for local dev.

const attempts = []; // newest last
const mastery = new Map(); // `${userId}|${concept}` -> score

const kind = 'memory';

async function init() {}

async function recordAttempt(a) {
  attempts.push(a);
  for (const [concept, delta] of a.masteryDeltas) {
    const key = `${a.userId}|${concept}`;
    const cur = mastery.has(key) ? mastery.get(key) : 0.5;
    mastery.set(key, Math.max(0, Math.min(1, cur + delta)));
  }
}

function userAttempts(userId) {
  return attempts.filter((a) => a.userId === userId);
}

async function recentAttempts(userId, limit = 20) {
  return userAttempts(userId)
    .slice(-limit)
    .reverse()
    .map(({ attemptId, courseId, filePath, ts, severity, mistakes }) => ({ attemptId, courseId, filePath, ts, severity, mistakes }));
}

async function mistakeCounts(userId) {
  const by = new Map();
  for (const a of userAttempts(userId)) {
    for (const m of a.mistakes) {
      const key = `${m.type}|${m.concept}`;
      const cur = by.get(key) || { type: m.type, concept: m.concept, count: 0, lastSeen: a.ts };
      cur.count += 1;
      if (a.ts > cur.lastSeen) cur.lastSeen = a.ts;
      by.set(key, cur);
    }
  }
  return [...by.values()].sort((x, y) => y.count - x.count);
}

async function conceptStats(userId) {
  const by = new Map();
  for (const a of userAttempts(userId)) for (const m of a.mistakes) by.set(m.concept, (by.get(m.concept) || 0) + 1);
  for (const [key, score] of mastery) {
    const [uid, concept] = key.split('|');
    if (uid === userId && !by.has(concept)) by.set(concept, 0);
  }
  return [...by.entries()].map(([concept, n]) => ({
    concept,
    mistakes: n,
    mastery: mastery.has(`${userId}|${concept}`) ? mastery.get(`${userId}|${concept}`) : 0.5,
  }));
}

async function courseStats(userId) {
  const out = {};
  for (const a of userAttempts(userId)) {
    const c = (out[a.courseId] ||= { files: new Set(), attempts: 0, lastActivity: null });
    c.files.add(a.filePath);
    c.attempts += 1;
    if (!c.lastActivity || a.ts > c.lastActivity) c.lastActivity = a.ts;
  }
  for (const k of Object.keys(out)) out[k] = { filesTouched: out[k].files.size, attempts: out[k].attempts, lastActivity: out[k].lastActivity };
  return out;
}

module.exports = { kind, init, recordAttempt, recentAttempts, mistakeCounts, conceptStats, courseStats };
