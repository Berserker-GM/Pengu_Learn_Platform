// OpenRouter client: one call, primary model then fallback, JSON extraction + light repair.
const config = require('./config');

const URL = 'https://openrouter.ai/api/v1/chat/completions';

// Global daily request budget (every model attempt counts, fallbacks included). Resets at UTC midnight.
const budget = { day: '', used: 0 };
function spend() {
  const day = new Date().toISOString().slice(0, 10);
  if (budget.day !== day) Object.assign(budget, { day, used: 0 });
  if (budget.used >= config.llmDailyCap) throw new Error('daily LLM budget exhausted');
  budget.used += 1;
}

function enabled() {
  return Boolean(config.openrouterKey) && !config.forceStub;
}

function budgetStatus() {
  const day = new Date().toISOString().slice(0, 10);
  return { used: budget.day === day ? budget.used : 0, cap: config.llmDailyCap };
}

async function callModel(model, messages, { json, maxTokens, timeoutMs }) {
  spend();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${config.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Vansh-Baranwal/Pengu_Learn_Platform',
        'X-Title': 'Pengu',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        // Free reasoning models spend tokens thinking first; keep it short and out of the content.
        // Hidden reasoning tokens count toward max_tokens; 1000 truncated the JSON mid-answer.
        max_tokens: Math.max(maxTokens, 3000),
        reasoning: { effort: 'low', exclude: true },
        // json_object mode makes some free models return empty content; the prompt asks for JSON and parseJson extracts it.
        ...(json && process.env.LLM_JSON_MODE === '1' ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`openrouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    const text = body.choices?.[0]?.message?.content;
    if (!text) throw new Error('openrouter: empty completion');
    if (body.choices[0].finish_reason === 'length') console.warn(`[llm] ${model} hit max_tokens (usage ${JSON.stringify(body.usage)})`);
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// Returns raw text from the first model that answers. Throws if both fail.
async function complete(messages, { json = false, maxTokens = 300 } = {}) {
  let lastErr;
  const attempts = [
    [config.model, config.llmTimeoutMs],
    [config.fallbackModel, config.llmFallbackTimeoutMs],
  ];
  for (const [model, timeoutMs] of attempts) {
    try {
      return await callModel(model, messages, { json, maxTokens, timeoutMs });
    } catch (err) {
      lastErr = err;
      console.warn(`[llm] ${model} failed: ${err.message}`);
      if (/budget exhausted/.test(err.message)) break;
    }
  }
  throw lastErr;
}

// Pull the first JSON object out of model text, tolerating fences and trailing commas.
function parseJson(text) {
  if (!text) return null;
  const stripped = text.replace(/```(?:json)?/gi, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const raw = stripped.slice(start, end + 1);
  for (const candidate of [raw, raw.replace(/,\s*([}\]])/g, '$1')]) {
    try {
      return JSON.parse(candidate);
    } catch {
      /* try next repair */
    }
  }
  return null;
}

module.exports = { enabled, complete, parseJson, budgetStatus };
