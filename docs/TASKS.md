# TASKS, TIMELINE, CUT-LINE

## Cut-line (build top-down; nothing below a line starts until everything above it works)
**MUST**: pet appears on desktop · click opens dashboard · Start opens VS Code on the course · watcher → backend → bubble question · progress % moves
**SHOULD**: FalkorDB writes (backend done) · Progress page audit · wander/drag/sleep animations · extension auto-install
**LATER**: hover chat box · whisper.cpp voice · semantic vector view · extra courses

## Timeline (T = kickoff)
| Time | Dev1 BRAIN | Dev2 app | Dev3 pet | Dev4 ext+content |
|---|---|---|---|---|
| 0:00-0:20 | kit, content import, stub backend, deploy | read docs; `app/` skeleton (A1) | read docs; P1 | read docs; E1 |
| 0:20-1:30 | real backend (LLM, FalkorDB), help | A2 → A3 → A4 | P1 → P2 → P3 | E1 → E2 → E3, C1 |
| **0:45 CP1** | BRAIN checks: pet window shows placeholder sprite; ext POSTs reach deployed backend (`/health` + logs) | | | |
| **1:30 CP2** | BRAIN runs E2E: edit file in course → bubble over pet within 45 s; progress % changes | | | |
| 1:30-2:15 | integration: fix cross-folder bugs, merge pasted files, re-deploy | A5, A6, A7 dry run | P4 if MUST green | C2, README |
| **2:15 FREEZE** | only blocker fixes after this, BRAIN approves each | | | |
| 2:15-2:45 | release owner with Dev2: package, clean-machine test, upload | A7 | test on own PC | test on own PC |
| 2:45-3:00 | get real users: post link, watch `/health` + logs | | | |

## Dev2: app (Cursor, has repo). Folder `/app` except `/app/pet`
| ID | Task | Depends | Acceptance |
|---|---|---|---|
| A1 | `app/package.json` (devDeps: `electron`, `electron-packager` only), `main.js`, `preload.js`, `config.default.json` (`backendUrl`, `bridgePort`). userId UUID (`crypto.randomUUID`) in `userData/user.json`; write `%USERPROFILE%\.pengu\config.json` (CONTRACT §3). Pet window per §5 loading `pet/index.html` (use a 1-line placeholder if Dev3's isn't in yet). | – | `npm start` → transparent always-on-top window; config.json exists with a UUID |
| A2 | Pet IPC handlers (§5 pet table): list-animations (reads `app/assets/animations`, applies defaults from §6), move-by (clamp to `screen.getDisplayNearestPoint().workArea`), drag-*, clicked → dashboard, system-idle every 15 s, set-interactive. | A1 | Dev3's `pet/index.html` animates and can be dragged; click opens dashboard |
| A3 | Local bridge: `node:http` server on 127.0.0.1:bridgePort (§2) → `pet:state`/`pet:say`; on `review_result`/`file_saved` recompute progress & send `dash:progress-updated`. Ping `GET /health` on launch (wakes Render). | A1 | `curl -X POST localhost:47821/event -d '{"type":"review_result","question":"Hi?","mistakes":[]}'` shows bubble |
| A4 | Dashboard `app/dashboard/index.html` + js: course list from `content/manifest.json` (dev: `../content`; packaged: `process.resourcesPath/content`), progress % (§4), Start: copy course → `%USERPROFILE%\PenguLearn\<folder>`, find VS Code (`where code`, else `%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd`), if missing show message + link https://code.visualstudio.com/, install bundled `pengu-watcher.vsix` if `code --list-extensions` lacks `pengu.pengu-watcher`, then `code "<path>"`. | A1 | Start opens VS Code on the copied folder; second Start doesn't overwrite edits |
| A5 | Progress page: render `dash:get-progress` audit (4 lists + totals), refresh button, friendly empty state. | A4 | shows stub data from backend |
| A6 | `pet:chat` → `POST /chat` (45 s timeout). | A1 | Dev3 chat box gets replies |
| A7 | Packaging per `docs/RELEASE.md`. | A1-A4 | zip runs on a PC without Node |

