# STATE (update your block on every push; newest info wins)

Backend URL: `http://localhost:8787` (local) · prod: _TBD, BRAIN fills after Render deploy_
Phase: **T+0:20 kit + stub backend** · Code freeze: **T+2:15**

## Dev1 BRAIN (backend, docs)
- Done: kit, content, placeholder art, backend. Verified LIVE: OpenRouter free models (nemotron-3-ultra primary, laguna-xs fallback)
  give good Socratic questions; FalkorDB Cloud (ap-south-1, no TLS) causal/temporal/entity views + audit verified with real writes.
- In progress: Render deploy (human: create service from render.yaml, paste OPENROUTER_API_KEY + FALKORDB_HOST/USERNAME/PASSWORD)
- Next: smoke test prod URL, put it at the top of this file; CP1 at T+0:45
- Blockers: Render URL
- Known bugs / limits: free OpenRouter key = 50 free requests/day total (backend caps at 45, then seed-question fallback);
  key expires 2026-10-31. Free models take 5-40 s per review. Clients must use 45 s timeouts (CONTRACT §1).

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
