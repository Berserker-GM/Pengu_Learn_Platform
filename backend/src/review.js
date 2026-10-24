// POST /snapshot pipeline: dedupe -> rate limit -> LLM (or stub) -> validate + guard -> persist -> respond.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const llm = require('./llm');
const guard = require('./guard');
const limits = require('./limits');
const store = require('./store');
const content = require('./content');

const SYSTEM = fs.readFileSync(path.join(config.promptsDir, 'review.system.md'), 'utf8');
const PROMPT_VERSION = fs.readFileSync(path.join(config.promptsDir, 'VERSION'), 'utf8').trim();
const CONCEPT_IDS = Object.keys(content.concepts).join(', ');
const MAX_CODE_CHARS = 12000;
const SEVERITIES = ['none', 'low', 'medium', 'high'];

const lastHash = new Map(); // `${userId}|${courseId}|${filePath}` -> sha256

const notReviewed = (reason) => ({ reviewed: false, question: null, mistakes: [], severity: 'none', reason });

function snake(s, fallback) {
  const v = String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  return v || fallback;
}

function numbered(code) {
  const text = code.length > MAX_CODE_CHARS ? code.slice(0, MAX_CODE_CHARS) + '\n…(truncated)' : code;
  return text.split('\n').map((line, i) => `${i + 1}| ${line}`).join('\n');
}

function buildUserPrompt(s, recurring) {
  const lesson = content.findLesson(s.courseId, s.filePath);
  const readme = content.lessonReadme(s.courseId, s.filePath);
  const diags = s.diagnostics.length
    ? s.diagnostics.map((d) => `- line ${d.line} [${d.severity}] ${d.message}`).join('\n')
    : '(none)';
  const history = recurring.length
    ? recurring.slice(0, 5).map((m) => `${m.type} (${m.concept}) x${m.count}`).join(', ')
    : '(none yet)';
  return [
    `Course: ${s.courseId}` + (lesson ? ` | Lesson: ${lesson.title} (concepts: ${lesson.concepts.join(', ')})` : ''),
    readme ? `Problem statement:\n"""\n${readme}\n"""` : '',
    `File: ${s.filePath} (${s.languageId}) | trigger: ${s.trigger}`,
    `Editor diagnostics:\n${diags}`,
    `Learner's recurring mistakes: ${history}`,
    `Concept list: ${CONCEPT_IDS}`,
    `Code:\n"""\n${numbered(s.content)}\n"""`,
  ].filter(Boolean).join('\n\n');
}

// Normalize whatever the model returned into the contract shape.
function normalize(obj, s) {
  const mistakes = (Array.isArray(obj?.mistakes) ? obj.mistakes : [])
    .slice(0, 3)
    .map((m) => ({
      type: snake(m?.type, 'logic_error'),
      concept: snake(m?.concept, 'debugging_by_tracing'),
      evidence: guard.clean(m?.evidence || '', 15),
    }));
  let severity = SEVERITIES.includes(obj?.severity) ? obj.severity : mistakes.length ? 'medium' : 'none';
  let question = typeof obj?.question === 'string' ? obj.question.trim() : null;
  if (question && !guard.checkQuestion(question).ok) {
    console.warn(`[review] guard rejected (${guard.checkQuestion(question).reason}): ${question}`);
    question = (mistakes[0] && content.seedQuestion(mistakes[0].concept)) || fallbackQuestion(s);
  }
  if (!mistakes.length && !question) severity = 'none';
  return { mistakes, question: question ? guard.clean(question) : null, severity };
}

function fallbackQuestion(s) {
  const err = s.diagnostics.find((d) => d.severity === 'error');
  return err ? `Your editor is unhappy about line ${err.line}. What do you think it is trying to tell you?` : null;
}

// No API key (or STUB=1): deterministic, cheap, good enough for integration.
function stubReview(s) {
  const err = s.diagnostics.find((d) => d.severity === 'error');
  if (err) {
    return {
      mistakes: [{ type: 'editor_error', concept: 'reading_error_messages', evidence: guard.clean(err.message, 15) }],
      question: fallbackQuestion(s),
      severity: 'high',
    };
  }
  const lesson = content.findLesson(s.courseId, s.filePath);
  const concept = lesson?.concepts?.[0] || 'edge_cases';
  return {
    mistakes: [],
    question: content.seedQuestion(concept) || 'What is the smallest input you could test this with right now?',
    severity: 'low',
  };
}

async function review(s) {
  if (!s.content.trim()) return notReviewed('empty');

  const key = `${s.userId}|${s.courseId}|${s.filePath}`;
  const hash = crypto.createHash('sha256').update(s.content).digest('hex');
  if (lastHash.get(key) === hash && s.trigger !== 'error') return notReviewed('duplicate');

  const limited = limits.check(s.userId, { trigger: s.trigger, kind: 'review' });
  if (limited) return notReviewed(limited);
  limits.record(s.userId, { kind: 'review' });
  lastHash.set(key, hash);

  let result;
  if (llm.enabled()) {
    try {
      const recurring = await store.mistakeCounts(s.userId);
      const text = await llm.complete(
        [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: buildUserPrompt(s, recurring) },
        ],
        { json: true, maxTokens: 350 },
      );
      const parsed = llm.parseJson(text);
      if (!parsed) throw new Error(`unparseable model output: ${text.slice(0, 120)}`);
      result = normalize(parsed, s);
    } catch (err) {
      console.warn('[review] llm failed, using stub:', err.message);
      result = stubReview(s);
    }
  } else {
    result = stubReview(s);
  }

  const attemptId = `a_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const lesson = content.findLesson(s.courseId, s.filePath);
  const masteryDeltas = result.mistakes.length
    ? [...new Set(result.mistakes.map((m) => m.concept))].map((c) => [c, -0.15])
    : result.severity === 'none' ? (lesson?.concepts || []).map((c) => [c, 0.1]) : [];

  store
    .recordAttempt({
      attemptId,
      userId: s.userId,
      courseId: s.courseId,
      filePath: s.filePath,
      lessonId: content.lessonId(s.courseId, s.filePath),
      languageId: s.languageId,
      trigger: s.trigger,
      contentHash: hash,
      ts: s.timestamp,
      promptVersion: PROMPT_VERSION,
      masteryDeltas,
      ...result,
    })
    .catch((err) => console.warn('[review] persist failed:', err.message));

  return { reviewed: true, ...result, reason: null, attemptId };
}

module.exports = { review, normalize, buildUserPrompt };