## Dev3: pet renderer (free Claude, no repo). Folder `/app/pet`
Files: `index.html`, `pet.css`, `animation-registry.js`, `pet.js` (player + state machine), `bubble.js`, `chat.js`, `mock-pengu.js`.
`mock-pengu.js` defines `window.pengu` ONLY if it is missing, so `index.html` runs in a normal browser for testing.
| ID | Task | Depends | Acceptance |
|---|---|---|---|
| P1 | Animation player: registry of known states with §6 defaults; loads `pengu.invoke('pet:list-animations')`; plays frames on a `<img>` at fps; missing state → idle; missing idle → CSS circle. Mock returns 2-frame fake data. | – | open index.html in Chrome: idle animates; `Pet.play('nope')` falls back to idle, no console errors |
| P2 | State machine (§6 priorities): hello on load; hover → hover_jump; drag (mousedown+move ≥5 px) → dragged + `pet:drag-*`; click (<5 px) → `pet:clicked`; wander every 20-60 s via `pet:move-by` in small steps (walk); random hover_jump 10-20 min; `pet:system-idle` ≥300 → sleeping, any input wakes; `pet:state` from main. | P1 | each trigger visibly switches state in the browser with mock |
| P3 | Speech bubble (§7): queue, word cap, ttl, dedupe, talking state while visible; listens to `pet:say`. | P1 | `mockSay('…long text…')` shows ≤25 words then dismisses |
| P4 | Hover chat box (LATER): input under pet on hover; Enter → sending → thinking → `pet:chat` → bubble. Mic button hidden unless `pet:transcribe` exists. | P3 | mock reply appears in bubble |

## Dev4: VS Code extension + content (free Claude, no repo). Folders `/vscode-ext`, `/content`
Extension: plain JS, **zero runtime deps**, `engines.vscode ^1.80` (global `fetch` exists), publisher `pengu`, name `pengu-watcher`.
| ID | Task | Depends | Acceptance |
|---|---|---|---|
| E1 | `package.json`, `extension.js`: activate on `workspaceContains:.pengu-course.json`; read `%USERPROFILE%\.pengu\config.json` + marker; per-document timers: while editing send every 10 s (`interval`), 20 s after last edit (`idle`), immediately on new error diagnostics (`error`, include messages); skip if content hash unchanged; truncate 20000 chars; payload per CONTRACT §1; 45 s timeout; never throw. | – | with backend on localhost and a hand-written config, editing a file shows POSTs in backend log |
| E2 | Bridge events (§2): `review_start` before POST, `review_result` after, `file_saved` on save. 2 s timeout, silent. | E1 | with Electron running, bubble appears |
| E3 | Package: human runs `npx @vscode/vsce package --allow-missing-repository --skip-license` in `vscode-ext/` → `pengu-watcher-0.1.0.vsix`; commit it. | E1 | `code --install-extension pengu-watcher-0.1.0.vsix` works |
| C1 | Review `/content` (imported by BRAIN), fix README wording, keep manifest valid (CONTRACT §4). If the human has extra course files, add them as new course/lesson folders + manifest entries. | – | `node -e "require('./content/manifest.json')"` passes; every lesson folder exists |
| C2 | `/content/README.md` = user guide: install VS Code (+ "Add to PATH"), unzip, run Pengu.exe, SmartScreen "More info → Run anyway", how to Start a course, privacy note (code snippets are sent to our server for review). | – | a non-dev can follow it |

## Dev1 BRAIN
B1 kit · B2 content import + placeholder frames · B3 backend stub + deploy · B4 OpenRouter review/chat + guard · B5 FalkorDB write path + audit · B6 CP1/CP2 integration · B7 release owner with Dev2.

## Parallel vs waiting
- Fully parallel from minute 0 against mocks: A1, P1-P3, E1, C1, B3-B5.
- Waits: A2 needs A1 · E2/A3 meet at CP2 · A7 needs E3 (vsix) and A4 · P4 needs A6.
