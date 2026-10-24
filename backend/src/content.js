// Read-only access to /content (manifest, lesson READMEs) and the concept taxonomy. All optional.
const fs = require('fs');
const path = require('path');
const config = require('./config');

let manifest = { courses: [] };
try {
  manifest = JSON.parse(fs.readFileSync(path.join(config.contentDir, 'manifest.json'), 'utf8'));
} catch {
  console.warn('[content] manifest not found; lesson context disabled');
}

const concepts = JSON.parse(fs.readFileSync(path.join(config.promptsDir, 'concepts.json'), 'utf8'));

function findCourse(courseId) {
  return manifest.courses.find((c) => c.id === courseId);
}

// "binary-search/solution.py" -> lesson folder "binary-search"
function lessonFolderOf(filePath) {
  const parts = String(filePath || '').split('/').filter(Boolean);
  return parts.length > 1 ? parts[0] : '_root';
}

function lessonId(courseId, filePath) {
  return `${courseId}/${lessonFolderOf(filePath)}`;
}

function findLesson(courseId, filePath) {
  const course = findCourse(courseId);
  if (!course) return null;
  return course.lessons.find((l) => l.folder === lessonFolderOf(filePath)) || null;
}

const readmeCache = new Map();
function lessonReadme(courseId, filePath, maxChars = 1500) {
  const course = findCourse(courseId);
  const lesson = findLesson(courseId, filePath);
  if (!course || !lesson) return '';
  const p = path.join(config.contentDir, course.folder, lesson.folder, 'README.md');
  if (!readmeCache.has(p)) {
    try {
      readmeCache.set(p, fs.readFileSync(p, 'utf8').slice(0, maxChars));
    } catch {
      readmeCache.set(p, '');
    }
  }
  return readmeCache.get(p);
}

function seedQuestion(concept) {
  const qs = concepts[concept]?.questions || [];
  return qs.length ? qs[Math.floor(Math.random() * qs.length)] : null;
}

module.exports = { manifest, concepts, findLesson, lessonId, lessonReadme, seedQuestion };
