# Quiz Battle 3D

Game duel kuis 2 pemain dalam satu keyboard, dibuat dengan Three.js.

## Cara menjalankan
Butuh [Node.js](https://nodejs.org) (versi 18 ke atas). Buka terminal di folder proyek ini, lalu:

```bash
npm install     # sekali saja: mengunduh Three.js dan Vite
npm run dev     # menjalankan game; browser terbuka otomatis
```

Kalau browser tidak terbuka sendiri, buka alamat yang tampil di terminal (biasanya http://localhost:5173).
Perintah lain: `npm run build` (hasil jadi di folder `dist/`) dan `npm run preview`.

## Main di HP (Android / iPhone)
Game bisa dimainkan lewat browser HP dengan kontrol sentuh. Cukup ketuk kartu jawaban.
- Mode V.S. AI: ketuk jawaban yang benar.
- Mode 2 pemain: Pemain 1 mengetuk sisi kiri kartu, Pemain 2 mengetuk sisi kanan. Putar HP ke landscape.
- Tombol ⏸ di layar = jeda. Grafis otomatis diset Low di HP (bisa diubah di Setting).

## Hosting di GitHub Pages
Three.js sudah disertakan di folder `vendor/`, jadi tidak perlu build. Di GitHub: Settings → Pages → Source: *Deploy from a branch* → Branch `main` / folder `/ (root)` → Save.
Alamat game: `https://USERNAME.github.io/NAMA-REPO/`

## Pelajaran & tingkat kesulitan
Klik tombol pelajaran di menu utama, lalu pilih tingkat kesulitannya (Mudah / Sedang / Sulit).

| Pelajaran | Isi soal | Mudah | Sedang | Sulit |
|-----------|----------|-------|--------|-------|
| Matematika | Hitungan acak + − × ÷ (operasi bisa dipilih) | angka kecil | sampai 100 | sampai 500 + soal gabungan |
| IPA | Biologi, fisika, kimia, bumi & antariksa | SD | SMP | SMA |
| IPS | Sejarah, ekonomi, sosial, kewarganegaraan | SD | SMP | SMA |
| Geografi | Negara, peta, alam, iklim | SD | SMP | SMA |
| Budaya | Budaya & kearifan lokal Indonesia | umum | menengah | warisan UNESCO, aksara, naskah |
| B. Indonesia | Ejaan, kata baku, kalimat, majas, sastra | SD | SMP | SMA |
| B. Inggris | Kosakata, grammar, tenses, idiom | SD | SMP | SMA |
| B. Jepang | Hiragana/katakana, kosakata, tata bahasa, kanji | N5 | N4 | N3 |

Tiap pelajaran bacaan punya 35 soal per tingkat (soal diacak dan tidak berulang sebelum habis).

## Kontrol
| Pemain | Pilihan 1 | 2 | 3 | 4 |
|--------|-----------|---|---|---|
| Pemain 1 (kiri)  | A | S | D | F |
| Pemain 2 (kanan) | H | J | K | L |

Jeda: `P` atau `Esc`.

## Aturan
- Soal yang sama muncul untuk kedua pemain.
- Siapa yang menjawab benar lebih dulu menyerang lawan; makin cepat dan makin banyak combo, makin besar damage.
- Jawaban salah mengunci pemain ±1,3 detik.
- HP lawan habis = menang.

## Menambah / mengubah soal
Buka file di `js/data/` (`ipa.js`, `ips.js`, `geografi.js`, `budaya.js`, `indonesia.js`, `inggris.js`, `jepang.js`). Tiap soal satu baris:

```js
["Pertanyaan...", "Jawaban benar", "Salah 1", "Salah 2", "Salah 3"],
```

## Mengubah pengaturan
Damage, waktu per soal, tombol, warna, dan daftar pelajaran ada di `js/config.js`.
