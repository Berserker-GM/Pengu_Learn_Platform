# RELEASE checklist (Windows zip) · owners: BRAIN + Dev2 · window T+2:15 to T+2:45

## Build
- [ ] `app/config.default.json` has the **production** `backendUrl` (Render URL), no secrets anywhere (`git grep -i "sk-or\|password"` is empty).
- [ ] `vscode-ext/pengu-watcher-0.1.0.vsix` exists (E3).
- [ ] In `app/`: `npx electron-packager . Pengu --platform=win32 --arch=x64 --out=../dist --overwrite --asar --extra-resource=../content --extra-resource=../vscode-ext/pengu-watcher-0.1.0.vsix --icon=assets/icon.ico`
      (no icon? drop `--icon`). Result: `dist/Pengu-win32-x64/Pengu.exe`, `resources/content`, `resources/pengu-watcher-0.1.0.vsix`.
- [ ] Animations are inside the asar or copied: `app/assets/animations` must be read via `path.join(__dirname, 'assets/animations')`; with `--asar` fs reads still work. If they fail, rebuild without `--asar`.
- [ ] Copy `content/README.md` to `dist/Pengu-win32-x64/README-FIRST.txt`.
- [ ] Zip: `powershell Compress-Archive dist/Pengu-win32-x64/* dist/Pengu-win.zip` (≈100 MB is normal).

## Clean-machine test (a teammate's PC that never ran the dev build, or a fresh Windows user account)
- [ ] Delete `%USERPROFILE%\.pengu` and `%USERPROFILE%\PenguLearn` first.
- [ ] Unzip → run `Pengu.exe` → SmartScreen "Windows protected your PC" → **More info → Run anyway** (unsigned app; expected).
- [ ] Pet says hello; click → dashboard; Start DSA → VS Code opens on `PenguLearn\dsa`, extension installed (`code --list-extensions | findstr pengu`).
- [ ] Edit `binary-search/solution.py`, introduce a syntax error → bubble within 45 s (first call may hit Render cold start).
- [ ] Progress % for DSA > 0 after editing.
- [ ] VS Code missing from PATH → friendly message with link (rename `code.cmd` temporarily or test on a PC without VS Code).

## Upload
- [ ] GitHub Release on the repo: tag `v0.1.0`, attach `Pengu-win.zip`. (Zip >2 GB not allowed; ours is ~100 MB, fine.)
- [ ] Put the release link on the landing page / post it. Mention: Windows 10/11 x64, VS Code required, SmartScreen note.
- [ ] Watch Render logs and `GET /health` during the first users.

## User-facing notes (also in `content/README.md`)
- VS Code must be installed; tick "Add to PATH" in its installer (default on). Restart Pengu after installing VS Code.
- Code snippets you write in Pengu courses are sent to the Pengu server for review. No login, an anonymous ID only.
