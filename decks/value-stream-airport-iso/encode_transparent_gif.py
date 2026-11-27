"""Encode RGBA frames into a small transparent GIF with no ghost trails.

GIF alpha is on/off only, and a frame drawn with "keep" disposal cannot turn a pixel back to
transparent. Full frames with "restore to background" are correct but huge (69 MB for the airport
map). This encoder writes **only the changed rectangle** of each frame and switches the previous
frame to disposal 2 (clear its rectangle) only when the next frame needs pixels to become
transparent again - e.g. where the plane was a moment ago.

Steps: blend semi-transparent edges against a matte (slide background, default white) and make
alpha binary; quantise to one shared 255-colour palette (+1 transparent index); merge identical
consecutive frames; then assemble the GIF container by hand (Pillow LZW-encodes each sub-image).

Usage: python encode_transparent_gif.py FRAMES_DIR OUT.gif [--fps-in 25] [--step 2] [--matte FFFFFF] [--width 1920]
"""
import argparse, glob, io, struct
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("frames"); ap.add_argument("out")
ap.add_argument("--fps-in", type=float, default=25); ap.add_argument("--step", type=int, default=2)
ap.add_argument("--matte", default="FFFFFF"); ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--verify", action="store_true", help="decode the result and compare every frame")
a = ap.parse_args()

matte = np.array([int(a.matte[i:i + 2], 16) for i in (0, 2, 4)], float)
files = sorted(glob.glob(f"{a.frames}/f*.png"))[::a.step]
frame_ms = 1000 / a.fps_in * a.step
NC, T = 255, 255                                   # 255 colours + transparent index 255


def flatten(path):
    im = Image.open(path).convert("RGBA")
    if im.width != a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)
    x = np.asarray(im, float); al = x[..., 3:] / 255
    rgb = x[..., :3] * al + matte * (1 - al)
    return rgb.astype("uint8"), al[..., 0] > 0.12


# shared palette from a spread of frames (opaque pixels only)
sample_idx = np.linspace(0, len(files) - 1, 8).astype(int)
pool = np.concatenate([(lambda f: f[0][f[1]])(flatten(files[i])) for i in sample_idx])
pool = pool[np.random.default_rng(0).choice(len(pool), min(len(pool), 600_000), replace=False)]
pal = Image.fromarray(pool[None, :, :]).quantize(colors=NC, method=Image.Quantize.MEDIANCUT)
palette = (pal.getpalette()[:NC * 3] + [0] * (NC * 3))[:NC * 3] + [255, 0, 255]

# quantise + merge identical frames
frames, durs, prev = [], [], None
for f in files:
    rgb, keep = flatten(f)
    arr = np.asarray(Image.fromarray(rgb).quantize(palette=pal, dither=Image.Dither.NONE)).copy()
    arr[~keep] = T
    if prev is not None and np.array_equal(arr, prev):
        durs[-1] += frame_ms; continue
    frames.append(arr); durs.append(frame_ms); prev = arr
H, W = frames[0].shape


def bbox(mask):
    ys, xs = np.where(mask)
    return None if len(xs) == 0 else [xs.min(), ys.min(), xs.max() + 1, ys.max() + 1]


def union(r, q):
    if r is None: return q
    if q is None: return r
    return [min(r[0], q[0]), min(r[1], q[1]), max(r[2], q[2]), max(r[3], q[3])]


# plan rectangles and disposal
rects, disp = [[0, 0, W, H]], [1]
for k in range(1, len(frames)):
    a0, a1 = frames[k - 1], frames[k]
    clear = (a0 != T) & (a1 == T)                  # pixels that must become transparent again
    r = bbox(a0 != a1)
    if clear.any():
        rects[k - 1] = union(rects[k - 1], bbox(clear)); disp[k - 1] = 2
        r = union(r, rects[k - 1])                 # previous rect gets cleared: redraw it
    rects.append(r or [0, 0, 1, 1]); disp.append(1)


def lzw_block(sub):
    """Encode a palette sub-image with Pillow and return (min_code_size+data sub-blocks) bytes."""
    img = Image.fromarray(sub, "P"); img.putpalette(palette)
    buf = io.BytesIO(); img.save(buf, "GIF", optimize=False, interlace=False); b = buf.getvalue()
    p = 13 + (3 * (2 ** ((b[10] & 7) + 1)) if b[10] & 0x80 else 0)
    while b[p] == 0x21:                             # skip extensions
        p += 2
        while b[p]: p += b[p] + 1
        p += 1
    assert b[p] == 0x2C
    flags = b[p + 9]; p += 10
    if flags & 0x80: p += 3 * (2 ** ((flags & 7) + 1))
    start = p; p += 1
    while b[p]: p += b[p] + 1
    return b[start:p + 1]


out = bytearray(b"GIF89a")
out += struct.pack("<HHBBB", W, H, 0xF7, 0, 0)     # global colour table, 256 entries
out += bytes(palette)
out += b"\x21\xFF\x0BNETSCAPE2.0\x03\x01\x00\x00\x00"   # loop forever
for k, arr in enumerate(frames):
    x0, y0, x1, y1 = rects[k]
    gce_flags = (disp[k] << 2) | 1                 # disposal + transparent flag
    out += b"\x21\xF9\x04" + struct.pack("<BHB", gce_flags, round(durs[k] / 10), T) + b"\x00"
    out += b"\x2C" + struct.pack("<HHHHB", x0, y0, x1 - x0, y1 - y0, 0)
    out += lzw_block(np.ascontiguousarray(arr[y0:y1, x0:x1]))
out += b"\x3B"
open(a.out, "wb").write(out)
if a.verify:
    from PIL import ImageSequence
    lut = np.array(palette, "uint8").reshape(-1, 3)
    got = [np.asarray(f.convert("RGBA")) for f in ImageSequence.Iterator(Image.open(a.out))]
    assert len(got) == len(frames), (len(got), len(frames))
    bad = 0
    for k, (g, e) in enumerate(zip(got, frames)):
        ea = e != T
        am = int(((g[..., 3] > 0) != ea).sum()); cm = int((g[..., :3][ea] != lut[e[ea]]).any(1).sum())
        if am or cm:
            bad += 1
            if bad <= 3: print(f"  frame {k}: alpha mismatches {am}, colour mismatches {cm}, rect {rects[k]}, disposal {disp[k]}")
    print(f"verify: {len(frames) - bad}/{len(frames)} frames decode exactly as intended")
area = sum((r[2] - r[0]) * (r[3] - r[1]) for r in rects) / (W * H * len(rects))
print(f"{len(files)} frames -> {len(frames)} unique, avg rect {area:.0%} of canvas, {sum(durs) / 1000:.1f} s -> {a.out}")
