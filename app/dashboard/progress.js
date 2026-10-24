(function () {
  'use strict';

  var pengu = window.pengu;
  var D = window.PenguDashboard;
  var el = D.el;
  var view = document.getElementById('view-progress');
  var loading = false;

  function words(snake) {
    var text = String(snake || '').replace(/_/g, ' ').trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function when(iso) {
    var date = new Date(iso);
    return isNaN(date) ? '' : date.toLocaleString();
  }

  function stat(label, value) {
    var box = el('div', 'stat');
    box.appendChild(el('strong', '', String(value)));
    box.appendChild(el('span', '', label));
    return box;
  }

  function panel(title, items, render, emptyText) {
    var box = el('section', 'panel');
    box.appendChild(el('h3', '', title));
    if (!Array.isArray(items) || !items.length) {
      box.appendChild(el('p', 'muted', emptyText));
      return box;
    }
    var list = el('ul', 'rows');
    items.forEach(function (item) { list.appendChild(render(item)); });
    box.appendChild(list);
    return box;
  }

  function row(main, side) {
    var li = el('li', '');
    li.appendChild(el('span', '', main));
    if (side) li.appendChild(el('span', 'muted', side));
    return li;
  }

  function header(onRefresh) {
    var head = el('div', 'progress-head');
    head.appendChild(el('h2', '', 'Your mistake audit'));
    var button = el('button', 'btn secondary', loading ? 'Refreshing…' : 'Refresh');
    button.disabled = loading;
    button.addEventListener('click', onRefresh);
    head.appendChild(button);
    return head;
  }

  function render(data) {
    view.textContent = '';
    view.appendChild(header(load));

    if (!data || data.error) {
      view.appendChild(el('p', 'notice', 'Could not reach the Pengu server. It may be waking up; try Refresh in a minute.'));
      return;
    }

    var audit = data.audit || {};
    var courses = data.courses || {};
    var touched = Object.keys(courses).reduce(function (sum, id) { return sum + (Number(courses[id].filesTouched) || 0); }, 0);
    var total = Number(audit.totalAttempts) || 0;

    var stats = el('div', 'stats');
    stats.appendChild(stat('reviews', total));
    stats.appendChild(stat('files worked on', touched));
    stats.appendChild(stat('courses active', Object.keys(courses).length));
    view.appendChild(stats);

    if (!total) {
      var empty = el('div', 'empty');
      empty.appendChild(el('p', '', 'No reviews yet. Start a course and write some code; Pengu will collect your patterns here.'));
      view.appendChild(empty);
    }

    var grid = el('div', 'panels');
    grid.appendChild(panel('Recurring mistakes', audit.recurringMistakes, function (m) {
      return row(words(m.type) + (m.concept ? ' · ' + words(m.concept) : ''), m.count + '× · last ' + when(m.lastSeen));
    }, 'Nothing recurring yet.'));

    grid.appendChild(panel('Weak concepts', audit.weakConcepts, function (c) {
      var li = row(words(c.concept), c.mistakes + (c.mistakes === 1 ? ' mistake' : ' mistakes'));
      var bar = el('div', 'bar small');
      var fill = el('span', '');
      fill.style.width = Math.round(Math.max(0, Math.min(1, Number(c.mastery) || 0)) * 100) + '%';
      bar.appendChild(fill);
      li.appendChild(bar);
      return li;
    }, 'No weak spots found yet.'));

    grid.appendChild(panel('Repeated bugs', audit.repeatedBugs, function (b) {
      return row(words(b.type) + ' in ' + b.filePath, b.streak + ' in a row');
    }, 'No bug streaks.'));

    grid.appendChild(panel('How to improve', audit.improve, function (tip) {
      return row(String(tip));
    }, 'Tips appear after a few reviews.'));
    view.appendChild(grid);
  }

  function load() {
    if (loading) return;
    loading = true;
    if (view._last) {
      render(view._last);
    } else {
      view.textContent = '';
      view.appendChild(el('p', 'empty', 'Loading your progress… (the server can take up to a minute to wake up)'));
    }
    pengu.invoke('dash:get-progress').then(function (data) { return data; }, function () { return { error: 'failed' }; })
      .then(function (data) {
        loading = false;
        view._last = data;
        render(data);
      });
  }

  D.onView('progress', load);
})();
