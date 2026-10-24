// Socratic output guard, ported from graphHacks daemon/tutor/guard.py.
// The pet must never hand over code or a direct fix; it asks exactly one short question.

const CODE_BLOCK = /```/;

const DIRECT_FIX = [
  /\b(?:change|replace|substitute|switch)\s+.+?\s+(?:to|with|for|by)\b/i,
  /\b(?:use|try using|consider using)\s+.+?\s+instead of\b/i,
  /\b(?:set|update)\s+[\w.()[\]]+\s+to\s+[^.!?\n]+/i,
  /\b(?:just|simply)\s+(?:write|put|add|insert|delete|remove|change|replace)\b/i,
  /\byou\s+(?:should|need to|must|have to)\s+(?:change|replace|write|put|use|set|return)\b/i,
  /\b(?:the fix|the solution|the correct code)\s+(?:is|would be)\b/i,
];

const CODE_LIKE = [
  /\b(?:let|var|const|val|int|float|double|bool|auto|str|String)\s+[a-zA-Z_]\w*\s*=/i,
  /\b[a-zA-Z_]\w*\s*(?:=|\+=|-=|\*=|\/=|:=)\s*(?:\(|\[|\{|"|'|-?\d+|[a-zA-Z_]\w*\(|[a-zA-Z_]\w*\s*[+\-*/%])/,
  /\b(?:def|function)\s+[a-zA-Z_]\w*\s*\(/i,
  /\breturn\s+(?:-?\d+|true|false|null|none|nil|\w+\s*\([^)]*\)|\w+;)/i,
];

const MAX_WORDS = 25;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Returns { ok: true } or { ok: false, reason }.
function checkQuestion(text) {
  if (!text || !text.trim()) return { ok: false, reason: 'empty' };
  const t = text.trim();
  if (CODE_BLOCK.test(t)) return { ok: false, reason: 'code block' };
  for (const re of DIRECT_FIX) if (re.test(t)) return { ok: false, reason: 'direct fix' };
  for (const re of CODE_LIKE) if (re.test(t)) return { ok: false, reason: 'code' };
  const q = (t.match(/\?/g) || []).length;
  if (q !== 1) return { ok: false, reason: q === 0 ? 'not a question' : 'multiple questions' };
  if (wordCount(t) > MAX_WORDS) return { ok: false, reason: 'too long' };
  return { ok: true };
}

// Client-safe text: no markdown, collapsed whitespace, capped words.
function clean(text, maxWords = MAX_WORDS) {
  if (!text) return '';
  let t = String(text).replace(/```[\s\S]*?```/g, ' ').replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').trim();
  const words = t.split(' ');
  if (words.length > maxWords) t = words.slice(0, maxWords).join(' ').replace(/[,;:.]$/, '') + '…';
  return t;
}

module.exports = { checkQuestion, clean, wordCount, MAX_WORDS };
