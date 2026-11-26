// Render scene.html frame by frame (deterministic render(t)) and encode MP4 + GIF + poster PNG.
// Usage: node render.js OUT_DIR [--fps 25] [--gif-fps 12.5] [--gif-width 1920] [--only t1,t2,...]
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const OUT = path.resolve(args[0] || "out");
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt("--fps", 25), GIF_FPS = +opt("--gif-fps", 12.5), GIF_W = +opt("--gif-width", 1920);
const ONLY = opt("--only", null);

(async () => {
  fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, "scene.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const duration = await page.evaluate(() => window.DURATION);
  const sceneH = await page.evaluate(() => window.SCENE_H || 1080);
  await page.setViewportSize({ width: 1920, height: sceneH });
  const times = ONLY ? ONLY.split(",").map(Number) : [...Array(Math.ceil(duration * FPS)).keys()].map((f) => f / FPS);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate((t) => window.render(t), times[i]);
    const name = ONLY ? `t${times[i]}.png` : `f${String(i).padStart(4, "0")}.png`;
    await page.screenshot({ path: path.join(OUT, "frames", name) });
  }
  await browser.close();
  console.log(`${times.length} frames, ${duration.toFixed(1)} s`);
  if (ONLY) return;
  const ff = (a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], { stdio: "inherit" });
  const src = ["-framerate", String(FPS), "-i", path.join(OUT, "frames", "f%04d.png")];
  ff([...src, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", path.join(OUT, "value-stream-flight.mp4")]);
  ff([...src, "-vf", `fps=${GIF_FPS},scale=${GIF_W}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, "-loop", "0", path.join(OUT, "value-stream-flight.gif")]);
  fs.copyFileSync(path.join(OUT, "frames", `f${String(times.length - 1).padStart(4, "0")}.png`), path.join(OUT, "poster.png"));
  console.log("encoded mp4 + gif + poster");
})();
