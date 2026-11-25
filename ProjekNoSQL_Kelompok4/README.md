# ProjekNoSQL_Kelompok4

Projek Basis Data Lanjut — Sistem Rekam Medis dan Resep Obat  
Klinik Sehat Bersama  
Kelompok 4 | Informatika FMIPA Universitas Udayana

---

## Anggota Kelompok

| NIM | Nama | Peran |
| :--- | :--- | :--- |
| 2408561057 | I Kadek Candra Gunawan | Ketua, Koordinasi, README |
| 2408561086 | Wayan Gde Adi Surya Wirawan | Perancang Data, 01_schema.js |
| 2408561045 | Made Mahatmika Adriananda Kusuma | Pengembang Data, 02_seed.js, 03_crud.js, 04_aggregation.js |
| 2408561066 | Wisnu Bayu Cakti | Penguji, 05_indeks_explain.js, 06_pengujian.js |

---

## Deskripsi Projek

Projek ini mengimplementasikan basis data dokumen MongoDB sebagai migrasi dari sistem relasional MySQL yang digunakan pada UTS.  
Topik kasus: Sistem Rekam Medis dan Resep Obat Klinik Sehat Bersama.

**12 tabel MySQL** pada UTS dirancang ulang menjadi **4 koleksi MongoDB** dengan strategi embedding dan referencing berdasarkan pola akses data.

---

## Arsitektur Koleksi

| Koleksi | Jumlah Dokumen | Strategi |
| :--- | :--- | :--- |
| `pasien` | 120 | Referencing (dirujuk oleh kunjungan) |
| `dokter` | 35 | Embedding (spesialisasi di-embed sebagai array) |
| `obat` | 50 | Embedding (preset aturan pakai di-embed) |
| `kunjungan` | 5.000 | Embedding (diagnosis dan resep di-embed bersarang) |

---

## Struktur Folder

```
ProjekNoSQL_Kelompok4/
├── skrip/
│   ├── 01_schema.js          Validasi skema $jsonSchema + 4 uji negatif
│   ├── 02_seed.js            Generator data sintetis berbenih tetap
│   ├── 03_crud.js            15 operasi CRUD
│   ├── 04_aggregation.js     6 pipeline analitik bisnis
│   ├── 05_indeks_explain.js  4 indeks + pengujian performa explain
│   └── 06_pengujian.js       15 kasus uji fungsional
├── dump/                     Hasil backup mongodump
├── bukti/                    Screenshot output terminal
└── README.md
```

---

## Platform

- **Database**: MongoDB Atlas M0 Free Tier  
- **Cluster**: ClusterKelompok4 (Region: AWS Singapore)  
- **Shell**: mongosh 2.x  
- **Nama Database**: `klinik_sehat_bersama`

---

## Cara Menjalankan

Pastikan `mongosh` sudah terinstal. Jalankan skrip secara berurutan dari folder `ProjekNoSQL_Kelompok4/`.

```bash
# Langkah 1: Inisialisasi skema dan koleksi
mongosh "MONGODB_URI" --file skrip/01_schema.js

# Langkah 2: Isi data sintetis
mongosh "MONGODB_URI" --file skrip/02_seed.js

# Langkah 3: Operasi CRUD
mongosh "MONGODB_URI" --file skrip/03_crud.js

# Langkah 4: Pipeline aggregasi
mongosh "MONGODB_URI" --file skrip/04_aggregation.js

# Langkah 5: Indeks dan pengujian performa
mongosh "MONGODB_URI" --file skrip/05_indeks_explain.js

# Langkah 6: Kasus uji fungsional
mongosh "MONGODB_URI" --file skrip/06_pengujian.js

# Backup database
mongodump --uri="MONGODB_URI" --out=dump/
```

> Ganti `MONGODB_URI` dengan connection string Atlas tanpa kata sandi yang dicantumkan langsung di dokumen ini.

---

## Catatan Keamanan

- Kata sandi Database User tidak dicantumkan di repositori ini.
- Gunakan variabel lingkungan atau prompt interaktif `--username` saat menjalankan skrip.
