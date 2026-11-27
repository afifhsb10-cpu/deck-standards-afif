// Render an HTML animation scene frame by frame and encode it for PowerPoint.
//
// Scene contract (see templates/gif-route-strip/scene.html):
//   window.render(t)  draws the scene at time t seconds - deterministic, no timers / CSS transitions
//   window.DURATION   total length in seconds (loops back to t=0)
//   window.SCENE_H    canvas height in px (width is always 1920)
//   ?transparent=1    query flag: page background transparent, no semi-transparent effects
//
// Usage:
//   node render_scene.js SCENE.html OUT_DIR [--name NAME] [--fps 25] [--gif-fps 12.5] [--gif-width 1920]
//        [--colors 256] [--only t1,t2,...] [--transparent [--matte FFFFFF] [--verify]]
// Outputs:
//   default        OUT_DIR/NAME.mp4, NAME.gif (palette --colors), poster.png
//   --transparent  OUT_DIR/NAME-transparent.gif (changed-rect deltas, see encode_transparent_gif.py), poster-transparent.png
//   --only         OUT_DIR/frames/t<sec>.png only, plus the content bounds of each frame (catch clipping at the edges)
// Needs: playwright (+ its Chromium), ffmpeg, python3 + Pillow + numpy. Run with NODE_PATH=<repo>/node_modules:$(npm root -g).
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length < 2) { console.error("usage: node render_scene.js SCENE.html OUT_DIR [options]"); process.exit(2); }
const SCENE = path.resolve(args[0]), OUT = path.resolve(args[1]);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const NAME = opt("--name", path.basename(path.dirname(SCENE)));
const FPS = +opt("--fps", 25), GIF_FPS = +opt("--gif-fps", 12.5), GIF_W = +opt("--gif-width", 1920), COLORS = +opt("--colors", 256);
const ONLY = opt("--only", null), TRANSPARENT = args.includes("--transparent"), MATTE = opt("--matte", "FFFFFF");

(async () => {
  fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto("file://" + SCENE + (TRANSPARENT ? "?transparent=1" : ""));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const duration = await page.evaluate(() => window.DURATION);
  const sceneH = await page.evaluate(() => window.SCENE_H || 1080);
  if (!duration || (await page.evaluate(() => typeof window.render)) !== "function") throw new Error("scene must define window.render(t) and window.DURATION");
  await page.setViewportSize({ width: 1920, height: sceneH });
  const times = ONLY ? ONLY.split(",").map(Number) : [...Array(Math.ceil(duration * FPS)).keys()].map((f) => f / FPS);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate((t) => window.render(t), times[i]);
    const name = ONLY ? `t${times[i]}.png` : `f${String(i).padStart(4, "0")}.png`;
    await page.screenshot({ path: path.join(OUT, "frames", name), omitBackground: TRANSPARENT });
  }
  await browser.close();
  console.log(`${times.length} frames, ${duration.toFixed(1)} s, 1920x${sceneH}${TRANSPARENT ? " (transparent)" : ""}`);
  if (ONLY) {
    if (TRANSPARENT) execFileSync("python3", ["-c", `
import sys, numpy as np
from PIL import Image
for f in sys.argv[1:]:
    a = np.asarray(Image.open(f))[..., 3] > 0; ys, xs = np.where(a)
    print(f"{f.split('/')[-1]}: content x {xs.min()}-{xs.max()}, y {ys.min()}-{ys.max()} of {a.shape[1]}x{a.shape[0]}" + ("  <- touches an edge" if min(xs.min(), ys.min()) == 0 or xs.max() == a.shape[1]-1 or ys.max() == a.shape[0]-1 else ""))
`, ...times.map((t) => path.join(OUT, "frames", `t${t}.png`))], { stdio: "inherit" });
    return;
  }
  const ff = (a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], { stdio: "inherit" });
  const last = path.join(OUT, "frames", `f${String(times.length - 1).padStart(4, "0")}.png`);
  if (TRANSPARENT) {
    fs.copyFileSync(last, path.join(OUT, "poster-transparent.png"));
    execFileSync("python3", [path.join(__dirname, "encode_transparent_gif.py"), path.join(OUT, "frames"), path.join(OUT, `${NAME}-transparent.gif`),
      "--fps-in", String(FPS), "--step", String(Math.round(FPS / GIF_FPS)), "--matte", MATTE, "--width", String(GIF_W),
      ...(args.includes("--verify") ? ["--verify"] : [])], { stdio: "inherit" });
    return;
  }
  const src = ["-framerate", String(FPS), "-i", path.join(OUT, "frames", "f%04d.png")];
  ff([...src, "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", path.join(OUT, `${NAME}.mp4`)]);
  ff([...src, "-vf", `fps=${GIF_FPS},scale=${GIF_W}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${COLORS}:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, "-loop", "0", path.join(OUT, `${NAME}.gif`)]);
  fs.copyFileSync(last, path.join(OUT, "poster.png"));
  console.log(`encoded ${NAME}.mp4 + ${NAME}.gif + poster.png`);
})().catch((e) => { console.error(e.message); process.exit(1); });
