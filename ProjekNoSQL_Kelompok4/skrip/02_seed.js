

const dbName = "klinik_sehat_bersama";
const database = db.getSiblingDB(dbName);

print("1. Mengosongkan data lama dengan deleteMany({})...");
database.kunjungan.deleteMany({});
database.pasien.deleteMany({});
database.dokter.deleteMany({});
database.obat.deleteMany({});
print("   -> Data lama berhasil dibersihkan tanpa menghapus validator schema.\n");



let seedValue = 2408561057;
function seededRandom() {
  seedValue = (seedValue * 9301 + 49297) % 233280;
  return seedValue / 233280;
}
function getRandomInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}
function getRandomElement(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}


print("2. Membangkitkan data koleksi 'pasien' (120 dokumen)...");

const namaDepanL = ["I Wayan", "I Made", "I Nyoman", "I Ketut", "I Putu", "I Gede", "I Kadek", "I Komang"];
const namaDepanP = ["Ni Wayan", "Ni Made", "Ni Nyoman", "Ni Ketut", "Ni Putu", "Ni Kadek", "Ni Komang", "Luh Putu"];
const namaBelakang = [
  "Suryawan", "Wirawan", "Kusuma", "Gunawan", "Cakti", "Pratama", "Aditya", "Mahendra",
  "Suastini", "Ariani", "Sari", "Wardani", "Lestari", "Damayanti", "Maharani", "Utami",
  "Wijaya", "Saputra", "Wibawa", "Arimbawa", "Sudarma", "Budiarta", "Subawa", "Hartawan"
];
const jalanBali = [
  "Jl. Sudirman No.", "Jl. Gatot Subroto No.", "Jl. Hayam Wuruk No.", "Jl. Diponegoro No.",
  "Jl. Teuku Umar No.", "Jl. Imam Bonjol No.", "Jl. Tukad Badung No.", "Jl. Tukad Yeh Aya No.",
  "Jl. Raya Sesetan No.", "Jl. Danau Tamblingan No.", "Jl. Bypass Ngurah Rai No.", "Jl. Nakula No."
];
const kotaBali = ["Denpasar", "Badung", "Gianyar", "Tabanan"];

const dataPasien = [];
for (let i = 1; i <= 120; i++) {
  const isLaki = seededRandom() > 0.5;
  const jk = isLaki ? "L" : "P";
  const namaDepan = isLaki ? getRandomElement(namaDepanL) : getRandomElement(namaDepanP);
  const namaLengkap = `${namaDepan} ${getRandomElement(namaBelakang)}`;
  

  const thnLahir = getRandomInt(1955, 2018);
  const blnLahir = String(getRandomInt(1, 12)).padStart(2, "0");
  const tglLahir = String(getRandomInt(1, 28)).padStart(2, "0");
  const nik = `517101${tglLahir}${blnLahir}${String(i).padStart(4, "0")}`;
  
  const alamat = `${getRandomElement(jalanBali)}${getRandomInt(1, 150)}, ${getRandomElement(kotaBali)}`;
  const noTelp = `081${getRandomInt(100000000, 999999999)}`;
  const terdaftarSejak = new Date(Date.UTC(2025, getRandomInt(0, 11), getRandomInt(1, 28)));

  dataPasien.push({
    _id: nik,
    nama: namaLengkap,
    tanggal_lahir: `${thnLahir}-${blnLahir}-${tglLahir}`,
    jenis_kelamin: jk,
    alamat: alamat,
    no_telp: noTelp,
    terdaftar_sejak: terdaftarSejak
  });
}
database.pasien.insertMany(dataPasien);
print(`   -> Berhasil memasukkan ${dataPasien.length} dokumen pasien.\n`);


print("3. Membangkitkan data koleksi 'dokter' (35 dokumen)...");

const spesialisasiPool = [
  "Umum", "Gigi", "Anak", "Penyakit Dalam", "THT",
  "Kulit dan Kelamin", "Mata", "Saraf", "Kandungan", "Geriatri"
];

