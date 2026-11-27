"""Remove the plain white backdrop from a generated illustration (FLUX "plain pure white background").

Only near-white pixels CONNECTED TO THE IMAGE BORDER become transparent, so white parts inside the
subject (paper, screens, shirts) stay. Edges get a 1-px erosion + soft feather; the result is cropped
to the subject with a small pad.

Caveat: light parts that TOUCH the border region are removed too - flat illustrations that rely on
white shapes look "holed" on dark slides. Keep such scenes on a white/light ground.

Usage: python cutout.py SRC.jpg OUT.png [--threshold 232] [--pad 12]
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--threshold", type=int, default=232); ap.add_argument("--pad", type=int, default=12)
a = ap.parse_args()

im = Image.open(a.src).convert("RGB"); x = np.asarray(im).astype(int)
near = (x.min(2) > a.threshold) & ((x.max(2) - x.min(2)) < 14)
m = Image.fromarray((near * 255).astype("uint8")).copy()   # .copy(): numpy-backed images are read-only in Pillow 12
h, w = near.shape
for p in [(i, j) for i in range(0, w, 4) for j in (0, h - 1)] + [(i, j) for j in range(0, h, 4) for i in (0, w - 1)]:
    if m.getpixel(p) == 255: ImageDraw.floodfill(m, p, 128)
bg = np.asarray(m) == 128
alpha = Image.fromarray(((~bg) * 255).astype("uint8")).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
rgba = im.convert("RGBA"); rgba.putalpha(alpha)
bb = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
rgba.crop((max(0, bb[0] - a.pad), max(0, bb[1] - a.pad), min(w, bb[2] + a.pad), min(h, bb[3] + a.pad))).save(a.out)
print(f"{a.out}: background {bg.mean():.0%} removed")
