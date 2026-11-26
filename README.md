# deck-standards-afif

Standar pembuatan deck presentasi untuk Claude Code. Setiap sesi Claude Code yang membuka repo ini otomatis memuat skill **`deck-house-style`**, jadi semua deck mengikuti standar yang sama tanpa perlu dijelaskan ulang.

## Isi

```text
CLAUDE.md                              # instruksi repo: muat skill ini untuk setiap deck
package.json                           # dependency build (npm install di root)
.claude/skills/deck-house-style/
├── SKILL.md                           # alur kerja: dunia visual per tema, larangan, gambar, QA
├── reference/
│   ├── genres.md                      # genre pack sebagai titik awal (palet, tipe, komposisi)
│   └── image-pipeline.md              # NVIDIA FLUX klein: endpoint, parameter, resep prompt
└── scripts/
    ├── gen_images.py                  # generate varian gambar dari images.jobs.json
    ├── contact_sheet.py               # lembar pratinjau untuk memilih varian
    ├── halftone.py                    # foto → figur halftone transparan
    ├── photo_grade.py                 # foto → crop, tint, fade ke warna latar
    ├── check_pptx.py                  # cek hal yang bikin PowerPoint minta "Repair"
    ├── add_animation.py               # sisipkan animasi klik (wipe, fade, motion path, spin)
    ├── storyboard.py                  # QA animasi: render per klik + preview.gif
    └── setup_qa_fonts.sh              # alias Arial Black → Archivo Black untuk QA jujur
decks/                                 # contoh kerja: .pptx + build.js + aset + studi kasus
├── modus-senyap/                      # dunia sinematik malam, foto ber-fade, satu cahaya amber
├── bls-5-menit-pertama/               # dunia manual lapangan, figur halftone, data digambar
├── value-stream-mind-id/              # brand MIND ID, rencana penerbangan, garis pemandu beranimasi
└── value-stream-flight-gif/           # versi GIF/MP4: papan petunjuk bandara, ilustrasi flat FLUX
```

## Cara pakai

Buka sesi Claude Code dengan repo ini, lalu minta deck seperti biasa, misalnya:

> Buatkan deck safety talk 8 slide tentang bahaya listrik di area kerja.

Claude akan merancang dunia visual dari temanya (adegan, cahaya, satu warna sinyal, suara tipe, perlakuan gambar, satu motif), memakai genre pack terdekat sebagai titik awal, membuat gambar lewat NVIDIA FLUX klein, menyusun deck, lalu menjalankan QA sebelum menyerahkan file.

## Sumber prinsip

Diadaptasi dari [Impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0) dan [design-taste](https://github.com/madebymustafa/design-taste) (MIT). Lihat [ATTRIBUTION.md](ATTRIBUTION.md).
