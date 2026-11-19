// Reference implementation of the deck-house-style standard (BLS "field manual" deck).
// Paths to assets, the pptx skill's apply_theme.js and the notes source are from the session that built it:
// adapt them before reuse. Patterns worth copying: masthead layouts, rule() with flip normalisation,
// ledger / instrument-panel helpers, halftone figure placement on the baseline rule.
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const { applyTheme } = require("/root/.claude/skills/synced/d58f7d14-7c85-49c3-8e4a-1ced79dfb219_1bc288b5-2658-4452-b56d-9c6c08aad2e9/pptx/scripts/apply_theme.js");

const A = (f) => __dirname + "/assets/" + f;
const OUT = process.argv[2] || "bls2.pptx";

// Notes carried over from v1 (same content, new design)
const OLD = fs.readFileSync(__dirname + "/../bls/build.js", "utf8");
const NOTES = [...OLD.matchAll(/s\.addNotes\("((?:[^"\\]|\\.)*)"\)/g)].map((m) => JSON.parse('"' + m[1] + '"'));

// World: emergency field manual — aged paper, ink, one signal red, visible grid.
const HEX = { ink: "141414", paper: "F2F1EC", night: "1B1B18", panel: "E6E4DC", red: "DA291C", ink2: "6E6C64", ruleDark: "4A4944", white: "FFFFFF", mutedDark: "A8A69E" };
const THEME = {
  name: "BLS Field Manual", headFontFace: "Arial Black", bodyFontFace: "Arial",
  colors: { dk1: HEX.ink, lt1: HEX.paper, dk2: HEX.night, lt2: HEX.panel, accent1: HEX.red, accent2: HEX.ink2, accent3: HEX.ruleDark, accent4: HEX.white, accent5: HEX.mutedDark, accent6: "8F1A12", hlink: HEX.red, folHlink: "8F1A12" },
};
const MONO = "Consolas";
const SW = 13.333, L = 0.6, R = 12.733, CW = R - L;

