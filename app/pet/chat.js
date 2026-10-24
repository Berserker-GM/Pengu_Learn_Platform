/* Hover chat box (P4). Shows over the pet's feet on hover. Enter -> sending -> thinking -> pet:chat -> bubble.
 * Mic button is hidden unless voice is available (window.PENGU_VOICE === true or pengu.hasChannel('pet:transcribe')). */
(function () {
  'use strict';
  var Pet = window.Pet;
  var stage = document.getElementById('stage');
  var sprite = document.getElementById('sprite');
  if (!Pet || !stage || !sprite) return;

  var box = document.createElement('div');
  box.id = 'chat'; box.hidden = true;
  var input = document.createElement('input');
  input.type = 'text'; input.maxLength = 500; input.placeholder = 'Ask Pengu\u2026';
  input.autocomplete = 'off'; input.spellcheck = false;
  var mic = document.createElement('button');
  mic.type = 'button'; mic.textContent = '\uD83C\uDFA4'; mic.title = 'Speak'; mic.hidden = true;
  box.appendChild(input); box.appendChild(mic);
  stage.appendChild(box);

  var hideTimer = null, busy = false, overBox = false, overSprite = false, recording = false;

  function voiceOk() {
    try {
      return window.PENGU_VOICE === true ||
        (window.pengu && typeof window.pengu.hasChannel === 'function' && window.pengu.hasChannel('pet:transcribe'));
    } catch (e) { return false; }
  }
  function show() { clearTimeout(hideTimer); mic.hidden = !voiceOk(); box.hidden = false; }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (document.activeElement === input || busy || overBox || overSprite || recording) return;
      box.hidden = true;
    }, 1500);
  }

  sprite.addEventListener('pointerenter', function () { overSprite = true; show(); });
  sprite.addEventListener('pointerleave', function () { overSprite = false; scheduleHide(); });
  sprite.addEventListener('pointerdown', function () { box.hidden = true; });   // click/drag: get out of the way
  box.addEventListener('pointerenter', function () { overBox = true; show(); });
  box.addEventListener('pointerleave', function () { overBox = false; scheduleHide(); });
  input.addEventListener('blur', scheduleHide);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { input.blur(); box.hidden = true; }
  });

  function submit() {
    var msg = input.value.trim().slice(0, 500);
    if (!msg || busy) return;
    busy = true; input.value = '';
    Pet.request('sending');
    Pet.hold('thinking', 50000);
    Pet.invoke('pet:chat', { message: msg }).then(function (res) {
      if (res && res.reply && window.PenguBubble) window.PenguBubble.say(res.reply, 'chat');
    }).catch(function () { /* errors are ignored silently (CONTRACT) */ }).then(function () {
      busy = false;
      Pet.release('thinking');
      scheduleHide();
    });
  }

  // ---- voice (LATER): record -> 16 kHz mono WAV -> pet:transcribe ----
  var rec = null, stream = null, chunks = [];

  function toBase64(bytes) {
    var s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }
  function encodeWav(f32, rate) {
    var buf = new ArrayBuffer(44 + f32.length * 2), v = new DataView(buf);
    function str(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + f32.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, f32.length * 2, true);
    for (var i = 0; i < f32.length; i++) {
      var x = Math.max(-1, Math.min(1, f32[i]));
      v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
    }
    return new Uint8Array(buf);
  }
  function blobToWav16k(blob) {
    var AC = window.AudioContext || window.webkitAudioContext;
    return blob.arrayBuffer().then(function (ab) { return new AC().decodeAudioData(ab); }).then(function (audio) {
      var off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * 16000)), 16000);
      var src = off.createBufferSource(); src.buffer = audio; src.connect(off.destination); src.start();
      return off.startRendering();
    }).then(function (out) { return toBase64(encodeWav(out.getChannelData(0), 16000)); });
  }

  function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s; chunks = [];
      rec = new MediaRecorder(s);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        blobToWav16k(new Blob(chunks)).then(function (b64) {
          return Pet.invoke('pet:transcribe', { wavBase64: b64 });
        }).then(function (r) {
          if (r && r.text) { input.value = String(r.text).slice(0, 500); submit(); }
        }).catch(function () {});
      };
      rec.start(); recording = true; mic.classList.add('rec');
    }).catch(function () {});
  }
  function stopRec() {
    recording = false; mic.classList.remove('rec');
    try { rec.stop(); } catch (e) {}
    try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
  }
  mic.addEventListener('click', function () { if (recording) stopRec(); else startRec(); });

  window.PenguChat = { submit: submit, show: show, input: input };
})();
