/* Defines window.pengu ONLY if missing (so index.html works in plain Chrome).
 * Console helpers (mock only): mockSay(text,kind,ttlMs), mockState(state), mockIdle(seconds), mockVoice(bool) */
(function () {
  'use strict';
  if (window.pengu) return;

  var handlers = {};
  var fakeX = 300; // virtual window x so wander can hit an "edge" (0..600)

  function emit(channel, payload) {
    (handlers[channel] || []).forEach(function (cb) { try { cb(payload); } catch (e) { console.error(e); } });
  }

  var COLORS = {
    hello: '#f7b731', idle: '#4aa3df', walk: '#26de81', dragged: '#fd9644',
    hover_jump: '#a55eea', thinking: '#778ca3', sending: '#eb3b5a', talking: '#2bcbba'
    // "sleeping" is intentionally missing to test the fallback to idle
  };

  function frame(color, n) {
    var y = n === 1 ? 52 : 60;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">' +
      '<circle cx="64" cy="' + y + '" r="40" fill="' + color + '"/>' +
      '<circle cx="50" cy="' + (y - 8) + '" r="5" fill="#fff"/>' +
      '<circle cx="78" cy="' + (y - 8) + '" r="5" fill="#fff"/></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function fakeAnimations() {
    var out = {};
    Object.keys(COLORS).forEach(function (s) {
      var d = (window.PenguRegistry && window.PenguRegistry.defaults(s)) || { fps: 4, loop: true, next: 'idle' };
      out[s] = { frames: [frame(COLORS[s], 1), frame(COLORS[s], 2)], fps: Math.min(d.fps, 4), loop: d.loop, next: d.next };
    });
    return { states: out };
  }

  window.pengu = {
    invoke: function (channel, payload) {
      switch (channel) {
        case 'pet:list-animations': return Promise.resolve(fakeAnimations());
        case 'pet:move-by':
          fakeX += (payload && payload.dx) || 0;
          var edge = fakeX <= 0 || fakeX >= 600;
          fakeX = Math.max(0, Math.min(600, fakeX));
          return Promise.resolve({ x: fakeX, y: 300, atEdge: edge });
        case 'pet:chat':
          return new Promise(function (r) { setTimeout(function () { r({ reply: 'Mock reply: what have you tried so far?' }); }, 1200); });
        case 'pet:transcribe': return Promise.resolve({ text: 'why is my loop infinite' });
        default: return Promise.resolve({});
      }
    },
    send: function (channel, payload) { console.log('[mock send]', channel, payload); },
    on: function (channel, cb) { (handlers[channel] = handlers[channel] || []).push(cb); }
  };

  window.mockSay = function (text, kind, ttlMs) { emit('pet:say', { text: text, kind: kind || 'review', ttlMs: ttlMs }); };
  window.mockState = function (state, reason) { emit('pet:state', { state: state, reason: reason }); };
  window.mockIdle = function (seconds) { emit('pet:system-idle', { seconds: seconds }); };
  window.mockVoice = function (on) { window.PENGU_VOICE = on !== false; };

  console.log('[mock-pengu] active. Helpers: mockSay(text), mockState(state), mockIdle(seconds), mockVoice(true)');
})();
