// Content + settings for scene.html. Edit this file only; keep scene.html generic.
// Text fields accept inline HTML (<i>…</i> for italics, &#8209; for a non-breaking hyphen).
window.SCENE = {
  canvasH: 940,                 // 1920 x canvasH; ~900-940 fits under a two-line slide title
  noteLabel: "Di MIND ID",      // highlighted label before each step's note (set "" to hide the note line)
  dwell: 2.0,                   // seconds the marker stays at each stop
  speed: 520,                   // px per second along the route
  steps: [                      // in travel order; num = the number on the plaque
    { num: 1, label: "STRATEGY TO PLAN", title: "Merancang itinerary", desc: "Menentukan tujuan, rute, jadwal, dan maskapai yang akan dipakai.", note: "RJPP dan RKAP untuk menentukan arah strategis dan target perusahaan", img: "assets/vs1.png" },
    { num: 2, label: "INVEST TO VALUE", title: "Memilih tiket <i>best value</i>", desc: "Menimbang harga, kelas, dan manfaat sebelum membeli tiket.", note: "Proses gate review untuk melihat ketepatan nilai sebelum berinvestasi", img: "assets/vs2.png" },
    { num: 3, label: "PERMIT TO OPERATE", title: "Mengurus paspor dan visa", desc: "Memastikan dokumen perjalanan lengkap dan sah sebelum berangkat.", note: "Mengelola izin dan kebijakan untuk kelancaran operasi perusahaan", img: "assets/vs3.png" },
    { num: 6, label: "HIRE TO RETIRE", title: "Menyiapkan rombongan", desc: "Menentukan siapa yang ikut, membagi peran, dan menyewa pemandu.", note: "Menentukan <i>talent</i> dan desain organisasi yang tepat untuk menjalankan perusahaan", img: "assets/vs6.png" },
  ],
};
