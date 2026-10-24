## Dev3 free Claude (app/pet)
- Done: P1 player, P2 state machine/drag/click/wander/sleep, P3 bubble, P4 hover chat + optional voice (all headless-smoke-tested in jsdom; no errors)
- In progress: –
- Next: test in real Electron with Dev2's main (file:/// frames, drag feel, focus for chat input)
- Blockers: –
- Known bugs: untested in real Electron/Chrome GUI. Walk flips sprite with CSS `scale` when going left (set FLIP_WHEN_WALKING_LEFT=false in pet.js if art is asymmetric). Voice untested.
