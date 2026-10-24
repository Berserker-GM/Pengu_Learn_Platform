# Pengu: CONTEXT (read first, 1 page)

**Product.** A desktop-pet coding mentor for Windows. User unzips, runs `Pengu.exe`, a penguin lives on the desktop.
Click it → dashboard → pick a course (DSA or System Design) → **Start** opens VS Code on that course folder.
A tiny VS Code extension sends code snapshots to our backend; the backend asks an LLM (OpenRouter) for a short
**Socratic question** (never the answer), stores mistakes in a FalkorDB graph, and the question appears as a
speech bubble over the pet. The dashboard shows progress % per course and a Progress page (mistake audit).
Goal: prep users for dev + coding-interview rounds. Works for ANY language (we read text + diagnostics, not ASTs).

**Deadline.** 3 hours. Real users must download and use it. A working zip beats completeness. See cut-line in `TASKS.md`.

## Architecture (one picture)
```
 VS Code ext ──POST /snapshot──▶ Backend (Render) ──▶ OpenRouter LLM
   │   ▲                              │
   │   └──── {question,mistakes} ─────┘──▶ FalkorDB Cloud (graph)
   │
   └──POST http://127.0.0.1:47821/event──▶ Electron main ──IPC──▶ pet window (bubble)
                                               │                └▶ dashboard window ──GET /progress──▶ Backend
                                     writes %USERPROFILE%\.pengu\config.json (userId, backendUrl, bridgePort)
```

## Folders & owners
| Folder | Owner | What |
|---|---|---|
| `/backend` | Dev1 BRAIN (Claude Code) | Express API, prompts, FalkorDB |
| `/docs`, `/changes`, `render.yaml` | Dev1 BRAIN | kit, contract, state |
| `/app` (except `/app/pet`) | Dev2 (Cursor) | Electron main, preload, dashboard, packaging |
| `/app/pet` | Dev3 (free Claude, no repo) | pet renderer: animation state machine, bubble, hover chat |
| `/app/assets/animations` | Dev3 + human artist | frames only |
| `/vscode-ext` | Dev4 (free Claude, no repo) | watcher extension |
| `/content` | Dev4 | courses, manifest, user README |
| `/` (root Vite site: `src/`, `public/`, `index.html`, ...) | pre-existing landing page (Vercel) | untouched; may host the download link |

## Decisions (locked)
- Electron + plain JS (no React in the app, no bundler). Package: `electron-packager` → zip.
- Backend: **Node 20 + Express** (same language as the whole team; one `fetch` for OpenRouter; official `falkordb` npm client).
- No login: Electron creates a UUID `userId` on first run.
- Secrets only in Render env vars. The zip contains only the public backend URL.
- Backend runs without secrets (stub LLM + in-memory store) so everyone can integrate from minute 20.

## Assumptions (made by BRAIN, change only via BRAIN)
1. **Reused** from the graphHacks repo: 11 lessons (9 DSA × py/js/go/java, 2 system design) → `/content`; Socratic guard
   regexes + seed questions → `/backend/src/guard.js`; placeholder pet PNGs → `/app/assets/animations`.
2. Progress unit = **lesson folder** (touched if any file differs from the bundled starter), not individual files,
   because each DSA lesson ships 4 language starters and a user edits only one. % = touched lessons / total lessons.
3. Electron copies a course to `%USERPROFILE%\PenguLearn\<course>` on first Start (never overwrites) and opens that.
4. Extension → desktop link is a localhost HTTP bridge (port 47821) run by Electron main. No polling needed.
5. Render free tier sleeps: first request can take ~40 s. Electron pings `/health` on launch; extension timeout 45 s.
6. Voice (whisper.cpp) and hover chat are LATER items; never block the zip on them.
