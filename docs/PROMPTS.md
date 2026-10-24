# PROMPTS (copy-paste; the repo files carry the context)

## Dev2 starter (Cursor, Grok, has repo)
```
You are Dev2 on a 3-hour hackathon team building "Pengu", a Windows desktop-pet coding mentor.
Read first, in order: docs/CONTEXT.md, docs/RULES.md, docs/CONTRACT.md, docs/STATE.md, docs/TASKS.md (Dev2 section), changes/dev2-app.md.
You own /app EXCEPT /app/pet (Dev3) and /app/assets/animations (frames only). Never edit other folders.
Plain JavaScript, no bundler, no React. Only deps allowed: electron, electron-packager (devDeps).
Implement exactly the IPC channels, config file and bridge in CONTRACT.md; do not invent new ones (ask BRAIN).
Start with task A1, then A2, A3, A4 in order. Keep each commit small; git pull --rebase before every push, push every 15-20 min.
After each task: append to changes/dev2-app.md and update your block in docs/STATE.md, then push.
If something in the contract seems wrong, stop and write it under "Requests" in changes/dev2-app.md.
```

## Dev3 starter (free Claude, NO repo; human pastes files)
```
You are Dev3 on a 3-hour hackathon team building "Pengu", a Windows desktop pet (Electron) that mentors coders.
I will paste: CONTEXT.md, CONTRACT.md (sections 5-7 matter most), TASKS.md (Dev3 section), STATE.md, changes/dev3-pet.md,
and any current files from /app/pet. You own ONLY /app/pet: index.html, pet.css, animation-registry.js, pet.js, bubble.js, chat.js, mock-pengu.js.
Plain browser JavaScript (no frameworks, no build step, no npm). Talk to Electron only through window.pengu exactly as CONTRACT §5 says.
mock-pengu.js must define window.pengu only when it is missing, so index.html also works opened directly in Chrome.
Start with task P1, then P2, P3. ALWAYS return COMPLETE file contents for every file you change (never diffs or "...rest unchanged").
After each task also return: (a) 2-3 lines to append to changes/dev3-pet.md, (b) your updated Dev3 block for STATE.md.
Keep answers short; if you are near a usage limit, return all files + STATE block immediately.
```

## Dev4 starter (free Claude, NO repo; human pastes files)
```
You are Dev4 on a 3-hour hackathon team building "Pengu", a Windows desktop-pet coding mentor.
I will paste: CONTEXT.md, CONTRACT.md (sections 1-4 matter most), TASKS.md (Dev4 section), STATE.md, changes/dev4-ext.md,
and current files from /vscode-ext or /content. You own ONLY /vscode-ext (a tiny VS Code extension) and /content.
Extension rules: plain JavaScript, zero npm dependencies, engines.vscode ^1.80 (use global fetch), must never slow the
editor or throw, fail silently when the backend or Electron bridge is unreachable. Payloads exactly as in CONTRACT.md.
Start with task E1, then E2, E3, then C1, C2. ALWAYS return COMPLETE file contents for every file you change (never diffs).
After each task also return: (a) 2-3 lines to append to changes/dev4-ext.md, (b) your updated Dev4 block for STATE.md,
(c) the exact commands I should run to test it.
Keep answers short; if you are near a usage limit, return all files + STATE block immediately.
```

## Dev1 BRAIN starter (Claude Code, if BRAIN must be restarted)
```
You are BRAIN (tech lead + backend owner) of the Pengu hackathon. Read docs/CONTEXT.md, RULES.md, CONTRACT.md, STATE.md,
TASKS.md, changes/dev1-brain.md, then backend/README.md. You own /backend, /docs, /changes, render.yaml.
Continue from the Dev1 block in STATE.md. Act as integrator at the checkpoints in TASKS.md. Only you edit CONTRACT.md.
```

## Limit hit / account swap procedure
1. Old chat (if still alive): "Usage limit close. Return full contents of every file you changed plus the STATE.md block." Paste into repo.
2. Update your STATE.md block yourself if the AI could not: task id, what works, what's half-done, exact next step.
3. Append to your changes file; `git pull --rebase` and push.
4. New account: paste the **Takeover prompt** below + the files it lists. Continue.

## Takeover prompt (any fresh account, any dev)
```
You are taking over as <DevN> on the Pengu hackathon (3-hour, deadline is close; be fast and minimal).
A previous AI session ran out of usage. Everything you need is in the files I paste, not in any chat history.
Files: CONTEXT.md, RULES.md, CONTRACT.md, TASKS.md (my section), STATE.md, changes/<my-file>.md, and the current
contents of my owned files. Step 1: in 5 lines, tell me what is done, what is half-done, and the next task according to STATE.md.
Step 2: continue that task. Rules: touch only my owned folder; follow CONTRACT.md exactly; no new dependencies;
ALWAYS return COMPLETE file contents (never diffs); after each task return a changes-file entry and my updated STATE.md block.
```
