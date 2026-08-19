import { Student } from '../types';

export const MAPEL_TKA_OPTIONS = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika Tingkat Lanjut',
  'Bahasa Indonesia Tingkat Lanjut',
  'Bahasa Inggris Tingkat Lanjut',
  'Fisika',
  'Kimia',
  'Biologi',
  'Pendidikan Pancasila dan Kewarganegaraan',
  'Ekonomi',
  'Geografi',
  'Sosiologi',
  'Sejarah',
  'Antropologi',
  'Bahasa Prancis',
  'Bahasa Jerman',
  'Bahasa Jepang',
  'Bahasa Mandarin',
  'Bahasa Korea',
  'Bahasa Arab',
];

export const UNIVERSITAS_POPULAR_OPTIONS = [
  'Institut Teknologi Bandung (ITB)',
  'Universitas Indonesia (UI)',
  'Universitas Gadjah Mada (UGM)',
  'Institut Teknologi Sepuluh Nopember (ITS)',
  'Universitas Airlangga (UNAIR)',
  'Universitas Padjadjaran (UNPAD)',
  'Universitas Diponegoro (UNDIP)',
  'Universitas Brawijaya (UB)',
  'Universitas Sebelas Maret (UNS)',
  'IPB University',
  'Universitas Pendidikan Indonesia (UPI)',
  'Universitas Negeri Yogyakarta (UNY)',
  'Universitas Negeri Malang (UM)',
  'Universitas Negeri Jakarta (UNJ)',
  'Universitas Hasanuddin (UNHAS)',
  'Universitas Sumatra Utara (USU)',
  'Politeknik Negeri Bandung (POLBAN)',
  'Politeknik Negeri Jakarta (PNJ)',
  'STIS / STAN / IPDN / STIN / AKMIL / AKPOL',
  'Perguruan Tinggi Swasta (PTS)',
];

export const PRODI_POPULAR_OPTIONS = [
  'Teknik Informatika / Ilmu Komputer',
  'Pendidikan Dokter / Kedokteran Umum',
  'Teknik Elektro',
  'Teknik Mesin',
  'Teknik Sipil',
  'Teknik Industri',
  'Sekolah Bisnis dan Manajemen (SBM) / Manajemen',
  'Akuntansi',
  'Hukum',
  'Farmasi',
  'Psikologi',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Sistem Informasi',
  'Statistika / Sains Data',
  'Pendidikan Matematika',
  'Pendidikan Bahasa Inggris',
  'Desain Komunikasi Visual (DKV)',
];

