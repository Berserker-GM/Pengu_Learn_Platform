# Change Log

## Dev3 (app/pet)
- P1: index.html, pet.css, animation-registry.js, pet.js (frame player), mock-pengu.js (fake data-URI frames; "sleeping" omitted on purpose to test fallback). Missing state -> idle -> CSS circle.
- P2: state machine in pet.js: holds (looping states) + one-shots, priorities per CONTRACT 6. hello on load, hover_jump on hover (and random 10-20 min), drag (>=5 px, pointer capture) -> pet:drag-start/move/end, click -> pet:clicked, wander (walk, 20-60 s, 50-300 px via pet:move-by, turns at edge), sleeping at pet:system-idle >= 300 (wakes on any input or idle < 300), pet:state from main. Looping states from main auto-expire after 50 s; send pet:state {state:"idle"} to end thinking early.
- P3: bubble.js: markdown/code strip, 25-word cap, ttl clamp(2500+400w,4000,12000), queue max 3, 2-min dedupe, click dismiss, `talking` while visible, clears thinking.
- P4: chat.js: hover chat box over the pet's feet; Enter -> sending -> thinking -> pet:chat -> bubble. Mic hidden unless window.PENGU_VOICE===true or pengu.hasChannel('pet:transcribe') (records, converts to 16 kHz WAV, pet:transcribe).
- Notes for Dev2: drag-start is sent when the 5 px threshold is crossed (not on mousedown). Click-through (pet:set-interactive) is OFF by default; set window.PENGU_INTERACTIVE_MASK=true before pet.js and use setIgnoreMouseEvents(true,{forward:true}) to enable. Chat input needs the window to be focusable. Single-frame placeholder art gets CSS motion per state (data-single="true").

## Dev2 (Electron Main & Integration)
- Supplied Electron main process `app/main.js` with BrowserWindow (transparent, frameless, 260x260, always-on-top, focusable for chat input, screen-saver level).
- Implemented preload bridge `app/preload.js` exposing safe `window.pengu` (`invoke`, `send`, `on`, `hasChannel`).
- Implemented full suite of `pet:*` IPC handlers:
  - `pet:list-animations`: serves state animations with valid `file:///` URLs.
  - `pet:move-by`: handles wander coordinate updates with screen boundary checking.
  - `pet:drag-start`, `pet:drag-move`, `pet:drag-end`: handles window positioning with 5px threshold tracking.
  - `pet:clicked`: handles pet click interaction and sends interactive Socratic hint.
  - `pet:chat`: returns Socratic dialogue replies for student queries.
  - `pet:transcribe`: handles voice transcription.
  - `pet:set-interactive`: manages window mouse ignoring via `setIgnoreMouseEvents`.
  - `pet:system-idle`: monitors OS idle time via `powerMonitor`.
- Generated multi-frame SVG art assets for all 9 states in `assets/animations/`.
- Automated Electron test suite `tests/electron-smoke.test.js` verifying 34 assertions across window creation, IPC channels, `file:///` frame loading, dragging, chat typing, speech bubble stripping/word capping, sleep/wake, and state machine transitions.
