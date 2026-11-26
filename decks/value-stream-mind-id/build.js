// Value Stream MIND ID — analogi perjalanan udara (1 slide, 11 klik).
// World: a flight plan. Ghost dashed route = the plan; a red plane flies it click by click,
// leaving a navy "flown" route behind; each waypoint fills in and its step appears.
// Animations are injected after the build by scripts/add_animation.py (spec written next to the deck).
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const { execFileSync } = require("child_process");
const md = require("react-icons/md");

function findApplyTheme() {
  const cands = [];
  if (process.env.PPTX_SKILL_DIR) cands.push(path.join(process.env.PPTX_SKILL_DIR, "scripts/apply_theme.js"));
  for (const base of ["/root/.claude/skills/synced", path.join(require("os").homedir(), ".claude/skills")]) {
    if (!fs.existsSync(base)) continue;
    cands.push(path.join(base, "pptx/scripts/apply_theme.js"));
    for (const d of fs.readdirSync(base)) cands.push(path.join(base, d, "pptx/scripts/apply_theme.js"));
  }
  const hit = cands.find((p) => fs.existsSync(p));
  if (!hit) throw new Error("apply_theme.js not found: set PPTX_SKILL_DIR to the pptx skill folder");
  return hit;
}
const { applyTheme } = require(findApplyTheme());

const A = (f) => path.join(__dirname, "assets", f);
const OUT = process.argv[2] || path.join(__dirname, "MIND_ID_Value_Stream.pptx");
const NOTES = JSON.parse(fs.readFileSync(path.join(__dirname, "notes.json"), "utf8"));
const ANIM = path.join(__dirname, "animation.json");
const ADD_ANIM = path.join(__dirname, "../../.claude/skills/deck-house-style/scripts/add_animation.py");

// MIND ID brand (mind-id-design skill): navy / blue / sky / pale, red as the single accent.
const HEX = { navy: "16325C", white: "FFFFFF", blue: "0862A4", tint: "F3F7FB", red: "ED1C24", sky: "3CA6DE", pale: "CEE0ED", gold: "EAB22E", muted: "4E5D73", ghost: "9DBBD6" };
const THEME = {
  name: "MIND ID Flight Plan", headFontFace: "Montserrat", bodyFontFace: "Montserrat",
  colors: { dk1: HEX.navy, lt1: HEX.white, dk2: HEX.blue, lt2: HEX.tint, accent1: HEX.red, accent2: HEX.sky, accent3: HEX.pale, accent4: HEX.gold, accent5: HEX.muted, accent6: HEX.ghost, hlink: HEX.blue, folHlink: HEX.navy },
};
const SW = 13.333, SH = 7.5;

const STEPS = [ // in travel order
  { vs: 1, en: "STRATEGY TO PLAN", t: "Merancang itinerary", d: "Menentukan tujuan, rute, jadwal, dan maskapai yang akan dipakai.", m: "RJPP dan RKAP" },
  { vs: 2, en: "INVEST TO VALUE", t: "Memilih tiket sepadan", d: "Menimbang harga, kelas, dan manfaat sebelum membeli tiket.", m: "Gate review dan akuisisi" },
  { vs: 3, en: "PERMIT TO OPERATE", t: "Mengurus paspor dan visa", d: "Memastikan dokumen perjalanan lengkap dan sah sebelum berangkat.", m: "Izin, lingkungan, kebijakan" },
  { vs: 6, en: "HIRE TO RETIRE", t: "Menyiapkan rombongan", d: "Menentukan siapa yang ikut, membagi peran, dan menyewa pemandu.", m: "Talenta organik dan TAD" },
  { vs: 4, en: "ASSET TO PRODUCTIVITY", t: "Mengecek koper dan bawaan", d: "Mendata barang bawaan dan memastikan semuanya siap dipakai.", m: "Aset MIND ID dan AH" },
  { vs: 9, en: "DETECT TO PROTECT", t: "Melewati cek keamanan", d: "Memastikan bawaan aman dan memahami prosedur darurat.", m: "WBS, illegal mining, BCMS" },
  { vs: 10, en: "DATA TO DECISION", t: "Memantau info penerbangan", d: "Membaca aplikasi, papan jadwal, dan cuaca sebelum mengambil keputusan.", m: "Analitik data dan TI/OT" },
  { vs: 8, en: "NARRATIVE TO TRUST", t: "Mengabari keluarga", d: "Memberi kabar jadwal dan posisi agar keluarga dan penjemput tenang.", m: "Komunikasi korporat" },
  { vs: 5, en: "TARGET TO PERFORMANCE", t: "Menilai hasil perjalanan", d: "Mengecek ketepatan waktu, biaya, dan agenda yang tercapai.", m: "KPI kolegial dan kinerja AH" },
  { vs: 7, en: "IDEA TO IMPACT", t: "Mencatat pelajaran", d: "Mengubah pengalaman menjadi ide perbaikan perjalanan berikutnya.", m: "BIGMIND dan CI-MIND" },
];

