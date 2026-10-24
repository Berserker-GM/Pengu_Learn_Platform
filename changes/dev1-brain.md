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
