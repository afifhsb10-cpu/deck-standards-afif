"""Storyboard QA for click animations: renders the slide as it looks after each click.

LibreOffice cannot play PowerPoint animations, so this rebuilds one .pptx per click with only the
shapes that have entered by then (from the add_animation.py spec), moves the motion-path shape
to its stop, applies accumulated spins, then renders every frame and writes a contact sheet + GIF.

Usage:
  python storyboard.py deck.pptx spec.json OUT_DIR [--slide 1] [--mover pesawat] [--soffice path/to/soffice.py]

Approximation: fades/wipes are shown as fully entered; exit effects hide the shape after their click.
"""
import argparse, glob, json, os, subprocess
from pptx import Presentation
from pptx.util import Emu
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pptx"); ap.add_argument("spec"); ap.add_argument("out")
    ap.add_argument("--slide", default="1"); ap.add_argument("--mover", default=None)
    ap.add_argument("--soffice", default=None, help="pptx skill's scripts/office/soffice.py")
    a = ap.parse_args()
    clicks = json.load(open(a.spec))["slides"][a.slide]
    enter, leave = {}, {}
    for k, c in enumerate(clicks, 1):
        for e in c["effects"]:
            if e["type"] in ("fade", "wipe"): enter.setdefault(e["target"], k)
            if e["type"] == "fadeOut": leave.setdefault(e["target"], k)
    stops, spins = [(0.0, 0.0)], [0.0]
    for c in clicks:
        paths = [e["path"] for e in c["effects"] if e["type"] == "path" and (a.mover is None or e["target"] == a.mover)]
        if paths:
            nums = paths[-1].replace("E", "").split(); stops.append((float(nums[-2]), float(nums[-1])))
        else:
            stops.append(stops[-1])
        spins.append(spins[-1] + sum(e.get("by", 0) for e in c["effects"] if e["type"] == "spin"))
    os.makedirs(a.out, exist_ok=True); idx = int(a.slide) - 1
    for k in range(len(clicks) + 1):
        p = Presentation(a.pptx); s = p.slides[idx]; W, H = p.slide_width, p.slide_height
        for sh in list(s.shapes):
            if enter.get(sh.name, 0) > k or leave.get(sh.name, 99) <= k:
                sh._element.getparent().remove(sh._element)
            elif sh.name == a.mover:
                dx, dy = stops[k]; sh.left = Emu(int(sh.left + dx * W)); sh.top = Emu(int(sh.top + dy * H)); sh.rotation = spins[k]
        p.save(os.path.join(a.out, f"f{k:02d}.pptx"))
    soffice = a.soffice or next(iter(glob.glob("/root/.claude/skills/synced/*/pptx/scripts/office/soffice.py")), None)
    frames = []
    for k in range(len(clicks) + 1):
        f = os.path.join(a.out, f"f{k:02d}.pptx")
        cmd = ["python3", soffice] if soffice else ["soffice"]
        subprocess.run(cmd + ["--headless", "--convert-to", "pdf", "--outdir", a.out, f], capture_output=True)
        base = f[:-5]
        subprocess.run(["pdftoppm", "-png", "-r", "90", "-singlefile", "-f", str(idx + 1), "-l", str(idx + 1), base + ".pdf", base], check=True)
        frames.append(Image.open(base + ".png").convert("RGB"))
    w, h = frames[0].size; cols = 3; rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w // 2, rows * h // 2), "white")
    for i, im in enumerate(frames):
        sheet.paste(im.resize((w // 2, h // 2)), ((i % cols) * w // 2, (i // cols) * h // 2))
    sheet.save(os.path.join(a.out, "storyboard.jpg"), quality=88)
    small = [im.resize((1000, int(1000 * h / w))) for im in frames]
    small[0].save(os.path.join(a.out, "preview.gif"), save_all=True, append_images=small[1:] + [small[-1]] * 2,
                  duration=[1200] + [900] * (len(small) - 2) + [2500, 2500, 2500], loop=0, optimize=True)
    print(f"{len(frames)} frames -> {a.out}/storyboard.jpg, preview.gif")


if __name__ == "__main__":
    main()