export const INITIAL_STUDENTS: Student[] = [];
const OLD_INITIAL_STUDENTS: Student[] = []; /*
  {
    id: 'std-101',
    namaSiswa: 'Ahmad Fauzi Nurrahman',
    nis: '22231001',
    nisn: '0061234561',
    kelas: 'XII MIPA 1',
    jenisKelamin: 'L',
    mapelTka1: 'Matematika Tingkat Lanjut',
    mapelTka2: 'Fisika',
    pilihanStudiLanjut: 'Kuliah',
    ptn1: 'Institut Teknologi Bandung (ITB)',
    prodiPilihan1: 'Teknik Informatika',
    akreditasiPilihan1: 'Unggul (ASIIN)',
    kriteriaPilihan1: 'Keketatan SNBP 2%, Akreditasi Internasional ASIIN, PTN-BH Utama',
    ptn2: 'Institut Teknologi Sepuluh Nopember (ITS)',
    prodiPilihan2: 'Teknik Informatika',
    akreditasiPilihan2: 'Unggul',
    kriteriaPilihan2: 'Daya Tampung 120, Pilihan Cadangan Prioritas',
    noHp: '081234567890',
    fotoSiswa: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    prestasiList: [
      {
        id: 'p-101-1',
        namaPrestasi: 'Juara 1 Olimpiade Sains Nasional (OSN) Matematika',
        jenis: 'Akademik',
        tingkat: 'Nasional',
        lembaga: 'Puspresnas / Kemendikbudristek',
      },
      {
        id: 'p-101-2',
        namaPrestasi: 'Juara 2 Hackathon Pelajar Komputer',
        jenis: 'Non-Akademik',
        tingkat: 'Provinsi',
        lembaga: 'Dinas Pendidikan Provinsi',
      },
    ],
    catatan: 'Persiapan SNBP & TKA Saintek sangat matang',
    updatedAt: '2026-08-01',
  },
  {
    id: 'std-102',
    namaSiswa: 'Anisa Rahmawati',
    nis: '22231002',
    nisn: '0061234562',
    kelas: 'XII MIPA 1',
    jenisKelamin: 'P',
    mapelTka1: 'Biologi',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Kuliah',
    ptn1: 'Universitas Indonesia (UI)',
    prodiPilihan1: 'Pendidikan Dokter (Kedokteran)',
    ptn2: 'Universitas Gadjah Mada (UGM)',
    prodiPilihan2: 'Kedokteran Umum',
    noHp: '081234567891',
    fotoSiswa: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    prestasiList: [
      {
        id: 'p-102-1',
        namaPrestasi: 'Juara 1 Olimpiade Biologi SMA Se-Jawa Barat',
        jenis: 'Akademik',
        tingkat: 'Provinsi',
        lembaga: 'FKM Universitas Indonesia',
      },
    ],
    catatan: 'Peringkat 1 Pararel Kelas XII',
    updatedAt: '2026-08-02',
  },
  {
    id: 'std-103',
    namaSiswa: 'Bintang Putra Pratama',
    nis: '22231003',
    nisn: '0061234563',
    kelas: 'XII MIPA 2',
    jenisKelamin: 'L',
    mapelTka1: 'Ekonomi',
    mapelTka2: 'Sosiologi',
    pilihanStudiLanjut: 'AKADEMI',
    prodiPilihan1: '-',
    prodiPilihan2: '-',
    noHp: '081234567892',
    prestasiList: [
      {
        id: 'p-103-1',
        namaPrestasi: 'Juara 1 Lomba Baris Berbaris & Paskibraka',
        jenis: 'Non-Akademik',
        tingkat: 'Kota/Kabupaten',
        lembaga: 'Dispora Kota',
      },
    ],
    catatan: 'Persiapan Seleksi Akpol & Kedinasan STIN',
    updatedAt: '2026-08-03',
  },
  {
    id: 'std-104',
    namaSiswa: 'Citra Dewi Kartika',
    nis: '22231004',
    nisn: '0061234564',
    kelas: 'XII MIPA 2',
    jenisKelamin: 'P',
    mapelTka1: 'Geografi',
    mapelTka2: 'Ekonomi',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UI - Hukum',
    prodiPilihan2: 'UGM - Hukum',
    noHp: '081234567893',
    prestasiList: [
      {
        id: 'p-104-1',
        namaPrestasi: 'Juara 1 Debat Bahasa Indonesia Pelajar Nasional',
        jenis: 'Akademik',
        tingkat: 'Nasional',
        lembaga: 'Puspresnas Kemendikbudristek',
      },
    ],
    catatan: 'Juara Debat Bahasa Indonesia Nasional',
    updatedAt: '2026-08-03',
  },
  {
    id: 'std-105',
    namaSiswa: 'Daffa Rizky Ramadhan',
    nis: '22231005',
    nisn: '0061234565',
    kelas: 'XII IPS 1',
    jenisKelamin: 'L',
    mapelTka1: 'Matematika Lanjut',
    mapelTka2: 'Informatika',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UI - Ilmu Komputer',
    prodiPilihan2: 'ITB - Teknik Elektro',
    noHp: '081234567894',
    prestasiList: [],
    catatan: 'Tertarik pada AI & Software Engineering',
    updatedAt: '2026-08-04',
  },
  {
    id: 'std-106',
    namaSiswa: 'Eka Nur Syamsiah',
    nis: '22231006',
    nisn: '0061234566',
    kelas: 'XII IPS 1',
    jenisKelamin: 'P',
    mapelTka1: 'Fisika',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Bekerja',
    prodiPilihan1: '-',
    prodiPilihan2: '-',
    noHp: '081234567895',
    prestasiList: [],
    catatan: 'Fokus persiapan sertifikasi keahlian & kerja',
    updatedAt: '2026-08-04',
  },
  {
    id: 'std-107',
    namaSiswa: 'Farhan Aditya Nugraha',
    nis: '22231007',
    nisn: '0061234567',
    kelas: 'XII IPS 2',
    jenisKelamin: 'L',
    mapelTka1: 'Sosiologi',
    mapelTka2: 'Sejarah',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UNPAD - Ilmu Komunikasi',
    prodiPilihan2: 'UGM - Psikologi',
    noHp: '081234567896',
    prestasiList: [],
    catatan: 'Suka broadcasting & komunikasi publik',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-108',
    namaSiswa: 'Gita Savitri Maharani',
    nis: '22231008',
    nisn: '0061234568',
    kelas: 'XII IPS 2',
    jenisKelamin: 'P',
    mapelTka1: 'Bahasa Inggris Tingkat Lanjut',
    mapelTka2: 'Sosiologi',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UGM - Psikologi',
    prodiPilihan2: 'UNAIR - Manajemen',
    noHp: '081234567897',
    prestasiList: [],
    catatan: 'Sertifikat TOEFL 580',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-109',
    namaSiswa: 'Hadi Kurniawan',
    nis: '22231009',
    nisn: '0061234569',
    kelas: 'XII MIPA 1',
    jenisKelamin: 'L',
    mapelTka1: 'Biologi',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UNAIR - Kedokteran',
    prodiPilihan2: 'UNPAD - Kedokteran',
    noHp: '081234567898',
    prestasiList: [],
    catatan: 'Target Kedokteran UNAIR Mandiri/SNBT',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-110',
    namaSiswa: 'Intan Permata Sari',
    nis: '22231010',
    nisn: '0061234570',
    kelas: 'XII MIPA 2',
    jenisKelamin: 'P',
    mapelTka1: 'Ekonomi',
    mapelTka2: 'Matematika Lanjut',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UB - Manajemen',
    prodiPilihan2: 'UNDIP - Akuntansi',
    noHp: '081234567899',
    prestasiList: [],
    catatan: 'Portofolio kewirausahaan muda',
    updatedAt: '2026-08-06',
  },
]; */;

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script Backend - Administrasi Pendataan TKA & Studi Lanjut + Sarana Ujian Laptop (Lengkap)
 * Salin kode ini ke Google Apps Script (Extensions > Apps Script di Google Sheets Anda)
 * Lalu Deploy sebagai Web App dengan Akses: "Anyone" (Siapa Saja)
 */

