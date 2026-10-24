// All runtime config comes from env vars. Secrets never live in the repo.
const path = require('path');

// Local dev: backend/.env (git-ignored). On Render the dashboard env vars are used and this file is absent.
try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  /* no .env */
}

const env = process.env;

module.exports = {
  port: Number(env.PORT || 8787),
  version: require('../package.json').version,
  supabaseUrl: env.SUPABASE_URL || '',
  supabaseSecretKey: env.SUPABASE_SECRET_KEY || '',
  supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',

  openrouterKey: env.OPENROUTER_API_KEY || '',
  // Free-tier models only. Free keys get ~50 free requests/day across all models, hence llmDailyCap.
  model: env.LLM_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  fallbackModel: env.LLM_FALLBACK_MODEL || 'poolside/laguna-xs-2.1:free',
  llmTimeoutMs: Number(env.LLM_TIMEOUT_MS || 25000),
  llmDailyCap: Number(env.LLM_DAILY_CAP || 45),
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
