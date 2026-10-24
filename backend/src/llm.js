// OpenRouter client: one call, primary model then fallback, JSON extraction + light repair.
const config = require('./config');

const URL = 'https://openrouter.ai/api/v1/chat/completions';

function enabled() {
  return Boolean(config.openrouterKey) && !config.forceStub;
}

async function callModel(model, messages, { json, maxTokens }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.llmTimeoutMs);
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
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`openrouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    const text = body.choices?.[0]?.message?.content;
    if (!text) throw new Error('openrouter: empty completion');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// Returns raw text from the first model that answers. Throws if both fail.
async function complete(messages, { json = false, maxTokens = 300 } = {}) {
  let lastErr;
  for (const model of [config.model, config.fallbackModel]) {
    try {
      return await callModel(model, messages, { json, maxTokens });
    } catch (err) {
      lastErr = err;
      console.warn(`[llm] ${model} failed: ${err.message}`);
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

module.exports = { enabled, complete, parseJson };
