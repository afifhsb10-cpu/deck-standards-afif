---
name: deck-house-style
description: House standard for every slide deck / presentation / .pptx made here. Load it whenever the user asks for a deck, slides, a presentation, a pitch, a training or safety-talk deck, or a redesign of an existing .pptx — before choosing colors, fonts, layout or generating any image. It integrates Impeccable (every deck gets its own visual world derived from the topic) with design-taste (genre packs as disciplined starting points, bans, pre-flight), adds the NVIDIA FLUX image pipeline (graded photos or halftone figures, never "pasted" pictures), worked example decks, and the PPTX pitfalls that make PowerPoint ask to repair a file. Use together with the pptx skill, which owns the file mechanics.
---

# deck-house-style

The standard for decks made in this repo. Goal: decks that look **designed, not generated** — one committed visual world per deck, imagery that is part of the composition, and files that open cleanly in PowerPoint.

This skill decides **what the deck looks like**. The `pptx` skill decides **how the file is built** (pptxgenjs, layouts, placeholders, theme, validate). Load both.

## 0. Before anything: read the brief

Infer and write down, in one line, a **design read** before touching code:

> *Reading this as: [deck kind] for [audience], used [where / what light], genre **[pack]**, [light/dark], one signal color [hex].*

- **Deck kind & audience** pick the direction, not habit. A safety talk is not a pitch.
- **Use scene** picks light vs dark (lit training room / projector → light ground; evening keynote → dark). Never pick dark "because premium".
- **Existing brand** (logo, colors, fonts) is input and overrides the genre palette; the genre then only governs composition and type.
- **Redesign:** keep every fact, number, source and speaker note; treat the old look as an anti-reference — replace it, don't polish it.
- Ambiguous? Ask exactly one question. Otherwise proceed.

## 1. Design the deck's world (every deck gets its own)

A genre pack is a starting point, not a template. Each deck earns a **world derived from its topic** (Impeccable), built with the discipline of a genre pack (design-taste). Two decks on different topics must not look alike.

**a. Find the theme's scene or object.** Ask: *where does this topic physically happen, and what is its one telling detail?* Write it as a short phrase.
- "Modus Senyap" (silent fraud) → *a quiet city at night, one sodium streetlight* — silence made visible.
- "BLS, 5 menit pertama" (emergency) → *an emergency field manual / safety placard* — procedure made physical.

**b. Turn the scene into five decisions**, and write them in the design read:
1. **Ground & light** — the scene's ambient (night ink-blue, aged paper, lit training room…), checked against where the deck is shown.
2. **One signal color with a meaning** — sodium amber = the only light in the dark; emergency red = action. Never decorative.
3. **Type voice** — what would be printed in that scene (cinema title serif; stencil-heavy manual caps; broadsheet serif…).
4. **Image treatment** — how pictures belong to the scene: graded photographs that dissolve into the ground, halftone cut-outs printed on the paper, duotone toward the inks, or no imagery (structure only).
5. **One signature motif**, repeated: e.g. "Modus N dari 5" set on the image; masthead coordinates + `FIG.` captions; beat ticks for rhythm.

**c. Anchor it to the closest genre pack** below, then bend it toward the scene. Say what you borrowed and what you changed. Details per pack: [reference/genres.md](reference/genres.md).

| Deck content | Closest starting pack |
|---|---|
| Procedures, safety, K3, SOP, training, incident briefings | **brutalist-industrial** + halftone ("field manual") |
| Awareness, risk, fraud, security, stories with tension | **cinematic-night** (graded documentary photos, one light) |
| Executive reports, strategy, research findings | **editorial-minimal** (Swiss broadsheet) |
| Campaigns, internal events, culture | **retro-print** (riso, two inks max) |
| Product / tech demos, engineering reviews | **dark-tech** |
| Board / investor / formal finance | **quiet-luxury** |
| Regulated, compliance, customer-facing trust | **corporate-trust** |

**d. Differ from what exists.** Look at `decks/*/README.md` in this repo; a new deck must not reuse another deck's world (palette + type + image treatment) unless brand rules require it. Reuse *techniques*, not looks.

