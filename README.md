# deck-standards-afif

Standar pembuatan deck presentasi untuk Claude Code. Setiap sesi Claude Code yang membuka repo ini otomatis memuat skill **`deck-house-style`**, jadi semua deck mengikuti standar yang sama tanpa perlu dijelaskan ulang.

## Isi

```text
CLAUDE.md                              # instruksi repo: muat skill ini untuk setiap deck
.claude/skills/deck-house-style/
├── SKILL.md                           # alur kerja, larangan, aturan tipe/warna/grid, QA
├── reference/
│   ├── genres.md                      # genre pack untuk deck (palet, tipe, komposisi)
│   └── image-pipeline.md              # NVIDIA FLUX klein: endpoint, parameter, resep prompt
├── scripts/
│   ├── gen_images.py                  # generate varian gambar dari file jobs.json
│   ├── jobs.example.json              # contoh job gambar
│   ├── contact_sheet.py               # lembar pratinjau untuk memilih varian
│   ├── halftone.py                    # foto → figur halftone transparan (tinta/kertas/merah)
│   ├── check_pptx.py                  # cek hal yang bikin PowerPoint minta "Repair"
│   └── setup_qa_fonts.sh              # alias Arial Black → Archivo Black untuk QA jujur
└── examples/
    └── bls-field-manual.build.js      # contoh deck lengkap (BLS, gaya manual lapangan)
```

## Cara pakai

Buka sesi Claude Code dengan repo ini, lalu minta deck seperti biasa, misalnya:

> Buatkan deck safety talk 8 slide tentang bahaya listrik di area kerja.

Claude akan menulis *design read* satu baris, memilih satu genre, membuat gambar lewat NVIDIA FLUX klein, menyusun deck, lalu menjalankan QA sebelum menyerahkan file.

## Sumber prinsip

Diadaptasi dari [Impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0) dan [design-taste](https://github.com/madebymustafa/design-taste) (MIT). Lihat [ATTRIBUTION.md](ATTRIBUTION.md).
