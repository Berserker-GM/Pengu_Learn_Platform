# changes/dev2-app.md (append-only log, newest at bottom)

## Requests (things you need from other folders / BRAIN)

## Log
### 15:20 A1 electron skeleton and config
- Files: app/package.json, app/package-lock.json, app/main.js, app/preload.js, app/config.default.json, app/pet/index.html
- What: `npm start` opens a 260×260 transparent, frameless, always-on-top pet window. First launch stores a UUID in Electron userData `user.json` and writes `%USERPROFILE%\.pengu\config.json` (`backendUrl` http://localhost:8787, `bridgePort` 47821, `courses` preserved). `app/pet/index.html` is a placeholder sprite until Dev3's pet files arrive. `window.pengu` exposes `invoke`, `send`, and `on` for the CONTRACT §5 channels.
- Test: `cd app && npm install && npm start`, then open `%USERPROFILE%\.pengu\config.json` and confirm `userId` is a UUID. A penguin idle frame sits at the bottom of a transparent window.
