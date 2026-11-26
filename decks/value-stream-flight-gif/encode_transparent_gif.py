"""Encode RGBA frames into a transparent GIF that stays small and has no ghost trails.

GIF alpha is on/off only and ffmpeg drops its delta optimisation once frames carry alpha (33 MB here),
so this encoder:
  1. blends semi-transparent edge pixels against a matte (the slide background, default white) and
     makes alpha binary -> smooth edges on that background;
  2. quantises every frame to one shared palette (+1 transparent index);
  3. merges consecutive identical frames into one longer frame (the plane parks ~1 s per stop);
  4. writes full frames with disposal=2 so pixels that become transparent really clear.

Usage: python encode_transparent_gif.py FRAMES_DIR OUT.gif [--fps-in 25] [--step 2] [--matte FFFFFF] [--width 1920]
"""
import argparse, glob
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("frames"); ap.add_argument("out")
ap.add_argument("--fps-in", type=float, default=25); ap.add_argument("--step", type=int, default=2)
ap.add_argument("--matte", default="FFFFFF"); ap.add_argument("--width", type=int, default=1920)
a = ap.parse_args()

matte = np.array([int(a.matte[i:i + 2], 16) for i in (0, 2, 4)], float)
files = sorted(glob.glob(f"{a.frames}/f*.png"))[::a.step]
frame_ms = 1000 / a.fps_in * a.step


def flatten(path):
    im = Image.open(path).convert("RGBA")
    if im.width != a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)
    x = np.asarray(im, float); al = x[..., 3:] / 255
    rgb = x[..., :3] * al + matte * (1 - al)
    keep = al[..., 0] > 0.12
    return rgb.astype("uint8"), keep


frames = [flatten(f) for f in files]
# shared palette from a few representative frames (opaque pixels only)
pool = np.concatenate([f[0][f[1]] for f in frames[len(frames) // 3::max(1, len(frames) // 6)]])
pal_img = Image.fromarray(pool[np.random.default_rng(0).choice(len(pool), min(len(pool), 400_000), replace=False)][None, :, :])
pal = pal_img.quantize(colors=127, method=Image.Quantize.MEDIANCUT)
palette = pal.getpalette()[:127 * 3] + [255, 0, 255]  # index 127 = transparent
TRANSPARENT = 127

out, durations, prev = [], [], None
for rgb, keep in frames:
    q = Image.fromarray(rgb).quantize(palette=pal, dither=Image.Dither.NONE)
    arr = np.asarray(q).copy(); arr[~keep] = TRANSPARENT
    if prev is not None and np.array_equal(arr, prev):
        durations[-1] += frame_ms; continue
    img = Image.fromarray(arr, "P"); img.putpalette(palette)
    out.append(img); durations.append(frame_ms); prev = arr
durations[-1] += 0  # final hold already contained in the frames
out[0].save(a.out, save_all=True, append_images=out[1:], duration=[round(d) for d in durations],
            loop=0, transparency=TRANSPARENT, disposal=2, optimize=False)
print(f"{len(files)} frames -> {len(out)} unique, {sum(durations) / 1000:.1f} s -> {a.out}")