**Worked examples** (read the README of the closest one before building):
- [decks/modus-senyap](../../../decks/modus-senyap/README.md) — cinematic-night: photographic world, graded fades, one sodium light.
- [decks/bls-5-menit-pertama](../../../decks/bls-5-menit-pertama/README.md) — field manual: halftone figures on the grid, data drawn literally.
- [decks/value-stream-mind-id](../../../decks/value-stream-mind-id/README.md) — brand-led (MIND ID) flight plan: animated guide line, plane on a motion path, client illustrations reused.
- [decks/value-stream-flight-gif](../../../decks/value-stream-flight-gif/README.md) — airport wayfinding, flat FLUX icons, rendered to GIF/MP4.
- [decks/value-stream-airport-iso](../../../decks/value-stream-airport-iso/README.md) — isometric airport floor plan assembled from FLUX modules, take-off/landing, side panel, GIF/MP4.

**Client assets & brand:** when the user supplies on-brand illustrations or a brand skill exists (e.g. `mind-id-design`), reuse those assets and palette; generate with FLUX only what is missing.

## 2. Never (merged Impeccable + design-taste bans)

- Eyebrow/kicker label above a slide title as decoration. (Exception: a genre's masthead/coordinate system — e.g. `03 / 07 — KENALI` in the top rule — is navigation, not a kicker.)
- Accent line under titles; decorative color bars; colored left/right borders on cards; edge stripes.
- Rows of identical icon + heading + text cards as the slide structure; cards inside cards.
- Rounded rectangles + soft shadow as the default container. Depth comes from rules, tonal panels, offset solid blocks.
- Icons in colored circles as the default motif. Emoji or unicode glyphs as icons.
- Gradient text, purple/blue gradients, glassmorphism.
- A photo dropped in a rectangle next to text ("pasted" look) — see §4.
- The hero-metric template (big number + small label + accent) **unless** the number is the slide's message; then typeset it as an instrument panel / ledger row.
- Section numbers 01/02/03 unless the sequence carries meaning (steps of a procedure do).
- Same layout on consecutive slides. Vary: split, ledger, full-bleed, instrument panel, quote.
- More than ~2 colors carrying meaning; the accent appearing more than ~4 times per slide.
- Centered body text; body wider than ~75 characters per line; paragraphs over 3 lines.

## 3. Type, color, composition

- **Type pairs with contrast**: heavy/serif display + clean body + (optionally) mono labels. Display is genuinely large; titles at one fixed position and size per slide type.
- **Fonts must exist on the presenter's machine.** Use Office-shipped faces unless the user confirms custom fonts are installed. Proven set: display `Arial Black` or `Cambria`, body `Arial`/`Calibri`, mono labels `Consolas`. Leave ~10% width slack on any face QA can't render exactly (§6).
- **Color**: one neutral ground + ink + one signal accent. Tint, don't add hues. Body contrast ≥ 4.5:1, large text ≥ 3:1. Secondary text tinted from the ground, never plain grey on color.
- **Grid**: one visible grid per deck — hairline rules (0.75pt), aligned columns, consistent margins (≥ 0.5"). Rules and whitespace separate content, not boxes.
- **Data as structure**: numbers as ledgers/instrument panels; sequences as indexed rows; ratios drawn literally (e.g. 30:2 = 30 ticks + 2 dots).

## 4. Imagery — NVIDIA FLUX, never "pasted"

Full pipeline and prompt rules: [reference/image-pipeline.md](reference/image-pipeline.md). Summary:

1. Generate with `black-forest-labs/flux-3-image-klein` via `scripts/gen_images.py` — **steps 28** (4 steps = mushy hands/faces), no `seed` (API rejects it), no brand names in prompts (content filter).
2. Generate subjects **on a seamless plain white studio backdrop** so they can be cut out.
3. Make 3–4 variants; inspect a contact sheet (`scripts/contact_sheet.py`) and crop hands/faces at full resolution. Reject wrong anatomy **and wrong procedure** (e.g. hands on chest when the step says shoulders; police-looking uniforms for paramedics).
4. Integrate: `scripts/halftone.py` → transparent halftone PNG in ink / paper / signal color, with edge `fade` where it meets the ground. Place figures **on** the layout: standing on the baseline rule, overlapping giant numerals, bleeding off an edge. Captions as `FIG. 0N — …` where the genre allows.
5. Photographic (non-halftone) images are allowed when the world wants them, but must still be composed: full-bleed with a graded fade into the ground, or a half-bleed edge-to-edge — never a floating rectangle. Use `scripts/photo_grade.py` (crop to the slot's exact ratio, tint toward the ground, fade the edges that meet text). Recipes in its docstring.

## 5. Build

Follow the `pptx` skill's structured-deck flow (theme → layouts → placeholders → `applyTheme`). Each finished deck lives in `decks/<name>/` with `build.js`, `notes.json`, processed `assets/`, `images.jobs.json` (prompts used) and a `README.md` case study (design read, the five decisions, techniques, what was rejected and why). Build with `NODE_PATH=$PWD/node_modules node decks/<name>/build.js <out.pptx>` after `npm install` at the repo root. Speaker notes on every slide (what to say, timing, cautions). Unverified claims (guideline years, statistics) are flagged to the user, never silently invented.

Reusable helpers in the two example `build.js` files: `rule()` with flip normalisation, masthead layouts, ledger and instrument-panel blocks, beat ticks, half-bleed image + overlaid caption, thumbnail summary rows.

## 5b. Motion — click animations that teach the reading order

Animate only when the motion carries meaning (a sequence, a route, a build-up); never decorative entrances on everything. When a user asks for "animation on every shape", give every content shape an entrance that is **tied to the narrative**, not a uniform fade.

Proven pattern — **the guide line** (decks/value-stream-mind-id):
- A faint dashed "planned" route and ghost waypoints are visible from the start (the map).
- Each click wipes the next route segment in the direction of travel while a marker (plane, dot, cursor) follows the same motion path; on arrival the waypoint fills, then its image and text fade in (staggered ~120–250 ms).
- Constant line speed (inches/second) so wipe and motion stay in sync; corners as quarter arcs with a 90° spin of the marker.
- Put the marker **under** the waypoint discs so arriving never hides the number.

**When the user wants to paste the animation as one object** (GIF/video instead of PowerPoint animations): build the slide as an HTML scene with a deterministic `render(t)` (SVG path for the route, `getPointAtLength` for the marker and its heading), capture frames with Playwright, encode MP4 + GIF with ffmpeg, and wrap the GIF in a one-slide .pptx. Template: [decks/value-stream-flight-gif](../../../decks/value-stream-flight-gif/README.md) (`scene.html`, `render.js`, `make_pptx.js`). Flat FLUX illustrations rely on white parts — keep a white ground or they break apart when the background is removed.
- **Isometric "denah" world** (decks/value-stream-airport-iso): generate each zone as a separate isometric cutaway module with one locked style recipe, remove the background, and assemble them on an isometric grid in code (keep white corridors between modules; put stops at module floor centres; draw the route as a transit-map overlay). Text goes in a side panel that changes per stop.
- **GIF palette:** use 256 colours for detailed illustrations (96 turns light accents grey).
- **Transparent GIF:** use the deck's `encode_transparent_gif.py` (changed-rectangle deltas + selective disposal 2, `--verify`), not ffmpeg (drops deltas with alpha) or full frames (5× larger). When hand-assembling GIFs from Pillow-encoded sub-images, save them with `interlace=False`.

Mechanics: pptxgenjs cannot write animations. Name every animated shape (`objectName`), write a spec, and run `scripts/add_animation.py deck.pptx spec.json` after `applyTheme`. Motion paths are offsets from the shape's **original** position in slide fractions (write each click's path from the origin). QA with `scripts/storyboard.py deck.pptx spec.json OUT --mover <name>` (frame per click + `preview.gif`) because LibreOffice renders only the final state. Tell the user to play it once in PowerPoint for timing.

## 6. QA — required before delivering

1. `bash scripts/setup_qa_fonts.sh` once per machine (aliases Arial Black → Archivo Black so overflow checks are honest).
2. `python scripts/check_pptx.py deck.pptx` — catches what PowerPoint repairs but LibreOffice/validators accept (**negative line extents**), leftover placeholders, missing notes.
3. `pptx` skill's `validate.py`, then render every slide to images and look at them fresh: overflow, collisions, contrast, mid-word breaks (`SATU-` / `SATUNYA`), figures covering labels.
4. Run the design-taste pre-flight: *could this deck have come from a default agent? Is any slide a template layout? Does every image sit in the composition?* If yes, redo that slide.

Report what was verified, what is placeholder (`[ISI …]`), and which claims need a subject-matter check.

---
Attribution: principles adapted from **Impeccable** (pbakaus/impeccable, Apache-2.0) and **design-taste** (madebymustafa/design-taste, MIT). See `ATTRIBUTION.md` at the repo root.
