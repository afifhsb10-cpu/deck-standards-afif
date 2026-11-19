# Modus Senyap: Penipuan yang Tidak Kamu Sangka

11 slide · safety talk keamanan finansial digital · 20 menit + 10 menit tanya jawab · redesign dari deck asli (teks, sumber dan speaker notes dipertahankan).

## Design read
> *Safety talk untuk karyawan, ditayangkan di ruang rapat/proyektor; tema "senyap" → dunia **kota malam yang sunyi dengan satu lampu jalan**; genre dasar cinematic-night; gelap; satu sinyal amber lampu sodium `F0A646`.*

## Lima keputusan dunia
| Keputusan | Pilihan | Alasan dari tema |
|---|---|---|
| Ground & light | Tinta biru-malam `0B0F14`, gelap di semua slide | Penipuan yang tidak terdengar terjadi saat kita lengah: malam |
| Sinyal | Amber lampu sodium | Satu-satunya cahaya di kegelapan = hal yang harus diperhatikan |
| Suara tipe | Cambria serif, normal weight, rata kiri | Judul film/dokumenter, tenang, tidak berteriak |
| Gambar | Foto dokumenter malam realistis, di-grade memudar ke latar | Setiap modus = satu adegan nyata, bukan ilustrasi |
| Motif | "Modus N dari 5 / Nama" ditulis di atas foto; thumbnail di ringkasan | Navigasi tanpa kicker di atas judul; ringkasan memanggil ulang adegan |

## Teknik yang bisa dipakai ulang
- **Half-bleed berselang-seling**: foto 5,42" × 7,5" di kiri untuk lima modus, di kanan untuk slide "kenapa senyap" dan "golden hour".
- **Fade dibakar ke JPEG** (`photo_grade.py`): tepi yang bertemu teks memudar ke `0B0F14`, bawah memudar untuk caption di atas foto.
- **Bukti sebagai kalimat**: angka besar amber (Rp473 juta, 35.600) bersanding dengan kalimatnya, bukan kartu metrik.
- **Garis aksi**: satu panel ber-tint dengan ikon perisai, satu-satunya kontainer di slide.
- **Penutup**: kutipan serif besar, kata kunci *senyap.* italic amber, di atas foto jalan basah full-bleed.

## Gambar
`images.jobs.json` berisi prompt dan gaya (28 steps); `_picked` = varian terpilih. Pelajaran:
- 4 steps menghasilkan tangan/jari tidak realistis → selalu 28 steps.
- Nama merek kamera di prompt kena filter konten.
- Adegan tangan berisiko diganti: NFC = kartu bersandar di HP (tanpa tangan); money mule = satu tangan saja.
- Tiap gambar 3 varian, tangan dicek di resolusi penuh sebelum dipilih.

## Build
```bash
npm install            # di root repo
npm run build:modus-senyap
python .claude/skills/deck-house-style/scripts/check_pptx.py decks/modus-senyap/Modus_Senyap.pptx
```
Placeholder yang masih harus diisi: `[NAMA PEMBICARA] · [UNIT] · [TANGGAL]`.
