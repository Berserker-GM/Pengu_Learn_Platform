# changes/dev1-brain.md (append-only log, newest at bottom)

## Requests (things you need from other folders / BRAIN)
- [ ] <request> (to: BRAIN) <time>

## Log
### <HH:MM> <task id> <short title>
- Files: <paths>
- What: <1-2 lines>
- Test: <how someone verifies it in 30 s>

### T+0:20 B1-B5 kit + backend
- Files: docs/*, content/*, app/assets/animations/*, backend/*, render.yaml
- What: team kit; reused graphHacks lessons, guard, concepts, sprites; Express backend with stub LLM + memory store fallback, OpenRouter + FalkorDB when env set
- Test: `cd backend && npm ci && npm start` then `npm run smoke`

### B4/B5 live verification
- Files: backend/src/{config,llm,chat}.js, prompts/*, render.yaml
- What: free OpenRouter models + daily budget; FalkorDB Cloud connected and all graph views verified, test data removed
- Test: `curl <backend>/health` → llm: openrouter, db: falkordb, llmBudget

### Integration + pet art
- Files: app/assets/animations/*, app/pet/* (Dev3), vscode-ext/* (Dev4), content/README.md (Dev4), docs/STATE.md
- What: converted pengu-vid.zip to transparent frames (flood-fill cutout, 12 fps); moved staged dev work into owned folders
- Test: `cd app && npm start` -> penguin waves (hello) then idles; hover = jump; sleep after 5 min idle

### Prod
- Files: app/config.default.json, docs/STATE.md
- What: Render backend https://pengu-learn.onrender.com verified; app points at it; release zip built
- Test: `curl https://pengu-learn.onrender.com/health`
