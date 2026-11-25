// Projek Basis Data Lanjut - Klinik Sehat Bersama
// Kelompok 4 | Informatika FMIPA Universitas Udayana
// 04_aggregation.js - 6 Pipeline Analitik Bisnis

const database = db.getSiblingDB("klinik_sehat_bersama");

// ---------------------------------------------------------------------------
// PIPELINE 1: Diagnosis Penyakit Terbanyak per Bulan
// Tahap: $unwind > $group > $sort
// ---------------------------------------------------------------------------
print("=== Pipeline 1: Diagnosis Terbanyak per Bulan ===");

const hasilP1 = database.kunjungan.aggregate([
  {
    $match: {
      waktu_kunjungan: { $gte: new Date("2026-01-01T00:00:00Z") }
    }
  },
  {
    $unwind: "$pemeriksaan"
  },
  {
    $group: {
      _id: {
        bulan: { $month: "$waktu_kunjungan" },
        tahun: { $year: "$waktu_kunjungan" },
        diagnosis: "$pemeriksaan.nama_diagnosis"
      },
      jumlah_kasus: { $sum: 1 }
    }
  },
  {
    $sort: {
      "_id.tahun": 1,
      "_id.bulan": 1,
      jumlah_kasus: -1
    }
  },
  {
    $group: {
      _id: { bulan: "$_id.bulan", tahun: "$_id.tahun" },
      diagnosis_terbanyak: { $first: "$_id.diagnosis" },
      jumlah: { $first: "$jumlah_kasus" }
    }
  },
  {
    $sort: { "_id.tahun": 1, "_id.bulan": 1 }
  }
]).toArray();

printjson(hasilP1);

// ---------------------------------------------------------------------------
// PIPELINE 2: Obat Terlaris dan Total Omzet Farmasi
// Tahap: $unwind > $unwind > $group > $sort > $limit
// ---------------------------------------------------------------------------
print("=== Pipeline 2: Obat Terlaris dan Total Omzet ===");

const hasilP2 = database.kunjungan.aggregate([
  {
    $match: {
      "pemeriksaan.resep.status": { $ne: "Dibatalkan" }
    }
  },
  { $unwind: "$pemeriksaan" },
  { $unwind: "$pemeriksaan.resep" },
  {
    $match: {
      "pemeriksaan.resep.status": { $ne: "Dibatalkan" }
    }
  },
  {
    $group: {
      _id: {
        kode_obat: "$pemeriksaan.resep.kode_obat",
        nama_obat: "$pemeriksaan.resep.nama_obat"
      },
      total_terjual: { $sum: "$pemeriksaan.resep.jumlah" },
      total_omzet: { $sum: "$pemeriksaan.resep.subtotal" },
      frekuensi_diresepkan: { $sum: 1 }
    }
  },
  {
    $sort: { total_terjual: -1 }
  },
  {
    $limit: 10
  }
]).toArray();

printjson(hasilP2);

// ---------------------------------------------------------------------------
// PIPELINE 3: Beban Kerja dan Pendapatan per Dokter
// Tahap: $match > $group > $lookup > $project > $sort
// ---------------------------------------------------------------------------
print("=== Pipeline 3: Beban Kerja dan Pendapatan per Dokter ===");

const hasilP3 = database.kunjungan.aggregate([
  {
    $match: { kode_dokter: { $exists: true } }
  },
  {
    $group: {
      _id: "$kode_dokter",
      jumlah_kunjungan: { $sum: 1 },
      total_pendapatan: { $sum: "$total_biaya" },
      rata_biaya_per_kunjungan: { $avg: "$total_biaya" }
    }
  },
  {
    $lookup: {
      from: "dokter",
      localField: "_id",
      foreignField: "_id",
      as: "detail_dokter"
    }
  },
  {
    $project: {
      _id: 0,
      kode_dokter: "$_id",
      nama_dokter: { $arrayElemAt: ["$detail_dokter.nama", 0] },
      spesialisasi: { $arrayElemAt: ["$detail_dokter.spesialisasi", 0] },
      jumlah_kunjungan: 1,
      total_pendapatan: 1,
      rata_biaya_per_kunjungan: { $round: ["$rata_biaya_per_kunjungan", 0] }
    }
  },
  {
    $sort: { jumlah_kunjungan: -1 }
  }
]).toArray();

