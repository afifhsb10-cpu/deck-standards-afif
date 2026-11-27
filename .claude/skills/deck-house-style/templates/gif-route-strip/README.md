# Template: route strip animation (GIF / MP4)

A two-row snake route with N stops. A yellow plane flies the route, each stop's plaque fills in and its
illustration and text appear; at the end the plane lands on a pin. Data-driven: edit `steps.js` only.

```bash
cp -r .claude/skills/deck-house-style/templates/gif-route-strip decks/<name>
# put illustrations in decks/<name>/assets/ (python .claude/skills/deck-house-style/scripts/cutout.py raw.jpg assets/x.png)
# edit decks/<name>/steps.js (steps, canvasH, noteLabel, dwell, speed)
export NODE_PATH=$PWD/node_modules:$(npm root -g)
node .claude/skills/deck-house-style/scripts/render_scene.js decks/<name>/scene.html /tmp/<name>-chk --only 0.5,6,40 --transparent
node .claude/skills/deck-house-style/scripts/render_scene.js decks/<name>/scene.html decks/<name>/out --name <name>
node .claude/skills/deck-house-style/scripts/render_scene.js decks/<name>/scene.html /tmp/<name>-t --name <name> --transparent --verify
```
Look: white ground, Barlow (fonts/ included, OFL), signal yellow `#FFC629`, charcoal ink. Change the CSS
tokens at the top of `scene.html` for another world. 2–12 stops work; text width follows the column width,
so keep notes short when there are many stops, or use the side-panel layout of `decks/value-stream-airport-iso`.
Full workflow and pitfalls: `reference/animated-gif.md`.
