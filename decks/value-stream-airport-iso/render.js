// Render scene.html frame by frame (deterministic render(t)) and encode the animation.
// Usage: node render.js OUT_DIR [--fps 25] [--gif-fps 12.5] [--gif-width 1920] [--only t1,t2,...] [--transparent [--matte FFFFFF]]
//   default       -> value-stream-airport.mp4 + .gif + poster.png (white ground)
//   --transparent -> value-stream-airport-transparent.gif + poster-transparent.png (no ground).
//                    GIF alpha is on/off only, so semi-transparent edge pixels are blended against
//                    --matte (default white) before the alpha is made binary: clean on white/light slides.
//                    Encoded by encode_transparent_gif.py (ffmpeg loses its delta optimisation with alpha).
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const OUT = path.resolve(args[0] || "out");
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt("--fps", 25), GIF_FPS = +opt("--gif-fps", 12.5), GIF_W = +opt("--gif-width", 1920);
const ONLY = opt("--only", null);
const TRANSPARENT = args.includes("--transparent");
const MATTE = opt("--matte", "FFFFFF");

(async () => {
  fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, "scene.html") + (TRANSPARENT ? "?transparent=1" : ""));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const duration = await page.evaluate(() => window.DURATION);
  const sceneH = await page.evaluate(() => window.SCENE_H || 1080);
  await page.setViewportSize({ width: 1920, height: sceneH });
  const times = ONLY ? ONLY.split(",").map(Number) : [...Array(Math.ceil(duration * FPS)).keys()].map((f) => f / FPS);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate((t) => window.render(t), times[i]);
    const name = ONLY ? `t${times[i]}.png` : `f${String(i).padStart(4, "0")}.png`;
    await page.screenshot({ path: path.join(OUT, "frames", name), omitBackground: TRANSPARENT });
  }
  await browser.close();
  console.log(`${times.length} frames, ${duration.toFixed(1)} s${TRANSPARENT ? " (transparent)" : ""}`);
  if (ONLY) return;
  const ff = (a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], { stdio: "inherit" });
  const last = path.join(OUT, "frames", `f${String(times.length - 1).padStart(4, "0")}.png`);
  if (TRANSPARENT) {
    fs.copyFileSync(last, path.join(OUT, "poster-transparent.png"));          // true alpha, before flattening
    execFileSync("python3", [path.join(__dirname, "encode_transparent_gif.py"), path.join(OUT, "frames"),
      path.join(OUT, "value-stream-airport-transparent.gif"), "--fps-in", String(FPS), "--step", String(Math.round(FPS / GIF_FPS)),
      "--matte", MATTE, "--width", String(GIF_W)], { stdio: "inherit" });
    console.log("encoded transparent gif + poster-transparent.png");
    return;
  }
  const src = ["-framerate", String(FPS), "-i", path.join(OUT, "frames", "f%04d.png")];
  ff([...src, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", path.join(OUT, "value-stream-airport.mp4")]);
  ff([...src, "-vf", `fps=${GIF_FPS},scale=${GIF_W}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, "-loop", "0", path.join(OUT, "value-stream-airport.gif")]);
  fs.copyFileSync(last, path.join(OUT, "poster.png"));
  console.log("encoded mp4 + gif + poster");
})();