printjson(hasilP3.slice(0, 10));

// ---------------------------------------------------------------------------
// PIPELINE 4: Distribusi Usia Pasien (Anak, Dewasa, Lansia)
// Tahap: $addFields > $group > $sort
// ---------------------------------------------------------------------------
print("=== Pipeline 4: Distribusi Usia Pasien ===");

const hasilP4 = database.pasien.aggregate([
  {
    $match: {
      tanggal_lahir: { $exists: true },
      jenis_kelamin: { $in: ["L", "P"] }
    }
  },
  {
    $addFields: {
      tahun_lahir: { $toInt: { $substr: ["$tanggal_lahir", 0, 4] } }
    }
  },
  {
    $addFields: {
      usia: { $subtract: [2026, "$tahun_lahir"] }
    }
  },
  {
    $addFields: {
      kategori_usia: {
        $switch: {
          branches: [
            { case: { $lte: ["$usia", 12] }, then: "Anak-anak (0-12 tahun)" },
            { case: { $lte: ["$usia", 59] }, then: "Dewasa (13-59 tahun)" }
          ],
          default: "Lansia (60+ tahun)"
        }
      }
    }
  },
  {
    $group: {
      _id: "$kategori_usia",
      jumlah_pasien: { $sum: 1 }
    }
  },
  {
    $sort: { jumlah_pasien: -1 }
  }
]).toArray();

printjson(hasilP4);

// ---------------------------------------------------------------------------
// PIPELINE 5: Riwayat Resep Lengkap Pasien dengan Diagnosis Hipertensi
// Tahap: $match > $lookup > $unwind > $unwind > $project
// ---------------------------------------------------------------------------
print("=== Pipeline 5: Riwayat Resep Pasien Hipertensi ===");

const hasilP5 = database.kunjungan.aggregate([
  {
    $match: {
      "pemeriksaan.kode_diagnosis": "D05"
    }
  },
  {
    $lookup: {
      from: "pasien",
      localField: "nik_pasien",
      foreignField: "_id",
      as: "detail_pasien"
    }
  },
  {
    $lookup: {
      from: "dokter",
      localField: "kode_dokter",
      foreignField: "_id",
      as: "detail_dokter"
    }
  },
  {
    $unwind: "$pemeriksaan"
  },
  {
    $match: {
      "pemeriksaan.kode_diagnosis": "D05"
    }
  },
  {
    $project: {
      _id: 0,
      no_kunjungan: "$_id",
      tanggal: "$waktu_kunjungan",
      nama_pasien: { $arrayElemAt: ["$detail_pasien.nama", 0] },
      nama_dokter: { $arrayElemAt: ["$detail_dokter.nama", 0] },
      diagnosis: "$pemeriksaan.nama_diagnosis",
      catatan: "$pemeriksaan.catatan_klinis",
      jumlah_resep: { $size: { $ifNull: ["$pemeriksaan.resep", []] } },
      resep: "$pemeriksaan.resep"
    }
  },
  {
    $sort: { tanggal: -1 }
  },
  {
    $limit: 10
  }
]).toArray();

printjson(hasilP5);

// ---------------------------------------------------------------------------
// PIPELINE 6: Laporan Frekuensi Substitusi Obat
// Tahap: $unwind > $unwind > $match > $group > $sort
// ---------------------------------------------------------------------------
print("=== Pipeline 6: Laporan Substitusi Obat ===");

const hasilP6 = database.kunjungan.aggregate([
  {
    $match: {
      "pemeriksaan.resep.status": "Disubstitusi"
    }
  },
  { $unwind: "$pemeriksaan" },
  { $unwind: "$pemeriksaan.resep" },
  {
    $match: {
      "pemeriksaan.resep.status": "Disubstitusi"
    }
  },
  {
    $group: {
      _id: {
        kode_obat: "$pemeriksaan.resep.kode_obat",
        nama_obat: "$pemeriksaan.resep.nama_obat"
      },
      total_disubstitusi: { $sum: 1 }
    }
  },
  {
    $sort: { total_disubstitusi: -1 }
  }
]).toArray();

printjson(hasilP6);

print("\nSeluruh 6 pipeline aggregasi selesai dieksekusi.");
