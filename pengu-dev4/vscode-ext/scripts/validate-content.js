// Usage (from repo root): node vscode-ext/scripts/validate-content.js
// Validates /content/manifest.json against CONTRACT section 4. Exit code 1 on problems.
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'content'));
const problems = [];
let m;
try { m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8').replace(/^\uFEFF/, '')); }
catch (e) { console.error('Cannot read manifest.json: ' + e.message); process.exit(1); }
if (m.version !== 1) problems.push('version should be 1');
if (!Array.isArray(m.courses) || !m.courses.length) problems.push('courses[] missing or empty');
const ids = new Set();
for (const c of m.courses || []) {
  for (const k of ['id', 'title', 'folder', 'description', 'track']) if (!c[k]) problems.push(`course ${c.id || '?'}: missing ${k}`);
  if (ids.has(c.id)) problems.push('duplicate course id ' + c.id); ids.add(c.id);
  const cdir = path.join(root, c.folder || '_');
  if (!fs.existsSync(cdir)) { problems.push('missing course folder ' + c.folder); continue; }
  try {
    const mk = JSON.parse(fs.readFileSync(path.join(cdir, '.pengu-course.json'), 'utf8').replace(/^\uFEFF/, ''));
    if (mk.courseId !== c.id) problems.push(`${c.folder}/.pengu-course.json courseId "${mk.courseId}" != "${c.id}"`);
  } catch (e) { problems.push(`${c.folder}/.pengu-course.json unreadable`); }
  const lids = new Set();
  for (const l of c.lessons || []) {
    for (const k of ['id', 'title', 'folder']) if (!l[k]) problems.push(`${c.id}: lesson missing ${k}`);
    if (lids.has(l.id)) problems.push(`${c.id}: duplicate lesson id ${l.id}`); lids.add(l.id);
    if (!Array.isArray(l.concepts) || l.concepts.some(x => !/^[a-z0-9_]+$/.test(x))) problems.push(`${c.id}/${l.id}: concepts must be lowercase snake_case`);
    if (typeof l.difficulty !== 'number') problems.push(`${c.id}/${l.id}: difficulty must be a number`);
    const ldir = path.join(cdir, l.folder || '_');
    if (!fs.existsSync(ldir)) { problems.push(`missing lesson folder ${c.folder}/${l.folder}`); continue; }
    if (!fs.existsSync(path.join(ldir, 'README.md'))) problems.push(`${c.folder}/${l.folder}: no README.md`);
    if (fs.readdirSync(ldir).filter(f => f.toLowerCase() !== 'readme.md').length === 0) problems.push(`${c.folder}/${l.folder}: no starter files`);
  }
  if (!(c.lessons || []).length) problems.push(`course ${c.id} has no lessons`);
}
if (problems.length) { console.error('PROBLEMS:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('OK: ' + m.courses.length + ' course(s), ' + m.courses.reduce((n, c) => n + c.lessons.length, 0) + ' lesson(s)');
