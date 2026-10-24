# CONTRACT v1 (single source of truth, only BRAIN edits)

Sections: 1 Backend API · 2 Local bridge · 3 Config file · 4 Content manifest · 5 Electron IPC · 6 Animations · 7 Bubble rules.
All JSON is UTF-8. Timestamps are ISO-8601 strings. `userId` is a UUID v4 string.

---
## 1. Backend HTTP API
Base URL: `BACKEND_URL` (production value lives in `app/config.default.json`; local dev `http://localhost:8787`).
CORS open. Body limit 256 KB. Every error is `{ "error": "<message>" }` with 4xx/5xx. Clients **ignore errors silently**.
Cold start on Render can take ~40 s: timeouts **60 s** for /snapshot and /chat (free LLMs take 15-45 s), 15 s for /progress.

### GET /health
```json
{ "ok": true, "version": "1.0.0", "llm": "openrouter|stub", "db": "falkordb|memory" }
```

### POST /snapshot
Request:
```json
{
  "userId": "6f1c...",
  "courseId": "dsa",
  "filePath": "binary-search/solution.py",
  "languageId": "python",
  "content": "<full file text, client truncates to 20000 chars>",
  "diagnostics": [ { "message": "Expected ':'", "severity": "error", "line": 12, "source": "Pylance" } ],
  "trigger": "interval",
  "timestamp": "2026-10-24T10:15:00.000Z"
}
```
- `filePath` is relative to the course root, forward slashes. `trigger` ∈ `interval | idle | error`.
- `severity` ∈ `error | warning | info | hint`. `line` is 1-based. Max 20 diagnostics.

Response 200 (always 200 for valid input, even when nothing was reviewed):
```json
{
  "reviewed": true,
  "question": "Is a stack really the right structure for a first-in-first-out queue?",
  "mistakes": [ { "type": "wrong_data_structure", "concept": "stacks_queues", "evidence": "uses list.pop() for queue" } ],
  "severity": "medium",
  "reason": null,
  "attemptId": "a_1729764900000_ab12"
}
```
- `question`: string ≤ 25 words, or `null` (nothing worth saying). Never contains code or the full answer.
- `severity` ∈ `none | low | medium | high`.
- When not reviewed: `{ "reviewed": false, "question": null, "mistakes": [], "severity": "none", "reason": "duplicate|rate_limited|empty" }`.
- Server rules: dedupe by sha256(content) per user+file; ≤1 LLM call per user per 30 s; `error` and `idle` triggers may bypass
  the 30 s window if ≥10 s since the last call; hard cap 60 LLM calls/user/hour.
- `mistakes[].type` and `.concept` are lowercase `snake_case`.

### POST /chat
Request: `{ "userId": "...", "message": "why is my loop infinite?", "courseId": "dsa" }` (`message` ≤ 500 chars, `courseId` optional)
Response: `{ "reply": "Friendly answer under 20 words, often a question back." }`

### GET /progress/:userId
```json
{
  "userId": "6f1c...",
  "courses": { "dsa": { "filesTouched": 3, "attempts": 17, "lastActivity": "2026-10-24T10:15:00.000Z" } },
  "audit": {
    "totalAttempts": 17,
    "recurringMistakes": [ { "type": "off_by_one", "concept": "array_indexing", "count": 4, "lastSeen": "..." } ],
    "weakConcepts": [ { "concept": "loop_invariants", "mistakes": 5, "mastery": 0.35 } ],
    "repeatedBugs": [ { "type": "off_by_one", "filePath": "binary-search/solution.py", "streak": 3 } ],
    "improve": [ "Trace loop bounds on a 1-element input before running.", "..." ]
  }
}
```
Lists are sorted most-important first, max 5 items each. Unknown user → same shape with zeros/empty lists.
**Progress % is computed locally by Electron** (section 4); `courses` here is extra info only.

---
## 2. Local bridge (VS Code extension → Electron)
Electron main listens on `http://127.0.0.1:<bridgePort>` (default **47821**, from config file). Extension fire-and-forget, 2 s timeout, ignore failures.
`POST /event` with one of:
```json
{ "type": "review_start",  "courseId": "dsa", "filePath": "binary-search/solution.py" }
{ "type": "review_result", "courseId": "dsa", "filePath": "binary-search/solution.py",
  "question": "…or null", "mistakes": [ … ], "severity": "medium" }
{ "type": "file_saved",    "courseId": "dsa", "filePath": "binary-search/solution.py" }
```
Response `{ "ok": true }`. `GET /ping` → `{ "ok": true, "app": "pengu" }`.
Electron reaction: `review_start` → pet `thinking`; `review_result` with question → bubble; any → recompute progress for that course.

---
## 3. Shared config file
Path: `%USERPROFILE%\.pengu\config.json`. Written by Electron on every launch (create dir if missing). Extension only reads it.
```json
{
  "userId": "6f1c2b9e-....",
  "backendUrl": "https://pengu-backend.onrender.com",
  "bridgePort": 47821,
  "courses": [ { "courseId": "dsa", "path": "C:\\Users\\me\\PenguLearn\\dsa" } ]
}
```
Course marker: every course root contains `.pengu-course.json` = `{ "courseId": "dsa", "title": "DSA Interview Prep" }`.
The extension activates on `workspaceContains:.pengu-course.json` and takes `courseId` from it (fallback: match `courses[].path`).