// ---- Route geometry (inches) ----
const L = 0.45, XR = 12.6, CW = (XR - L) / 5;
const CX = [0, 1, 2, 3, 4].map((i) => L + CW * i + CW / 2);
const Y1 = 2.62, Y2 = 5.3, XS = 0.32, XE = 0.42, RC = 0.3, XV = XR + RC;
const POS = [...CX.map((x) => [x, Y1]), ...[4, 3, 2, 1, 0].map((i) => [CX[i], Y2])]; // waypoint per step
const SPEED = 3.7; // inches per second for the guide line
const ms = (inch) => Math.round((inch / SPEED) * 1000);
const fx = (x) => +((x - XS) / SW).toFixed(5), fy = (y) => +((y - Y1) / SH).toFixed(5);
const P = (x, y) => `${fx(x)} ${fy(y)}`;

async function iconPng(Comp, color, rotate = 0, px = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { size: px, color: "#" + color }));
  let img = sharp(Buffer.from(svg)).png();
  if (rotate) img = sharp(await img.toBuffer()).rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png();
  return "image/png;base64," + (await img.toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Value Stream MIND ID: Analogi Perjalanan Udara";
  pres.company = "MIND ID";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const NAVY = C.text1, WHITE = C.background1, BLUE = C.text2, RED = C.accent1, PALE = C.accent3, MUTED = C.accent5, GHOST = C.accent6;

  const logo = await sharp(A("mindid-logo-color.png")).metadata();
  const lh = 0.42, lw = lh * logo.width / logo.height;
  pres.defineSlideMaster({
    title: "Peta Rute", background: { path: A("content-light.jpg") },
    objects: [
      { image: { path: A("mindid-logo-color.png"), x: 12.73 - lw, y: 0.24, w: lw, h: lh, altText: "Logo MIND ID" } },
      { text: { text: "VALUE STREAM MIND ID   |   ANALOGI PERJALANAN UDARA", options: { x: 0.6, y: 0.3, w: 8, h: 0.25, fontSize: 9.5, bold: true, color: BLUE, charSpacing: 2, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.6, w: 10.5, h: 0.5, fontFace: "Montserrat", fontSize: 24, bold: true, color: NAVY, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  const s = pres.addSlide({ masterName: "Peta Rute" });
  const tb = (text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: "Montserrat", color: NAVY, valign: "top", ...o });
  const line = (name, x, y, w, h, color, width, dash) =>
    s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color, width, ...(dash ? { dashType: "dash" } : {}) }, objectName: name });
  const arc = (name, x, y, d, range, color, width, dash) =>
    s.addShape(pres.shapes.ARC, { x, y, w: d, h: d, angleRange: range, line: { color, width, ...(dash ? { dashType: "dash" } : {}) }, objectName: name });

  s.addText("Menjalankan MIND ID seperti satu perjalanan udara", { placeholder: "title" });
  tb("Dari sudut pandang kita sebagai penumpang, sepuluh value stream adalah langkah yang kita jalani dari merencanakan perjalanan hingga tiba dan mengevaluasinya. Nomor menunjukkan value stream.",
    { x: 0.6, y: 1.1, w: 10.4, h: 0.45, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.15, objectName: "Subjudul" });

  // ---- Phase labels (animated with their phase) ----
  const phase = (key, text, x, y, w) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.07, w: 0.09, h: 0.09, fill: { color: RED }, line: { type: "none" }, objectName: `${key}-sq` });
    tb(text, { x: x + 0.18, y, w: w - 0.2, h: 0.23, fontSize: 9, bold: true, charSpacing: 2.5, objectName: `${key}-txt` });
    const tw = 0.3 + text.length * 0.118;
    line(`${key}-line`, x + tw, y + 0.115, Math.max(0.2, w - tw - 0.15), 0, PALE, 0.75);
  };
  phase("fase1", "SEBELUM BERANGKAT", L + 0.1, 1.6, XR - L);
  phase("fase3", "SETELAH TIBA", L + 0.1, 4.22, CW * 2 - 0.1);
  phase("fase2", "DI BANDARA DAN SELAMA PERJALANAN", L + CW * 2, 4.22, XR - L - CW * 2);

  // ---- Ghost route (the plan, always visible) ----
  const G = 1.25;
  line("rencana-r1", XS, Y1, XR - XS, 0, GHOST, G, true);
  arc("rencana-ka", XR - RC, Y1, 2 * RC, [270, 0], GHOST, G, true);
  line("rencana-v", XV, Y1 + RC, 0, Y2 - Y1 - 2 * RC, GHOST, G, true);
  arc("rencana-kb", XR - RC, Y2 - 2 * RC, 2 * RC, [0, 90], GHOST, G, true);
  line("rencana-r2", XE, Y2, XR - XE, 0, GHOST, G, true);
  s.addShape(pres.shapes.OVAL, { x: XS - 0.08, y: Y1 - 0.08, w: 0.16, h: 0.16, fill: { color: WHITE }, line: { color: NAVY, width: 2 }, objectName: "titik-mulai" });

  // ---- Flown route (animated segments) ----
  const F = 2.75, segs = [];
  let prev = XS;
  CX.forEach((x, i) => { line(`rute-${i + 1}`, prev, Y1, x - prev, 0, NAVY, F); segs.push(x - prev); prev = x; });
  line("rute-ekor", CX[4], Y1, XR - CX[4], 0, NAVY, F);
  arc("rute-ka", XR - RC, Y1, 2 * RC, [270, 0], NAVY, F);
  line("rute-v", XV, Y1 + RC, 0, Y2 - Y1 - 2 * RC, NAVY, F);
  arc("rute-kb", XR - RC, Y2 - 2 * RC, 2 * RC, [0, 90], NAVY, F);
  line("rute-6", CX[4], Y2, XR - CX[4], 0, NAVY, F);
  [3, 2, 1, 0].forEach((i, k) => line(`rute-${7 + k}`, CX[i], Y2, CW, 0, NAVY, F));
  line("rute-tiba", XE, Y2, CX[0] - XE, 0, NAVY, F);

  // Plane sits under the waypoint discs: on arrival the navy disc fades in over it, keeping the number readable.
  const PL = 0.68;
  s.addImage({ data: await iconPng(md.MdFlight, HEX.red, 90), x: XS - PL / 2, y: Y1 - PL / 2, w: PL, h: PL, altText: "Pesawat penanda posisi", objectName: "pesawat" });

  // ---- Waypoints, illustrations, step text ----
  const DISC = 0.4;
  STEPS.forEach((st, k) => {
    const [x, y] = POS[k], n = k + 1;
    s.addShape(pres.shapes.OVAL, { x: x - DISC / 2, y: y - DISC / 2, w: DISC, h: DISC, fill: { color: WHITE }, line: { color: GHOST, width: 1.25 }, objectName: `rencana-wp-${n}` });
    tb(String(st.vs), { x: x - DISC / 2, y: y - DISC / 2, w: DISC, h: DISC, fontSize: 11, bold: true, color: GHOST, align: "center", valign: "middle", objectName: `rencana-no-${n}` });
    s.addShape(pres.shapes.OVAL, { x: x - DISC / 2, y: y - DISC / 2, w: DISC, h: DISC, fill: { color: NAVY }, line: { color: WHITE, width: 1.5 }, objectName: `wp-${n}` });
    tb(String(st.vs), { x: x - DISC / 2, y: y - DISC / 2, w: DISC, h: DISC, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", objectName: `no-${n}` });
    s.addImage({ path: A(`vs${st.vs}.png`), x: x - 0.6, y: y - 0.86, w: 1.2, h: 0.75, altText: `Ilustrasi ${st.t}`, objectName: `ilustrasi-${n}` });
    tb([
      { text: st.en, options: { fontSize: 8.5, bold: true, color: BLUE, charSpacing: 1, breakLine: true, paraSpaceAfter: 2 } },
      { text: st.t, options: { fontSize: 10.5, bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 1 } },
      { text: st.d, options: { fontSize: 9, color: MUTED, breakLine: true, paraSpaceAfter: 2 } },
      { text: "Di MIND ID: ", options: { fontSize: 9, bold: true, color: RED } },
      { text: st.m, options: { fontSize: 9, bold: true, color: BLUE } },
    ], { x: x - 1.12, y: y + 0.28, w: 2.32, h: 1.15, lineSpacingMultiple: 1.0, objectName: `teks-${n}` });
  });

  // ---- Destination, plane, key message ----
  const pin = await iconPng(md.MdLocationOn, HEX.red);
  s.addImage({ data: pin, x: XE - 0.2, y: Y2 - 0.42, w: 0.4, h: 0.4, altText: "Tujuan", objectName: "tujuan" });
  line("garis-kaki", 0.6, 6.9, 12.13, 0, PALE, 0.75);
  tb("PESAN KUNCI", { x: 0.6, y: 6.99, w: 1.3, h: 0.25, fontSize: 9, bold: true, color: RED, charSpacing: 2, objectName: "pesan-label" });
  tb("Perjalanan berhasil bila setiap langkah dijalankan dengan baik dan saling terhubung. Begitu pula MIND ID.", { x: 1.95, y: 6.97, w: 10.78, h: 0.27, fontSize: 10.5, bold: true, objectName: "pesan" });
  tb("Sumber: SoD Topic Mapping #1 sampai #10", { x: 8.73, y: 7.24, w: 4.0, h: 0.2, fontSize: 8, color: MUTED, align: "right", objectName: "sumber" });
  s.addNotes(NOTES.join("\n\n"));

  // ---- Animation spec: one click per step + arrival ----
  const reveal = (n, D) => [
    { target: `wp-${n}`, type: "fade", delay: D, dur: 250 }, { target: `no-${n}`, type: "fade", delay: D, dur: 250 },
    { target: `ilustrasi-${n}`, type: "fade", delay: D + 120, dur: 450 }, { target: `teks-${n}`, type: "fade", delay: D + 250, dur: 450 },
  ];
  const phaseIn = (key) => ["sq", "txt", "line"].map((p) => ({ target: `${key}-${p}`, type: "fade", delay: 0, dur: 400 }));
  const clicks = [];
  let from = XS;
  CX.forEach((x, i) => {
    const d = ms(x - from), n = i + 1;
    clicks.push({ effects: [
      { target: `rute-${n}`, type: "wipe", dir: "left", delay: 0, dur: d },
      { target: "pesawat", type: "path", path: `M ${P(from, Y1)} L ${P(x, Y1)} E`, delay: 0, dur: d },
      ...(n === 1 ? phaseIn("fase1") : []), ...reveal(n, d)] });
    from = x;
  });
  { // step 6 (VS 9): tail → corner → down → corner → back along row 2
    const k = 0.5523 * RC, dt = ms(XR - CX[4]), dc = ms(Math.PI / 2 * RC), dv = ms(Y2 - Y1 - 2 * RC);
    const p = `M ${P(CX[4], Y1)} L ${P(XR, Y1)} C ${P(XR + k, Y1)} ${P(XV, Y1 + RC - k)} ${P(XV, Y1 + RC)} L ${P(XV, Y2 - RC)} C ${P(XV, Y2 - RC + k)} ${P(XR + k, Y2)} ${P(XR, Y2)} L ${P(CX[4], Y2)} E`;
    let t = 0; const seq = [];
    for (const [name, dir, dur] of [["rute-ekor", "left", dt], ["rute-ka", "left", dc], ["rute-v", "up", dv], ["rute-kb", "up", dc], ["rute-6", "right", dt]]) { seq.push({ target: name, type: "wipe", dir, delay: t, dur }); t += dur; }
    clicks.push({ effects: [...seq,
      { target: "pesawat", type: "path", path: p, delay: 0, dur: t },
      { target: "pesawat", type: "spin", by: 90, delay: dt, dur: dc },
      { target: "pesawat", type: "spin", by: 90, delay: dt + dc + dv, dur: dc },
      ...phaseIn("fase2"), ...reveal(6, t)] });
  }
  [3, 2, 1, 0].forEach((i, k) => {
    const n = 7 + k, d = ms(CW);
    clicks.push({ effects: [
      { target: `rute-${n}`, type: "wipe", dir: "right", delay: 0, dur: d },
      { target: "pesawat", type: "path", path: `M ${P(CX[i + 1], Y2)} L ${P(CX[i], Y2)} E`, delay: 0, dur: d },
      ...(n === 9 ? phaseIn("fase3") : []), ...reveal(n, d)] });
  });
  { const d = ms(CX[0] - XE);
    clicks.push({ effects: [
      { target: "rute-tiba", type: "wipe", dir: "right", delay: 0, dur: d },
      { target: "pesawat", type: "path", path: `M ${P(CX[0], Y2)} L ${P(XE, Y2)} E`, delay: 0, dur: d },
      { target: "pesawat", type: "fadeOut", delay: d, dur: 300 },
      { target: "tujuan", type: "fade", delay: d, dur: 300 },
      { target: "pesan-label", type: "fade", delay: d + 300, dur: 500 },
      { target: "pesan", type: "fade", delay: d + 300, dur: 500 }] }); }
  fs.writeFileSync(ANIM, JSON.stringify({ slides: { 1: clicks } }, null, 1));

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  execFileSync("python3", [ADD_ANIM, OUT, ANIM], { stdio: "inherit" });
  console.log("wrote", OUT);
})();
