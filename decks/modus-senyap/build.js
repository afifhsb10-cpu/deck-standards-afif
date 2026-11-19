const pptxgen = require("pptxgenjs");
const fs = require("fs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const lu = require("react-icons/lu");
const path = require("path");
// Locate the pptx skill's apply_theme.js: $PPTX_SKILL_DIR, or the skills synced into a Claude Code cloud session.
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

const A = (f) => __dirname + "/assets/" + f;
const NOTES = JSON.parse(fs.readFileSync(__dirname + "/notes.json", "utf8"));
const OUT = process.argv[2] || "deck.pptx";

// ---- Theme: "night street" world — ink ground, one sodium-amber light source ----
const HEX = { bg: "0B0F14", surface: "141B24", text: "ECEFF3", muted: "9BA7B6", amber: "F0A646", line: "2A3442", faint: "6F7C8C" };
const THEME = {
  name: "Modus Senyap",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: HEX.bg, lt1: HEX.text, dk2: HEX.surface, lt2: HEX.muted,
    accent1: HEX.amber, accent2: HEX.line, accent3: HEX.faint, accent4: "C9874A", accent5: "5B7A99", accent6: "3E4C5C",
    hlink: HEX.amber, folHlink: "C9874A",
  },
};

async function icon(Comp, color, px = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { size: px, color: "#" + color, strokeWidth: 1.75 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Modus Senyap: Penipuan yang Tidak Kamu Sangka";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const TXT = C.background1, MUTED = C.background2, AMBER = C.accent1, LINE = C.accent2, SURF = C.text2;

  const IMGW = 5.4167; // half-bleed image width (832x1152 source)
  const slideNum = (x) => ({ x, y: 6.92, w: 0.6, h: 0.3, fontSize: 10, color: MUTED, align: "right" });
  const titleOpts = (x, y, w, h, size = 34) => ({
    type: "title", x, y, w, h, fontFace: "Cambria", fontSize: size, color: TXT, valign: "top", align: "left", margin: 0, bold: false,
  });

  pres.defineSlideMaster({ title: "Sampul", background: { color: HEX.bg },
    objects: [{ placeholder: { options: { name: "title", ...titleOpts(0.6, 1.85, 7.4, 1.4, 72) }, text: "" } }] });
  pres.defineSlideMaster({ title: "Judul", background: { color: HEX.bg }, slideNumber: slideNum(12.13),
    objects: [{ placeholder: { options: { name: "title", ...titleOpts(0.6, 0.55, 12.1, 0.9) }, text: "" } }] });
  pres.defineSlideMaster({ title: "Gambar Kiri", background: { color: HEX.bg }, slideNumber: slideNum(12.13),
    objects: [{ placeholder: { options: { name: "title", ...titleOpts(6.05, 0.5, 6.75, 1.3, 32) }, text: "" } }] });
  pres.defineSlideMaster({ title: "Gambar Kanan", background: { color: HEX.bg }, slideNumber: slideNum(12.13),
    objects: [{ placeholder: { options: { name: "title", ...titleOpts(0.6, 0.55, 6.9, 1.3) }, text: "" } }] });

  const shield = await icon(lu.LuShieldCheck, HEX.amber);
  const tb = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: "Calibri", color: TXT, valign: "top", ...o });
  const hair = (s, x, y, w, name) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: LINE, width: 0.75 }, objectName: name });
  const source = (s, text, x = 0.6, w = 6.5) => tb(s, text, { x, y: 6.92, w, h: 0.3, fontSize: 10, color: MUTED, objectName: "Sumber" });

  // ---------- 1. Cover ----------
  pres.addSection({ title: "Pembuka" });
  let s = pres.addSlide({ masterName: "Sampul", sectionTitle: "Pembuka" });
  s.background = { path: A("cover.jpg") };
  s.addText("Modus Senyap", { placeholder: "title" });
  tb(s, "Penipuan yang tidak kamu sangka", { x: 0.6, y: 3.3, w: 7, h: 0.6, fontFace: "Cambria", fontSize: 26, italic: true, color: MUTED, objectName: "Subjudul" });
  tb(s, [
    { text: "SMS", options: { color: AMBER } }, { text: "   ·   ", options: { color: C.accent3 } },
    { text: "Transfer", options: { color: AMBER } }, { text: "   ·   ", options: { color: C.accent3 } },
    { text: "Rekening", options: { color: AMBER } }, { text: "   ·   ", options: { color: C.accent3 } },
    { text: "NFC", options: { color: AMBER } }, { text: "   ·   ", options: { color: C.accent3 } },
    { text: "Sinyal", options: { color: AMBER } },
  ], { x: 0.6, y: 4.35, w: 7, h: 0.4, fontSize: 15, charSpacing: 1, objectName: "Lima modus" });
  tb(s, "Safety talk keamanan finansial digital  ·  [NAMA PEMBICARA]  ·  [UNIT]  ·  [TANGGAL]", { x: 0.6, y: 6.75, w: 8.5, h: 0.35, fontSize: 11, color: MUTED, objectName: "Pembicara" });
  tb(s, "20 menit + 10 menit tanya jawab", { x: 9.2, y: 6.75, w: 3.53, h: 0.35, fontSize: 11, color: MUTED, align: "right", objectName: "Durasi" });
  s.addNotes(NOTES[0]);

  // ---------- 2. Warm-up ----------
  s = pres.addSlide({ masterName: "Judul", sectionTitle: "Pembuka" });
  s.background = { path: A("warmup.jpg") };
  s.addText("Mana yang asli?", { placeholder: "title" });
  const msgIcon = await icon(lu.LuMessageSquare, HEX.muted);
  const msgs = [
    { k: "A", from: "SMS · BankKu", body: "Akun Anda akan diblokir hari ini. Verifikasi segera di bankku-verifikasi.co/login" },
    { k: "B", from: "WhatsApp · nomor tidak dikenal", money: "+ Rp1.500.000 · dana masuk", body: "Maaf kak, saya salah transfer. Tolong kembalikan ke rek 8812xxxx ya, urgent." },
    { k: "C", from: "Chat · “CS BankKu”", body: "Untuk aktivasi fitur keamanan, install aplikasi BankKu Secure lalu tempelkan kartu debit ke belakang HP Anda." },
  ];
  msgs.forEach((m, i) => {
    const x = 0.6 + i * 4.12, y = 1.75, w = 3.85, h = 2.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18, fill: { color: SURF, transparency: 12 }, line: { color: LINE, width: 0.75 },
      shadow: { type: "outer", color: "000000", opacity: 0.45, blur: 18, offset: 6, angle: 90 }, objectName: `Pesan ${m.k}` });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: AMBER }, line: { type: "none" }, objectName: `Huruf ${m.k}` });
    tb(s, m.k, { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fontFace: "Cambria", fontSize: 20, bold: true, color: C.text1, align: "center", valign: "middle" });
    s.addImage({ data: msgIcon, x: x + 0.3, y: y + 1.04, w: 0.2, h: 0.2, altText: "Ikon pesan" });
    tb(s, m.from, { x: x + 0.58, y: y + 1.0, w: w - 0.9, h: 0.3, fontSize: 12, color: MUTED });
    let by = y + 1.45;
    if (m.money) { tb(s, m.money, { x: x + 0.3, y: by, w: w - 0.6, h: 0.35, fontSize: 15, bold: true, color: AMBER }); by += 0.45; }
    tb(s, m.body, { x: x + 0.3, y: by, w: w - 0.6, h: y + h - by - 0.2, fontSize: 16, lineSpacingMultiple: 1.1 });
  });
  tb(s, "Angkat tangan: mana yang asli?", { x: 0.6, y: 5.2, w: 9, h: 0.6, fontFace: "Cambria", fontSize: 28, italic: true, objectName: "Ajakan" });
  source(s, "Contoh pesan fiktif · “BankKu” bukan bank sungguhan");
  s.addNotes(NOTES[1]);

  // ---------- 3. Why silent ----------
  s = pres.addSlide({ masterName: "Gambar Kanan", sectionTitle: "Pembuka" });
  s.addImage({ path: A("silent_half.jpg"), x: 13.333 - IMGW, y: 0, w: IMGW, h: 7.5, altText: "Ponsel tertelungkup di meja kantor diterangi lampu meja" });
  s.addText("Modus ini melawan insting kita", { placeholder: "title" });
  const pats = [
    ["Kena walau tidak klik apa-apa", "Fake BTS · SIM swap"],
    ["Kena justru karena niat baik", "Salah transfer"],
    ["Kena, lalu malah jadi tersangka", "Money mule"],
    ["Kena lewat teknologi yang dikira aman", "NFC relay"],
  ];
  pats.forEach(([a, b], i) => {
    const y = 1.75 + i * 0.66;
    if (i) hair(s, 0.6, y, 6.9, `Garis ${i}`);
    tb(s, a, { x: 0.6, y: y + 0.15, w: 4.9, h: 0.4, fontSize: 18, bold: true });
    tb(s, b, { x: 5.5, y: y + 0.19, w: 2.0, h: 0.35, fontSize: 12, color: MUTED, align: "right" });
  });
  tb(s, "±1.000", { x: 0.6, y: 4.75, w: 2.7, h: 1.0, fontFace: "Cambria", fontSize: 54, color: AMBER, objectName: "Angka laporan" });
  tb(s, [
    { text: "laporan penipuan per hari masuk ke IASC.", options: { bold: true, breakLine: true } },
    { text: "Modus besar sudah banyak dikenal. Yang ini belum.", options: { color: MUTED } },
  ], { x: 3.4, y: 4.9, w: 4.1, h: 0.9, fontSize: 16, objectName: "Keterangan laporan" });
  source(s, "Sumber: OJK via CNBC Indonesia, Juni 2026");
  s.addNotes(NOTES[2]);

  // ---------- 4–8. Five modus ----------
  pres.addSection({ title: "Lima modus" });
  const MODUS = [
    { img: "bts", alt: "Van putih tanpa tanda terparkir sendirian di parkiran kantor pada malam hari", n: 1, name: "Fake BTS",
      title: "SMS “resmi” dari mobil di parkiran",
      steps: ["Mobil berisi BTS palsu berkeliling di area ramai", "Sinyal HP di sekitar diturunkan dari 4G ke 2G", "SMS atas nama bank masuk, berisi link palsu", "Data login dicuri, rekening dikuras"],
      fig: "Rp473 juta", lead: "Kasus SCBD, Jakarta. ", figText: "Kerugian 12 korban. Pelaku ditangkap saat berkeliling dengan mobil berisi perangkat BTS palsu.",
      act: "Nama pengirim bukan bukti asli. Jangan klik link di SMS, buka aplikasi bank langsung.",
      src: "Sumber: Bareskrim Polri via RMOL & Metro TV, Maret 2025" },
    { img: "transfer", alt: "Pria muda di sofa menatap ponselnya dengan cemas pada malam hari", n: 2, name: "Salah transfer",
      title: "Uang nyasar yang jadi utang",
      steps: ["Uang tiba-tiba masuk ke rekeningmu", "WA atau telepon: “maaf, saya salah transfer”", "Kamu transfer balik ke rekening yang ia sebut", "Ternyata itu pinjol ilegal atas namamu. Kamu ditagih plus bunga"],
      fig: "Niat baik", lead: "Celahnya. ", figText: "Korban tidak pernah mengajukan pinjaman, tapi namanya sudah tercatat sebagai peminjam.",
      act: "Jangan pakai uangnya. Kembalikan lewat bank, bukan ke rekening si penelepon.",
      src: "Sumber: OJK / Satgas PASTI via RRI & DDTC News" },
    { img: "mule", alt: "Tangan menggeser kartu bank di atas meja di bawah lampu redup", n: 3, name: "Money mule",
      title: "Dari korban jadi tersangka",
      steps: ["“Pinjam rekening dong”, atau kerja sampingan terima lalu teruskan dana", "Rekening dipakai menampung uang hasil kejahatan", "Jejak transaksi mengarah ke pemilik rekening", "Pemilik rekening ikut menanggung akibat hukumnya"],
      fig: "Rp119 miliar", lead: "Kasus PN Surabaya. ", figText: "Dicuci lewat rekening yang dijual Rp250 ribu. Pemiliknya terancam 20 tahun penjara.",
      act: "Jangan pinjamkan rekening, kartu, atau akses m-banking. Tutup rekening yang tidak terpakai.",
      src: "Sumber: OJK via Kontan, Feb 2026; Bisnis.com, Mar 2025" },
    { img: "nfc", alt: "Kartu debit bersandar di belakang ponsel", n: 4, name: "NFC relay",
      title: "“Tempelkan kartu ke HP Anda”",
      steps: ["Telepon atau chat dari “bank”: ada masalah di kartumu", "Diminta install aplikasi “verifikasi” dari link", "Kartu ditempel ke belakang HP, lalu diminta PIN", "Data kartu diteruskan, pelaku tarik tunai di ATM"],
      fig: "35.600", lead: "Serangan Jan–Apr 2026. ", figText: "Malware NFC diblokir, naik hampir 3 kali lipat dari 12.300 di periode yang sama 2025.",
      act: "Bank tidak pernah meminta kartu ditempel ke HP. Matikan NFC saat tidak dipakai.",
      src: "Sumber: Kaspersky via InvestorTrust, Mei 2026" },
    { img: "simswap", alt: "Slot kartu SIM tercabut dari ponsel, kartu SIM dan pin di sampingnya", n: 5, name: "SIM swap",
      title: "Sinyal hilang di tengah kota",
      steps: ["Data pribadimu bocor: NIK, tanggal lahir, nama ibu", "Pelaku mengambil alih nomor HP-mu (SIM atau eSIM)", "Sinyalmu hilang, OTP masuk ke HP pelaku", "Rekening dan e-wallet dikuras dalam hitungan menit"],
      fig: "Tanpa sinyal", lead: "Tanda utama. ", figText: "Di tempat yang biasanya normal, padahal HP orang lain di sekitarmu baik-baik saja.",
      act: "Sinyal hilang tanpa sebab? Segera hubungi bank dan operator dari HP lain.",
      src: "Sumber: Kominfo via Bisnis.com; Bank Indonesia via Infobank" },
  ];
  MODUS.forEach((m, i) => {
    const s = pres.addSlide({ masterName: "Gambar Kiri", sectionTitle: "Lima modus" });
    s.addImage({ path: A(m.img + "_half.jpg"), x: 0, y: 0, w: IMGW, h: 7.5, altText: m.alt });
    tb(s, `Modus ${m.n} dari 5`, { x: 0.6, y: 5.9, w: 4, h: 0.3, fontSize: 13, bold: true, color: AMBER, charSpacing: 1, objectName: "Urutan modus" });
    tb(s, m.name, { x: 0.6, y: 6.2, w: 4.5, h: 0.7, fontFace: "Cambria", fontSize: 32, objectName: "Nama modus" });
    s.addText(m.title, { placeholder: "title" });
    m.steps.forEach((t, j) => {
      const y = 1.95 + j * 0.6, last = j === m.steps.length - 1;
      tb(s, String(j + 1), { x: 6.05, y: y - 0.03, w: 0.4, h: 0.45, fontFace: "Cambria", fontSize: 20, color: AMBER, objectName: `Langkah ${j + 1}` });
      tb(s, t, { x: 6.5, y, w: 6.3, h: 0.55, fontSize: 16, bold: last, color: last ? TXT : MUTED });
    });
    hair(s, 6.05, 4.5, 6.75, "Pemisah");
    tb(s, m.fig, { x: 6.05, y: 4.68, w: 3.05, h: 0.8, fontFace: "Cambria", fontSize: 34, color: AMBER, fit: "none", objectName: "Bukti" });
    tb(s, [{ text: m.lead, options: { bold: true, color: TXT } }, { text: m.figText, options: { color: MUTED } }],
      { x: 9.2, y: 4.7, w: 3.6, h: 0.95, fontSize: 14, objectName: "Keterangan bukti" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.05, y: 5.85, w: 6.75, h: 0.78, rectRadius: 0.12, fill: { color: SURF }, line: { color: LINE, width: 0.75 }, objectName: "Lakukan" });
    s.addImage({ data: shield, x: 6.27, y: 6.04, w: 0.4, h: 0.4, altText: "Ikon perisai" });
    tb(s, m.act, { x: 6.85, y: 5.85, w: 5.8, h: 0.78, fontSize: 15, bold: true, valign: "middle" });
    source(s, m.src, 6.05, 5.9);
    s.addNotes(NOTES[3 + i]);
  });

  // ---------- 9. Summary ----------
  pres.addSection({ title: "Penutup" });
  s = pres.addSlide({ masterName: "Judul", sectionTitle: "Penutup" });
  s.addText("5 kalimat untuk dibawa pulang", { placeholder: "title" });
  const sum = [
    ["bts", "SMS dari “nama bank” belum tentu asli", "Fake BTS"],
    ["transfer", "Jujur boleh, tapi kembalikan uang lewat bank", "Salah transfer"],
    ["mule", "Rekeningmu bisa membuatmu jadi tersangka", "Money mule"],
    ["nfc", "Kartu tidak pernah ditempel ke HP atas permintaan siapa pun", "NFC relay"],
    ["simswap", "Sinyal hilang mendadak berarti langsung hubungi bank", "SIM swap"],
  ];
  sum.forEach(([img, t, tag], i) => {
    const y = 1.6 + i * 1.0;
    if (i) hair(s, 0.6, y - 0.11, 12.13, `Garis ${i}`);
    s.addImage({ path: A(img + "_thumb.jpg"), x: 0.6, y, w: 0.78, h: 0.78, altText: tag });
    tb(s, t, { x: 1.7, y, w: 8.6, h: 0.78, fontFace: "Cambria", fontSize: 22, valign: "middle" });
    tb(s, tag, { x: 10.4, y, w: 2.33, h: 0.78, fontSize: 13, color: MUTED, align: "right", valign: "middle" });
  });
  tb(s, "Modus Senyap", { x: 0.6, y: 6.92, w: 4, h: 0.3, fontSize: 10, color: MUTED });
  s.addNotes(NOTES[8]);

  // ---------- 10. Golden hour ----------
  s = pres.addSlide({ masterName: "Gambar Kanan", sectionTitle: "Penutup" });
  s.addImage({ path: A("golden_half.jpg"), x: 13.333 - IMGW, y: 0, w: IMGW, h: 7.5, altText: "Matahari terbit di atas kota dilihat dari jendela kantor" });
  s.addText("Golden hour: kecepatan lapor menentukan", { placeholder: "title" });
  tb(s, "80%", { x: 0.6, y: 1.95, w: 2.6, h: 1.25, fontFace: "Cambria", fontSize: 80, color: AMBER, objectName: "Angka 80%" });
  tb(s, [
    { text: "pelapor ke IASC baru melapor setelah lebih dari 12 jam.", options: { bold: true, fontSize: 18, breakLine: true } },
    { text: "Makin lambat laporan, makin kecil peluang dana diselamatkan.", options: { color: MUTED, fontSize: 15 } },
  ], { x: 3.35, y: 2.1, w: 4.15, h: 1.15, objectName: "Keterangan 80%" });
  const acts = [
    [lu.LuPhone, "Blokir rekening", "Call center bank"],
    [lu.LuGlobe, "Laporkan penipuan", "iasc.ojk.go.id"],
    [lu.LuSearch, "Cek legalitas", "Kontak OJK 157"],
  ];
  for (let i = 0; i < acts.length; i++) {
    const [ic, a, b] = acts[i], y = 3.75 + i * 0.85;
    hair(s, 0.6, y - 0.12, 6.9, `Garis ${i}`);
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.06, w: 0.56, h: 0.56, fill: { color: SURF }, line: { color: LINE, width: 0.75 }, objectName: `Lingkar ${i + 1}` });
    s.addImage({ data: await icon(ic, HEX.amber), x: 0.74, y: y + 0.2, w: 0.28, h: 0.28, altText: a });
    tb(s, a, { x: 1.4, y, w: 3.0, h: 0.68, fontSize: 18, bold: true, valign: "middle" });
    tb(s, b, { x: 4.4, y, w: 3.1, h: 0.68, fontSize: 16, color: AMBER, valign: "middle", align: "right" });
  }
  source(s, "Sumber: OJK via detikFinance, Juni–Juli 2026");
  s.addNotes(NOTES[9]);

  // ---------- 11. Closing ----------
  s = pres.addSlide({ masterName: "Sampul", sectionTitle: "Penutup" });
  s.background = { path: A("closing.jpg") };
  tb(s, [
    { text: "Penipu tidak selalu berisik. Yang paling berbahaya justru yang " },
    { text: "senyap.", options: { italic: true, color: AMBER } },
  ], { x: 0.6, y: 1.5, w: 7.2, h: 2.8, fontFace: "Cambria", fontSize: 42, valign: "bottom", lineSpacingMultiple: 1.05, objectName: "Kutipan penutup" });
  tb(s, "Tanya jawab  ·  Bagikan materi ini ke keluarga di rumah", { x: 0.6, y: 4.55, w: 7.4, h: 0.45, fontSize: 18, color: MUTED, objectName: "Ajakan" });
  tb(s, "Modus Senyap", { x: 0.6, y: 6.75, w: 4, h: 0.35, fontSize: 11, color: MUTED });
  tb(s, "Tanya jawab · 10 menit", { x: 9.2, y: 6.75, w: 3.53, h: 0.35, fontSize: 11, color: MUTED, align: "right" });
  s.addNotes(NOTES[10]);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
