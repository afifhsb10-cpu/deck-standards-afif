# Animated GIF / video "deck" — workflow

For requests like *"make it an animation I can paste into PowerPoint"*, *"GIF version"*, *"remove the white background"*.
The slide is built as an **HTML scene with a deterministic `render(t)`**, captured frame by frame with Playwright,
and encoded to MP4 + GIF (+ a transparent GIF), then wrapped in a one-slide .pptx. No PowerPoint animation involved.

Worked examples (copy the closest one as a starting point):

| Example | Layout | Imagery | Notes |
|---|---|---|---|
| `templates/gif-route-strip/` | two-row snake route, N stops, text under each stop | flat 2D FLUX icons | data-driven (`steps.js`), the quickest start |
| `decks/value-stream-flight-gif/` | same, 10 stops, 1920×940 | flat 2D FLUX icons | white + transparent GIF, MP4 |
| `decks/value-stream-airport-iso/` | isometric floor plan + side text panel, take-off/loop/landing | 11 isometric FLUX modules assembled in code | 1920×900 under a slide title |

## 1. Brief → layout decision
- **Where will it sit?** Full slide → 1920×1080. Under a slide title → a wide band (1920×900–940). Ask for a screenshot of the target slide if unsure; match its background (light → white matte, see §6).
- **How much text per stop?** Short → text under each stop on the map (route strip). Long (3–4 lines per stop) → **side panel** that swaps per stop + a progress strip, map without text (floor-plan layout).
- **Pacing:** ~2–2.4 s dwell per stop, 1 s intro, 3–4 s final hold (recap). A GIF can't be paused → also deliver the MP4.

## 2. Content
Put all copy in data (`steps.js` / a `STEPS` array): number, label, title, description, note. Keep the user's exact wording, italics (`<i>`), and fix only obvious typos (tell them). Use `&#8209;` for hyphens that must not break (CI‑MIND).

## 3. Imagery with FLUX klein (see image-pipeline.md)
- One **locked style suffix** for the whole set; 3–6 variants per item; pick for consistency of angle, scale and palette, not just beauty.
- Recipes that worked:
  - *flat 2D icon*: "flat 2D vector illustration, simple geometric shapes, limited palette of warm golden yellow, light sky blue, white and light grey, no outlines/gradients/shadows, single centred subject, plain pure white background, no text…"
  - *isometric module*: "isometric 2D flat vector illustration of one single cutaway room module standing on a square floor platform, true 30-degree isometric projection seen from the front corner, light grey tiled floor, two low back walls in dark charcoal grey, small stylized people, … signs show only simple pictograms, plain pure white background…"
- Ask for **blank** tickets/boards/screens: FLUX writes fake text ("APPROVED YISA", "295") otherwise.
- Remove the backdrop: `python scripts/cutout.py src.jpg out.png` (border-connected white only). Flat icons with white parts break apart on dark grounds → keep such scenes light.
- A user-supplied reference image (often stock art) is a style reference in words only; don't send it to FLUX or copy it.

## 4. Scene (`scene.html`)
Contract (required by `scripts/render_scene.js`):
- `window.render(t)` draws the frame at `t` seconds — compute everything from `t`; **no CSS transitions, timers or `requestAnimationFrame`**.
- `window.DURATION` (s) and `window.SCENE_H` (px; width is 1920).
- `?transparent=1` → `html, body` background transparent and drop semi-transparent effects (halos/glows), since GIF alpha is binary.
Techniques that read well:
- Ghost dashed route + ghost plaques visible from t=0 (the map), a flown line drawn with `stroke-dashoffset`, a marker moving with `getPointAtLength` and heading from the path tangent, ease-in-out per leg, constant speed (px/s).
- Put the marker **under** the plaques so a parked marker never hides the number; let its wings peek out.
- Mask the route under plaques (SVG mask) instead of covering it with a white fill — otherwise white boxes show on the user's slide.
- Flight illusion: altitude 0→1 scales the plane up, lifts it, and leaves a fading shadow on the ground; a dotted contrail grows along the flight path.
- Keep ~30 px clearance from every canvas edge for anything that moves (check with `--only … --transparent`, it prints content bounds and flags edges).

## 5. Render
```bash
export NODE_PATH=<repo>/node_modules:$(npm root -g)
node scripts/render_scene.js decks/<name>/scene.html /tmp/<name>-t --only 0.5,6,30 --transparent   # quick frames + bounds
node scripts/render_scene.js decks/<name>/scene.html /tmp/<name>   --name <name>                     # MP4 + GIF + poster.png
node scripts/render_scene.js decks/<name>/scene.html /tmp/<name>-x --name <name> --transparent --verify  # transparent GIF
node scripts/gif_to_pptx.js /tmp/<name>-x/<name>-transparent.gif decks/<name>/out/<Name>.pptx --title-zone 1.5 --bg F3F6FA
```
- Look at frames before the full render: start, a mid stop, any take-off/turn, the final frame. Fix, then render once.
- GIF palette: **256 colours** (`--colors 256`); 96 turns light blues grey in detailed art.
- Typical sizes: white GIF 1–3 MB, MP4 1–3 MB, transparent GIF 2–15 MB (more motion area → bigger).

## 6. Transparent GIF — what to know
- GIF transparency is on/off. `encode_transparent_gif.py` blends edge pixels against `--matte` (default white) → clean on white/light slides, pale fringe on dark ones. Re-render with `--matte <slide bg hex>` for a coloured slide.
- It writes only the changed rectangle per frame and sets disposal "clear" on the previous frame only where pixels must become transparent again (69 MB → 14 MB for the airport map). ffmpeg can't do this with alpha (drops its delta optimisation); full frames are ~5× larger.
- Always run with `--verify` (decodes the file and compares every frame). Pitfall found the hard way: sub-images encoded by Pillow must use `interlace=False` when the container is assembled by hand.
- Downloaded encoder binaries (e.g. gifski) may be blocked in the sandbox; the Python encoder needs only Pillow + numpy.

## 7. Deliver
- `out/`: `<name>.gif`, `<name>.mp4`, `<name>-transparent.gif`, `poster.png`, `poster-transparent.png`, the `.pptx`, and a zip of the transparent illustrations if useful.
- Tell the user: how to place it (width in inches under their title), that GIFs play in slideshow mode only, which version to use on which background, and that it hasn't been played in real PowerPoint (ask them to check once).
- Commit the deck folder (scene, data, assets, scripts used, out/) and a README case study.
