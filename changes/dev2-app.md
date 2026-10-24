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
### A3 local bridge
- Files: app/bridge.js (new), app/courses.js (new: manifest + §4 progress), app/main.js
- What: `node:http` on 127.0.0.1:bridgePort. `GET /ping` → `{ ok, app: "pengu" }`; `POST /event` (256 KB cap) → `{ ok: true }`. `review_start` → `pet:state thinking`; `review_result` → `pet:state idle` then `pet:say { text: question, kind: "review" }` when question is non-empty; any event with `courseId` recomputes that course's % and sends `dash:progress-updated`. `GET /health` on launch with 45 s timeout (wakes Render), result logged.
- Test: `npm start`, then `curl -X POST localhost:47821/event -d '{"type":"review_result","question":"Hi?","mistakes":[]}'` → bubble "Hi?" over the pet.
### A4 dashboard + Start course
- Files: app/dashboard/index.html, dashboard.css, dashboard.js (new), app/courses.js, app/main.js
- What: `dash:get-user`, `dash:get-courses` (manifest from `../content` in dev / `resources/content` packaged, §4 progress, `started` = user copy exists), `dash:start-course` (copy to `%USERPROFILE%\PenguLearn\<folder>` only if missing → find `code.cmd` via `where code`, else `%LOCALAPPDATA%\Programs\Microsoft VS Codein\code.cmd` or Program Files → install `pengu-watcher-*.vsix` if `pengu.pengu-watcher` not listed (skipped with a warning when no vsix exists yet) → `code "<path>"`), records `{ courseId, path }` in config.json `courses`. `dash:get-progress` → backend `/progress/:userId` (15 s). `dash:open-external` (http/https only). Dashboard: course cards with % bar, Start/Continue, NO_VSCODE message with download link, live `dash:progress-updated`, refresh on focus.
- Test: click pet → dashboard → Start DSA → VS Code opens `PenguLearn\dsa`. Edit `binary-search/solution.py`, `curl -X POST localhost:47821/event -d '{"type":"file_saved","courseId":"dsa","filePath":"binary-search/solution.py"}'` → DSA shows 11%. Start again → edit kept.
### A5 progress page
- Files: app/dashboard/progress.js (new), app/dashboard/index.html, app/dashboard/dashboard.css
- What: Progress tab renders `dash:get-progress`: totals (reviews, files worked on, active courses), recurring mistakes, weak concepts (mastery bar), repeated bugs, improve tips. Refresh button, empty state when there are no reviews, "server may be waking up" message on `{ error }`.
- Test: dashboard → Progress. Fresh user shows zeros + the backend's tip.
