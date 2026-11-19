# Basic Life Support: 5 Menit Pertama yang Menentukan

7 slide · pelatihan BLS untuk karyawan · versi v2 (v1 ditolak karena "masih template dan gambar terkesan ditempel").

## Design read
> *Pelatihan prosedur darurat untuk orang awam, ruang pelatihan terang; tema → dunia **manual lapangan darurat / plakat keselamatan**; genre dasar brutalist-industrial + halftone dari retro-print; terang dengan dua slide malam; satu sinyal merah darurat `DA291C`.*

## Lima keputusan dunia
| Keputusan | Pilihan | Alasan dari tema |
|---|---|---|
| Ground & light | Kertas tua `F2F1EC`; slide inti (kompresi) dan penutup di `1B1B18` | Manual yang dicetak; momen paling penting dibalik warnanya |
| Sinyal | Merah darurat | Aksi, bukan dekorasi: mata rantai "kamu", 100–120, 30:2, kolom "tekan" |
| Suara tipe | Arial Black UPPERCASE + Consolas untuk label koordinat | Stensil manual/plakat, terbaca dari jauh |
| Gambar | Figur halftone transparan (tinta / kertas / merah) | Tercetak di kertas yang sama, bukan foto di kotak |
| Motif | Masthead + `03 / 07 — KENALI` + `FIG. 0N —` + garis ketukan | Bahasa dokumen teknis; ketukan = ritme kompresi |

## Teknik yang bisa dipakai ulang
- **Figur menumpuk tipografi**: penolong menutupi "5:00"; korban berbaring tepat di garis bawah, di depan angka "10".
- **Data digambar harfiah**: 30:2 = 30 garis + 2 titik merah; hands-only = garis terus; ritme "Staying Alive" = deretan ketukan dengan aksen tiap 4.
- **Ledger & panel instrumen**: rantai keselamatan 5 kolom bergaris; spesifikasi kompresi sebagai panel 2×2 (label mono / nilai besar / satuan).
- **Callout blueprint**: garis merah tipis dari perangkat AED ke label mono.
- **Gema penutup**: figur sampul diulang dalam halftone merah di slide terakhir.

## Gambar
`images.jobs.json` = prompt latar studio putih (untuk dipotong). Pelajaran:
- Uji prosedur, bukan cuma estetika: versi awal menaruh tangan di dada (harus bahu) dan seragam medis tampak seperti polisi → di-generate ulang dengan prompt eksplisit.
- AED putih jadi pucat sebagai halftone → pakai varian bodi gelap.
- `fade` di tepi halftone supaya larut ke latar gelap; jaga label koordinat tetap bebas titik.

## Build
```bash
npm install
bash .claude/skills/deck-house-style/scripts/setup_qa_fonts.sh   # QA font tebal yang jujur
npm run build:bls
python .claude/skills/deck-house-style/scripts/check_pptx.py decks/bls-5-menit-pertama/BLS_5_Menit_Pertama.pptx
```
Placeholder: `[NAMA FASILITATOR] · [UNIT] · [TANGGAL]`, `[ISI LOKASI …]` (slide 6). Klaim "pedoman 2025" dan "4 dari 5 mata rantai" perlu dicek instruktur BLS.
