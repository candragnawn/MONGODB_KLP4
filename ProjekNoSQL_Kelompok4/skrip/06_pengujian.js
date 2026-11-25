

const database = db.getSiblingDB("klinik_sehat_bersama");

let lulus = 0;
let gagal = 0;

function ujiPositif(nomor, label, fn) {
  try {
    const hasil = fn();
    const valid = hasil !== null && hasil !== undefined;
    if (valid) {
      print("LULUS [P" + nomor + "] " + label);
      lulus++;
    } else {
      print("GAGAL [P" + nomor + "] " + label + " - hasil null/undefined");
      gagal++;
    }
  } catch (e) {
    print("GAGAL [P" + nomor + "] " + label + " - ERROR: " + e.message);
    gagal++;
  }
}

function ujiNegatif(nomor, label, fn) {
  try {
    fn();
    print("GAGAL [N" + nomor + "] " + label + " - data tidak valid lolos masuk");
    gagal++;
  } catch (e) {
    const alasan = e.codeName || (e.code ? "Kode " + e.code : "DocumentValidationFailure");
    print("LULUS [N" + nomor + "] " + label + " - ditolak: " + alasan);
    lulus++;
  }
}

print("=========================================================");
print("MEMULAI 15 KASUS UJI FUNGSIONAL");
print("=========================================================\n");

// ---------------------------------------------------------------------------
// KASUS POSITIF (11 Kasus)
// ---------------------------------------------------------------------------

// P1: Koleksi pasien harus memiliki setidaknya 100 dokumen
ujiPositif(1, "countDocuments pasien >= 100", function() {
  const count = database.pasien.countDocuments();
  if (count < 100) throw new Error("Hanya " + count + " dokumen");
  return count;
});

// P2: Koleksi dokter harus memiliki setidaknya 30 dokumen
ujiPositif(2, "countDocuments dokter >= 30", function() {
  const count = database.dokter.countDocuments();
  if (count < 30) throw new Error("Hanya " + count + " dokumen");
  return count;
});

// P3: Koleksi obat harus memiliki setidaknya 30 dokumen
ujiPositif(3, "countDocuments obat >= 30", function() {
  const count = database.obat.countDocuments();
  if (count < 30) throw new Error("Hanya " + count + " dokumen");
  return count;
});

// P4: Koleksi kunjungan harus memiliki setidaknya 1000 dokumen
ujiPositif(4, "countDocuments kunjungan >= 1000", function() {
  const count = database.kunjungan.countDocuments();
  if (count < 1000) throw new Error("Hanya " + count + " dokumen");
  return count;
});

// P5: Semua dokumen kunjungan memiliki field waktu_kunjungan
ujiPositif(5, "Semua kunjungan memiliki waktu_kunjungan", function() {
  const tanpaWaktu = database.kunjungan.countDocuments({ waktu_kunjungan: { $exists: false } });
  if (tanpaWaktu > 0) throw new Error(tanpaWaktu + " kunjungan tanpa waktu");
  return true;
});

// P6: Semua dokumen kunjungan memiliki array pemeriksaan minimal 1 elemen
ujiPositif(6, "Semua kunjungan memiliki pemeriksaan minimal 1", function() {
  const kosong = database.kunjungan.countDocuments({ "pemeriksaan.0": { $exists: false } });
  if (kosong > 0) throw new Error(kosong + " kunjungan tanpa pemeriksaan");
  return true;
});

// P7: Query find dengan filter $and menghasilkan hasil yang benar
ujiPositif(7, "Query $and obat harga > 500 dan stok > 0", function() {
  const hasil = database.obat.find({
    $and: [{ harga_master: { $gt: 500 } }, { stok: { $gt: 0 } }]
  }).toArray();
  if (hasil.length === 0) throw new Error("Tidak ada hasil");
  return hasil;
});

// P8: Query dengan notasi titik pada nested field berhasil
ujiPositif(8, "Query notasi titik pemeriksaan.kode_diagnosis D01", function() {
  const hasil = database.kunjungan.findOne({ "pemeriksaan.kode_diagnosis": "D01" });
  if (!hasil) throw new Error("Tidak ditemukan");
  return hasil;
});

