# deck-standards-afif

This repo holds the house standard for slide decks.

- For any request to make, redesign or restyle a deck / presentation / slides / .pptx, load the `deck-house-style` skill **first**, then the `pptx` skill for file mechanics. Follow the skill's workflow: design read → one genre pack → imagery via NVIDIA FLUX klein (studio cut-out → halftone or composed photo) → build → QA (`check_pptx.py`, validate, render every slide).
- Deliverable decks go in `decks/<name>/` (the `.pptx`, its `build.js`, and the processed assets). Raw generated images and scratch renders stay out of git.
- Default language for slide copy and speaker notes: Bahasa Indonesia, unless the user asks otherwise.
- Never ship a deck that `check_pptx.py` reports errors on — PowerPoint will ask to repair it.
