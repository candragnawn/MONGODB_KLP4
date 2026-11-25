// Projek Basis Data Lanjut - Klinik Sehat Bersama
// Kelompok 4 | Informatika FMIPA Universitas Udayana
// 05_indeks_explain.js - 4 Indeks & Pengujian Explain (Median 3 Kali Eksekusi)

const database = db.getSiblingDB("klinik_sehat_bersama");

// Hapus indeks non-default agar pengujian [SEBELUM INDEKS] selalu akurat (idempotent)
database.kunjungan.dropIndexes();
database.pasien.dropIndexes();
database.dokter.dropIndexes();

// Ekstrak tahap terdalam (COLLSCAN atau IXSCAN) dari pohon executionStages
function ekstrakTahap(stageObj) {
  if (!stageObj) return "-";
  if (stageObj.stage === "COLLSCAN" || stageObj.stage === "IXSCAN") {
    return stageObj.stage;
  }
  if (stageObj.inputStage) return ekstrakTahap(stageObj.inputStage);
  if (stageObj.shards && stageObj.shards.length > 0) {
    return ekstrakTahap(stageObj.shards[0].executionStages);
  }
  return stageObj.stage || "-";
}

// Jalankan explain("executionStats") 3 kali dan ambil nilai tengah (median) waktu
function ukurExplainMedian(label, fnQuery) {
  const daftarWaktu = [];
  let tahap = "-";
  let nReturned = 0;
  let totalDocsExamined = 0;

  for (let i = 0; i < 3; i++) {
    const res = fnQuery().explain("executionStats");
    const stats = res.executionStats || {};
    tahap = ekstrakTahap(stats.executionStages);
    nReturned = stats.nReturned !== undefined ? stats.nReturned : 0;
    totalDocsExamined = stats.totalDocsExamined !== undefined ? stats.totalDocsExamined : 0;
    daftarWaktu.push(stats.executionTimeMillis !== undefined ? stats.executionTimeMillis : 0);
  }

  daftarWaktu.sort((a, b) => a - b);
  const medianWaktu = daftarWaktu[1];

  print(label + ":");
  print("  tahap (stage)     : " + tahap);
  print("  nReturned         : " + nReturned);
  print("  totalDocsExamined : " + totalDocsExamined);
  print("  waktu 3x (ms)     : [" + daftarWaktu.join(", ") + "] -> median: " + medianWaktu + " ms");
  print("");
}

// ---------------------------------------------------------------------------
// UJI 1: Query kunjungan berdasarkan kode_dokter dan waktu_kunjungan (ESR)
// ---------------------------------------------------------------------------
print("=========================================================");
print("UJI 1: Filter kode_dokter + waktu_kunjungan + sort");
print("=========================================================");

const queryUji1 = () =>
  database.kunjungan
    .find({
      kode_dokter: "DK03",
      waktu_kunjungan: { $gte: new Date("2026-01-01"), $lte: new Date("2026-06-30") }
    })
    .sort({ waktu_kunjungan: -1 });

ukurExplainMedian("[SEBELUM INDEKS]", queryUji1);

database.kunjungan.createIndex(
  { kode_dokter: 1, waktu_kunjungan: -1, total_biaya: 1 },
  { name: "idx_kunjungan_dokter_waktu_biaya" }
);
print("Indeks majemuk ESR dibuat: idx_kunjungan_dokter_waktu_biaya\n");

ukurExplainMedian("[SESUDAH INDEKS]", queryUji1);

// ---------------------------------------------------------------------------
// UJI 2: Query pasien berdasarkan no_telp (Indeks Unik)
// ---------------------------------------------------------------------------
print("=========================================================");
print("UJI 2: Filter no_telp pasien");
print("=========================================================");

const samplePasien = database.pasien.findOne({}, { no_telp: 1 });
const targetTelp = samplePasien ? samplePasien.no_telp : "081234567890";

const queryUji2 = () => database.pasien.find({ no_telp: targetTelp });

ukurExplainMedian("[SEBELUM INDEKS]", queryUji2);

database.pasien.createIndex(
  { no_telp: 1 },
  { unique: true, name: "idx_pasien_notelp_unik" }
);
print("Indeks unik dibuat: idx_pasien_notelp_unik\n");

ukurExplainMedian("[SESUDAH INDEKS]", queryUji2);

// ---------------------------------------------------------------------------
// UJI 3: Query dokter berdasarkan array spesialisasi (Indeks Multikey)
// ---------------------------------------------------------------------------
print("=========================================================");
print("UJI 3: Filter spesialisasi dokter (array)");
print("=========================================================");

const queryUji3 = () => database.dokter.find({ spesialisasi: { $in: ["Umum"] } });

ukurExplainMedian("[SEBELUM INDEKS]", queryUji3);

database.dokter.createIndex(
  { spesialisasi: 1 },
  { name: "idx_dokter_spesialisasi_multikey" }
);
print("Indeks multikey dibuat: idx_dokter_spesialisasi_multikey\n");

ukurExplainMedian("[SESUDAH INDEKS]", queryUji3);

// ---------------------------------------------------------------------------
// INDEKS 4: Indeks Teks pada diagnosis dan catatan klinis
// ---------------------------------------------------------------------------
database.kunjungan.createIndex(
  { "pemeriksaan.nama_diagnosis": "text", "pemeriksaan.catatan_klinis": "text" },
  { name: "idx_kunjungan_catatan_teks" }
);
print("Indeks teks dibuat: idx_kunjungan_catatan_teks");

const hasilTeks = database.kunjungan
  .find(
    { $text: { $search: "demam" } },
    { score: { $meta: "textScore" }, waktu_kunjungan: 1, "pemeriksaan.nama_diagnosis": 1 }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(3)
  .toArray();

print("Contoh hasil pencarian teks 'demam' (3 teratas):");
printjson(hasilTeks);

print("\n=========================================================");
print("DAFTAR SELURUH INDEKS YANG TERDAFTAR:");
print("=========================================================");
print("kunjungan:", database.kunjungan.getIndexes().map(i => i.name).join(", "));
print("pasien   :", database.pasien.getIndexes().map(i => i.name).join(", "));
print("dokter   :", database.dokter.getIndexes().map(i => i.name).join(", "));
print("\nSeluruh indeks berhasil dibuat dan diuji.");
