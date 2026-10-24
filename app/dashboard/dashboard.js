(function () {
  'use strict';

  var pengu = window.pengu;
  var VSCODE_URL = 'https://code.visualstudio.com/';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function openExternal(url) {
    pengu.send('dash:open-external', { url: url });
  }

  // ---------- tabs ----------
  var views = { courses: document.getElementById('view-courses'), progress: document.getElementById('view-progress') };
  var viewHandlers = {};

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { showView(tab.dataset.view); });
  });

  function showView(name) {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.view === name);
    });
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== name; });
    if (viewHandlers[name]) viewHandlers[name]();
  }

  // ---------- courses ----------
  var list = document.getElementById('course-list');
  var cards = {};

  function setProgress(card, progress) {
    var value = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
    card.fill.style.width = value + '%';
    card.percent.textContent = value + '% done';
  }

  function showNotice(card, result) {
    card.notice.hidden = false;
    card.notice.textContent = '';
    if (result.ok) {
      card.notice.className = 'notice ok';
      card.notice.textContent = 'Opened in VS Code. Pengu is watching; happy coding!';
      return;
    }
    card.notice.className = 'notice';
    card.notice.textContent = (result.message || 'Something went wrong.') + ' ';
    if (result.code === 'NO_VSCODE') {
      var link = el('a', '', 'Download VS Code');
      link.href = '#';
      link.addEventListener('click', function (e) { e.preventDefault(); openExternal(VSCODE_URL); });
      card.notice.appendChild(link);
    }
  }

  function startCourse(course, card) {
    card.button.disabled = true;
    card.button.textContent = 'Opening VS Code…';
    card.notice.hidden = true;
    pengu.invoke('dash:start-course', { courseId: course.id }).then(function (result) {
      showNotice(card, result || {});
    }, function () {
      showNotice(card, { ok: false, message: 'Could not start the course.' });
    }).then(function () {
      card.button.disabled = false;
      card.button.textContent = 'Continue';
    });
  }

  function renderCourse(course) {
    var root = el('article', 'card');
    root.appendChild(el('h2', '', course.title));
    root.appendChild(el('p', 'desc', course.description));

    var meta = el('div', 'meta');
    meta.appendChild(el('span', '', course.lessonCount + (course.lessonCount === 1 ? ' lesson' : ' lessons')));
    var percent = el('span', '');
    meta.appendChild(percent);
    root.appendChild(meta);

    var bar = el('div', 'bar');
    var fill = el('span', '');
    bar.appendChild(fill);
    root.appendChild(bar);

    var notice = el('p', 'notice');
    notice.hidden = true;
    root.appendChild(notice);

    var button = el('button', 'btn', course.started ? 'Continue' : 'Start');
    root.appendChild(button);

    var card = { fill: fill, percent: percent, notice: notice, button: button };
    setProgress(card, course.progress);
    button.addEventListener('click', function () { startCourse(course, card); });
    cards[course.id] = card;
    return root;
  }

  function loadCourses() {
    pengu.invoke('dash:get-courses').then(function (courses) {
      list.textContent = '';
      cards = {};
      if (!Array.isArray(courses) || !courses.length) {
        list.appendChild(el('p', 'empty', 'No courses found. Try reinstalling Pengu.'));
        return;
      }
      courses.forEach(function (course) { list.appendChild(renderCourse(course)); });
    }, function () {
      list.textContent = '';
      list.appendChild(el('p', 'empty', 'Could not load courses.'));
    });
  }

  pengu.on('dash:progress-updated', function (data) {
    if (data && cards[data.courseId]) setProgress(cards[data.courseId], data.progress);
  });

  // Edits made while the window was in the background count too.
  window.addEventListener('focus', function () {
    if (!views.courses.hidden) {
      pengu.invoke('dash:get-courses').then(function (courses) {
        (courses || []).forEach(function (course) {
          if (cards[course.id]) setProgress(cards[course.id], course.progress);
        });
      });
    }
  });

  pengu.invoke('dash:get-user').then(function (user) {
    document.getElementById('user-id').textContent = (user && user.userId) || 'unknown';
  });

  window.PenguDashboard = { el: el, openExternal: openExternal, onView: function (name, fn) { viewHandlers[name] = fn; } };

  loadCourses();
})();