// P9: updateOne berhasil mengubah data dan nilai stok bertambah tepat +5
ujiPositif(9, "updateOne $inc stok obat O01 bertambah +5", function() {
  const sebelum = database.obat.findOne({ _id: "O01" });
  if (!sebelum) throw new Error("Obat O01 tidak ditemukan");
  database.obat.updateOne({ _id: "O01" }, { $inc: { stok: 5 } });
  const sesudah = database.obat.findOne({ _id: "O01" });
  if (sesudah.stok !== sebelum.stok + 5) {
    throw new Error("Stok tidak bertambah 5");
  }
  database.obat.updateOne({ _id: "O01" }, { $inc: { stok: -5 } });
  return sesudah.stok;
});

// P10: Aggregation pipeline menghasilkan minimal 1 hasil
ujiPositif(10, "Aggregation pipeline diagnosis terbanyak menghasilkan hasil", function() {
  const hasil = database.kunjungan.aggregate([
    { $unwind: "$pemeriksaan" },
    { $group: { _id: "$pemeriksaan.nama_diagnosis", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]).toArray();
  if (hasil.length === 0) throw new Error("Pipeline tidak menghasilkan data");
  return hasil;
});

// P11: Indeks terdaftar pada koleksi kunjungan
ujiPositif(11, "Indeks ESR terdaftar di koleksi kunjungan", function() {
  const indeks = database.kunjungan.getIndexes();
  const ada = indeks.some(i => i.name === "idx_kunjungan_dokter_waktu_biaya");
  if (!ada) throw new Error("Indeks tidak ditemukan");
  return true;
});

// ---------------------------------------------------------------------------
// KASUS NEGATIF (4 Kasus - Harus Ditolak Validator)
// ---------------------------------------------------------------------------

// N1: NIK pasien mengandung huruf
ujiNegatif(1, "NIK pasien mengandung huruf harus ditolak", function() {
  database.pasien.insertOne({
    _id: "ABCD12345678",
    nama: "Pasien Gagal",
    tanggal_lahir: "1990-01-01",
    alamat: "Jl. Uji No.1",
    no_telp: "08100000000"
  });
});

// N2: Dokter dengan array spesialisasi kosong
ujiNegatif(2, "Spesialisasi dokter kosong harus ditolak", function() {
  database.dokter.insertOne({
    _id: "DK99",
    nama: "dr. Uji Gagal",
    spesialisasi: [],
    tarif_konsultasi: 50000,
    status_aktif: true
  });
});

// N3: Harga obat negatif
ujiNegatif(3, "Harga obat negatif harus ditolak", function() {
  database.obat.insertOne({
    _id: "O99",
    nama_obat: "Obat Uji",
    satuan: "Tablet",
    harga_master: -5000,
    stok: 10
  });
});

// N4: Status resep di luar nilai enum
ujiNegatif(4, "Status resep 'Menunggu' harus ditolak", function() {
  database.kunjungan.insertOne({
    _id: "KJ9999",
    waktu_kunjungan: new Date(),
    nik_pasien: "5171011630003",
    kode_dokter: "DK01",
    total_biaya: 50000,
    pemeriksaan: [
      {
        kode_diagnosis: "D01",
        nama_diagnosis: "Flu",
        resep: [
          {
            kode_resep: "RS9999",
            kode_obat: "O01",
            nama_obat: "Paracetamol 500 mg",
            aturan_pakai: "3x sehari",
            jumlah: 10,
            harga_satuan_snapshot: 550,
            subtotal: 5500,
            status: "Menunggu"
          }
        ]
      }
    ]
  });
});

// ---------------------------------------------------------------------------
// RINGKASAN HASIL PENGUJIAN
// ---------------------------------------------------------------------------
print("\n=========================================================");
print("RINGKASAN HASIL PENGUJIAN");
print("=========================================================");
print("Total Kasus   : 15");
print("Lulus         : " + lulus);
print("Gagal         : " + gagal);
print("Status        : " + (gagal === 0 ? "SEMUA KASUS LULUS" : gagal + " KASUS PERLU DIPERIKSA"));
print("=========================================================");
