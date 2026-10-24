// All runtime config comes from env vars. Secrets never live in the repo.
const path = require('path');

const env = process.env;

module.exports = {
  port: Number(env.PORT || 8787),
  version: require('../package.json').version,

  openrouterKey: env.OPENROUTER_API_KEY || '',
  model: env.LLM_MODEL || 'anthropic/claude-haiku-5.5',
  fallbackModel: env.LLM_FALLBACK_MODEL || 'google/gemini-3.1-flash-lite',
  llmTimeoutMs: Number(env.LLM_TIMEOUT_MS || 25000),
  forceStub: env.STUB === '1',

  // FalkorDB Cloud: either FALKORDB_URL (falkor://user:pass@host:port) or host/port/user/pass.
  falkor: {
    url: env.FALKORDB_URL || '',
    host: env.FALKORDB_HOST || '',
    port: Number(env.FALKORDB_PORT || 6379),
    username: env.FALKORDB_USERNAME || undefined,
    password: env.FALKORDB_PASSWORD || undefined,
    graph: env.FALKORDB_GRAPH || 'pengu',
  },

  // Rate limits (CONTRACT §1)
  llmMinIntervalMs: Number(env.LLM_MIN_INTERVAL_MS || 30000),
  errorBypassMinMs: 10000,
  llmHourlyCap: Number(env.LLM_HOURLY_CAP || 60),

  contentDir: env.CONTENT_DIR || path.join(__dirname, '..', '..', 'content'),
  promptsDir: path.join(__dirname, '..', 'prompts'),
};
