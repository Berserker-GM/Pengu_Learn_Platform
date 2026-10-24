# Pet animations

One folder per state: `<state>/frame-001.png, frame-002.png, ...` (transparent PNG, square, ~256 px). Sorted by file name.
Optional `<state>/config.json`: `{ "fps": 8, "loop": true, "next": "idle" }` (defaults in docs/CONTRACT.md §6).
Known states: hello idle walk dragged hover_jump thinking sending talking sleeping.
Replacing art = replace the PNGs. New known state = new folder, zero code. New state NAME = one line in `app/pet/animation-registry.js`.
Current frames are single-frame placeholders imported from the graphHacks repo; swap in real art any time.
