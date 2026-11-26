// One full-bleed slide holding the animated GIF (PowerPoint plays it in slideshow, looping).
// Usage: NODE_PATH=<repo>/node_modules node make_pptx.js [out.pptx]
const pptxgen = require("pptxgenjs");
const path = require("path");
const OUT = process.argv[2] || path.join(__dirname, "out", "Value_Stream_Flight.pptx");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Value Stream MIND ID: Analogi Perjalanan Udara (animasi)";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };
const GW = 12.9, GH = GW * 940 / 1920; // GIF is 1920x940 (journey only); centred, room for a title above if needed
s.addImage({ path: path.join(__dirname, "out", "value-stream-flight.gif"), x: (13.333 - GW) / 2, y: 7.5 - GH - 0.25, w: GW, h: GH,
  altText: "Animasi peta perjalanan: pesawat melewati sepuluh value stream MIND ID dari merancang itinerary hingga mencatat pelajaran", objectName: "animasi" });
s.addNotes([
  "Slide ini berisi satu GIF animasi (±34 detik, berulang otomatis saat slideshow). Tidak perlu klik. Ruang di atas GIF bisa dipakai untuk judul slide.",
  "Urutan yang dilalui pesawat: 1 Strategy to Plan → 2 Invest to Value → 3 Permit to Operate → 6 Hire to Retire → 4 Asset to Productivity (sebelum berangkat) → 9 Detect to Protect → 10 Data to Decision → 8 Narrative to Trust (di bandara dan selama perjalanan) → 5 Target to Performance → 7 Idea to Impact (setelah tiba).",
  "Setiap titik: pesawat berhenti ±2 detik, plakat nomor muncul, lalu ilustrasi dan teks. Narasikan sambil pesawat bergerak; bila butuh jeda per langkah, pakai versi MP4 (bisa di-pause) atau slide versi klik di decks/value-stream-mind-id.",
  "Penutup: pesawat mendarat di pin tujuan setelah langkah 7.",
].join("\n\n"));
pres.writeFile({ fileName: OUT }).then(() => {
  // drop folder entries from the zip (some cloud viewers refuse them)
  require("child_process").execFileSync("zip", ["-dq", OUT, "*/"]);
  console.log("wrote", OUT);
});
