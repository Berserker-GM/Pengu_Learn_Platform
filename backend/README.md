# Pengu backend (owner: Dev1 BRAIN)

Node 20+ / Express. API shapes: `docs/CONTRACT.md` §1. Graph model + Cypher: `docs/GRAPH.md`.
Runs with **zero secrets** (stub LLM + in-memory store), so clients can integrate before keys exist.

```bash
cd backend && npm ci && npm start      # http://localhost:8787
npm test                                # unit tests (guard, JSON repair, limits, audit)
npm run smoke                           # hits every endpoint (server must be running)
node scripts/smoke.js https://<render-url>
```

## Env vars (Render dashboard only; never commit)
| Var | Default | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | – | missing → stub questions |
| `LLM_MODEL` / `LLM_FALLBACK_MODEL` | `nvidia/nemotron-3-ultra-550b-a55b:free` / `poolside/laguna-xs-2.1:free` | free models only (team decision); tested 2026-10-24 |
| `LLM_DAILY_CAP` | 45 | free OpenRouter keys get 50 free requests/day; past the cap reviews use seed questions (stub) |
| `FALKORDB_HOST` `FALKORDB_PORT` `FALKORDB_USERNAME` `FALKORDB_PASSWORD` | – | or one `FALKORDB_URL=falkor://user:pass@host:port`; `FALKORDB_TLS=1` if the instance needs TLS |
| `FALKORDB_GRAPH` | `pengu` | graph name |
| `STUB=1` | – | force stub LLM even with a key |
| `LLM_MIN_INTERVAL_MS` `LLM_HOURLY_CAP` `LLM_GLOBAL_HOURLY_CAP` | 30000 / 60 / 3000 | rate limits |
| `CONTENT_DIR` | `../content` | lesson READMEs are added to the review prompt |
| SUPABASE_URL | - | Supabase project URL, required for access requests |
| SUPABASE_SERVICE_ROLE_KEY | - | Render secret used by access routes; never expose it in the frontend |


Put installers in backend/downloads/ with the filenames listed in src/server.js. The backend serves them only to accounts whose download_access status is approved. Review payment references in Supabase Table Editor and set status to approved. Apply backend/sql/download-access.sql first. Configure Google OAuth in Supabase Auth > Providers and allow your deployed site URL in Auth URL Configuration. Keep the service role key only in Render.

`GET /health` reports `llm: openrouter|stub` and `db: falkordb|memory`, so you can see which mode prod is in.

## Deploy (Render, free)
1. render.com → New → **Blueprint** → this repo (uses `/render.yaml`). Or New → Web Service, root dir `backend`, build `npm ci`, start `npm start`.
2. Set the secret env vars. Deploy. Check `https://<name>.onrender.com/health`.
3. Put the URL in `docs/STATE.md` (top) and tell Dev2 for `app/config.default.json`.
Free tier sleeps after 15 min idle; first request ~40 s. The app pings `/health` on launch.

## Files
- `src/server.js` routes + validation · `src/review.js` snapshot pipeline · `src/chat.js` · `src/audit.js` progress/audit
- `src/llm.js` OpenRouter (primary → fallback, JSON repair) · `src/guard.js` Socratic guard (no code, no fixes, one question, ≤25 words)
- `src/store/` `falkor.js` | `memory.js`, chosen in `index.js`; FalkorDB errors fall back to memory, never fail a request
- `prompts/` review + chat system prompts (bump `prompts/VERSION` when you edit them), `concepts.json` taxonomy + seed questions