const dataDokter = [];
for (let i = 1; i <= 35; i++) {
  const kodeDokter = `DK${String(i).padStart(2, "0")}`;
  const isLaki = seededRandom() > 0.4;
  const namaDepan = isLaki ? getRandomElement(namaDepanL) : getRandomElement(namaDepanP);
  const gelarDepan = i % 5 === 0 ? "drg." : "dr.";
  const namaLengkap = `${gelarDepan} ${namaDepan} ${getRandomElement(namaBelakang)}`;
  

  const sp1 = getRandomElement(spesialisasiPool);
  const sp2 = getRandomElement(spesialisasiPool);
  const spesialisasi = (sp1 === sp2 || seededRandom() > 0.4) ? [sp1] : [sp1, sp2];
  
  const tarif = (sp1 === "Umum" ? 60000 : 125000) + (getRandomInt(0, 4) * 10000);

  dataDokter.push({
    _id: kodeDokter,
    nama: namaLengkap,
    spesialisasi: spesialisasi,
    tarif_konsultasi: tarif,
    status_aktif: i <= 32 
  });
}
database.dokter.insertMany(dataDokter);
print(`   -> Berhasil memasukkan ${dataDokter.length} dokumen dokter.\n`);


print("4. Membangkitkan data koleksi 'obat' (50 dokumen)...");

const obatMasterList = [
  { nama: "Paracetamol 500 mg", satuan: "Tablet", harga: 550, preset: "PR01" },
  { nama: "Amoxicillin 500 mg", satuan: "Kapsul", harga: 800, preset: "PR02" },
  { nama: "Vitamin C 500 mg", satuan: "Tablet", harga: 300, preset: "PR01" },
  { nama: "Asam Mefenamat 500 mg", satuan: "Tablet", harga: 700, preset: "PR03" },
  { nama: "Amlodipine 5 mg", satuan: "Tablet", harga: 1200, preset: "PR05" },
  { nama: "Amlodipine 10 mg", satuan: "Tablet", harga: 1800, preset: "PR05" },
  { nama: "Loratadine 10 mg", satuan: "Tablet", harga: 2500, preset: "PR06" },
  { nama: "Cetirizine 10 mg", satuan: "Tablet", harga: 900, preset: "PR06" },
  { nama: "Omeprazole 20 mg", satuan: "Kapsul", harga: 2500, preset: "PR03" },
  { nama: "Antasida Doen", satuan: "Tablet", harga: 400, preset: "PR03" },
  { nama: "Sirup Batuk DMP 60 ml", satuan: "Botol", harga: 15000, preset: "PR04" },
  { nama: "Sirup Paracetamol 60 ml", satuan: "Botol", harga: 12000, preset: "PR01" },
  { nama: "Ibuprofen 400 mg", satuan: "Tablet", harga: 650, preset: "PR01" },
  { nama: "Ciprofloxacin 500 mg", satuan: "Tablet", harga: 1500, preset: "PR02" },
  { nama: "Salbutamol 2 mg", satuan: "Tablet", harga: 450, preset: "PR01" },
  { nama: "Dexamethasone 0.5 mg", satuan: "Tablet", harga: 350, preset: "PR01" },
  { nama: "Metformin 500 mg", satuan: "Tablet", harga: 850, preset: "PR05" },
  { nama: "Glimepiride 2 mg", satuan: "Tablet", harga: 1600, preset: "PR05" },
  { nama: "Simvastatin 10 mg", satuan: "Tablet", harga: 1400, preset: "PR05" },
  { nama: "Atorvastatin 20 mg", satuan: "Tablet", harga: 3500, preset: "PR05" },
  { nama: "Oralit Sachet", satuan: "Sachet", harga: 1000, preset: "PR04" },
  { nama: "Ranitidine 150 mg", satuan: "Tablet", harga: 750, preset: "PR03" },
  { nama: "Domperidone 10 mg", satuan: "Tablet", harga: 800, preset: "PR03" },
  { nama: "Betamethasone Salep 5 gr", satuan: "Salep", harga: 8500, preset: "PR06" },
  { nama: "Hydrocortisone Salep 5 gr", satuan: "Salep", harga: 9000, preset: "PR06" }
];

