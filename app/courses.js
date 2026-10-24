const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXTENSION_ID = 'pengu.pengu-watcher';

// Bundled content: ../content in dev, resources/content when packaged (docs/RELEASE.md).
function contentDir(app) {
  return app.isPackaged ? path.join(process.resourcesPath, 'content') : path.join(__dirname, '..', 'content');
}

function userCoursesRoot(app) {
  const home = process.env.USERPROFILE || app.getPath('home');
  return path.join(home, 'PenguLearn');
}

function loadManifest(app) {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(contentDir(app), 'manifest.json'), 'utf8'));
    return Array.isArray(manifest.courses) ? manifest.courses : [];
  } catch (err) {
    return [];
  }
}

function findCourse(app, courseId) {
  return loadManifest(app).find((course) => course && course.id === courseId) || null;
}

function bundledCoursePath(app, course) {
  return path.join(contentDir(app), course.folder);
}

function userCoursePath(app, course) {
  return path.join(userCoursesRoot(app), course.folder);
}

function listFiles(dir, base) {
  let out = [];
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return out;
  }
  for (const entry of entries) {
    const rel = base ? path.join(base, entry.name) : entry.name;
    if (entry.isDirectory()) out = out.concat(listFiles(path.join(dir, entry.name), rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

// CONTRACT §4: a lesson is touched when any file except README.md differs from the bundle, or is new.
function lessonTouched(bundledLesson, userLesson) {
  for (const rel of listFiles(userLesson, '')) {
    if (path.basename(rel).toLowerCase() === 'readme.md') continue;
    let original;
    try {
      original = fs.readFileSync(path.join(bundledLesson, rel));
    } catch (err) {
      return true;
    }
    try {
      if (!original.equals(fs.readFileSync(path.join(userLesson, rel)))) return true;
    } catch (err) {
      continue;
    }
  }
  return false;
}

function courseProgress(app, course) {
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const userRoot = userCoursePath(app, course);
  if (!lessons.length || !fs.existsSync(userRoot)) return 0;
  const bundleRoot = bundledCoursePath(app, course);
  const touched = lessons.filter((lesson) =>
    lessonTouched(path.join(bundleRoot, lesson.folder), path.join(userRoot, lesson.folder))
  ).length;
  return Math.round((touched / lessons.length) * 100);
}

// First Start copies the bundled course; later Starts never overwrite the user's edits (CONTRACT §4).
function ensureUserCopy(app, course) {
  const dest = userCoursePath(app, course);
  if (fs.existsSync(dest)) return dest;
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(bundledCoursePath(app, course), dest, { recursive: true, errorOnExist: true });
  } catch (err) {
    fs.rmSync(dest, { recursive: true, force: true });
    throw err;
  }
  return dest;
}

function quote(arg) {
  return `"${String(arg).replace(/"/g, '')}"`;
}

// code.cmd is a batch file, so it has to run through cmd.exe.
function runCode(codePath, args, timeoutMs) {
  return new Promise((resolve) => {
    execFile(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', `"${[codePath, ...args].map(quote).join(' ')}"`],
      { windowsVerbatimArguments: true, windowsHide: true, timeout: timeoutMs },
      (err, stdout, stderr) => resolve({ ok: !err, stdout: String(stdout || ''), stderr: String(stderr || '') })
    );
  });
}

function whereCode() {
  return new Promise((resolve) => {
    execFile('where', ['code'], { windowsHide: true, timeout: 5000 }, (err, stdout) => {
      if (err) return resolve(null);
      const found = String(stdout).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      resolve(found.find((p) => /\.cmd$/i.test(p)) || null);
    });
  });
}

async function findVsCode() {
  const onPath = await whereCode();
  if (onPath) return onPath;
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft VS Code', 'bin', 'code.cmd'),
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

// Packaged: resources/pengu-watcher-*.vsix (docs/RELEASE.md). Dev: ../vscode-ext/.
function findVsix(app) {
  const dir = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', 'vscode-ext');
  try {
    const name = fs.readdirSync(dir).filter((f) => /^pengu-watcher-.*\.vsix$/i.test(f)).sort().pop();
    return name ? path.join(dir, name) : null;
  } catch (err) {
    return null;
  }
}

async function ensureExtension(app, codePath) {
  const vsix = findVsix(app);
  if (!vsix) {
    console.warn('Pengu extension .vsix not found; skipping install.');
    return true;
  }
  // Reinstall when the bundled version differs from the installed one, so app updates ship extension fixes.
  const version = (path.basename(vsix).match(/^pengu-watcher-(.+)\.vsix$/i) || [])[1] || '';
  const listed = await runCode(codePath, ['--list-extensions', '--show-versions'], 30000);
  const wanted = `${EXTENSION_ID}@${version}`.toLowerCase();
  if (listed.ok && listed.stdout.toLowerCase().split(/\r?\n/).some((l) => l.trim() === wanted)) return true;
  const installed = await runCode(codePath, ['--install-extension', vsix, '--force'], 120000);
  if (!installed.ok) console.error('Extension install failed:', installed.stderr);
  return installed.ok;
}

function openInVsCode(codePath, folder) {
  const child = spawn(
    process.env.ComSpec || 'cmd.exe',
    ['/d', '/s', '/c', `"${[codePath, folder].map(quote).join(' ')}"`],
    { windowsVerbatimArguments: true, windowsHide: true, detached: true, stdio: 'ignore' }
  );
  child.unref();
}

async function startCourse(app, courseId) {
  const course = findCourse(app, courseId);
  if (!course) return { ok: false, code: 'COPY_FAILED', message: `Unknown course "${courseId}".` };

  let folder;
  try {
    folder = ensureUserCopy(app, course);
  } catch (err) {
    return { ok: false, code: 'COPY_FAILED', message: `Could not copy the course files: ${err.message}` };
  }

  const codePath = await findVsCode();
  if (!codePath) {
    return {
      ok: false,
      code: 'NO_VSCODE',
      message: 'VS Code was not found. Install it (keep "Add to PATH" ticked), then restart Pengu.'
    };
  }

  const extensionOk = await ensureExtension(app, codePath);
  openInVsCode(codePath, folder);
  if (!extensionOk) {
    return {
      ok: false,
      code: 'EXT_INSTALL_FAILED',
      message: 'VS Code opened, but the Pengu extension could not be installed, so reviews will not appear.'
    };
  }
  return { ok: true };
}

module.exports = {
  courseProgress,
  findCourse,
  loadManifest,
  startCourse,
  userCoursePath,
};
