---
name: deck-house-style
description: House standard for every slide deck / presentation / .pptx made here. Load it whenever the user asks for a deck, slides, a presentation, a pitch, a training or safety-talk deck, or a redesign of an existing .pptx — before choosing colors, fonts, layout or generating any image. It merges the Impeccable design principles with the design-taste genre packs, adds the NVIDIA FLUX image pipeline (photo → halftone, no "pasted" pictures) and the PPTX pitfalls that make PowerPoint ask to repair a file. Use together with the pptx skill, which owns the file mechanics.
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

## 1. Pick ONE genre pack

Pick by content, then commit for the whole deck. Details: [reference/genres.md](reference/genres.md).

| Deck content | Default genre |
|---|---|
| Procedures, safety, K3, SOP, training, incident briefings | **brutalist-industrial** + halftone ("field manual") |
| Executive reports, strategy, research findings | **editorial-minimal** (Swiss broadsheet) |
| Awareness campaigns, internal events, culture | **retro-print** (riso, two inks max) |
| Product / tech demos, engineering reviews | **dark-tech** |
| Board / investor / formal finance | **quiet-luxury** |
| Regulated, compliance, customer-facing trust | **corporate-trust** |

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
5. Photographic (non-halftone) images are allowed when the genre wants them, but must still be composed: full-bleed with a graded fade into the ground, or a half-bleed edge-to-edge — never a floating rectangle.

## 5. Build

Follow the `pptx` skill's structured-deck flow (theme → layouts with the masthead/rules → placeholders → `applyTheme`). Reference implementation of a complete deck in this standard: [examples/bls-field-manual.build.js](examples/bls-field-manual.build.js). Speaker notes on every slide (what to say, timing, cautions). Unverified claims (guideline years, statistics) are flagged to the user, never silently invented.

## 6. QA — required before delivering

1. `bash scripts/setup_qa_fonts.sh` once per machine (aliases Arial Black → Archivo Black so overflow checks are honest).
2. `python scripts/check_pptx.py deck.pptx` — catches what PowerPoint repairs but LibreOffice/validators accept (**negative line extents**), leftover placeholders, missing notes.
3. `pptx` skill's `validate.py`, then render every slide to images and look at them fresh: overflow, collisions, contrast, mid-word breaks (`SATU-` / `SATUNYA`), figures covering labels.
4. Run the design-taste pre-flight: *could this deck have come from a default agent? Is any slide a template layout? Does every image sit in the composition?* If yes, redo that slide.

Report what was verified, what is placeholder (`[ISI …]`), and which claims need a subject-matter check.

---
Attribution: principles adapted from **Impeccable** (pbakaus/impeccable, Apache-2.0) and **design-taste** (madebymustafa/design-taste, MIT). See `ATTRIBUTION.md` at the repo root.