const presetTemplates = {
  PR01: { kode_preset: "PR01", frekuensi: "3x sehari", durasi_hari: 5, metode: "Sesudah makan", catatan: "Diminum dengan air putih" },
  PR02: { kode_preset: "PR02", frekuensi: "2x sehari", durasi_hari: 7, metode: "Sesudah makan", catatan: "Antibiotik, habiskan sesuai resep" },
  PR03: { kode_preset: "PR03", frekuensi: "3x sehari", durasi_hari: 3, metode: "Sebelum makan", catatan: "Diminum 30 menit sebelum makan" },
  PR04: { kode_preset: "PR04", frekuensi: "3x sehari", durasi_hari: 5, metode: "Sesudah makan", catatan: "Kocok dahulu sebelum diminum" },
  PR05: { kode_preset: "PR05", frekuensi: "1x sehari", durasi_hari: 30, metode: "Sesudah makan", catatan: "Rutin diminum setiap pagi/malam" },
  PR06: { kode_preset: "PR06", frekuensi: "Bila perlu", durasi_hari: 3, metode: "Sesudah makan", catatan: "Maksimal pemakaian 3 hari" }
};

const dataObat = [];
for (let i = 1; i <= 50; i++) {
  const master = obatMasterList[(i - 1) % obatMasterList.length];
  const kodeObat = `O${String(i).padStart(2, "0")}`;
  const namaLengkap = i > obatMasterList.length ? `${master.nama} (Gen ${Math.ceil(i / obatMasterList.length)})` : master.nama;
  const p = presetTemplates[master.preset];

  dataObat.push({
    _id: kodeObat,
    nama_obat: namaLengkap,
    satuan: master.satuan,
    harga_master: master.harga + getRandomInt(0, 5) * 50,
    stok: getRandomInt(50, 1500),
    rekomendasi_preset: [p]
  });
}
database.obat.insertMany(dataObat);
print(`   -> Berhasil memasukkan ${dataObat.length} dokumen obat.\n`);


print("5. Membangkitkan data koleksi 'kunjungan' (5.000 dokumen)...");

const diagnosisMaster = [
  { kode: "D01", nama: "Flu", gejala: "Suhu tubuh 38.2°C, pilek dan hidung tersumbat" },
  { kode: "D02", nama: "Demam Akut", gejala: "Suhu tubuh 38.8°C, sakit kepala dan menggigil" },
  { kode: "D03", nama: "Batuk Pilek", gejala: "Batuk berdahak sudah 4 hari, tenggorokan gatal" },
  { kode: "D04", nama: "Karies Gigi", gejala: "Gigi geraham kanan bawah berlubang dan nyeri" },
  { kode: "D05", nama: "Hipertensi", gejala: "Tekanan darah 150/95 mmHg, tengkuk kaku" },
  { kode: "D06", nama: "Sakit Kepala / Cephalgia", gejala: "Nyeri berdenyut di pelipis kanan" },
  { kode: "D07", nama: "Pemeriksaan Rutin", gejala: "Pemeriksaan kesehatan berkala, kondisi stabil" },
  { kode: "D08", nama: "Gastritis / Maag", gejala: "Nyeri ulu hati, mual setelah makan pedas" },
  { kode: "D09", nama: "Dermatitis Alergi", gejala: "Bintik merah gatal di kedua lengan tangan" },
  { kode: "D10", nama: "Faringitis Akut", gejala: "Radang dan nyeri saat menelan makanan" }
];

const dataKunjungan = [];
const startTimestamp = new Date("2026-01-01T08:00:00Z").getTime();
const endTimestamp = new Date("2026-11-20T17:00:00Z").getTime();

