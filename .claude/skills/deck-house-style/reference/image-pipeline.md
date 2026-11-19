# Image pipeline — NVIDIA FLUX klein → composed figure

## Endpoint (verified Nov 2026)
`POST https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux-3-image-klein`
Body: `{"prompt": "...", "width": W, "height": H, "steps": 28}`
- `seed` → **rejected** (`extra_forbidden`). Variants come from repeated calls.
- `aspect_ratio` must be one of the listed literals; prefer explicit `width`/`height` (e.g. 1344×768, 832×1152, 1024×1024).
- `steps`: 4 is the fast default but produces mushy hands/faces; **use 28**.
- Response: `artifacts[0].base64` (JPEG), `finishReason`. An empty image with `CONTENT_FILTERED` means the prompt tripped the filter.
- Auth: in Claude Code cloud sessions the proxy injects the key for `ai.api.nvidia.com`; send any dummy bearer. Elsewhere set `NVIDIA_API_KEY`.
- Not available as hosted API: `stable-diffusion-3.5-large` (download-only NIM).

## Content-filter triggers seen
- Camera **brand names** ("Sony A7 IV") → filtered. Use "35mm lens, f/2, high ISO".
- Some person + bed phrasings ("woman lying in bed") → filtered. Rephrase scene (sofa, office).

## Prompt recipes
Studio cut-out (for halftone / compositing):
```
<subject, pose, view>, studio photograph on a seamless plain pure white backdrop, isolated subject,
nothing else in frame, soft even lighting, crisp edges, high contrast, sharp focus, realistic,
true-to-life proportions, anatomically correct hands, no text, no letters, no logos, no watermark
```
Documentary scene (for full-bleed photographic use):
```
<scene>, realistic documentary photograph, editorial photojournalism, <lighting matching the deck>,
sharp focus on the subject, natural textures, true-to-life colors and proportions, 35mm lens,
no text, no letters, no logos, no watermark
```
Tips: describe the **correct procedure** explicitly ("both hands placed on his shoulders, not his chest"); say "no weapons, no badges" for uniforms; prefer subjects that minimise hand count when anatomy keeps failing (objects instead of hands, one hand instead of two). White devices halftone poorly — ask for a dark-bodied variant.

## Selection
`python scripts/contact_sheet.py sheet.jpg "img/*.jpg"` → review. Crop hands/faces at full resolution before choosing. Check procedure correctness, not only aesthetics. Regenerate rather than ship a wrong pose.

## Integration
`scripts/halftone.py` (importable or CLI):
```python
from halftone import halftone
halftone(src, out_png, out_w=2000, cell=14, color="141414", gamma=1.1, floor=0.05,
         contrast=1.0, fade={"left": .45, "bottom": .35, "top": .2})
```
- Auto-crops to the subject; output is RGBA with transparent background.
- `cell` 12–15 px at ~2000 px width reads as deliberate print on a projector.
- `color`: ink on paper slides, paper (`F2F1EC`) on night slides, signal color for an echo/closing.
- `fade`: dissolve an edge that meets the ground or bleeds off the slide.
- Compose: baseline on the layout's bottom rule, overlap a giant numeral, bleed off an edge; keep coordinate labels clear of dots.

Photographic integration (non-halftone): crop to the slot's exact aspect, grade toward the ground (darken/fade gradient baked into the JPEG — pptxgenjs has no gradient fills), full-bleed or half-bleed only.