const SHEET_STUDENTS = "Data_Siswa_TKA";
const SHEET_LAPTOPS = "Pendataan_Laptop_Sarana";
const SHEET_PROKTOR = "Proktor_Teknisi_Lab";
const SHEET_MASTER = "Kredensial_Login_Siswa";

/**
 * Otomatis membuat & memformat 4 Sheet Tab Utama di Google Sheets:
 * 1. Data_Siswa_TKA
 * 2. Pendataan_Laptop_Sarana
 * 3. Proktor_Teknisi_Lab
 * 4. Kredensial_Login_Siswa
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Data Siswa TKA
  let sheetStudents = ss.getSheetByName(SHEET_STUDENTS);
  if (!sheetStudents) {
    sheetStudents = ss.insertSheet(SHEET_STUDENTS);
  }
  const headersStudents = [
    "ID",
    "Nama Siswa",
    "NIS",
    "NISN",
    "Kelas",
    "Jenis Kelamin",
    "No HP / WA",
    "Pasfoto Siswa (URL/Base64)",
    "Mapel TKA 1",
    "Mapel TKA 2",
    "Pilihan Studi Lanjut",
    "Universitas / Perguruan Tinggi Pilihan 1",
    "Prodi Pilihan 1",
    "Akreditasi Prodi 1",
    "Linieritas TKA Prodi 1",
    "Universitas / Perguruan Tinggi Pilihan 2",
    "Prodi Pilihan 2",
    "Akreditasi Prodi 2",
    "Linieritas TKA Prodi 2",
    "Mengajukan KIP-K",
    "Kategori Desil",
    "Jumlah Prestasi",
    "Detail Prestasi Siswa (JSON)",
    "Catatan",
    "Waktu Diperbarui"
  ];
  if (sheetStudents.getLastRow() === 0) {
    sheetStudents.appendRow(headersStudents);
    sheetStudents.getRange(1, 1, 1, headersStudents.length)
                 .setBackground("#1e293b")
                 .setFontColor("#ffffff")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
    sheetStudents.setFrozenRows(1);
  }

  // Format NIS (Kolom C) dan NISN (Kolom D) sebagai Text (@) agar nol di depan tidak hilang di Google Sheets
  sheetStudents.getRange("C:D").setNumberFormat("@");

  // 2. Sheet Pendataan Laptop & Sarana Ujian TKA
  let sheetLaptops = ss.getSheetByName(SHEET_LAPTOPS);
  if (!sheetLaptops) {
    sheetLaptops = ss.insertSheet(SHEET_LAPTOPS);
  }
  const headersLaptops = [
    "ID Laptop / Inventaris",
    "ID Siswa",
    "Nama Siswa / Pemilik",
    "Kelas",
    "Gelombang Ujian",
    "Merk / Tipe Laptop",
    "Kelengkapan Charger",
    "Kelengkapan Mouse",
    "Kelengkapan Keyboard",
    "Kode Ruang Lab",
    "Nomor Meja / Unit Laptop",
    "Nama Teknisi Lab",
    "Status Kelayakan Ujian",
    "Catatan Kondisi Laptop",
    "Nama Orang Tua / Wali",
    "Waktu Diperbarui"
  ];
  if (sheetLaptops.getLastRow() === 0) {
    sheetLaptops.appendRow(headersLaptops);
    sheetLaptops.getRange(1, 1, 1, headersLaptops.length)
                .setBackground("#0f766e")
                .setFontColor("#ffffff")
                .setFontWeight("bold")
                .setHorizontalAlignment("center");
    sheetLaptops.setFrozenRows(1);
  }

  // 3. Sheet Proktor & Teknisi Lab Ujian
  let sheetProktor = ss.getSheetByName(SHEET_PROKTOR);
  if (!sheetProktor) {
    sheetProktor = ss.insertSheet(SHEET_PROKTOR);
  }
  const headersProktor = [
    "ID",
    "Kode Ruang Lab",
    "Range / No Urut Laptop",
    "Nama Teknisi Lab",
    "NIP Teknisi",
    "Nama Proktor Ujian",
    "NIP Proktor",
    "Keterangan Ruangan",
    "Waktu Diperbarui"
  ];
  if (sheetProktor.getLastRow() === 0) {
    sheetProktor.appendRow(headersProktor);
    sheetProktor.getRange(1, 1, 1, headersProktor.length)
               .setBackground("#0369a1")
               .setFontColor("#ffffff")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    sheetProktor.setFrozenRows(1);
  }

  // 4. Sheet Kredensial Login & Data Master Siswa
  let sheetMaster = ss.getSheetByName(SHEET_MASTER);
  if (!sheetMaster) {
    sheetMaster = ss.insertSheet(SHEET_MASTER);
  }
  const headersMaster = [
    "ID",
    "Nama Siswa",
    "NIS / Username",
    "NISN",
    "Kelas",
    "Password",
    "Waktu Diperbarui"
  ];
  if (sheetMaster.getLastRow() === 0) {
    sheetMaster.appendRow(headersMaster);
    sheetMaster.getRange(1, 1, 1, headersMaster.length)
               .setBackground("#4338ca")
               .setFontColor("#ffffff")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    sheetMaster.setFrozenRows(1);
  }
  
  // Format NIS (Kolom C), NISN (Kolom D), dan Password (Kolom F) sebagai Text agar tidak hilang format angka/huruf
  sheetMaster.getRange("C:D").setNumberFormat("@");
  sheetMaster.getRange("F:F").setNumberFormat("@");

  return { sheetStudents, sheetLaptops, sheetProktor, sheetMaster };
}

/**
 * Mendukung HTTP OPTIONS Preflight Request untuk koneksi dari Vercel (https://sitaka-v5.vercel.app/) & Browser / Perangkat Lain
 */
