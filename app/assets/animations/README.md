# Pet animations

One folder per state: `<state>/frame-001.png, frame-002.png, ...` (transparent PNG, 256x256, sorted by name).
Optional `<state>/config.json`: `{ "fps": 12, "loop": true, "next": "idle" }` (defaults in docs/CONTRACT.md §6).
Known states: hello idle walk dragged hover_jump thinking sending talking sleeping. A missing folder plays `idle`.

Current art (from pengu-vid.zip, background removed by flood fill, 12 fps):
| State | Source clip |
|---|---|
| hello | hi.mp4 (full wave, plays once) |
| idle | hi.mp4 first 0.9 s, ping-pong loop |
| hover_jump | jumping.mp4 from 0.6 s |
| talking | teaching.mp4 (glasses + pointer) |
| sleeping | falling_asleep.mp4 from 3.8 s (Zzz loop) |
| walk, dragged, thinking, sending | no clip yet, falls back to idle. Drop frames in a folder to add one. |

Replacing art = replace the PNGs. New state NAME = one line in `app/pet/animation-registry.js`.
