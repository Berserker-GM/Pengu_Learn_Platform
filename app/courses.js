const fs = require('fs');
const path = require('path');

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

module.exports = {
  bundledCoursePath,
  courseProgress,
  findCourse,
  loadManifest,
  userCoursePath,
};
