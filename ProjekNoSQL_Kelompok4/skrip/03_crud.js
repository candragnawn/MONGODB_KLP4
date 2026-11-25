// Projek Basis Data Lanjut - Klinik Sehat Bersama
// Kelompok 4 | Informatika FMIPA Universitas Udayana
// 03_crud.js - 15 Operasi CRUD (3 Create, 6 Read, 4 Update, 2 Delete)

const database = db.getSiblingDB("klinik_sehat_bersama");

// Bersihkan sisa data uji sebelumnya agar skrip idempotent jika dijalankan berulang
database.pasien.deleteOne({ _id: "5101010101010001" });
database.obat.deleteMany({ _id: { $in: ["O51", "O52", "O53"] } });

// ---------------------------------------------------------------------------
// CREATE (3 Operasi)
// ---------------------------------------------------------------------------

// C1: insertOne - Menambah 1 pasien baru
database.pasien.insertOne({
  _id: "5101010101010001",
  nama: "I Putu Arya Darmawan",
  tanggal_lahir: "2000-08-15",
  jenis_kelamin: "L",
  alamat: "Jl. Raya Kuta No.88, Badung",
  no_telp: "081234567890",
  terdaftar_sejak: new Date("2026-11-25T08:00:00Z")
});

print("C1 - insertOne pasien: OK");

// C2: insertMany - Menambah batch 3 obat baru sekaligus
database.obat.insertMany([
  {
    _id: "O51",
    nama_obat: "Antrain 500 mg",
    satuan: "Tablet",
    harga_master: 1200,
    stok: 300,
    rekomendasi_preset: [
      { kode_preset: "PR01", frekuensi: "3x sehari", durasi_hari: 3, metode: "Sesudah makan", catatan: "Bila nyeri" }
    ]
  },
  {
    _id: "O52",
    nama_obat: "Vit B Complex",
    satuan: "Tablet",
    harga_master: 500,
    stok: 800,
    rekomendasi_preset: [
      { kode_preset: "PR05", frekuensi: "1x sehari", durasi_hari: 30, metode: "Sesudah makan", catatan: "Rutin pagi hari" }
    ]
  },
  {
    _id: "O53",
    nama_obat: "Zinc 20 mg",
    satuan: "Tablet",
    harga_master: 750,
    stok: 500,
    rekomendasi_preset: [
      { kode_preset: "PR01", frekuensi: "1x sehari", durasi_hari: 14, metode: "Sesudah makan", catatan: "Untuk imunitas" }
    ]
  }
]);

print("C2 - insertMany obat: OK");

// C3: upsert - Perbarui tarif dokter DK01 jika ada, buat baru jika belum ada
database.dokter.updateOne(
  { _id: "DK01" },
  {
    $set: {
      tarif_konsultasi: 85000,
      status_aktif: true
    },
    $setOnInsert: {
      nama: "dr. Cadangan Upsert",
      spesialisasi: ["Umum"]
    }
  },
  { upsert: true }
);

print("C3 - upsert dokter DK01: OK");

// ---------------------------------------------------------------------------
// READ (6 Operasi)
// ---------------------------------------------------------------------------

// R1: Filter perbandingan - Pasien dengan tahun lahir sebelum 1976 (usia > 50)
const pasienLansia = database.pasien.find(
  { tanggal_lahir: { $lt: "1976-01-01" } },
  { nama: 1, tanggal_lahir: 1, _id: 0 }
).limit(5).toArray();

print("R1 - Pasien usia > 50 tahun (5 teratas):");
printjson(pasienLansia);

// R2: Filter logika AND - Obat dengan harga > 1000 DAN stok < 500
const obatKritis = database.obat.find(
  { $and: [{ harga_master: { $gt: 1000 } }, { stok: { $lt: 500 } }] },
  { nama_obat: 1, harga_master: 1, stok: 1 }
).limit(5).toArray();

print("R2 - Obat harga > 1000 dan stok < 500 (5 teratas):");
printjson(obatKritis);

