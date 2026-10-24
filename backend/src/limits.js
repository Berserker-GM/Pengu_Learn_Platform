// In-memory LLM rate limits (CONTRACT §1). Lost on restart, which is fine.
const config = require('./config');

const HOUR = 3600 * 1000;
const perUser = new Map(); // userId -> { last, calls: [ts] }
let globalCalls = [];
const GLOBAL_HOURLY_CAP = Number(process.env.LLM_GLOBAL_HOURLY_CAP || 3000);

function prune(list, now) {
  return list.filter((t) => now - t < HOUR);
}

// kind: 'review' | 'chat'. Returns null when allowed, else a reason string.
function check(userId, { trigger, kind = 'review' } = {}, now = Date.now()) {
  globalCalls = prune(globalCalls, now);
  if (globalCalls.length >= GLOBAL_HOURLY_CAP) return 'rate_limited';
  const u = perUser.get(userId) || { last: 0, calls: [] };
  u.calls = prune(u.calls, now);
  if (u.calls.length >= config.llmHourlyCap) return 'rate_limited';
  if (kind === 'review') {
    const since = now - u.last;
    const minGap = trigger === 'error' ? config.errorBypassMinMs : config.llmMinIntervalMs;
    if (since < minGap) return 'rate_limited';
  }
  return null;
}

function record(userId, { kind = 'review' } = {}, now = Date.now()) {
  const u = perUser.get(userId) || { last: 0, calls: [] };
  if (kind === 'review') u.last = now;
  u.calls.push(now);
  perUser.set(userId, u);
  globalCalls.push(now);
}

module.exports = { check, record };
