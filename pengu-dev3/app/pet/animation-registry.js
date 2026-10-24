/* Known animation states and their defaults (CONTRACT section 6).
 * Adding a NEW state name = add one line to STATES below.
 * Main may override fps/loop/next via the per-state config.json. */
(function () {
  'use strict';

  var STATES = {
    //  name:        { loop,  next,       priority, fps }
    hello:      { loop: false, next: 'idle',     priority: 2, fps: 8 },
    idle:       { loop: true,  next: null,       priority: 0, fps: 8 },
    walk:       { loop: true,  next: 'idle',     priority: 1, fps: 8 },
    dragged:    { loop: true,  next: 'idle',     priority: 6, fps: 8 },
    hover_jump: { loop: false, next: 'idle',     priority: 2, fps: 8 },
    thinking:   { loop: true,  next: 'idle',     priority: 4, fps: 8 },
    sending:    { loop: false, next: 'thinking', priority: 5, fps: 8 },
    talking:    { loop: true,  next: 'idle',     priority: 3, fps: 8 },
    sleeping:   { loop: true,  next: 'idle',     priority: 1, fps: 8 }
  };

  var GENERIC = { loop: false, next: 'idle', priority: 1, fps: 8 };

  window.PenguRegistry = {
    states: STATES,
    names: function () { return Object.keys(STATES); },
    defaults: function (name) {
      var d = STATES[name] || GENERIC;
      return { loop: d.loop, next: d.next, priority: d.priority, fps: d.fps };
    },
    priority: function (name) {
      return (STATES[name] || GENERIC).priority;
    }
  };
})();