for (let k = 1; k <= 5000; k++) {
  const noKunjungan = `KJ${String(k).padStart(4, "0")}`;
  
  // Waktu kunjungan acak dalam rentang 11 bulan
  const randomTime = new Date(startTimestamp + seededRandom() * (endTimestamp - startTimestamp));
  
  // Ambil NIK pasien dan Kode dokter acak yang valid
  const pasienTerpilih = getRandomElement(dataPasien);
  const dokterTerpilih = getRandomElement(dataDokter.filter(d => d.status_aktif));
  
  // 1 sampai 2 diagnosis per kunjungan
  const jmlDiag = seededRandom() > 0.8 ? 2 : 1;
  const pemeriksaanList = [];
  let totalBiayaKunjungan = dokterTerpilih.tarif_konsultasi;

  for (let d = 0; d < jmlDiag; d++) {
    const diag = getRandomElement(diagnosisMaster);
    
    // 0 sampai 3 resep per diagnosis (ada pemeriksaan rutin yang tanpa resep)
    const jmlResep = diag.kode === "D07" ? 0 : getRandomInt(1, 3);
    const resepList = [];

    for (let r = 1; r <= jmlResep; r++) {
      const obatPilihan = getRandomElement(dataObat);
      const kodeResep = `RS${String(k).padStart(4, "0")}_${d + 1}${r}`;
      const qty = getRandomInt(5, 20);
      const hargaSatuan = obatPilihan.harga_master;
      const subtotal = qty * hargaSatuan;
      totalBiayaKunjungan += subtotal;

      // Status resep: dominan 'Diberikan', sesekali 'Disubstitusi' atau 'Dibatalkan'
      let statusResep = "Diberikan";
      let substitusiDari = null;
      const roll = seededRandom();
      if (roll > 0.95) {
        statusResep = "Disubstitusi";
      } else if (roll > 0.92) {
        statusResep = "Dibatalkan";
      }

      resepList.push({
        kode_resep: kodeResep,
        kode_obat: obatPilihan._id,
        nama_obat: obatPilihan.nama_obat,
        aturan_pakai: obatPilihan.rekomendasi_preset[0]?.frekuensi || "3x sehari sesudah makan",
        jumlah: qty,
        harga_satuan_snapshot: hargaSatuan,
        subtotal: subtotal,
        status: statusResep,
        substitusi_dari: substitusiDari
      });
    }

    pemeriksaanList.push({
      kode_diagnosis: diag.kode,
      nama_diagnosis: diag.nama,
      catatan_klinis: diag.gejala,
      resep: resepList
    });
  }

  dataKunjungan.push({
    _id: noKunjungan,
    waktu_kunjungan: randomTime,
    nik_pasien: pasienTerpilih._id,
    kode_dokter: dokterTerpilih._id,
    total_biaya: totalBiayaKunjungan,
    pemeriksaan: pemeriksaanList
  });
}

database.kunjungan.insertMany(dataKunjungan);
print(`   -> Berhasil memasukkan ${dataKunjungan.length} dokumen kunjungan.\n`);

// -----------------------------------------------------------------------------
// VERIFIKASI AKHIR: countDocuments() pada Seluruh Koleksi (Wajib Juknis CP2)
// -----------------------------------------------------------------------------
print(`======================================================`);
print(`REKAPITULASI JUMLAH DOKUMEN (countDocuments)`);
print(`======================================================`);
const countPasien = database.pasien.countDocuments();
const countDokter = database.dokter.countDocuments();
const countObat = database.obat.countDocuments();
const countKunjungan = database.kunjungan.countDocuments();

print(`- Koleksi 'pasien'    : ${countPasien} dokumen (Syarat >= 30: ${countPasien >= 30 ? "TERPENUHI" : "BELUM"})`);
print(`- Koleksi 'dokter'    : ${countDokter} dokumen (Syarat >= 30: ${countDokter >= 30 ? "TERPENUHI" : "BELUM"})`);
print(`- Koleksi 'obat'      : ${countObat} dokumen (Syarat >= 30: ${countObat >= 30 ? "TERPENUHI" : "BELUM"})`);
print(`- Koleksi 'kunjungan' : ${countKunjungan} dokumen (Syarat >= 1.000: ${countKunjungan >= 1000 ? "TERPENUHI" : "BELUM"})`);
print(`======================================================\n`);
print(`Seeding selesai dengan sukses dan data konsisten!\n`);
