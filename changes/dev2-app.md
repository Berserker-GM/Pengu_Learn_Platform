# changes/dev2-app.md (append-only log, newest at bottom)

## Requests (things you need from other folders / BRAIN)
- Dev3's pet files are committed under `pengu-dev3/app/pet/` but not in `app/pet/` yet. Dev3's human: copy `pengu-dev3/app/pet/*` into `app/pet/`. Tested against them locally: animates, drags, click opens dashboard.

## Log
### 15:20 A1 electron skeleton and config
- Files: app/package.json, app/package-lock.json, app/main.js, app/preload.js, app/config.default.json, app/pet/index.html
- What: `npm start` opens a 260×260 transparent, frameless, always-on-top pet window. First launch stores a UUID in Electron userData `user.json` and writes `%USERPROFILE%\.pengu\config.json` (`backendUrl` http://localhost:8787, `bridgePort` 47821, `courses` preserved). `app/pet/index.html` is a placeholder sprite until Dev3's pet files arrive. `window.pengu` exposes `invoke`, `send`, and `on` for the CONTRACT §5 channels.
- Test: `cd app && npm install && npm start`, then open `%USERPROFILE%\.pengu\config.json` and confirm `userId` is a UUID. A penguin idle frame sits at the bottom of a transparent window.
### A2 pet IPC
- Files: app/main.js, app/dashboard/index.html (stub, filled in A4)
- What: handlers for every §5 pet channel. `pet:list-animations` reads `app/assets/animations/<state>/` (png/gif/webp/jpg/svg, sorted), §6 defaults + optional `config.json`, file:/// URLs, empty folders omitted. `pet:move-by` clamps to the nearest display's work area; `atEdge` is true when the move was clamped. Drag keeps the grab offset. `pet:clicked` opens/focuses the dashboard. `pet:system-idle` every 15 s. `pet:set-interactive` → `setIgnoreMouseEvents(!interactive, { forward: true })`. `pet:transcribe` returns `{ error }` (LATER). Single-instance lock: a second launch opens the dashboard.
- Test: copy Dev3's pet into `app/pet`, `npm start`; pet animates, drag it, click it → dashboard window.
