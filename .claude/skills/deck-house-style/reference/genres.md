# Genre packs for decks

Adapted from design-taste (MIT) for 16:9 PowerPoint (13.333" × 7.5"). One pack per deck. Brand colors, if given, replace the pack palette; composition and type rules stay.

## brutalist-industrial ("field manual") — proven in BLS deck
- **Palette:** paper `F2F1EC`, ink `141414`, secondary ink `6E6C64`, night ground `1B1B18` (max 2 night slides), one signal color (emergency red `DA291C`, safety orange `E8540B`, industrial yellow `E3B23C`, or technical blue `2B5FA8`).
- **Type:** display `Arial Black` UPPERCASE (titles 28pt, statements 40–60pt, numerals 140–220pt); body `Arial` 14–17pt; labels `Consolas` 9–10pt uppercase, letter-spaced.
- **Frame:** masthead on every layout — top rule at y 0.5", bottom rule at y 7.0", mono coordinate labels (`BLS — PANDUAN LAPANGAN` left, `03 / 07 — SECTION` right, `FIG. 03 — …` bottom).
- **Structure:** ledgers with full rules (vertical + horizontal), instrument panels (2×2 cells: mono label / big value / mono unit), one signal-filled cell for the featured item. Square corners only; no shadows.
- **Imagery:** halftone cut-outs (ink on paper, paper on night, signal for the closing echo).

## cinematic-night ("one light in the dark") — proven in Modus Senyap deck
- **Palette:** night ground `0B0F14`, surface `141B24`, text `ECEFF3`, muted `9BA7B6` (≈8:1 on ground), hairline `2A3442`, one light accent — sodium amber `F0A646`. The accent is *the light source* of every photo; keep it to the light, numbers and one italic word.
- **Type:** serif display (`Cambria`) at normal weight, left-aligned, 32–72pt; italic serif for the closing line with the key word in amber; body `Calibri` 14–18pt.
- **Structure:** half-bleed photo (5.42" × 7.5") on alternating sides with the topic's name set *on the image* ("Modus 1 dari 5 / Fake BTS") instead of a kicker; numbered steps as amber serif numerals; evidence as a big amber figure beside its sentence (not a card); one tinted rounded panel for the action line with a drawn icon; summary as rows with square thumbnails of the earlier images.
- **Imagery:** realistic documentary photography at night, one warm practical light + cool ambient, generated at 28 steps; graded with `photo_grade.py` (edge fades into the ground, bottom fade for the on-image caption). Cover and closing full-bleed with heavy left fade for the title.
- **Use for:** risk, fraud, security, investigations, anything whose message is "what you don't notice".

## editorial-minimal ("Swiss broadsheet")
- **Palette:** paper `F5F1EA`, ink `1A1A18`, secondary `6B675E`, one vermillion `E34A2B` (or deep red `C73E1D`). No dark slides.
- **Type:** serif display (`Cambria`; `Georgia` with slack) large, normal weight; mono or small-caps labels; body `Calibri`/serif 15–17pt.
- **Structure:** asymmetric 7/5 split, indexed rows with hairlines, metrics as mono-typeset tables, italic serif pull-quotes. Tonal panels `EFEAE1`, square corners.
- **Imagery:** full-bleed photo with 1px hairline frame, or halftone in ink.

## retro-print ("riso poster")
- **Palette:** stock `F4EDDE`, ink `21201C`, riso red `E4572E` (+ optional riso blue `355E8C`). Never a third ink.
- **Type:** condensed heavy display uppercase; serif body; mono labels. Misregistration: duplicate a heading 2–3pt offset in the second ink, max 2–3 headings per deck.
- **Texture:** halftone figures and dot fields (max ~2 per deck), dashed rotated "stamp" (max 2).
- **Imagery:** halftone or duotone toward the inks.

## dark-tech
- Near-black ground, hairline borders, mono metadata, one restrained accent. Lists over cards. Imagery: product/UI or halftone in a single light tone.

## quiet-luxury
- Ivory ground, deep ink, one brass or oxblood accent, serif with italic flourishes, very generous whitespace, few words per slide. Imagery: duotone photography, full-bleed with long fades.

## corporate-trust
- White ground, one deep-blue accent, evidence tables, compliance chips (square), restraint. Imagery: documentary photography, edge-bleed, never stock-smile clichés.

## Mixing rule
A deck may borrow **one technique** from a second pack (e.g. brutalist + retro-print halftone) when the read justifies it — say so in the design read.
