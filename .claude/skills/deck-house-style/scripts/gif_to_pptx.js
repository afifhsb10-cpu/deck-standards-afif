// Wrap an animated GIF in a one-slide 16:9 .pptx (PowerPoint animates GIFs in slideshow).
// Usage: NODE_PATH=<repo>/node_modules node gif_to_pptx.js ANIM.gif OUT.pptx
//          [--title "Judul"] [--title-zone 1.5] [--width 12.5] [--bg F3F6FA] [--notes notes.txt]
//   The GIF is centred horizontally, its height follows its aspect ratio, and it sits under the title zone
//   (inches from the top). Without --title the zone stays empty for the user's own title.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [GIF, OUT] = args;
if (!GIF || !OUT) { console.error("usage: node gif_to_pptx.js ANIM.gif OUT.pptx [options]"); process.exit(2); }
const buf = fs.readFileSync(GIF);
if (buf.slice(0, 3).toString() !== "GIF") throw new Error("not a GIF: " + GIF);
const gw = buf.readUInt16LE(6), gh = buf.readUInt16LE(8);
const ZONE = +opt("--title-zone", 1.5), BG = opt("--bg", "FFFFFF");
let W = +opt("--width", 12.5), H = W * gh / gw;
if (H > 7.5 - ZONE - 0.1) { H = 7.5 - ZONE - 0.1; W = H * gw / gh; }      // keep it under the title
const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE";
const s = pres.addSlide(); s.background = { color: BG };
const title = opt("--title", null);
if (title) s.addText(title, { x: 0.6, y: 0.4, w: 12.1, h: ZONE - 0.5, fontSize: 28, bold: true, color: "1C1F24", valign: "bottom", isTextBox: true, margin: 0, objectName: "judul" });
s.addImage({ path: path.resolve(GIF), x: (13.333 - W) / 2, y: ZONE + (7.5 - ZONE - H) / 2, w: W, h: H, altText: path.basename(GIF), objectName: "animasi" });
const notes = opt("--notes", null); if (notes) s.addNotes(fs.readFileSync(notes, "utf8"));
pres.writeFile({ fileName: OUT }).then(() => { execFileSync("zip", ["-dq", OUT, "*/"]); console.log(`wrote ${OUT} (GIF ${gw}x${gh} at ${W.toFixed(2)}" x ${H.toFixed(2)}")`); });
