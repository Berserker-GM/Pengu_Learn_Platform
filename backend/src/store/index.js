// Picks FalkorDB when configured and reachable, otherwise memory. Every call is best-effort:
// a FalkorDB failure is logged and served from memory so /snapshot never fails because of the DB.
const config = require('../config');
const memory = require('./memory');
const falkor = require('./falkor');

let primary = memory;

async function init() {
  if (!config.falkor.url && !config.falkor.host) {
    console.log('[store] FalkorDB not configured; using memory');
    return;
  }
  try {
    await falkor.init();
    primary = falkor;
    console.log('[store] FalkorDB connected, graph:', config.falkor.graph);
  } catch (err) {
    console.warn('[store] FalkorDB unavailable, using memory:', err.message);
  }
}

function wrap(name) {
  return async (...args) => {
    if (name === 'recordAttempt') await memory.recordAttempt(...args); // keep memory warm as a fallback
    if (primary === memory) return name === 'recordAttempt' ? undefined : memory[name](...args);
    try {
      return await primary[name](...args);
    } catch (err) {
      console.warn(`[store] falkor ${name} failed:`, err.message);
      return name === 'recordAttempt' ? undefined : memory[name](...args);
    }
  };
}

module.exports = {
  init,
  kind: () => primary.kind,
  recordAttempt: wrap('recordAttempt'),
  recentAttempts: wrap('recentAttempts'),
  mistakeCounts: wrap('mistakeCounts'),
  conceptStats: wrap('conceptStats'),
  courseStats: wrap('courseStats'),
};
