"""Compose photographic images into a slide world (the 'cinematic' path, used by Modus Senyap).

Bakes what pptxgenjs cannot do (gradient fills) into the JPEG itself, so a photo dissolves
into the slide ground instead of sitting in a rectangle.

  from photo_grade import load, save, crop_ratio, fade, tint, square_thumb
  a = load("bts_63.jpg")
  a = tint(a, ground="0B0F14", amount=0.08)            # pull toward the deck's ground color
  a = fade(a, "right", 0.35, ground="0B0F14")           # dissolve the edge that meets text
  a = fade(a, "bottom", 0.42, strength=0.92, ground="0B0F14")  # room for a caption on the image
  save(a, "bts_half.jpg")

Recipes used in decks/modus-senyap:
  half-bleed (image left, text right):  fade right 0.35 + bottom 0.42/0.92, tint 0.08
  full-bleed cover/closing:             crop 16:9, fade left 0.8/0.9 (power 0.9) + bottom 0.35/0.85
  dimmed background (behind cards):     crop 16:9, mix 0.55 toward ground, fade bottom 0.6/0.9
"""
import numpy as np
from PIL import Image


def hex_rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), float)


def save(a, path, quality=92):
    Image.fromarray(np.clip(a, 0, 255).astype("uint8")).save(path, quality=quality)


def crop_ratio(a, ratio, cy=0.5, cx=0.5):
    """Crop to width/height = ratio, centred on (cx, cy) as fractions."""
    h, w, _ = a.shape
    if w / h > ratio:
        nw = int(h * ratio); x = int(min(max(cx * w - nw / 2, 0), w - nw)); return a[:, x:x + nw]
    nh = int(w / ratio); y = int(min(max(cy * h - nh / 2, 0), h - nh)); return a[y:y + nh]


def tint(a, ground="0B0F14", amount=0.08):
    return a * (1 - amount) + hex_rgb(ground) * amount


def fade(a, side, frac, strength=1.0, power=1.6, ground="0B0F14"):
    """Blend the given edge into the ground color over `frac` of the image."""
    h, w, _ = a.shape; m = np.zeros((h, w))
    if side in ("left", "right"):
        n = int(w * frac); ramp = np.linspace(0, 1, n) ** power * strength
        if side == "right": m[:, w - n:] = ramp
        else: m[:, :n] = ramp[::-1]
    else:
        n = int(h * frac); ramp = (np.linspace(0, 1, n) ** power * strength)[:, None]
        if side == "bottom": m[h - n:, :] = ramp
        else: m[:n, :] = ramp[::-1]
    m = m[..., None]
    return a * (1 - m) + hex_rgb(ground) * m


def square_thumb(path, out, cy=0.5, frac=0.7, size=360):
    """Square crop around the subject (cy = vertical centre as fraction) for summary rows."""
    im = Image.open(path).convert("RGB"); w, h = im.size; s = int(w * frac)
    t = max(0, min(h - s, int(h * cy) - s // 2)); x0 = (w - s) // 2
    im.crop((x0, t, x0 + s, t + s)).resize((size, size), Image.LANCZOS).save(out, quality=92)
