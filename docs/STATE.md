# STATE (update your block on every push; newest info wins)

Backend URL: `http://localhost:8787` (local) · prod: _TBD, BRAIN fills after Render deploy_
Phase: **T+0:20 kit + stub backend** · Code freeze: **T+2:15**

## Dev1 BRAIN (backend, docs)
- Done: kit (docs/*), content imported (11 lessons), placeholder animations, backend complete in stub+memory mode
  (/health /snapshot /chat /progress, guard, rate limits, OpenRouter client, FalkorDB store + audit), 7 unit tests + smoke pass locally
- In progress: Render deploy (needs human: Render account + OPENROUTER_API_KEY + FALKORDB_* env vars)
- Next: verify FalkorDB writes against FalkorDB Cloud; real-LLM prompt check on 3 sample snapshots; CP1 at T+0:45
- Blockers: Render URL + secrets from human
- Known bugs: FalkorDB path not yet run against a live instance (falls back to memory on any error)

## Dev2 Cursor (app: Electron main, dashboard, packaging)
- Done: –
- In progress: –
- Next: A1
- Blockers: –
- Known bugs: –

## Dev3 free Claude (app/pet)
- Done: –
- In progress: –
- Next: P1
- Blockers: –
- Known bugs: –

## Dev4 free Claude (vscode-ext, content)
- Done: –
- In progress: –
- Next: E1
- Blockers: –
- Known bugs: –
