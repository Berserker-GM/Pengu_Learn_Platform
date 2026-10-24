/* Speech bubble (P3, CONTRACT section 7). Listens to pet:say. Needs pet.js (window.Pet). */
(function () {
  'use strict';
  var Pet = window.Pet;
  var area = document.getElementById('bubble-area');
  if (!Pet || !area) return;

  var MAX_WORDS = 25, MAX_QUEUE = 3, DEDUPE_MS = 2 * 60 * 1000;
  var queue = [], current = null, el = null, timer = null, dismissing = false, shownAt = {};

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* strip code fences / backticks / markdown, collapse whitespace, cap at 25 words */
  function clean(text) {
    var s = String(text == null ? '' : text);
    s = s.replace(/```[a-zA-Z0-9_+\-]*\n?/g, ' ').replace(/`/g, '');
    s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    s = s.replace(/<[^>]+>/g, ' ');
    s = s.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, '');
    s = s.replace(/(\*\*|__)(.+?)\1/g, '$2').replace(/\*(\S[^*]*?)\*/g, '$1').replace(/~~/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    var words = s ? s.split(' ') : [];
    var n = words.length;
    if (n > MAX_WORDS) { words = words.slice(0, MAX_WORDS); s = words.join(' ') + '\u2026'; n = MAX_WORDS; }
    return { text: s, words: n };
  }

  function ttlFor(c, ttlMs) {
    if (typeof ttlMs === 'number' && ttlMs > 0) return clamp(ttlMs, 1000, 60000);
    return clamp(2500 + 400 * c.words, 4000, 12000);
  }

  function recentlyShown(text) {
    var t = shownAt[text];
    return !!t && (Date.now() - t) < DEDUPE_MS;
  }

  function say(text, kind, ttlMs) {
    var c = clean(text);
    if (!c.text) return false;
    if (recentlyShown(c.text)) return false;
    if (current && current.text === c.text) return false;
    for (var i = 0; i < queue.length; i++) if (queue[i].text === c.text) return false;
    queue.push({ text: c.text, kind: kind || 'review', ttl: ttlFor(c, ttlMs) });
    while (queue.length > MAX_QUEUE) queue.shift();   // drop oldest
    if (!current) next();
    return true;
  }

  function next() {
    if (!queue.length) { current = null; Pet.release('talking'); return; }
    show(queue.shift());
  }

  function show(item) {
    current = item; dismissing = false;
    shownAt[item.text] = Date.now();
    var keys = Object.keys(shownAt);
    if (keys.length > 50) keys.forEach(function (k) { if (Date.now() - shownAt[k] > DEDUPE_MS) delete shownAt[k]; });

    Pet.release('thinking');   // an answer arrived
    Pet.release('sleeping');   // somebody is talking: wake quietly
    Pet.hold('talking');

    var b = document.createElement('div');
    b.id = 'bubble';
    b.className = 'kind-' + (/^(review|chat|system)$/.test(item.kind) ? item.kind : 'review');
    b.textContent = item.text;
    b.addEventListener('click', dismiss);
    area.appendChild(b);
    el = b;
    requestAnimationFrame(function () { b.classList.add('show'); });
    timer = setTimeout(dismiss, item.ttl);
  }

  function dismiss() {
    if (!current || dismissing) return;
    dismissing = true;
    clearTimeout(timer);
    var b = el; el = null;
    if (b) { b.classList.remove('show'); setTimeout(function () { b.remove(); }, 200); }
    setTimeout(function () { current = null; dismissing = false; next(); }, 220);
  }

  Pet.on('pet:say', function (p) { say(p.text, p.kind, p.ttlMs); });

  window.PenguBubble = {
    say: say, clean: clean, dismiss: dismiss,
    clear: function () { queue = []; dismiss(); },
    queueLength: function () { return queue.length; }
  };
})();