async function dims(f) { const m = await sharp(A(f)).metadata(); return m.width / m.height; }

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Basic Life Support: 5 Menit Pertama yang Menentukan";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const INK = C.text1, PAPER = C.background1, NIGHT = C.text2, PANEL = C.background2, RED = C.accent1, INK2 = C.accent2, RDK = C.accent3, WHITE = C.accent4, MDK = C.accent5;

  // Layouts: the masthead (rules + left coordinate) lives on the layout.
  const mast = (rule, label) => [
    { line: { x: L, y: 0.5, w: CW, h: 0, line: { color: rule, width: 0.75 } } },
    { line: { x: L, y: 7.0, w: CW, h: 0, line: { color: rule, width: 0.75 } } },
    { text: { text: "BLS — PANDUAN LAPANGAN", options: { x: L, y: 0.2, w: 5, h: 0.24, fontFace: MONO, fontSize: 9.5, color: label, charSpacing: 1.5, margin: 0, valign: "bottom" } } },
  ];
  const T = (color, size, y = 0.78, h = 0.75) => [{ placeholder: { options: { name: "title", type: "title", x: L, y, w: CW, h, fontFace: "Arial Black", fontSize: size, color, valign: "top", align: "left", margin: 0 }, text: "" } }];
  pres.defineSlideMaster({ title: "Kertas", background: { color: HEX.paper }, objects: [...mast(INK, INK2), ...T(INK, 28)] });
  pres.defineSlideMaster({ title: "Kertas Sampul", background: { color: HEX.paper }, objects: [...mast(INK, INK2), { placeholder: { options: { name: "title", type: "title", x: L, y: 0.95, w: 6.0, h: 3.9, fontFace: "Arial Black", fontSize: 50, color: INK, valign: "top", align: "left", margin: 0, lineSpacingMultiple: 0.92 }, text: "" } }] });
  pres.defineSlideMaster({ title: "Malam", background: { color: HEX.night }, objects: [...mast(RDK, MDK), ...T(PAPER, 40, 0.8, 0.8)] });

  const tb = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: "Arial", color: INK, valign: "top", ...o });
  const mono = (s, text, o) => tb(s, text, { fontFace: MONO, fontSize: 10, charSpacing: 1.2, color: INK2, ...o });
  const rule = (s, x, y, w, h, color = INK, wt = 0.75) => {
    // PowerPoint rejects negative extents: normalise and flip instead.
    const flipH = w < 0, flipV = h < 0;
    if (flipH) { x += w; w = -w; }
    if (flipV) { y += h; h = -h; }
    return s.addShape(pres.shapes.LINE, { x, y, w, h, flipH, flipV, line: { color, width: wt } });
  };
  const coord = (s, text, color = INK2) => mono(s, text, { x: R - 6, y: 0.2, w: 6, h: 0.24, align: "right", valign: "bottom", fontSize: 9.5, color });
  const foot = (s, left, right, color = INK2) => {
    mono(s, left, { x: L, y: 7.08, w: 8, h: 0.22, fontSize: 9, color });
    if (right) mono(s, right, { x: R - 4.5, y: 7.08, w: 4.5, h: 0.22, fontSize: 9, color, align: "right" });
  };
  const ticks = (s, x, y, n, step, h, color, opts = {}) => {
    for (let i = 0; i < n; i++) {
      const tall = opts.accentEvery && (i + 1) % opts.accentEvery === 0;
      rule(s, x + i * step, y + (tall ? 0 : h * 0.35), 0, tall ? h : h * 0.65, color, opts.wt || 1.5);
    }
  };

  // ---------- 1. Cover ----------
  pres.addSection({ title: "Pembuka" });
  let s = pres.addSlide({ masterName: "Kertas Sampul", sectionTitle: "Pembuka" });
  coord(s, "01 / 07 — PEMBUKA");
  tb(s, "5:00", { x: 5.6, y: 0.62, w: 7.13, h: 3.2, fontFace: "Arial Black", fontSize: 175, color: RED, align: "right", objectName: "Penghitung 5 menit" });
  const rc = await dims("ht_cover.png"), hc = 6.05;
  s.addImage({ path: A("ht_cover.png"), x: R - hc * rc + 0.15, y: 7.0 - hc, w: hc * rc, h: hc, altText: "Ilustrasi halftone: penolong berlutut melakukan kompresi dada dengan lengan lurus" });
  s.addText([
    { text: "BASIC LIFE SUPPORT", options: { fontSize: 18, color: RED, breakLine: true } },
    { text: "5 MENIT PERTAMA YANG MENENTUKAN" },
  ], { placeholder: "title" });
  tb(s, [
    { text: "Henti jantung bisa terjadi di mana saja. ", options: {} },
    { text: "Setiap menit tanpa RJP, peluang selamat turun sekitar 7–10%.", options: { bold: true } },
  ], { x: L, y: 5.05, w: 4.9, h: 0.95, fontSize: 16, lineSpacingMultiple: 1.15, objectName: "Alasan" });
  mono(s, "SUMBER: AMERICAN HEART ASSOCIATION", { x: L, y: 6.15, w: 4.9, h: 0.22, fontSize: 9 });
  foot(s, "[NAMA FASILITATOR] · [UNIT] · [TANGGAL]", "FIG. 01 — KOMPRESI DADA");
  s.addNotes(NOTES[0]);

  // ---------- 2. BLS & chain ----------
  s = pres.addSlide({ masterName: "Kertas", sectionTitle: "Pembuka" });
  coord(s, "02 / 07 — RANTAI KESELAMATAN");
  s.addText("KAMU ADALAH MATA RANTAI PERTAMA", { placeholder: "title" });
  tb(s, [
    { text: "Basic Life Support (BLS) ", options: { bold: true } },
    { text: "adalah pertolongan dasar untuk menjaga darah tetap mengalir ke otak dan jantung sampai tim medis datang." },
  ], { x: L, y: 1.75, w: 6.3, h: 1.2, fontSize: 17, lineSpacingMultiple: 1.2, objectName: "Definisi" });
  rule(s, 7.25, 1.75, 0, 1.2, INK);
  tb(s, [{ text: "4 DARI 5", options: { color: RED, breakLine: true } }, { text: "mata rantai bisa dilakukan orang awam.", options: { fontFace: "Arial", fontSize: 17, color: INK } }],
    { x: 7.55, y: 1.72, w: 5.18, h: 1.25, fontFace: "Arial Black", fontSize: 34, objectName: "Empat dari lima" });
  const chain = [
    ["KENALI", "Tidak merespons, tidak bernapas normal", "KAMU DI SINI"],
    ["PANGGIL", "119 / 112, minta orang ambil AED", "SEGERA"],
    ["RJP", "Tekan keras dan cepat di tengah dada", "TANPA HENTI"],
    ["AED", "Kejut listrik bila dianjurkan", "SECEPATNYA"],
    ["TIM MEDIS", "Perawatan lanjutan", "AMBIL ALIH"],
  ];
  const cy0 = 3.35, ch = 3.35, cw = CW / 5;
  s.addShape(pres.shapes.RECTANGLE, { x: L, y: cy0, w: cw, h: ch, fill: { color: RED }, line: { type: "none" }, objectName: "Mata rantai 1" });
  rule(s, L, cy0, CW, 0); rule(s, L, cy0 + ch, CW, 0);
  for (let i = 1; i < 5; i++) rule(s, L + cw * i, cy0, 0, ch);
  chain.forEach(([w, d, tag], i) => {
    const x = L + cw * i + 0.22, first = i === 0, c1 = first ? WHITE : INK, c2 = first ? WHITE : INK2;
    mono(s, String(i + 1).padStart(2, "0"), { x, y: cy0 + 0.22, w: 1, h: 0.25, color: c2 });
    if (i < 4) mono(s, "→", { x: L + cw * (i + 1) - 0.55, y: cy0 + 0.2, w: 0.4, h: 0.28, fontSize: 13, color: c2, align: "right" });
    tb(s, w, { x, y: cy0 + 0.85, w: cw - 0.4, h: 0.5, fontFace: "Arial Black", fontSize: 19, color: c1 });
    tb(s, d, { x, y: cy0 + 1.45, w: cw - 0.4, h: 1.0, fontSize: 14, color: c1, lineSpacingMultiple: 1.1 });
    mono(s, tag, { x, y: cy0 + ch - 0.45, w: cw - 0.4, h: 0.25, color: first ? WHITE : RED, bold: true });
  });
  foot(s, "RANTAI KESELAMATAN: KENALI → PANGGIL → RJP → AED → TIM MEDIS", "BLS / 2025");
  s.addNotes(NOTES[1]);

  // ---------- 3. Recognize & call ----------
  pres.addSection({ title: "Langkah" });
  s = pres.addSlide({ masterName: "Kertas", sectionTitle: "Langkah" });
  coord(s, "03 / 07 — KENALI & PANGGIL");
  s.addText("KENALI DAN PANGGIL BANTUAN", { placeholder: "title" });
  mono(s, "DETIK MAKSIMAL UNTUK MENILAI NAPAS", { x: L, y: 1.75, w: 6, h: 0.25 });
  tb(s, "10", { x: L - 0.08, y: 1.85, w: 5, h: 3.1, fontFace: "Arial Black", fontSize: 220, color: RED, objectName: "Sepuluh detik" });
  const rr = await dims("ht_recognize.png"), rw = 6.7;
  s.addImage({ path: A("ht_recognize.png"), x: 0.35, y: 7.0 - rw / rr + 0.05, w: rw, h: rw / rr, altText: "Ilustrasi halftone: penolong berlutut, tangan di bahu korban yang tergeletak, memanggil dengan keras" });
  const X3 = 7.45, W3 = R - X3;
  rule(s, X3 - 0.3, 1.75, 0, 5.25);
  const st = [
    ["Pastikan lokasi aman", "Tepuk bahu korban dan panggil dengan keras."],
    ["Tidak merespons, tidak bernapas normal: mulai RJP", "Napas megap-megap tidak dihitung normal."],
    ["Telepon 119 / 112, speaker HP menyala", "Minta orang lain mengambil AED."],
  ];
  st.forEach(([a, b], i) => {
    const y = 1.75 + i * 1.12;
    if (i) rule(s, X3, y - 0.14, W3, 0);
    mono(s, String(i + 1).padStart(2, "0"), { x: X3, y: y + 0.03, w: 0.5, h: 0.25, color: RED, bold: true });
    tb(s, [{ text: a, options: { bold: true, fontSize: 16, breakLine: true } }, { text: b, options: { fontSize: 14, color: INK2 } }], { x: X3 + 0.6, y, w: W3 - 0.6, h: 0.9, lineSpacingMultiple: 1.1, paraSpaceAfter: 2 });
  });
  [["119", "GAWAT DARURAT MEDIS"], ["112", "DARURAT UMUM"]].forEach(([n, l], i) => {
    const w = (W3 - 0.2) / 2, x = X3 + i * (w + 0.2), y = 5.3;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 1.45, fill: { color: i ? PAPER : INK }, line: { color: INK, width: 0.75 }, objectName: `Nomor ${n}` });
    tb(s, n, { x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.75, fontFace: "Arial Black", fontSize: 40, color: i ? INK : PAPER });
    mono(s, l, { x: x + 0.2, y: y + 1.05, w: w - 0.4, h: 0.25, color: i ? INK2 : PAPER });
  });
  foot(s, "FIG. 03 — TEPUK BAHU, PANGGIL KERAS", "SIMPAN 119 & 112 DI KONTAK HP");
  s.addNotes(NOTES[2]);

  // ---------- 4. Compressions (core, night) ----------
  s = pres.addSlide({ masterName: "Malam", sectionTitle: "Langkah" });
  coord(s, "04 / 07 — KOMPRESI DADA", MDK);
  const rq = await dims("ht_compress.png"), qh = 6.95;
  s.addImage({ path: A("ht_compress.png"), x: SW - qh * rq + 0.45, y: 0.55, w: qh * rq, h: qh, altText: "Ilustrasi halftone: dua tangan bertumpuk menekan tengah dada manikin" });
  s.addText("KOMPRESI DADA", { placeholder: "title" });
  tb(s, "TEKAN KERAS, TEKAN CEPAT.", { x: L, y: 1.75, w: 6.6, h: 0.5, fontFace: "Arial Black", fontSize: 22, color: RED });
  tb(s, "Tumit tangan di tengah dada · lengan lurus · bahu tepat di atas tangan", { x: L, y: 2.35, w: 6.6, h: 0.35, fontSize: 15, color: PAPER });
  const gx = L, gy = 2.95, gw = 6.6, gh = 3.0, cw2 = gw / 2, ch2 = gh / 2;
  rule(s, gx, gy, gw, 0, RDK); rule(s, gx, gy + ch2, gw, 0, RDK); rule(s, gx, gy + gh, gw, 0, RDK); rule(s, gx + cw2, gy, 0, gh, RDK);
  [["KECEPATAN", "100–120", "KALI / MENIT", true], ["KEDALAMAN", "≥ 5 CM", "MINIMAL, DEWASA"], ["REKOIL", "PENUH", "DADA MENGEMBANG KEMBALI"], ["JEDA", "≤ 10 DTK", "SAAT HARUS BERHENTI"]].forEach(([k, v, u, hot], i) => {
    const x = gx + (i % 2) * cw2 + (i % 2 ? 0.25 : 0), y = gy + Math.floor(i / 2) * ch2;
    mono(s, k, { x, y: y + 0.18, w: cw2 - 0.3, h: 0.22, color: MDK });
    tb(s, v, { x, y: y + 0.45, w: cw2 - 0.3, h: 0.65, fontFace: "Arial Black", fontSize: 30, color: hot ? RED : PAPER });
    mono(s, u, { x, y: y + 1.12, w: cw2 - 0.3, h: 0.22, color: MDK });
  });
  mono(s, "RITME ≈ “STAYING ALIVE”", { x: L, y: 6.2, w: 3, h: 0.22, color: PAPER });
  ticks(s, 3.55, 6.12, 32, 0.115, 0.36, PAPER, { accentEvery: 4 });
  foot(s, "FIG. 04 — POSISI TANGAN", "SLIDE INTI · PERAGAKAN LANGSUNG", MDK);
  s.addNotes(NOTES[3]);

  // ---------- 5. Breaths ----------
  s = pres.addSlide({ masterName: "Kertas", sectionTitle: "Langkah" });
  coord(s, "05 / 07 — NAPAS BANTUAN");
  s.addText("NAPAS BANTUAN: 30:2 ATAU HANDS-ONLY", { placeholder: "title" });
  const mid = L + CW / 2;
  rule(s, mid, 1.75, 0, 5.25);
  const colW = CW / 2 - 0.4;
  // A — trained
  mono(s, "A — TERLATIH", { x: L, y: 1.8, w: colW, h: 0.25, color: RED, bold: true });
  tb(s, "30:2", { x: L - 0.05, y: 2.05, w: colW, h: 2.1, fontFace: "Arial Black", fontSize: 140, color: RED, objectName: "30 banding 2" });
  tb(s, "30 kompresi, lalu 2 napas bantuan, sesuai penekanan pedoman 2025.", { x: L, y: 4.45, w: colW - 0.3, h: 0.75, fontSize: 16, lineSpacingMultiple: 1.15 });
  ticks(s, L, 5.75, 30, 0.152, 0.42, INK, { wt: 1.5 });
  for (let k = 0; k < 2; k++) s.addShape(pres.shapes.OVAL, { x: L + 30 * 0.152 + 0.12 + k * 0.3, y: 5.82, w: 0.2, h: 0.2, fill: { color: RED }, line: { type: "none" }, objectName: `Napas ${k + 1}` });
  mono(s, "30 TEKANAN", { x: L, y: 6.35, w: 3, h: 0.22 });
  mono(s, "2 NAPAS", { x: L + 4.45, y: 6.35, w: 1.4, h: 0.22, color: RED });
  // B — hands-only
  const xb = mid + 0.4;
  mono(s, "B — TIDAK TERLATIH ATAU RAGU", { x: xb, y: 1.8, w: colW, h: 0.25, bold: true, color: INK });
  tb(s, "HANDS-\nONLY", { x: xb - 0.03, y: 2.15, w: colW, h: 2.2, fontFace: "Arial Black", fontSize: 66, color: INK, lineSpacingMultiple: 0.9, objectName: "Hands-only" });
  tb(s, "Kompresi saja, terus tanpa berhenti sampai bantuan atau AED datang.", { x: xb, y: 4.45, w: colW - 0.3, h: 0.75, fontSize: 16, lineSpacingMultiple: 1.15 });
  ticks(s, xb, 5.75, 37, 0.152, 0.42, INK, { wt: 1.5 });
  mono(s, "TANPA HENTI →", { x: xb, y: 6.35, w: 3, h: 0.22 });
  foot(s, "RAGU? JANGAN BERHENTI MENEKAN", "AHA / ERC 2025");
  s.addNotes(NOTES[4]);

  // ---------- 6. AED ----------
  s = pres.addSlide({ masterName: "Kertas", sectionTitle: "Langkah" });
  coord(s, "06 / 07 — AED");
  s.addText("MENGGUNAKAN AED", { placeholder: "title" });
  const ra = await dims("ht_aed.png"), aw = 5.7, ah = aw / ra, ay = 1.8;
  s.addImage({ path: A("ht_aed.png"), x: 0.4, y: ay, w: aw, h: ah, altText: "Ilustrasi halftone: unit AED dengan dua pad elektroda" });
  // blueprint callouts
  const call = (px, py, lx, ly, label, align = "left") => {
    rule(s, px, py, lx - px, ly - py, RED, 0.75);
    s.addShape(pres.shapes.OVAL, { x: px - 0.05, y: py - 0.05, w: 0.1, h: 0.1, fill: { color: RED }, line: { type: "none" } });
    mono(s, label, { x: align === "left" ? lx + 0.05 : lx - 2.55, y: ly - 0.12, w: 2.5, h: 0.24, color: RED, bold: true, align });
  };
  call(0.4 + aw * 0.42, ay + ah * 0.42, 0.75, ay + ah + 0.3, "UNIT AED");
  call(0.4 + aw * 0.80, ay + ah * 0.78, 0.4 + aw - 0.1, ay + ah + 0.3, "PAD ELEKTRODA ×2", "right");
  const X6 = 7.45, W6 = R - X6;
  rule(s, X6 - 0.3, 1.75, 0, 5.25);
  const aedSteps = [
    ["Nyalakan dan ikuti suaranya", "AED memandu setiap langkah."],
    ["Tempel pad", "Di dada terbuka dan kering, sesuai gambar pada pad."],
    ["Semua menjauh saat analisis dan kejutan", "Tidak ada yang menyentuh korban."],
    ["Langsung lanjut kompresi", "Ikuti AED sampai tim medis tiba."],
  ];
  aedSteps.forEach(([a, b], i) => {
    const y = 1.75 + i * 0.86;
    if (i) rule(s, X6, y - 0.12, W6, 0);
    mono(s, String(i + 1).padStart(2, "0"), { x: X6, y: y + 0.03, w: 0.5, h: 0.25, color: RED, bold: true });
    tb(s, [{ text: a, options: { bold: true, fontSize: 16, breakLine: true } }, { text: b, options: { fontSize: 14, color: INK2 } }], { x: X6 + 0.6, y, w: W6 - 0.6, h: 0.72, lineSpacingMultiple: 1.1, paraSpaceAfter: 2 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: X6, y: 5.3, w: W6, h: 1.45, fill: { color: RED }, line: { type: "none" }, objectName: "Lokasi AED" });
  mono(s, "AED TERDEKAT DI GEDUNG INI", { x: X6 + 0.25, y: 5.48, w: W6 - 0.5, h: 0.22, color: WHITE, bold: true });
  tb(s, "[ISI LOKASI, MIS. LOBI LANTAI 1, SAMPING LIFT]", { x: X6 + 0.25, y: 5.82, w: W6 - 0.5, h: 0.75, fontFace: "Arial Black", fontSize: 17, color: WHITE });
  foot(s, "FIG. 06 — AED DAN SEPASANG PAD", "AED TIDAK MENGEJUT BILA TIDAK PERLU");
  s.addNotes(NOTES[5]);

  // ---------- 7. Summary (night) ----------
  pres.addSection({ title: "Penutup" });
  s = pres.addSlide({ masterName: "Malam", sectionTitle: "Penutup" });
  coord(s, "07 / 07 — RINGKASAN", MDK);
  const rr2 = await dims("ht_cover_red.png"), sh = 3.75;
  s.addImage({ path: A("ht_cover_red.png"), x: R - sh * rr2 + 0.1, y: 0.62, w: sh * rr2, h: sh, altText: "Ilustrasi halftone merah: penolong melakukan kompresi dada" });
  tb(s, [
    { text: "TIDAK MENOLONG", options: { color: PAPER, breakLine: true } },
    { text: "ADALAH", options: { color: PAPER, breakLine: true } },
    { text: "SATU-SATUNYA", options: { color: RED, breakLine: true } },
    { text: "KESALAHAN.", options: { color: RED } },
  ], { x: L, y: 0.85, w: 7.6, h: 3.0, fontFace: "Arial Black", fontSize: 44, lineSpacingMultiple: 0.95, objectName: "Pesan" });
  mono(s, "SATU BARIS UNTUK DIFOTO", { x: L, y: 4.5, w: 5, h: 0.22, color: MDK });
  const words = ["AMAN", "RESPONS", "119", "TEKAN KERAS & CEPAT", "AED"];
  const sy = 4.85, shh = 1.75, sw = CW / 5;
  s.addShape(pres.shapes.RECTANGLE, { x: L + sw * 3, y: sy, w: sw, h: shh, fill: { color: RED }, line: { type: "none" }, objectName: "Tekan" });
  rule(s, L, sy, CW, 0, MDK); rule(s, L, sy + shh, CW, 0, MDK);
  for (let i = 1; i < 5; i++) rule(s, L + sw * i, sy, 0, shh, MDK);
  words.forEach((w, i) => {
    const x = L + sw * i + 0.22;
    mono(s, String(i + 1).padStart(2, "0"), { x, y: sy + 0.2, w: 1, h: 0.22, color: i === 3 ? WHITE : MDK });
    tb(s, w, { x, y: sy + 0.55, w: sw - 0.4, h: 1.05, fontFace: "Arial Black", fontSize: w.length > 8 ? 18 : 24, color: i === 3 ? WHITE : PAPER, lineSpacingMultiple: 0.95 });
  });
  foot(s, "SEKARANG: PRAKTIK DI MANIKIN, BERGANTIAN TIAP 2 MENIT", "BLS · 5 MENIT PERTAMA", MDK);
  s.addNotes(NOTES[6]);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT, "notes", NOTES.length);
})();
