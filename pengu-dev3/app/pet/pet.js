/* Pet renderer core: animation player (P1) + state machine / input / wander / sleep (P2).
 * Talks to Electron ONLY via window.pengu (CONTRACT section 5). */
(function () {
  'use strict';

  var Reg = window.PenguRegistry;
  var spriteEl = document.getElementById('sprite');
  var fallbackEl = document.getElementById('fallback');

  // ---- tunables ----
  var DRAG_PX = 5;                    // click vs drag threshold
  var SLEEP_AFTER_S = 300;            // system idle seconds before sleeping
  var MIN_CLIP_MS = 900;              // non-loop clips last at least this long (single-frame placeholders)
  var MAIN_HOLD_MS = 50000;           // safety expiry for looping states pushed by main (pet:state)
  var FLIP_WHEN_WALKING_LEFT = true;  // set false if the art already faces both ways
  var WALK_STEP_PX = 4, WALK_TICK_MS = 50;

  function log() { try { console.log.apply(console, ['[pet]'].concat([].slice.call(arguments))); } catch (e) {} }
  function rand(a, b) { return a + Math.random() * (b - a); }

  // ---------- safe bridge to window.pengu ----------
  function invoke(channel, payload) {
    try { return Promise.resolve(window.pengu.invoke(channel, payload || {})); }
    catch (e) { return Promise.reject(e); }
  }
  function send(channel, payload) {
    try { window.pengu.send(channel, payload || {}); } catch (e) {}
  }
  function onMain(channel, fn) {
    try {
      window.pengu.on(channel, function (a, b) {
        // tolerate preloads that forward the Electron event as first arg
        var p = (a && typeof a === 'object' && (a.sender || a.preventDefault) && b !== undefined) ? b : a;
        try { fn(p || {}); } catch (e) { log('handler error', channel, e); }
      });
    } catch (e) { log('on() failed', channel, e); }
  }

  // ---------- P1: frame player ----------
  var anims = {};      // name -> { frames, fps, loop, next }
  var current = null;  // clip key currently playing (null = fallback circle)
  var token = 0;
  var timer = null;

  function preload(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(url); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  function normalize(name, raw) {
    var d = Reg.defaults(name);
    raw = raw || {};
    return {
      frames: Array.isArray(raw.frames) ? raw.frames.slice() : [],
      fps: Number(raw.fps) > 0 ? Number(raw.fps) : d.fps,
      loop: typeof raw.loop === 'boolean' ? raw.loop : d.loop,
      next: raw.next === undefined ? d.next : raw.next
    };
  }

  function load() {
    return invoke('pet:list-animations', {}).then(function (res) {
      var states = (res && res.states) || {};
      return Promise.all(Object.keys(states).map(function (name) {
        var a = normalize(name, states[name]);
        return Promise.all(a.frames.map(preload)).then(function (ok) {
          a.frames = ok.filter(Boolean);
          if (a.frames.length) anims[name] = a;
        });
      }));
    }).catch(function (e) { log('load failed', e); });
  }

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function showFallback() { spriteEl.hidden = true; fallbackEl.hidden = false; }
  function showSprite() { fallbackEl.hidden = true; spriteEl.hidden = false; }

  function resolveKey(name) {
    if (name && anims[name]) return name;
    if (anims.idle) return 'idle';
    return null;
  }

  function setVisual(key, nFrames) {
    spriteEl.removeAttribute('data-state');
    void spriteEl.offsetWidth; // restart CSS animation
    spriteEl.setAttribute('data-state', key);
    spriteEl.setAttribute('data-single', nFrames === 1 ? 'true' : 'false');
  }

  /* Low-level: play a clip. onEnd(key) fires when a NON-loop clip finishes.
   * Without onEnd a finished non-loop clip plays its `next` (P1 behaviour). */
  function play(name, onEnd) {
    var key = resolveKey(name);
    token++; clearTimer();
    var my = token;

    if (!key) {
      current = null; showFallback();
      if (onEnd) timer = setTimeout(function () { if (my === token) onEnd(null); }, MIN_CLIP_MS);
      return null;
    }

    var a = anims[key], i = 0;
    current = key; showSprite(); setVisual(key, a.frames.length);

    function finish() {
      if (my !== token) return;
      if (onEnd) onEnd(key);
      else if (a.next && a.next !== key) play(a.next);
    }

    if (a.frames.length === 1) {            // single frame: no timer needed for loops
      spriteEl.src = a.frames[0];
      if (!a.loop) timer = setTimeout(finish, MIN_CLIP_MS);
      return key;
    }

    function step() {
      if (my !== token) return;
      spriteEl.src = a.frames[i];
      i++;
      if (i >= a.frames.length) {
        if (a.loop) { i = 0; }
        else {
          var frameMs = 1000 / a.fps;
          timer = setTimeout(finish, Math.max(frameMs, MIN_CLIP_MS - a.frames.length * frameMs));
          return;
        }
      }
      timer = setTimeout(step, 1000 / a.fps);
    }
    step();
    return key;
  }

  // ---------- P2: state machine (CONTRACT section 6 priorities) ----------
  var holds = {};        // looping states currently "held" by some controller
  var holdTimers = {};
  var mainHolds = {};    // holds that came from pet:state (cleared by pet:state idle)
  var oneShot = null;    // non-loop clip currently playing
  var pending = null;    // best one-shot waiting for the current one to end
  var shown = null;      // last state handed to play()
  var dragging = false;

  function pri(n) { return Reg.priority(n); }

  function effective() {
    var best = 'idle', bp = 0;
    Object.keys(holds).forEach(function (n) {
      if (holds[n] && pri(n) > bp) { best = n; bp = pri(n); }
    });
    return best;
  }

  function render() {
    if (oneShot) return;
    var n = effective();
    if (n === shown) return;
    shown = n;
    play(n);
  }

  function startOneShot(name) {
    oneShot = name; pending = null; shown = name;
    play(name, function () {
      oneShot = null; shown = null;
      var p = pending; pending = null;
      if (p && pri(p) > pri(effective())) startOneShot(p); else render();
    });
  }

  /* Ask for a one-shot clip. Higher priority interrupts; equal/lower waits for a
   * running one-shot, or is dropped while a looping state is held. Missing clip = ignored. */
  function request(name) {
    var a = anims[name];
    if (!a) return false;
    if (a.loop) { hold(name); return true; }
    var curP = oneShot ? pri(oneShot) : pri(effective());
    if (pri(name) > curP) startOneShot(name);
    else if (oneShot && name !== oneShot && (!pending || pri(name) > pri(pending))) pending = name;
    return true;
  }

  function hold(name, expireMs) {
    if (!name) return;
    holds[name] = true;
    clearTimeout(holdTimers[name]);
    if (expireMs > 0) holdTimers[name] = setTimeout(function () { release(name); }, expireMs);
    if (oneShot && pri(name) > pri(oneShot)) { oneShot = null; pending = null; shown = null; }
    render();
  }

  function release(name) {
    if (!holds[name]) return;
    delete holds[name]; delete mainHolds[name];
    clearTimeout(holdTimers[name]);
    render();
  }

  function wake() {
    if (!holds.sleeping) return false;
    release('sleeping');
    request('hello');
    return true;
  }

  // ---------- input: hover / click / drag ----------
  var down = null, lastHover = 0;

  spriteEl.addEventListener('pointerenter', function () {
    if (dragging || down) return;
    if (wake()) return;
    if (Date.now() - lastHover < 2500) return;
    lastHover = Date.now();
    request('hover_jump');
  });

  spriteEl.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    down = { x: e.screenX, y: e.screenY, id: e.pointerId };
    try { spriteEl.setPointerCapture(e.pointerId); } catch (err) {}
  });

  spriteEl.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dist = Math.sqrt(Math.pow(e.screenX - down.x, 2) + Math.pow(e.screenY - down.y, 2));
    if (!dragging && dist >= DRAG_PX) {
      dragging = true;
      send('pet:drag-start', { screenX: e.screenX, screenY: e.screenY });
      hold('dragged');
    }
    if (dragging) send('pet:drag-move', { screenX: e.screenX, screenY: e.screenY });
  });

  function endPointer(clicked) {
    if (!down) return;
    var wasDrag = dragging;
    down = null; dragging = false;
    if (wasDrag) { send('pet:drag-end', { moved: true }); release('dragged'); }
    else if (clicked) send('pet:clicked', {});
  }
  spriteEl.addEventListener('pointerup', function () { endPointer(true); });
  spriteEl.addEventListener('pointercancel', function () { endPointer(false); });

  // any interaction wakes the pet
  ['pointerdown', 'pointermove', 'keydown', 'wheel'].forEach(function (ev) {
    document.addEventListener(ev, function () { wake(); }, true);
  });

  // Optional click-through for transparent areas (needs main to forward mouse moves).
  // Enable by defining window.PENGU_INTERACTIVE_MASK = true BEFORE pet.js loads.
  if (window.PENGU_INTERACTIVE_MASK === true) {
    var inter = null;
    document.addEventListener('pointermove', function (e) {
      var hit = !!(e.target && e.target.closest && e.target.closest('#sprite,#bubble,#chat'));
      if (hit !== inter) { inter = hit; send('pet:set-interactive', { interactive: hit }); }
    });
  }

  // ---------- wander (walk) ----------
  var walkToken = 0, edgeDir = 0, walkTimer = null;

  function canIdleAct() { return !holds.sleeping && !oneShot && !dragging && effective() === 'idle'; }
  function setFlip(left) { spriteEl.style.scale = (left && FLIP_WHEN_WALKING_LEFT) ? '-1 1' : ''; }

  function wander() {
    if (!canIdleAct()) return false;
    var dir = edgeDir ? -edgeDir : (Math.random() < 0.5 ? -1 : 1);
    edgeDir = 0;
    var total = rand(50, 300), moved = 0, my = ++walkToken;
    hold('walk'); setFlip(dir < 0);

    function end() {
      if (my !== walkToken) return;
      walkToken++; clearTimeout(walkTimer); setFlip(false); release('walk');
    }
    function tick() {
      if (my !== walkToken) return;
      if (!holds.walk) { walkToken++; setFlip(false); return; }
      if (holds.sleeping) return end();
      if (oneShot) { walkTimer = setTimeout(tick, 100); return; } // pause during hop/hello
      if (effective() !== 'walk') return end();                   // something more important took over
      invoke('pet:move-by', { dx: dir * WALK_STEP_PX, dy: 0 }).then(function (r) {
        if (my !== walkToken) return;
        moved += WALK_STEP_PX;
        if (r && r.atEdge) { edgeDir = dir; end(); }
        else if (moved >= total) end();
        else walkTimer = setTimeout(tick, WALK_TICK_MS);
      }, end);
    }
    tick();
    return true;
  }

  function scheduleWander() { setTimeout(function () { wander(); scheduleWander(); }, rand(20000, 60000)); }
  function scheduleJump() {
    setTimeout(function () { if (canIdleAct()) request('hover_jump'); scheduleJump(); }, rand(10, 20) * 60000);
  }

  // ---------- main -> renderer ----------
  onMain('pet:system-idle', function (p) {
    var s = Number(p.seconds) || 0;
    if (s >= SLEEP_AFTER_S) { if (!holds.sleeping && !dragging) hold('sleeping'); }
    else if (holds.sleeping) wake();
  });

  onMain('pet:state', function (p) {
    var s = p.state;
    if (!s) return;
    if (s === 'idle') {
      Object.keys(mainHolds).forEach(release);
      return;
    }
    var loop = anims[s] ? anims[s].loop : Reg.defaults(s).loop;
    if (loop) { hold(s, s === 'sleeping' ? 0 : MAIN_HOLD_MS); mainHolds[s] = true; }
    else request(s);
  });

  // ---------- public API ----------
  window.Pet = {
    play: function (n) { return play(n); },          // raw clip play (console testing)
    request: request, hold: hold, release: release, wake: wake,
    effective: effective,
    current: function () { return current; },
    holds: function () { return Object.keys(holds); },
    states: function () { return Object.keys(anims); },
    has: function (n) { return !!anims[n]; },
    info: function (n) { return anims[n] || null; },
    wanderNow: wander,
    jumpNow: function () { return request('hover_jump'); },
    invoke: invoke, send: send, on: onMain,
    ready: null
  };

  window.Pet.ready = load().then(function () {
    log('animations loaded:', Object.keys(anims).join(', ') || '(none)');
    shown = null; render();
    request('hello');
    scheduleWander(); scheduleJump();
  });
})();
