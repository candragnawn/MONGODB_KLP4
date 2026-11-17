# Projek NoSQL dengan MongoDB - Kelompok 4
Mata Kuliah: Basis Data Lanjut (24SIFH16X034) - Informatika FMIPA Universitas Udayana

## Anggota Kelompok & Peran
1. I Kadek Candra Gunawan - [Peran]
2. [Nama Anggota 2] - [Peran]
3. [Nama Anggota 3] - [Peran]
4. [Nama Anggota 4] - [Peran]

## Struktur Repositori
- `skrip/` : Berisi skrip `01_schema.js` hingga `06_pengujian.js`
- `dump/` : Hasil ekspor `mongodump` dari klaster Atlas
- `bukti/` : Tangkapan layar pengujian, ping klaster, dan explain

## Cara Menjalankan Skrip (Dari Nol)
```powershell
$URI = "mongodb+srv://<alamat-klaster>.mongodb.net/<nama_db>"
mongosh $URI --username <nama_user> --file skrip/01_schema.js
mongosh $URI --username <nama_user> --file skrip/02_seed.js
mongosh $URI --username <nama_user> --file skrip/03_crud.js
mongosh $URI --username <nama_user> --file skrip/04_aggregation.js
mongosh $URI --username <nama_user> --file skrip/05_indeks_explain.js
mongosh $URI --username <nama_user> --file skrip/06_pengujian.js