function doOptions(e) {
  return responseJSON({ status: "success", message: "CORS preflight OK" });
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = setupAllSheets();

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";

    // Jika parameter GET membawa permintaan tulis/batch atau data payload, alihkan ke doPost
    if (e && e.parameter && (e.parameter.payload || (action !== "getAll" && action !== "ping" && action !== "test" && action !== "getStatus"))) {
      return doPost(e);
    }

    if (action === "ping" || action === "test" || action === "getStatus") {
      var sRows = sheets.sheetStudents.getDataRange().getValues();
      var lRows = sheets.sheetLaptops.getDataRange().getValues();
      var pRows = sheets.sheetProktor.getDataRange().getValues();
      var mRows = sheets.sheetMaster.getDataRange().getValues();

      var sCount = Math.max(0, sRows.length - 1);
      var lCount = Math.max(0, lRows.length - 1);
      var pCount = Math.max(0, pRows.length - 1);
      var mCount = Math.max(0, mRows.length - 1);
      var tot = sCount + lCount + pCount + mCount;

      return responseJSON({
        status: "success",
        connected: true,
        message: "Koneksi Google Sheets Apps Script Berhasil Terhubung!",
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        sheets: [SHEET_STUDENTS, SHEET_LAPTOPS, SHEET_PROKTOR, SHEET_MASTER],
        totalRows: tot,
        counts: {
          students: sCount,
          laptops: lCount,
          proktorList: pCount,
          masterStudents: mCount
        },
        time: new Date().toISOString()
      });
    }

    // Read Student Data
    const studentRows = sheets.sheetStudents.getDataRange().getValues();
    const students = studentRows.length > 1 ? studentRows.slice(1).map(parseStudentRow) : [];

    // Read Laptop Data
    const laptopRows = sheets.sheetLaptops.getDataRange().getValues();
    const laptops = laptopRows.length > 1 ? laptopRows.slice(1).map(parseLaptopRow) : [];

    // Read Proktor Data
    const proktorRows = sheets.sheetProktor.getDataRange().getValues();
    const proktorList = proktorRows.length > 1 ? proktorRows.slice(1).map(parseProktorRow) : [];

    // Read Master Student Data
    const masterRows = sheets.sheetMaster.getDataRange().getValues();
    const masterStudents = masterRows.length > 1 ? masterRows.slice(1).map(parseMasterRow) : [];

    var totalRows = students.length + laptops.length + proktorList.length + masterStudents.length;

    return responseJSON({
      status: "success",
      connected: true,
      message: "Data Administrasi TKA, Laptop, Proktor & Kredensial berhasil dimuat dari Google Sheets!",
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      totalRows: totalRows,
      counts: {
        students: students.length,
        laptops: laptops.length,
        proktorList: proktorList.length,
        masterStudents: masterStudents.length
      },
      data: students,
      students: students,
      laptops: laptops,
      proktorList: proktorList,
      masterStudents: masterStudents
    });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function parseStudentRow(row) {
  var prestasiListParsed = [];
  try {
    if (row[22]) {
      var str = row[22].toString();
      if (str.indexOf("[") === 0) {
        prestasiListParsed = JSON.parse(str);
      }
    }
  } catch (err) {}

  var fotoVal = row[7] ? row[7].toString() : "";
  if (fotoVal.indexOf('=IMAGE("') === 0) {
    fotoVal = fotoVal.replace('=IMAGE("', '').replace('")', '');
  }

  var parsedNis = row[2] ? row[2].toString().replace(/^'/, '').trim() : "";
  var parsedNisn = row[3] ? row[3].toString().replace(/^'/, '').trim() : "";
  if (parsedNisn && /^\d+$/.test(parsedNisn) && parsedNisn.length < 10) {
    parsedNisn = parsedNisn.padStart(10, "0");
  }

  return {
    id: row[0] ? row[0].toString() : "",
    namaSiswa: row[1] ? row[1].toString() : "",
    nis: parsedNis,
    nisn: parsedNisn,
    kelas: row[4] ? row[4].toString() : "",
    jenisKelamin: row[5] ? row[5].toString() : "L",
    noHp: row[6] ? row[6].toString() : "",
    fotoSiswa: fotoVal,
    mapelTka1: row[8] ? row[8].toString() : "",
    mapelTka2: row[9] ? row[9].toString() : "",
    pilihanStudiLanjut: row[10] ? row[10].toString() : "Kuliah",
    ptn1: row[11] ? row[11].toString() : "",
    prodiPilihan1: row[12] ? row[12].toString() : "",
    akreditasiPilihan1: row[13] ? row[13].toString() : "",
    kriteriaPilihan1: row[14] ? row[14].toString() : "",
    ptn2: row[15] ? row[15].toString() : "",
    prodiPilihan2: row[16] ? row[16].toString() : "",
    akreditasiPilihan2: row[17] ? row[17].toString() : "",
    kriteriaPilihan2: row[18] ? row[18].toString() : "",
    mengajukanKipKuliah: row[19] ? row[19].toString() : "Tidak",
    kategoriDesil: row[20] ? row[20].toString() : "",
    prestasiList: prestasiListParsed,
    catatan: row[23] ? row[23].toString() : "",
    updatedAt: row[24] ? row[24].toString() : new Date().toISOString()
  };
}

function parseLaptopRow(row) {
  return {
    id: row[0] ? row[0].toString() : "",
    studentId: row[1] ? row[1].toString() : "",
    namaSiswa: row[2] ? row[2].toString() : "",
    kelas: row[3] ? row[3].toString() : "",
    gelombang: row[4] ? row[4].toString() : "1",
    merkLaptop: row[5] ? row[5].toString() : "",
    kelengkapan: {
      charger: row[6] === true || row[6] === "Ada" || row[6] === "Ya" || row[6] === 1,
      mouse: row[7] === true || row[7] === "Ada" || row[7] === "Ya" || row[7] === 1,
      keyboard: row[8] === true || row[8] === "Ada" || row[8] === "Ya" || row[8] === 1,
    },
    kodeRuang: row[9] ? row[9].toString() : "",
    noUrutLaptop: row[10] ? row[10].toString() : "",
    namaTeknisi: row[11] ? row[11].toString() : "",
    statusKelayakan: row[12] ? row[12].toString() : "LAYAK",
    catatanKondisi: row[13] ? row[13].toString() : "",
    namaOrangTua: row[14] ? row[14].toString() : "",
    updatedAt: row[15] ? row[15].toString() : new Date().toISOString()
  };
}

function parseProktorRow(row) {
  return {
    id: row[0] ? row[0].toString() : "",
    kodeRuang: row[1] ? row[1].toString() : "",
    noUrutLaptop: row[2] ? row[2].toString() : "",
    namaTeknisi: row[3] ? row[3].toString() : "",
    nipTeknisi: row[4] ? row[4].toString() : "",
    namaProktor: row[5] ? row[5].toString() : "",
    nipProktor: row[6] ? row[6].toString() : "",
    keterangan: row[7] ? row[7].toString() : "",
    updatedAt: row[8] ? row[8].toString() : new Date().toISOString()
  };
}

function parseMasterRow(row) {
  var parsedNis = row[2] ? row[2].toString().replace(/^'/, '').trim() : "";
  var parsedNisn = row[3] ? row[3].toString().replace(/^'/, '').trim() : "";
  if (parsedNisn && /^\d+$/.test(parsedNisn) && parsedNisn.length < 10) {
    parsedNisn = parsedNisn.padStart(10, "0");
  }
  return {
    id: row[0] ? row[0].toString() : "",
    namaSiswa: row[1] ? row[1].toString() : "",
    nis: parsedNis,
    nisn: parsedNisn,
    kelas: row[4] ? row[4].toString() : "",
    password: row[5] ? row[5].toString() : "",
    updatedAt: row[6] ? row[6].toString() : new Date().toISOString()
  };
}

function doPost(e) {
  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (err) {
        contents = e.parameter || {};
      }
    } else if (e && e.parameter) {
      contents = e.parameter || {};
    }

    // Auto-parse payload if received as string
    if (contents.payload) {
      try {
        var parsedPayload = typeof contents.payload === "string" ? JSON.parse(contents.payload) : contents.payload;
        if (parsedPayload && typeof parsedPayload === "object") {
          for (var pKey in parsedPayload) {
            contents[pKey] = parsedPayload[pKey];
          }
        }
      } catch (pErr) {}
    }

    // Auto-parse array properties if received as stringified JSON
    var arrayKeys = ["students", "laptops", "proktorList", "masterStudents"];
    for (var a = 0; a < arrayKeys.length; a++) {
      var ak = arrayKeys[a];
      if (contents[ak] && typeof contents[ak] === "string") {
        try {
          contents[ak] = JSON.parse(contents[ak]);
        } catch (aErr) {}
      }
    }

    // Auto-parse object properties if received as stringified JSON
    var objectKeys = ["student", "laptop", "proktor", "data"];
    for (var o = 0; o < objectKeys.length; o++) {
      var ok = objectKeys[o];
      if (contents[ok] && typeof contents[ok] === "string") {
        try {
          contents[ok] = JSON.parse(contents[ok]);
        } catch (oErr) {}
      }
    }

    var action = contents.action || (e && e.parameter && e.parameter.action) || "save";
    var target = contents.target || (e && e.parameter && e.parameter.target) || "student";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupAllSheets();

    if (action === "ping" || action === "test" || action === "getStatus") {
      var studentRows = sheets.sheetStudents.getDataRange().getValues();
      var laptopRows = sheets.sheetLaptops.getDataRange().getValues();
      var proktorRows = sheets.sheetProktor.getDataRange().getValues();
      var masterRows = sheets.sheetMaster.getDataRange().getValues();

      var studentCount = Math.max(0, studentRows.length - 1);
      var laptopCount = Math.max(0, laptopRows.length - 1);
      var proktorCount = Math.max(0, proktorRows.length - 1);
      var masterCount = Math.max(0, masterRows.length - 1);
      var totalRows = studentCount + laptopCount + proktorCount + masterCount;

      return responseJSON({
        status: "success",
        connected: true,
        message: "Koneksi Google Sheets Apps Script Berhasil Terhubung!",
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        sheets: [SHEET_STUDENTS, SHEET_LAPTOPS, SHEET_PROKTOR, SHEET_MASTER],
        totalRows: totalRows,
        counts: {
          students: studentCount,
          laptops: laptopCount,
          proktorList: proktorCount,
          masterStudents: masterCount
        },
        time: new Date().toISOString()
      });
    }

    if (action === "getAll") {
      return doGet(e);
    }

    if (action === "batchSave") {
      var countS = 0, countL = 0, countP = 0, countM = 0;
      if (Array.isArray(contents.students)) {
        contents.students.forEach(function(st) {
          if (st && typeof st === "object") {
            handleStudentPost(sheets.sheetStudents, "save", { student: st });
            countS++;
          }
        });
      }
      if (Array.isArray(contents.laptops)) {
        contents.laptops.forEach(function(lp) {
          if (lp && typeof lp === "object") {
            handleLaptopPost(sheets.sheetLaptops, "saveLaptop", { laptop: lp });
            countL++;
          }
        });
      }
      if (Array.isArray(contents.proktorList)) {
        contents.proktorList.forEach(function(pr) {
          if (pr && typeof pr === "object") {
            handleProktorPost(sheets.sheetProktor, "saveProktor", { proktor: pr });
            countP++;
          }
        });
      }
      if (Array.isArray(contents.masterStudents)) {
        var lastRow = sheets.sheetMaster.getLastRow();
        if (lastRow > 1) {
          sheets.sheetMaster.getRange(2, 1, lastRow - 1, sheets.sheetMaster.getLastColumn()).clearContent();
        }
        contents.masterStudents.forEach(function(ms) {
          if (ms && typeof ms === "object") {
            handleMasterPost(sheets.sheetMaster, "save", { student: ms });
            countM++;
          }
        });
      }
      return responseJSON({
        status: "success",
        message: "Batch save berhasil: " + countS + " siswa, " + countL + " laptop, " + countP + " proktor, " + countM + " kredensial.",
        counts: { students: countS, laptops: countL, proktor: countP, masterStudents: countM }
      });
    }

    if (target === "laptop" || action === "saveLaptop" || action === "deleteLaptop") {
      return handleLaptopPost(sheets.sheetLaptops, action, contents);
    }

    if (target === "proktor" || action === "saveProktor" || action === "deleteProktor") {
      return handleProktorPost(sheets.sheetProktor, action, contents);
    }

    if (target === "master" || target === "masterStudent" || action === "saveMaster" || action === "deleteMaster") {
      return handleMasterPost(sheets.sheetMaster, action, contents);
    }

    return handleStudentPost(sheets.sheetStudents, action, contents);
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function processFotoSiswa(fotoData, namaSiswa, nisn, nis) {
  if (!fotoData) return "";
  
  var str = fotoData.toString().trim();
  
  if (str.indexOf("=IMAGE") === 0) return str;
  if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
    if (str.indexOf("drive.google.com") > -1) {
      return '=IMAGE("' + str + '")';
    }
    return '=IMAGE("' + str + '")';
  }

  if (str.indexOf("data:image") === 0) {
    try {
      var folderName = "Pasfoto_Siswa_TKA";
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      var parts = str.split(",");
      var contentType = "image/jpeg";
      if (parts[0].indexOf(":") > -1 && parts[0].indexOf(";") > -1) {
        contentType = parts[0].match(/:(.*?);/)[1] || "image/jpeg";
      }
      var base64Str = parts[1] || parts[0];
      var decodedBytes = Utilities.base64Decode(base64Str);
      
      var cleanNisn = (nisn || "").toString().replace(/^'/, '').trim().replace(/[^a-zA-Z0-9]/g, "");
      if (cleanNisn && /^\d+$/.test(cleanNisn) && cleanNisn.length < 10) {
        cleanNisn = cleanNisn.padStart(10, "0");
      }
      var cleanNis = (nis || "").toString().replace(/^'/, '').trim().replace(/[^a-zA-Z0-9]/g, "");
      var cleanNama = (namaSiswa || "pasfoto").toString().trim().replace(/[^a-zA-Z0-9]/g, "_");
      
      var fileNamePrefix = cleanNisn || cleanNis || "Siswa";
      var fileName = fileNamePrefix + "_" + cleanNama + ".jpg";
      
      // Hapus file pasfoto lama siswa ini jika sudah ada di folder agar tidak terjadi duplikasi foto di Google Drive
      var existingFiles = folder.getFilesByName(fileName);
      while (existingFiles.hasNext()) {
        var oldFile = existingFiles.next();
        try {
          oldFile.setTrashed(true);
        } catch (trashErr) {}
      }
      
      var blob = Utilities.newBlob(decodedBytes, contentType, fileName);
      
      var file = folder.createFile(blob);
      
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {}
      
      var fileId = file.getId();
      var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      return '=IMAGE("' + directUrl + '")';
    } catch (err) {
      return '=IMAGE("https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(namaSiswa || 'Siswa') + '")';
    }
  }

  return str;
}

function handleStudentPost(sheet, action, contents) {
  if (action === "save" || action === "update") {
    const student = contents.student || contents.data;
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == student.id || (student.nis && data[i][2] == student.nis)) {
        rowIndex = i + 1;
        break;
      }
    }

    var jmlPrestasi = (student.prestasiList && Array.isArray(student.prestasiList)) ? student.prestasiList.length : 0;
    var detailPrestasiJson = (student.prestasiList && Array.isArray(student.prestasiList)) ? JSON.stringify(student.prestasiList) : "";
    var fotoProcessed = processFotoSiswa(student.fotoSiswa, student.namaSiswa, student.nisn, student.nis);

    var rawNis = student.nis ? student.nis.toString().replace(/^'/, '').trim() : "";
    var rawNisn = student.nisn ? student.nisn.toString().replace(/^'/, '').trim() : "";

    if (rawNisn && /^\d+$/.test(rawNisn) && rawNisn.length < 10) {
      rawNisn = rawNisn.padStart(10, "0");
    }

    var formattedNis = rawNis ? ("'" + rawNis) : "";
    var formattedNisn = rawNisn ? ("'" + rawNisn) : "";

    const rowData = [
      student.id || "std-" + Date.now(),
      student.namaSiswa || "",
      formattedNis,
      formattedNisn,
      student.kelas || "",
      student.jenisKelamin || "L",
      student.noHp || "",
      fotoProcessed,
      student.mapelTka1 || "",
      student.mapelTka2 || "",
      student.pilihanStudiLanjut || "Kuliah",
      student.ptn1 || "",
      student.prodiPilihan1 || "",
      student.akreditasiPilihan1 || "",
      student.kriteriaPilihan1 || "",
      student.ptn2 || "",
      student.prodiPilihan2 || "",
      student.akreditasiPilihan2 || "",
      student.kriteriaPilihan2 || "",
      student.mengajukanKipKuliah || "Tidak",
      student.kategoriDesil || "",
      jmlPrestasi,
      detailPrestasiJson,
      student.catatan || "",
      new Date().toISOString().split("T")[0]
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return responseJSON({ status: "success", message: "Data Siswa TKA berhasil disimpan di Google Sheets!", student: student });
  }
  
  if (action === "delete") {
    const studentId = contents.id;
    const studentNis = contents.nis ? contents.nis.toString().replace(/^'/, '').trim() : "";
    const studentNisn = contents.nisn ? contents.nisn.toString().replace(/^'/, '').trim() : "";
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowNis = (data[i][2] || "").toString().replace(/^'/, '').trim();
      var rowNisn = (data[i][3] || "").toString().replace(/^'/, '').trim();
      if (
        (studentId && rowId == studentId) ||
        (studentNis && rowNis == studentNis) ||
        (studentNisn && rowNisn == studentNisn)
      ) {
        sheet.deleteRow(i + 1);
        return responseJSON({ status: "success", message: "Data Siswa berhasil dihapus" });
      }
    }
    return responseJSON({ status: "error", message: "Data Siswa tidak ditemukan" });
  }

  if (action === "clearAll" || action === "deleteAll") {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
    return responseJSON({ status: "success", message: "Seluruh Data Siswa berhasil dikosongkan dari Google Sheets" });
  }

  if (action === "deleteMultiple") {
    const ids = contents.ids || [];
    const data = sheet.getDataRange().getValues();
    let count = 0;
    for (let i = data.length - 1; i >= 1; i--) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowNis = (data[i][2] || "").toString().replace(/^'/, '').trim();
      var rowNisn = (data[i][3] || "").toString().replace(/^'/, '').trim();
      if (ids.indexOf(rowId) > -1 || ids.indexOf(rowNis) > -1 || ids.indexOf(rowNisn) > -1) {
        sheet.deleteRow(i + 1);
        count++;
      }
    }
    return responseJSON({ status: "success", message: count + " Data Siswa berhasil dihapus dari Google Sheets" });
  }

  return responseJSON({ status: "error", message: "Action tidak dikenal" });
}

function handleLaptopPost(sheet, action, contents) {
  if (action === "saveLaptop" || action === "save" || action === "update") {
    const laptop = contents.laptop || contents.data;
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == laptop.id || (laptop.studentId && data[i][1] == laptop.studentId)) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowData = [
      laptop.id || "lpt-" + Date.now(),
      laptop.studentId || "",
      laptop.namaSiswa || "",
      laptop.kelas || "",
      laptop.gelombang || "1",
      laptop.merkLaptop || "",
      laptop.kelengkapan && laptop.kelengkapan.charger ? "Ada" : "Tidak Ada",
      laptop.kelengkapan && laptop.kelengkapan.mouse ? "Ada" : "Tidak Ada",
      laptop.kelengkapan && laptop.kelengkapan.keyboard ? "Ada" : "Tidak Ada",
      laptop.kodeRuang || "",
      laptop.noUrutLaptop || "",
      laptop.namaTeknisi || "",
      laptop.statusKelayakan || "LAYAK",
      laptop.catatanKondisi || "",
      laptop.namaOrangTua || "",
      new Date().toISOString().split("T")[0]
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return responseJSON({ status: "success", message: "Data Laptop Inventaris Sarana Ujian TKA berhasil disimpan!", laptop: laptop });
  }

  if (action === "deleteLaptop" || action === "delete") {
    const laptopId = contents.id;
    const studentId = contents.studentId;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowStudentId = (data[i][1] || "").toString().trim();
      if (
        (laptopId && rowId == laptopId) ||
        (studentId && rowStudentId == studentId)
      ) {
        sheet.deleteRow(i + 1);
        return responseJSON({ status: "success", message: "Data Laptop berhasil dihapus" });
      }
    }
    return responseJSON({ status: "error", message: "Data Laptop tidak ditemukan" });
  }

  return responseJSON({ status: "error", message: "Action laptop tidak dikenal" });
}

function handleProktorPost(sheet, action, contents) {
  if (action === "saveProktor" || action === "save" || action === "update") {
    const proktor = contents.proktor || contents.data;
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == proktor.id || (proktor.kodeRuang && data[i][1] == proktor.kodeRuang)) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowData = [
      proktor.id || "prk-" + Date.now(),
      proktor.kodeRuang || "",
      proktor.noUrutLaptop || "",
      proktor.namaTeknisi || "",
      proktor.nipTeknisi || "",
      proktor.namaProktor || "",
      proktor.nipProktor || "",
      proktor.keterangan || "",
      new Date().toISOString().split("T")[0]
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return responseJSON({ status: "success", message: "Data Proktor & Teknisi Lab berhasil disimpan!", proktor: proktor });
  }

  if (action === "deleteProktor" || action === "delete") {
    const proktorId = contents.id;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == proktorId) {
        sheet.deleteRow(i + 1);
        return responseJSON({ status: "success", message: "Data Proktor berhasil dihapus" });
      }
    }
    return responseJSON({ status: "error", message: "Data Proktor tidak ditemukan" });
  }

  return responseJSON({ status: "error", message: "Action proktor tidak dikenal" });
}

function handleMasterPost(sheet, action, contents) {
  if (action === "save" || action === "update" || action === "saveMaster") {
    const student = contents.student || contents.data;
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == student.id || (student.nis && data[i][2] == student.nis)) {
        rowIndex = i + 1;
        break;
      }
    }

    var rawNis = student.nis ? student.nis.toString().replace(/^'/, '').trim() : "";
    var rawNisn = student.nisn ? student.nisn.toString().replace(/^'/, '').trim() : "";

    if (rawNisn && /^\d+$/.test(rawNisn) && rawNisn.length < 10) {
      rawNisn = rawNisn.padStart(10, "0");
    }

    var formattedNis = rawNis ? ("'" + rawNis) : "";
    var formattedNisn = rawNisn ? ("'" + rawNisn) : "";

    const rowData = [
      student.id || "mst-" + Date.now(),
      student.namaSiswa || "",
      formattedNis,
      formattedNisn,
      student.kelas || "",
      student.password || "",
      new Date().toISOString().split("T")[0]
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return responseJSON({ status: "success", message: "Data Kredensial Siswa berhasil disimpan di Google Sheets!", student: student });
  }
  
  if (action === "delete" || action === "deleteMaster") {
    const studentId = contents.id;
    const studentNis = contents.nis ? contents.nis.toString().replace(/^'/, '').trim() : "";
    const studentNisn = contents.nisn ? contents.nisn.toString().replace(/^'/, '').trim() : "";
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowNis = (data[i][2] || "").toString().replace(/^'/, '').trim();
      var rowNisn = (data[i][3] || "").toString().replace(/^'/, '').trim();
      if (
        (studentId && rowId == studentId) ||
        (studentNis && rowNis == studentNis) ||
        (studentNisn && rowNisn == studentNisn)
      ) {
        sheet.deleteRow(i + 1);
        return responseJSON({ status: "success", message: "Data Kredensial Siswa berhasil dihapus" });
      }
    }
    return responseJSON({ status: "error", message: "Data Kredensial Siswa tidak ditemukan" });
  }

  if (action === "clearAll" || action === "deleteAll") {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
    return responseJSON({ status: "success", message: "Seluruh Data Kredensial Siswa berhasil dikosongkan dari Google Sheets" });
  }

  if (action === "deleteMultiple") {
    const ids = contents.ids || [];
    const data = sheet.getDataRange().getValues();
    let count = 0;
    for (let i = data.length - 1; i >= 1; i--) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowNis = (data[i][2] || "").toString().replace(/^'/, '').trim();
      var rowNisn = (data[i][3] || "").toString().replace(/^'/, '').trim();
      if (ids.indexOf(rowId) > -1 || ids.indexOf(rowNis) > -1 || ids.indexOf(rowNisn) > -1) {
        sheet.deleteRow(i + 1);
        count++;
      }
    }
    return responseJSON({ status: "success", message: count + " Data Kredensial Siswa berhasil dihapus dari Google Sheets" });
  }

  return responseJSON({ status: "error", message: "Action master tidak dikenal" });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
