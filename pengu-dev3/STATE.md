# Project State

## Dev3 (app/pet)
- Done: P1 player, P2 state machine/drag/click/wander/sleep, P3 bubble, P4 hover chat + optional voice (all headless-smoke-tested in jsdom; no errors)
- In progress: –
- Next: test in real Electron with Dev2's main (file:/// frames, drag feel, focus for chat input)
- Blockers: –
- Known bugs: untested in real Electron/Chrome GUI. Walk flips sprite with CSS `scale` when going left (set FLIP_WHEN_WALKING_LEFT=false in pet.js if art is asymmetric). Voice untested.

## Dev2 (Electron Main & Integration)
- Done:
  - Created Electron main process (`app/main.js`) with transparent, frameless, 260x260, always-on-top, focusable window.
  - Implemented safe preload bridge (`app/preload.js`) exposing `window.pengu` APIs (`invoke`, `send`, `on`, `hasChannel`).
  - Implemented all `pet:*` IPC handlers (`pet:list-animations`, `pet:move-by`, `pet:drag-start/move/end`, `pet:clicked`, `pet:chat`, `pet:transcribe`, `pet:set-interactive`, `pet:system-idle`).
  - Added multi-frame SVG art assets across all 9 states in `assets/animations/` with `file:///` URL resolution.
  - Verified full test suite in real Electron environment via `tests/electron-smoke.test.js` (34 passing assertions).
- In progress: –
- Next: Live end-to-end integration with backend and terminal deep links.
- Blockers: –
- Known bugs: None found during real Electron test suite execution.
