// POST /chat: short in-character pet reply, aware of recent mistakes.
const fs = require('fs');
const path = require('path');
const config = require('./config');
const llm = require('./llm');
const guard = require('./guard');
const limits = require('./limits');
const store = require('./store');

const SYSTEM = fs.readFileSync(path.join(config.promptsDir, 'chat.system.md'), 'utf8');
const MAX_WORDS = 20;

const STUB_REPLIES = [
  "Let's waddle through it together. What have you tried so far?",
  'Good question! What would happen on the smallest possible input?',
  'Try tracing it by hand with three items. What do you notice?',
];

async function chat({ userId, message, courseId }) {
  if (!llm.enabled() || limits.check(userId, { kind: 'chat' })) {
    return { reply: STUB_REPLIES[Math.floor(Math.random() * STUB_REPLIES.length)] };
  }
  limits.record(userId, { kind: 'chat' });

  const recurring = (await store.mistakeCounts(userId)).slice(0, 3);
  const context = recurring.length
    ? `Learner's recent mistakes: ${recurring.map((m) => `${m.type} (${m.concept}) x${m.count}`).join(', ')}.`
    : 'No mistake history yet.';
  try {
    const text = await llm.complete(
      [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `${context}${courseId ? ` Current course: ${courseId}.` : ''}\nLearner says: ${message}` },
      ],
      { json: true, maxTokens: 120 },
    );
    // Only trust the JSON field: free reasoning models sometimes leak their thinking as plain text.
    const reply = llm.parseJson(text)?.reply;
    if (typeof reply !== 'string' || !reply.trim()) throw new Error(`no reply field: ${text.slice(0, 80)}`);
    return { reply: guard.clean(reply, MAX_WORDS) };
  } catch (err) {
    console.warn('[chat] llm failed:', err.message);
    return { reply: STUB_REPLIES[0] };
  }
}

module.exports = { chat };
