import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
def halftone(src, out, out_w, cell=11, color="141414", angle=45, gamma=0.85, floor=0.07, ss=3, crop=None, pad=0.03, fade=None, contrast=1.0):
    im = Image.open(src).convert("L")
    if crop: im = im.crop(crop)
    g = np.asarray(im, float) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1)
    d = np.clip((1 - g - floor) / (1 - floor), 0, 1) ** gamma
    # auto-crop to subject
    ys, xs = np.where(d > 0.05); h0, w0 = d.shape
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    py, px = int(h0 * pad), int(w0 * pad)
    y0, x0 = max(0, y0 - py), max(0, x0 - px); y1, x1 = min(h0, y1 + py), min(w0, x1 + px)
    d = d[y0:y1, x0:x1]; h, w = d.shape
    scale = out_w / w; out_h = int(h * scale)
    dm = np.asarray(Image.fromarray((d * 255).astype("uint8")).resize((out_w, out_h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(cell * 0.35)), float) / 255
    if fade:
        yy, xx = np.mgrid[0:out_h, 0:out_w]
        f = np.ones((out_h, out_w))
        for side, fr in fade.items():
            if side == 'left': f *= np.clip(xx / (out_w * fr), 0, 1)
            if side == 'right': f *= np.clip((out_w - xx) / (out_w * fr), 0, 1)
            if side == 'top': f *= np.clip(yy / (out_h * fr), 0, 1)
            if side == 'bottom': f *= np.clip((out_h - yy) / (out_h * fr), 0, 1)
        dm = dm * f ** 1.3
    W, H = out_w * ss, out_h * ss
    canvas = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(canvas)
    a = math.radians(angle); ca, sa = math.cos(a), math.sin(a)
    R = int(math.hypot(out_w, out_h) / cell) + 2
    cx, cy = out_w / 2, out_h / 2
    for i in range(-R, R):
        for j in range(-R, R):
            u, v = i * cell, j * cell
            x = cx + u * ca - v * sa; y = cy + u * sa + v * ca
            if 0 <= x < out_w and 0 <= y < out_h:
                t = dm[int(y), int(x)]
                if t < 0.04: continue
                r = cell * 0.5 * math.sqrt(t) * 1.25
                dr.ellipse([(x - r) * ss, (y - r) * ss, (x + r) * ss, (y + r) * ss], fill=255)
    alpha = canvas.resize((out_w, out_h), Image.LANCZOS)
    rgb = tuple(int(color[k:k + 2], 16) for k in (0, 2, 4))
    img = Image.new("RGBA", (out_w, out_h), rgb + (0,)); img.putalpha(alpha)
    img.save(out); return out_w, out_h
if __name__ == "__main__":
    a = sys.argv
    print(halftone(a[1], a[2], int(a[3]), cell=float(a[4]), color=a[5]))
