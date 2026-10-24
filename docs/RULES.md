# RULES (everyone, every push)

## Git
1. Branch: everyone works on `main`. Before EVERY push: `git pull --rebase origin main`, then `git push`.
2. Push small and often: **every 15-20 min**, or after each finished task. Never sit on >30 min of unpushed work.
3. Edit **only your own folder** (see CONTEXT.md table). Need a change elsewhere? Write it in your `/changes/<dev>.md`
   under "Requests" and ping BRAIN.
4. Commit message: `<area>: <what>` e.g. `pet: speech bubble queue`, `ext: idle trigger`.
5. Rebase conflict in a file you don't own → keep THEIRS, re-apply only your files. Never force-push.
6. No-repo devs (Dev3, Dev4): your human pastes the full files you return into the repo and pushes for you.

## Scope
- **No new dependencies, no refactors, no renames** without BRAIN approval (ask in chat, record in your changes file).
- `docs/CONTRACT.md` is law. Build against it with mocks. Want to change it? Ask BRAIN; only BRAIN edits it.
- If it is not in the MUST list (`docs/TASKS.md`), it waits until MUST is green.

## Secrets
- No keys, tokens, passwords, or `.env` files in the repo. Ever. Backend secrets live only in Render env vars.
- The app ships only the public backend URL.

## On every push
1. Update `/changes/<dev>.md` (append 1-3 lines: what changed, files, how to test).
2. Update your block in `docs/STATE.md` (done / in progress / next / blockers / known bugs).

## Usage limit / account swap (free accounts especially)
When you see a usage warning, or every ~45 min anyway:
1. **Stop coding.** Ask the AI for full contents of every file it changed, paste them into the repo.
2. Update your block in `docs/STATE.md`: exact task in progress, what's half-done, the next concrete step.
3. Append to `/changes/<dev>.md`.
4. Push (pull --rebase first).
5. Open a new account/chat and paste `docs/PROMPTS.md` → "Takeover prompt" plus the files it asks for.
Nothing important may live only in a chat.
