const test = require('node:test');
const assert = require('node:assert');
const guard = require('../src/guard');
const { parseJson } = require('../src/llm');
const { normalize } = require('../src/review');
const { repeatedBugs } = require('../src/audit');
const limits = require('../src/limits');

test('guard accepts a short Socratic question', () => {
  assert.ok(guard.checkQuestion('What does mid become when the list has one element?').ok);
});

test('guard rejects fixes, code and multiple questions', () => {
  assert.equal(guard.checkQuestion('Change hi to len(nums) - 1?').ok, false);
  assert.equal(guard.checkQuestion('Try mid = (lo + hi) // 2?').ok, false);
  assert.equal(guard.checkQuestion('Why? And why not?').ok, false);
  assert.equal(guard.checkQuestion('Look at line 3.').ok, false);
});

test('clean strips markdown and caps words', () => {
  const out = guard.clean('**Hey** `x` ' + 'word '.repeat(40));
  assert.ok(!out.includes('*') && !out.includes('`'));
  assert.ok(guard.wordCount(out) <= 25);
});

test('parseJson tolerates fences and trailing commas', () => {
  assert.deepEqual(parseJson('```json\n{"a": [1,2,],}\n```'), { a: [1, 2] });
  assert.equal(parseJson('no json here'), null);
});

test('normalize repairs model output into the contract shape', () => {
  const s = { courseId: 'dsa', filePath: 'binary-search/solution.py', diagnostics: [] };
  const out = normalize({ mistakes: [{ type: 'Off By One', concept: 'Array Indexing', evidence: 'hi = len(nums)' }], question: 'Replace hi with len(nums) - 1?', severity: 'weird' }, s);
  assert.equal(out.mistakes[0].type, 'off_by_one');
  assert.equal(out.mistakes[0].concept, 'array_indexing');
  assert.equal(out.severity, 'medium');
  assert.ok(out.question && guard.checkQuestion(out.question).ok, `guard fallback question: ${out.question}`);
});

test('repeatedBugs counts consecutive attempts with the same mistake per file', () => {
  const m = (type) => [{ type, concept: 'x' }];
  const attempts = [
    { filePath: 'a.py', mistakes: m('off_by_one') },
    { filePath: 'a.py', mistakes: m('off_by_one') },
    { filePath: 'a.py', mistakes: m('off_by_one') },
    { filePath: 'a.py', mistakes: [] },
    { filePath: 'b.py', mistakes: m('syntax_error') },
  ];
  assert.deepEqual(repeatedBugs(attempts), [{ type: 'off_by_one', filePath: 'a.py', streak: 3 }]);
});

test('limits: 30 s window, error trigger bypass after 10 s', () => {
  const t0 = 1_000_000_000;
  assert.equal(limits.check('u-limits-1', {}, t0), null);
  limits.record('u-limits-1', {}, t0);
  assert.equal(limits.check('u-limits-1', {}, t0 + 5000), 'rate_limited');
  assert.equal(limits.check('u-limits-1', { trigger: 'error' }, t0 + 5000), 'rate_limited');
  assert.equal(limits.check('u-limits-1', { trigger: 'error' }, t0 + 11000), null);
  assert.equal(limits.check('u-limits-1', {}, t0 + 31000), null);
});

test('limits: idle trigger (user stopped typing) also passes after 10 s', () => {
  const t0 = 2_000_000_000;
  limits.record('u-limits-2', {}, t0);
  assert.equal(limits.check('u-limits-2', { trigger: 'idle' }, t0 + 5000), 'rate_limited');
  assert.equal(limits.check('u-limits-2', { trigger: 'idle' }, t0 + 11000), null);
  assert.equal(limits.check('u-limits-2', { trigger: 'interval' }, t0 + 11000), 'rate_limited');
});
