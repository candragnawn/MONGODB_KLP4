
const database = db.getSiblingDB("klinik_sehat_bersama");

// ---------------------------------------------------------------------------
// KOLEKSI: pasien
// ---------------------------------------------------------------------------

database.pasien.drop();

database.createCollection("pasien", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "nama", "tanggal_lahir", "alamat", "no_telp"],
      properties: {
        _id: {
          bsonType: "string",
          pattern: "^[0-9]{10,16}$"
        },
        nama: {
          bsonType: "string",
          minLength: 3,
          maxLength: 100
        },
        tanggal_lahir: {
          bsonType: "string",
          pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
        },
        jenis_kelamin: {
          enum: ["L", "P"]
        },
        alamat: {
          bsonType: "string",
          maxLength: 200
        },
        no_telp: {
          bsonType: "string",
          pattern: "^[0-9+]{8,20}$"
        },
        terdaftar_sejak: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ---------------------------------------------------------------------------
// KOLEKSI: dokter
// ---------------------------------------------------------------------------

database.dokter.drop();

database.createCollection("dokter", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "nama", "spesialisasi", "status_aktif"],
      properties: {
        _id: {
          bsonType: "string",
          pattern: "^DK[0-9]{2,4}$"
        },
        nama: {
          bsonType: "string",
          minLength: 3
        },
        spesialisasi: {
          bsonType: "array",
          minItems: 1,
          items: { bsonType: "string" }
        },
        tarif_konsultasi: {
          bsonType: ["int", "double", "long", "decimal"],
          minimum: 0
        },
        status_aktif: {
          bsonType: "bool"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ---------------------------------------------------------------------------
// KOLEKSI: obat
// ---------------------------------------------------------------------------

database.obat.drop();

database.createCollection("obat", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "nama_obat", "satuan", "harga_master", "stok"],
      properties: {
        _id: {
          bsonType: "string",
          pattern: "^O[0-9]{2,4}$"
        },
        nama_obat: {
          bsonType: "string",
          minLength: 2
        },
        satuan: {
          enum: ["Tablet", "Kapsul", "Sirup", "Botol", "Sachet", "Salep", "Ampul"]
        },
        harga_master: {
          bsonType: ["int", "double", "long", "decimal"],
          minimum: 0
        },
        stok: {
          bsonType: ["int", "long"],
          minimum: 0
        },
        rekomendasi_preset: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["kode_preset", "frekuensi", "durasi_hari", "metode"],
            properties: {
              kode_preset: { bsonType: "string" },
              frekuensi: { bsonType: "string" },
              durasi_hari: { bsonType: ["int", "long"], minimum: 1 },
              metode: { bsonType: "string" },
              catatan: { bsonType: "string" }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ---------------------------------------------------------------------------
// KOLEKSI: kunjungan
// ---------------------------------------------------------------------------

database.kunjungan.drop();

database.createCollection("kunjungan", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "waktu_kunjungan", "nik_pasien", "kode_dokter", "total_biaya", "pemeriksaan"],
      properties: {
        _id: {
          bsonType: "string",
          pattern: "^KJ[0-9]{3,6}$"
        },
        waktu_kunjungan: {
          bsonType: "date"
        },
        nik_pasien: {
          bsonType: "string",
          pattern: "^[0-9]{10,16}$"
        },
        kode_dokter: {
          bsonType: "string",
          pattern: "^DK[0-9]{2,4}$"
        },
        total_biaya: {
          bsonType: ["int", "double", "long", "decimal"],
          minimum: 0
        },
        pemeriksaan: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["kode_diagnosis", "nama_diagnosis"],
            properties: {
              kode_diagnosis: {
                bsonType: "string",
                pattern: "^D[0-9]{2,4}$"
              },
              nama_diagnosis: {
                bsonType: "string"
              },
              catatan_klinis: {
                bsonType: "string"
              },
              resep: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["kode_resep", "kode_obat", "nama_obat", "jumlah", "harga_satuan_snapshot", "subtotal", "status"],
                  properties: {
                    kode_resep: { bsonType: "string" },
                    kode_obat: { bsonType: "string" },
                    nama_obat: { bsonType: "string" },
                    aturan_pakai: { bsonType: "string" },
                    jumlah: {
                      bsonType: ["int", "long"],
                      minimum: 1
                    },
                    harga_satuan_snapshot: {
                      bsonType: ["int", "double", "long", "decimal"],
                      minimum: 0
                    },
                    subtotal: {
                      bsonType: ["int", "double", "long", "decimal"],
                      minimum: 0
                    },
                    status: {
                      enum: ["Diberikan", "Disubstitusi", "Dibatalkan"]
                    },
                    substitusi_dari: {
                      bsonType: ["string", "null"]
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("Skema selesai dikonfigurasi untuk 4 koleksi.");

// ---------------------------------------------------------------------------
// UJI VALIDASI NEGATIF (4 Kasus - Wajib Juknis)
// ---------------------------------------------------------------------------

// Uji 1: NIK pasien mengandung huruf
try {
  database.pasien.insertOne({
    _id: "NIK_SALAH_123",
    nama: "Pasien Uji",
    tanggal_lahir: "1995-01-01",
    alamat: "Jl. Uji No. 1",
    no_telp: "08123456789"
  });
  print("Uji 1 GAGAL: data tidak valid lolos masuk.");
} catch (e) {
  print("Uji 1 LULUS - NIK huruf ditolak: " + (e.code ? "Kode " + e.code + " (Document failed validation)" : "DocumentValidationFailure"));
}

// Uji 2: Array spesialisasi dokter kosong
try {
  database.dokter.insertOne({
    _id: "DK99",
    nama: "dr. Tanpa Spesialisasi",
    spesialisasi: [],
    tarif_konsultasi: 50000,
    status_aktif: true
  });
  print("Uji 2 GAGAL: data tidak valid lolos masuk.");
} catch (e) {
  print("Uji 2 LULUS - spesialisasi kosong ditolak: " + (e.code ? "Kode " + e.code + " (Document failed validation)" : "DocumentValidationFailure"));
}

// Uji 3: Harga obat negatif
try {
  database.obat.insertOne({
    _id: "O99",
    nama_obat: "Obat Uji",
    satuan: "Tablet",
    harga_master: -15000,
    stok: 10
  });
  print("Uji 3 GAGAL: data tidak valid lolos masuk.");
} catch (e) {
  print("Uji 3 LULUS - harga negatif ditolak: " + (e.code ? "Kode " + e.code + " (Document failed validation)" : "DocumentValidationFailure"));
}

// Uji 4: Status resep di luar enum
try {
  database.kunjungan.insertOne({
    _id: "KJ999",
    waktu_kunjungan: new Date(),
    nik_pasien: "3401010101",
    kode_dokter: "DK01",
    total_biaya: 25000,
    pemeriksaan: [
      {
        kode_diagnosis: "D01",
        nama_diagnosis: "Flu",
        resep: [
          {
            kode_resep: "RS999",
            kode_obat: "O01",
            nama_obat: "Paracetamol",
            aturan_pakai: "3x sehari",
            jumlah: 10,
            harga_satuan_snapshot: 500,
            subtotal: 5000,
            status: "Pending"
          }
        ]
      }
    ]
  });
  print("Uji 4 GAGAL: data tidak valid lolos masuk.");
} catch (e) {
  print("Uji 4 LULUS - status enum tidak valid ditolak: " + (e.code ? "Kode " + e.code + " (Document failed validation)" : "DocumentValidationFailure"));
}
