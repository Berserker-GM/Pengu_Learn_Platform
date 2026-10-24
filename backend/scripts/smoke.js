// Usage: node scripts/smoke.js [baseUrl]   (default http://localhost:8787)
// Hits every endpoint with contract-shaped payloads and prints the responses.
const base = process.argv[2] || 'http://localhost:8787';
const userId = '00000000-smoke-test-0000-000000000001';

async function call(method, path, body) {
  const t = Date.now();
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  console.log(`${method} ${path} -> ${res.status} (${Date.now() - t} ms)\n${JSON.stringify(json, null, 2)}\n`);
  return json;
}

const snapshot = {
  userId,
  courseId: 'dsa',
  filePath: 'binary-search/solution.py',
  languageId: 'python',
  content: [
    'def binary_search(nums, target):',
    '    lo, hi = 0, len(nums)',
    '    while lo <= hi:',
    '        mid = (lo + hi) // 2',
    '        if nums[mid] == target:',
    '            return mid',
    '        elif nums[mid] < target:',
    '            lo = mid + 1',
    '        else:',
    '            hi = mid - 1',
    '    return -1',
  ].join('\n'),
  diagnostics: [],
  trigger: 'idle',
  timestamp: new Date().toISOString(),
};

(async () => {
  const health = await call('GET', '/health');
  if (!health.ok) process.exit(1);
  const first = await call('POST', '/snapshot', snapshot);
  await call('POST', '/snapshot', snapshot); // duplicate
  await call('POST', '/snapshot', {
    ...snapshot,
    filePath: 'two-pointers/solution.js',
    languageId: 'javascript',
    content: 'function twoSumSorted(nums, target) {\n  for (let i = 0; i < nums.length; i++ {\n  }\n}',
    diagnostics: [{ message: "')' expected.", severity: 'error', line: 2, source: 'ts' }],
    trigger: 'error',
  });
  await call('POST', '/chat', { userId, message: 'How do I avoid off by one errors?' });
  await new Promise((r) => setTimeout(r, 1500)); // writes are async
  await call('GET', `/progress/${userId}`);
  if (!first.reviewed) console.log('NOTE: first snapshot was not reviewed (rate limit from a previous run?)');
})().catch((err) => {
  console.error('smoke failed:', err.message);
  process.exit(1);
});
