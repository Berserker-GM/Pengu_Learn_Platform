// GET /progress/:userId: course stats + audit built from graph queries. No LLM (fast, free).
const store = require('./store');
const content = require('./content');

const TIPS = {
  syntax_error: 'Read the first editor error top to bottom before changing anything.',
  editor_error: 'Read the first editor error top to bottom before changing anything.',
  off_by_one: 'Trace your loop bounds on a 0, 1 and 2 element input before running.',
  infinite_loop: 'For every loop, name the variable that moves closer to the exit each pass.',
  missing_base_case: 'Write the base case first, then the recursive step.',
  unhandled_edge_case: 'List empty, single-element and max-size inputs before you code.',
  wrong_data_structure: 'Say out loud which operations you need, then pick the structure that makes them O(1).',
  inefficient_algorithm: 'State the time complexity before coding; check it against the input size.',
  mutation_during_iteration: 'Never modify a collection while looping over it; build a new one.',
  null_dereference: 'Ask "can this be null/empty here?" at every pointer or index access.',
  wrong_condition: 'Test each branch of your conditions with one concrete value.',
  missing_requirement: 'Start every design with functional + non-functional requirements.',
  single_point_of_failure: 'For each box in your diagram, ask what happens when it dies.',
  no_capacity_estimate: 'Estimate QPS and storage before choosing components.',
};

function repeatedBugs(attempts) {
  // attempts are newest first. Per file: how many consecutive latest attempts share each mistake type.
  const byFile = new Map();
  for (const a of attempts) {
    if (!byFile.has(a.filePath)) byFile.set(a.filePath, []);
    byFile.get(a.filePath).push(a);
  }
  const out = [];
  for (const [filePath, list] of byFile) {
    for (const type of new Set(list[0].mistakes.map((m) => m.type))) {
      let streak = 0;
      for (const a of list) {
        if (a.mistakes.some((m) => m.type === type)) streak += 1;
        else break;
      }
      if (streak >= 2) out.push({ type, filePath, streak });
    }
  }
  return out.sort((x, y) => y.streak - x.streak).slice(0, 5);
}

function improveList(recurring, weak) {
  const tips = [];
  for (const m of recurring) if (TIPS[m.type] && !tips.includes(TIPS[m.type])) tips.push(TIPS[m.type]);
  for (const c of weak) {
    const q = content.concepts[c.concept]?.questions?.[0];
    const name = content.concepts[c.concept]?.name || c.concept.replace(/_/g, ' ');
    if (q) tips.push(`Revisit ${name}: ${q}`);
  }
  if (!tips.length) tips.push('Keep coding: Pengu needs a few snapshots before it can spot patterns.');
  return tips.slice(0, 5);
}

async function progress(userId) {
  const [courses, counts, concepts, attempts] = await Promise.all([
    store.courseStats(userId),
    store.mistakeCounts(userId),
    store.conceptStats(userId),
    store.recentAttempts(userId, 50),
  ]);
  const recurringMistakes = counts
    .map((m) => ({ type: m.type, concept: m.concept, count: Number(m.count), lastSeen: m.lastSeen }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 5);
  const weakConcepts = concepts
    .filter((c) => Number(c.mistakes) > 0)
    .map((c) => ({ concept: c.concept, mistakes: Number(c.mistakes), mastery: Math.round(Number(c.mastery) * 100) / 100 }))
    .sort((x, y) => y.mistakes - x.mistakes || x.mastery - y.mastery)
    .slice(0, 5);
  return {
    userId,
    courses,
    audit: {
      totalAttempts: Object.values(courses).reduce((n, c) => n + Number(c.attempts || 0), 0),
      recurringMistakes,
      weakConcepts,
      repeatedBugs: repeatedBugs(attempts),
      improve: improveList(recurringMistakes, weakConcepts),
    },
  };
}

module.exports = { progress, repeatedBugs };
