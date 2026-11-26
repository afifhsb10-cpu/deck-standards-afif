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
s.addImage({ path: path.join(__dirname, "out", "value-stream-flight.gif"), x: 0, y: 0, w: 13.333, h: 7.5,
  altText: "Animasi peta perjalanan: pesawat melewati sepuluh value stream MIND ID dari merancang itinerary hingga mencatat pelajaran", objectName: "animasi" });
s.addNotes([
  "Slide ini berisi satu GIF animasi (±32 detik, berulang otomatis saat slideshow). Tidak perlu klik.",
  "Urutan yang dilalui pesawat: 1 Strategy to Plan → 2 Invest to Value → 3 Permit to Operate → 6 Hire to Retire → 4 Asset to Productivity (sebelum berangkat) → 9 Detect to Protect → 10 Data to Decision → 8 Narrative to Trust (di bandara dan selama perjalanan) → 5 Target to Performance → 7 Idea to Impact (setelah tiba).",
  "Setiap titik: pesawat berhenti ±1,8 detik, plakat nomor muncul, lalu ilustrasi dan teks. Narasikan sambil pesawat bergerak; bila butuh jeda per langkah, pakai versi MP4 (bisa di-pause) atau slide versi klik di decks/value-stream-mind-id.",
  "Penutup: pesawat mendarat, pin tujuan dan pesan kunci muncul — perjalanan berhasil bila setiap langkah dijalankan dengan baik dan saling terhubung. Begitu pula MIND ID.",
].join("\n\n"));
pres.writeFile({ fileName: OUT }).then(() => {
  // drop folder entries from the zip (some cloud viewers refuse them)
  require("child_process").execFileSync("zip", ["-dq", OUT, "*/"]);
  console.log("wrote", OUT);
});