---
## 4. Content manifest (`/content/manifest.json`)
```json
{
  "version": 1,
  "courses": [
    {
      "id": "dsa", "title": "DSA Interview Prep", "folder": "dsa",
      "description": "…", "track": "dsa",
      "lessons": [ { "id": "binary-search", "title": "Binary Search", "folder": "binary-search",
                     "concepts": ["binary_search", "array_indexing"], "difficulty": 2 } ]
    }
  ]
}
```
Layout: `/content/<course.folder>/.pengu-course.json`, `/content/<course.folder>/<lesson.folder>/README.md` + starter files.
Packaged app ships `/content` as `resources/content`. On Start, Electron copies `resources/content/<folder>` →
`%USERPROFILE%\PenguLearn\<folder>` if that folder does not exist yet.
**Progress %** = lessons where any file except `README.md` differs from the bundled copy (or a new file exists) ÷ total lessons, rounded.

---
## 5. Electron IPC
Preload exposes `window.pengu` via `contextBridge`. `invoke` = `ipcRenderer.invoke` (returns a Promise); `on` = main → renderer push.

### Pet window (`/app/pet`)
| Channel | Dir | Payload → Result |
|---|---|---|
| `pet:list-animations` | invoke | `{}` → `{ states: { "<state>": { frames: ["file:///…/frame-001.png"], fps: 8, loop: true, next: "idle" } } }` (missing folders omitted) |
| `pet:move-by` | invoke | `{ dx, dy }` → `{ x, y, atEdge: bool }` (main clamps to the display work area) |
| `pet:drag-start` | send | `{ screenX, screenY }` |
| `pet:drag-move` | send | `{ screenX, screenY }` |
| `pet:drag-end` | send | `{ moved: bool }` |
| `pet:clicked` | send | `{}` → main opens/focuses the dashboard (renderer sends only if drag distance < 5 px) |
| `pet:chat` | invoke | `{ message }` → `{ reply }` or `{ error }` (main calls `POST /chat`) |
| `pet:transcribe` | invoke | `{ wavBase64 }` → `{ text }` or `{ error }` (LATER, whisper.cpp) |
| `pet:set-interactive` | send | `{ interactive: bool }` (main toggles `setIgnoreMouseEvents` for transparent areas; optional) |
| `pet:say` | on | `{ text, kind: "review|chat|system", ttlMs? }` |
| `pet:state` | on | `{ state, reason? }` (e.g. `thinking` on review_start) |
| `pet:system-idle` | on | `{ seconds }` every 15 s (from `powerMonitor.getSystemIdleTime()`) |

### Dashboard window
| Channel | Dir | Payload → Result |
|---|---|---|
| `dash:get-user` | invoke | → `{ userId, backendUrl }` |
| `dash:get-courses` | invoke | → `[ { id, title, description, lessonCount, progress: 0-100, started: bool } ]` |
| `dash:start-course` | invoke | `{ courseId }` → `{ ok: true }` or `{ ok: false, code: "NO_VSCODE|COPY_FAILED|EXT_INSTALL_FAILED", message }` |
| `dash:get-progress` | invoke | → backend `/progress` JSON, or `{ error }` |
| `dash:open-external` | send | `{ url }` |
| `dash:progress-updated` | on | `{ courseId, progress }` |

Pet window: transparent, frameless, `alwaysOnTop`, `skipTaskbar`, 260×260, sprite drawn 128×128 at bottom-center, top area for bubble.

---
## 6. Animations
Folder: `app/assets/animations/<state>/frame-001.png, frame-002.png, …` (any count, sorted by name). Optional `config.json`:
`{ "fps": 8, "loop": true, "next": "idle" }`. Defaults per state below. Missing state folder → play `idle`; missing `idle` → static fallback circle. Never crash.
Known states live in `app/pet/animation-registry.js` (adding a NEW state name = one line there).

| State | Trigger | loop | next | priority |
|---|---|---|---|---|
| `hello` | app launch | no | idle | 2 |
| `idle` | default | yes | – | 0 |
| `walk` | pet wanders by itself (every 20-60 s, moves 50-300 px) | yes | idle | 1 |
| `dragged` | user dragging | yes | idle | 6 |
| `hover_jump` | mouse enters pet; also random every 10-20 min | no | idle | 2 |
| `thinking` | request in flight (review_start, chat) | yes | idle | 4 |
| `sending` | user submits chat text | no | thinking | 5 |
| `talking` | bubble visible | yes | idle | 3 |
| `sleeping` | system idle ≥ 300 s; any interaction wakes (→ `hello`) | yes | idle | 1 |
Higher priority interrupts lower; equal/lower waits until the current non-loop clip ends.

---
## 7. Speech bubble rules (client side, pet renderer)
- Strip code fences/backticks/markdown, collapse whitespace, cap **25 words** (append `…`).
- Show time `ttlMs = clamp(2500 + 400 × words, 4000, 12000)`. Click bubble = dismiss.
- Queue max 3; drop oldest when full; don't show the same text twice within 2 min.
- While a bubble is visible the pet is in `talking`.
