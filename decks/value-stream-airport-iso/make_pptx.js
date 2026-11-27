// One full-bleed 16:9 slide holding the animated GIF (PowerPoint plays it in slideshow, looping).
// Usage: NODE_PATH=<repo>/node_modules node make_pptx.js [out.pptx] [--white]   (default: transparent GIF)
const pptxgen = require("pptxgenjs");
const path = require("path");
const args = process.argv.slice(2);
const TRANSPARENT = !args.includes("--white");
const OUT = args.find((a) => a.endsWith(".pptx")) || path.join(__dirname, "out", "Value_Stream_Airport.pptx");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Value Stream: Analogi Perjalanan Udara (denah bandara, animasi)";
const s = pres.addSlide();
s.background = { color: "F3F6FA" };   // light tint so the transparent GIF is visibly background-free
// GIF is 1920x900: placed under a two-line slide title (title zone ~0-1.5"), centred horizontally.
const GW = 12.5, GH = GW * 900 / 1920;
s.addText("[Judul slide]", { x: 0.6, y: 0.55, w: 12.1, h: 0.9, fontSize: 28, bold: true, color: "16325C", isTextBox: true, margin: 0, objectName: "judul" });
s.addImage({ path: path.join(__dirname, "out", TRANSPARENT ? "value-stream-airport-transparent.gif" : "value-stream-airport.gif"), x: (13.333 - GW) / 2, y: 7.5 - GH - 0.1, w: GW, h: GH,
  altText: "Animasi denah bandara isometrik: pesawat melewati sepuluh value stream MIND ID, lepas landas setelah gate, mendarat, lalu ke aula kedatangan dan lounge", objectName: "animasi" });
s.addNotes([
  "Satu GIF animasi ±45 detik, berulang otomatis saat slideshow. Tidak perlu klik.",
  "Denah bandara isometrik; panel kanan menampilkan langkah yang sedang disinggahi. Urutan: 1 Strategy to Plan (agen perjalanan) → 2 Invest to Value (konter tiket) → 3 Permit to Operate (imigrasi) → 6 Hire to Retire (rombongan di check-in) → 4 Asset to Productivity (bag drop) → 9 Detect to Protect (pemeriksaan keamanan) → 10 Data to Decision (papan keberangkatan) → 8 Narrative to Trust (ruang tunggu gate).",
  "Lalu pesawat taxi ke landasan, lepas landas, berputar di udara, mendarat → 5 Target to Performance (aula kedatangan) → 7 Idea to Impact (lounge). Di akhir panel menampilkan rekap kesepuluh langkah.",
  "Setiap titik: pesawat berhenti ±2,4 detik. Bila butuh jeda per langkah, pakai MP4 (bisa di-pause).",
].join("\n\n"));
pres.writeFile({ fileName: OUT }).then(() => { require("child_process").execFileSync("zip", ["-dq", OUT, "*/"]); console.log("wrote", OUT); });
