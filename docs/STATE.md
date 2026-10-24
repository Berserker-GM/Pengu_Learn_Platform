# STATE (update your block on every push; newest info wins)

Backend URL: `http://localhost:8787` (local) · prod: _TBD, BRAIN fills after Render deploy_
Phase: **T+0:20 kit + stub backend** · Code freeze: **T+2:15**

## Dev1 BRAIN (backend, docs)
- Done: backend verified live (OpenRouter free models + FalkorDB Cloud). Integration: Dev3 pet -> app/pet, Dev4 extension -> vscode-ext
  (+ vsix), content/README.md; staging folders pengu-dev3/ pengu-dev4/ removed. New art from pengu-vid.zip -> 5 states
  (hello, idle, hover_jump, talking, sleeping; transparent 256px @12fps). Real Electron launch: animations load, bridge bubble OK.
- In progress: release. Prod smoke test passed (review, dedupe, error review, chat, progress); app/config.default.json -> prod;
  `npm run package` builds dist/Pengu-win.zip (165 MB, no warnings, vsix + content bundled); packaged exe starts and writes prod config.
- Next: clean-machine test (docs/RELEASE.md), GitHub Release v0.1.0, share link
- Blockers: none
- Known bugs / limits: free OpenRouter key = 50 req/day (backend caps 45, then seed questions), key expires 2026-10-31.
  walk/dragged/thinking/sending have no art yet (fall back to idle). backend/src/server.js got Razorpay routes from the web team
  without BRAIN review: self-contained, no new deps, not on the pet path.

## Dev2 Cursor (app: Electron main, dashboard, packaging)
- Done: A1 Electron skeleton + config.json. A2 pet IPC (animations, move-by, drag, click → dashboard, system-idle, set-interactive). A3 bridge on 127.0.0.1:47821 (ping, events → thinking/bubble/progress), /health ping on launch. A4 dashboard (course cards, % bar, Start copies course → opens VS Code, installs vsix when present). A5 Progress tab (audit lists, refresh, empty/error states). A6 `pet:chat` → POST /chat. A7 dry run: `cd app && npm run package` → `dist/Pengu-win.zip` (151 MB), packaged exe verified locally.
- In progress: –
- Next: final release build once prod backendUrl + vsix exist; clean-machine test (RELEASE.md)
- Blockers: Dev3's files are in `pengu-dev3/app/pet/`, not yet copied into `app/pet/` (Dev3's human). No `vscode-ext/pengu-watcher-*.vsix` yet (E3), so Start skips the extension install. Prod Render URL needed in `app/config.default.json`.
- Known bugs: –

## Dev3 free Claude (app/pet)
- Done: P1 player, P2 state machine/drag/click/wander/sleep, P3 bubble, P4 hover chat + optional voice (all headless-smoke-tested in jsdom; no errors)
- In progress: –
- Next: test in real Electron with Dev2's main (file:/// frames, drag feel, focus for chat input)
- Blockers: –
- Known bugs: untested in real Electron/Chrome GUI. Walk flips sprite with CSS `scale` when going left (set FLIP_WHEN_WALKING_LEFT=false in pet.js if art is asymmetric). Voice untested.

## Dev4 free Claude (vscode-ext, content)
- E1: DONE (smoke-tested with stub vscode + mock backend)
- E2: DONE (smoke-tested: file_saved, review_start, review_result reach mock bridge)
- E3: DONE, vscode-ext/pengu-watcher-0.1.0.vsix built. Dev2: bundle it as pengu-watcher.vsix (id pengu.pengu-watcher)
- C1: PARTIAL, manifest/lessons never pasted to me; run node vscode-ext/scripts/validate-content.js and send me any PROBLEMS
- C2: DONE, content/README.md
- Blockers: none. Not yet tested against real Electron bridge or real VS Code (needs your F5 run).