// R3: Filter array - Dokter dengan spesialisasi "Umum"
const dokterUmum = database.dokter.find(
  { spesialisasi: { $in: ["Umum"] } },
  { nama: 1, spesialisasi: 1, tarif_konsultasi: 1 }
).toArray();

print("R3 - Dokter dengan spesialisasi Umum (" + dokterUmum.length + " dokter):");
printjson(dokterUmum.slice(0, 3));

// R4: Filter regex - Pasien dengan alamat mengandung kata "Denpasar"
const pasienDenpasar = database.pasien.find(
  { alamat: { $regex: "Denpasar", $options: "i" } },
  { nama: 1, alamat: 1, _id: 0 }
).limit(5).toArray();

print("R4 - Pasien beralamat di Denpasar (5 teratas):");
printjson(pasienDenpasar);

// R5: Notasi titik - Kunjungan dengan diagnosis kode D05 (Hipertensi)
const kunjunganHipertensi = database.kunjungan.find(
  { "pemeriksaan.kode_diagnosis": "D05" },
  { waktu_kunjungan: 1, nik_pasien: 1, "pemeriksaan.nama_diagnosis": 1, total_biaya: 1 }
).limit(5).toArray();

print("R5 - Kunjungan dengan diagnosis Hipertensi (5 teratas):");
printjson(kunjunganHipertensi);

// R6: Proyeksi + Sort + Limit - 5 kunjungan terbaru berdasarkan waktu
const kunjunganTerbaru = database.kunjungan.find(
  {},
  { waktu_kunjungan: 1, nik_pasien: 1, kode_dokter: 1, total_biaya: 1 }
).sort({ waktu_kunjungan: -1 }).limit(5).toArray();

print("R6 - 5 kunjungan terbaru:");
printjson(kunjunganTerbaru);

// ---------------------------------------------------------------------------
// UPDATE (4 Operasi)
// ---------------------------------------------------------------------------

// U1: $set - Perbarui nomor telepon pasien tertentu
database.pasien.updateOne(
  { _id: "5101010101010001" },
  { $set: { no_telp: "089612345678" } }
);

print("U1 - $set no_telp pasien baru: OK");

// U2: $inc - Kurangi stok obat O01 sebanyak 10 (simulasi resep ditebus)
database.obat.updateOne(
  { _id: "O01" },
  { $inc: { stok: -10 } }
);

print("U2 - $inc stok obat O01 dikurangi 10: OK");

// U3: $push - Tambahkan objek rekomendasi preset baru ke dalam array obat O02
database.obat.updateOne(
  { _id: "O02" },
  {
    $push: {
      rekomendasi_preset: {
        kode_preset: "PR07",
        frekuensi: "2x sehari",
        durasi_hari: 5,
        metode: "Sesudah makan",
        catatan: "Untuk kasus infeksi ringan"
      }
    }
  }
);

print("U3 - $push preset baru ke obat O02: OK");

// U4: updateMany - Nonaktifkan dokter dengan tarif <= 135000
const hasilUpdateMany = database.dokter.updateMany(
  { tarif_konsultasi: { $lte: 135000 }, status_aktif: true },
  { $set: { status_aktif: false } }
);

print("U4 - updateMany nonaktifkan dokter tarif <= 135000: " + hasilUpdateMany.modifiedCount + " dokter diperbarui");

// ---------------------------------------------------------------------------
// DELETE (2 Operasi)
// ---------------------------------------------------------------------------

// D1: deleteOne - Hapus obat uji coba yang sudah tidak diperlukan
database.obat.deleteOne({ _id: "O53" });

print("D1 - deleteOne obat O53: OK");

// D2: deleteMany - Hapus seluruh pasien yang terdaftar hari ini sebagai data uji
const hasilDeleteMany = database.pasien.deleteMany({
  terdaftar_sejak: { $gte: new Date("2026-11-25T00:00:00Z") }
});

print("D2 - deleteMany pasien uji hari ini: " + hasilDeleteMany.deletedCount + " dokumen dihapus");

print("\nSeluruh 15 operasi CRUD selesai dieksekusi.");
