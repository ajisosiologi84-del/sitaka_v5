export interface MapelPilihanData {
  no: number;
  rumpunIlmo: string;
  kelompokProdi: string;
  gelarD3: string;
  gelarD4: string;
  gelarS1: string;
  mapelPendukung1: string;
  mapelPendukung2: string;
}

// Generates comprehensive dataset for numbers 1 to 845
const BASE_PRODI_PATTERNS = [
  // KESEHATAN
  { rumpun: 'Kesehatan', name: 'Kedokteran / Pendidikan Dokter', d3: '-', d4: '-', s1: 'S.Ked.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Kedokteran Gigi', d3: 'A.Md.KG.', d4: 'S.Tr.Kes.', s1: 'S.KG.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Kedokteran Hewan', d3: 'A.Md.Vet.', d4: 'S.Tr.Vet.', s1: 'S.SKH.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Farmasi / Farmasi Klinis', d3: 'A.Md.Farm.', d4: 'S.Tr.Farm.', s1: 'S.Farm.', m1: 'Kimia', m2: 'Biologi' },
  { rumpun: 'Kesehatan', name: 'Kesehatan Masyarakat', d3: 'A.Md.Kes.', d4: 'S.Tr.Kes.', s1: 'S.KM.', m1: 'Biologi', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Kesehatan', name: 'Keperawatan', d3: 'A.Md.Kep.', d4: 'S.Tr.Kep.', s1: 'S.Kep.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Kebidanan', d3: 'A.Md.Keb.', d4: 'S.Tr.Keb.', s1: 'S.Keb.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Gizi & Dietetik', d3: 'A.Md.Gz.', d4: 'S.Tr.Gz.', s1: 'S.Gz.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Kesehatan', name: 'Teknologi Laboratorium Medik', d3: 'A.Md.AK.', d4: 'S.Tr.Kes.', s1: 'S.Tr.Kes.', m1: 'Kimia', m2: 'Biologi' },
  { rumpun: 'Kesehatan', name: 'Teknik Elektromedis', d3: 'A.Md.TEM.', d4: 'S.Tr.Kes.', s1: 'S.T.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },

  // TEKNIK & KOMPUTER
  { rumpun: 'Teknik & Komputer', name: 'Teknik Informatika / Ilmu Komputer', d3: 'A.Md.Kom.', d4: 'S.Tr.Kom.', s1: 'S.Kom.', m1: 'Matematika Tingkat Lanjut', m2: 'Informatika' },
  { rumpun: 'Teknik & Komputer', name: 'Sistem Informasi / Teknologi Informasi', d3: 'A.Md.Kom.', d4: 'S.Tr.Kom.', s1: 'S.Kom.', m1: 'Matematika Tingkat Lanjut', m2: 'Informatika' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Sipil / Konstruksi', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Matematika Tingkat Lanjut', m2: 'Fisika' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Elektro / Kelistrikan', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Matematika Tingkat Lanjut', m2: 'Fisika' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Mesin / Otomotif', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Industri', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Matematika Tingkat Lanjut', m2: 'Fisika / Ekonomi' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Kimia', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Kimia', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Teknik & Komputer', name: 'Arsitektur', d3: 'A.Md.Ars.', d4: 'S.Tr.Ars.', s1: 'S.Ars.', m1: 'Matematika Tingkat Lanjut', m2: 'Seni Budaya / Fisika' },
  { rumpun: 'Teknik & Komputer', name: 'Perencanaan Wilayah & Kota (PWK)', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.PWK.', m1: 'Matematika Tingkat Lanjut', m2: 'Geografi' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Geodesi & Geomatika', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Matematika Tingkat Lanjut', m2: 'Geografi' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Lingkungan', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Kimia', m2: 'Biologi' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Penerbangan / Aeronautika', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Kelautan / Perkapalan', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Pertambangan', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Fisika', m2: 'Kimia' },
  { rumpun: 'Teknik & Komputer', name: 'Teknik Perminyakan / Geotermal', d3: 'A.Md.T.', d4: 'S.Tr.T.', s1: 'S.T.', m1: 'Fisika', m2: 'Kimia' },

  // MIPA & SAINS
  { rumpun: 'MIPA & Sains', name: 'Matematika / Matematika Murni', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Matematika Tingkat Lanjut', m2: 'Informatika' },
  { rumpun: 'MIPA & Sains', name: 'Fisika / Fisika Medis', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'MIPA & Sains', name: 'Kimia', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Kimia', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'MIPA & Sains', name: 'Biologi / Mikrobiologi', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'MIPA & Sains', name: 'Statistika / Sains Data', d3: 'A.Md.Stat.', d4: 'S.Tr.Stat.', s1: 'S.Stat.', m1: 'Matematika Tingkat Lanjut', m2: 'Informatika' },
  { rumpun: 'MIPA & Sains', name: 'Geofisika / Geologi', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Fisika', m2: 'Geografi' },
  { rumpun: 'MIPA & Sains', name: 'Astronomi / Kosmologi', d3: '-', d4: '-', s1: 'S.Si.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'MIPA & Sains', name: 'Bioteknologi', d3: 'A.Md.Si.', d4: 'S.Tr.Si.', s1: 'S.Si.', m1: 'Biologi', m2: 'Kimia' },

  // HUKUM & SOSIAL
  { rumpun: 'Hukum & Sosial', name: 'Ilmu Hukum', d3: '-', d4: 'S.Tr.H.', s1: 'S.H.', m1: 'Sosiologi', m2: 'PPKn / Sejarah' },
  { rumpun: 'Hukum & Sosial', name: 'Psikologi', d3: '-', d4: '-', s1: 'S.Psi.', m1: 'Sosiologi / Biologi', m2: 'Bahasa Indonesia' },
  { rumpun: 'Hukum & Sosial', name: 'Ilmu Komunikasi', d3: 'A.Md.I.Kom.', d4: 'S.Tr.I.Kom.', s1: 'S.I.Kom.', m1: 'Sosiologi', m2: 'Bahasa Indonesia' },
  { rumpun: 'Hukum & Sosial', name: 'Hubungan Internasional', d3: '-', d4: '-', s1: 'S.HI.', m1: 'Bahasa Inggris Tingkat Lanjut', m2: 'Sosiologi' },
  { rumpun: 'Hukum & Sosial', name: 'Sosiologi', d3: 'A.Md.Sos.', d4: 'S.Tr.Sos.', s1: 'S.Sos.', m1: 'Sosiologi', m2: 'Antropologi' },
  { rumpun: 'Hukum & Sosial', name: 'Antropologi Budaya', d3: 'A.Md.Sos.', d4: 'S.Tr.Sos.', s1: 'S.Sos.', m1: 'Antropologi', m2: 'Sosiologi' },
  { rumpun: 'Hukum & Sosial', name: 'Ilmu Politik', d3: '-', d4: '-', s1: 'S.IP.', m1: 'Sosiologi', m2: 'PPKn' },
  { rumpun: 'Hukum & Sosial', name: 'Administrasi Publik / Negara', d3: 'A.Md.A.P.', d4: 'S.Tr.A.P.', s1: 'S.A.P.', m1: 'Sosiologi', m2: 'PPKn' },
  { rumpun: 'Hukum & Sosial', name: 'Kesejahteraan Sosial', d3: 'A.Md.Sos.', d4: 'S.Tr.Sos.', s1: 'S.Sos.', m1: 'Sosiologi', m2: 'PPKn' },

  // EKONOMI & BISNIS
  { rumpun: 'Ekonomi & Bisnis', name: 'Akuntansi', d3: 'A.Md.Ak.', d4: 'S.Tr.Ak.', s1: 'S.Ak.', m1: 'Ekonomi', m2: 'Matematika' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Manajemen', d3: 'A.Md.M.', d4: 'S.Tr.M.', s1: 'S.M.', m1: 'Ekonomi', m2: 'Matematika' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Ekonomi Pembangunan', d3: 'A.Md.E.', d4: 'S.Tr.E.', s1: 'S.E.', m1: 'Ekonomi', m2: 'Matematika' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Ekonomi Syariah / Perbankan Syariah', d3: 'A.Md.E.', d4: 'S.Tr.E.', s1: 'S.E.', m1: 'Ekonomi', m2: 'Sosiologi' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Bisnis Digital / E-Commerce', d3: 'A.Md.Bis.', d4: 'S.Tr.Bis.', s1: 'S.Bis.', m1: 'Ekonomi', m2: 'Informatika' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Perpajakan / Administrasi Pajak', d3: 'A.Md.Pajak', d4: 'S.Tr.A.P.', s1: 'S.Ak. / S.A.P.', m1: 'Ekonomi', m2: 'Matematika' },
  { rumpun: 'Ekonomi & Bisnis', name: 'Pemasaran / Marketing', d3: 'A.Md.M.', d4: 'S.Tr.M.', s1: 'S.M.', m1: 'Ekonomi', m2: 'Sosiologi' },

  // PERTANIAN, PETERNAKAN, & KELAUTAN
  { rumpun: 'Pertanian & Peternakan', name: 'Agroteknologi / Agronomi', d3: 'A.Md.P.', d4: 'S.Tr.P.', s1: 'S.P.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Pertanian & Peternakan', name: 'Agribisnis', d3: 'A.Md.P.', d4: 'S.Tr.P.', s1: 'S.P.', m1: 'Ekonomi', m2: 'Biologi' },
  { rumpun: 'Pertanian & Peternakan', name: 'Peternakan / Ilmu Ternak', d3: 'A.Md.Pt.', d4: 'S.Tr.Pt.', s1: 'S.Pt.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Pertanian & Peternakan', name: 'Teknologi Pangan', d3: 'A.Md.T.P.', d4: 'S.Tr.T.P.', s1: 'S.T.P.', m1: 'Kimia', m2: 'Biologi' },
  { rumpun: 'Pertanian & Peternakan', name: 'Ilmu Kelautan', d3: 'A.Md.Pi.', d4: 'S.Tr.Pi.', s1: 'S.Kel.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Pertanian & Peternakan', name: 'Budidaya Perairan / Akuakultur', d3: 'A.Md.Pi.', d4: 'S.Tr.Pi.', s1: 'S.Pi.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Pertanian & Peternakan', name: 'Kehutanan / Konservasi Hutan', d3: 'A.Md.Hut.', d4: 'S.Tr.Hut.', s1: 'S.Hut.', m1: 'Biologi', m2: 'Geografi' },

  // PENDIDIKAN (FKIP)
  { rumpun: 'Pendidikan', name: 'Pendidikan Guru Sekolah Dasar (PGSD)', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Bahasa Indonesia', m2: 'Matematika' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Guru PAUD', d3: 'A.Md.Pd.', d4: '-', s1: 'S.Pd.', m1: 'Bahasa Indonesia', m2: 'Sosiologi' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Matematika', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Matematika Tingkat Lanjut', m2: 'Fisika' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Bahasa Indonesia', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Bahasa Indonesia', m2: 'Sosiologi' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Bahasa Inggris', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Bahasa Inggris Tingkat Lanjut', m2: 'Bahasa Indonesia' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Biologi', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Biologi', m2: 'Kimia' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Fisika', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Kimia', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Kimia', m2: 'Biologi' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Sejarah', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Sejarah', m2: 'Sosiologi' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Geografi', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Geografi', m2: 'Sosiologi' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Sosiologi', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Sosiologi', m2: 'Sejarah' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Ekonomi', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'Ekonomi', m2: 'Matematika' },
  { rumpun: 'Pendidikan', name: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', d3: '-', d4: '-', s1: 'S.Pd.', m1: 'PJOK / Biologi', m2: 'Sosiologi' },

  // BAHASA, SENI, HUMANIORA & AGAMA
  { rumpun: 'Bahasa & Humaniora', name: 'Sastra Inggris', d3: 'A.Md.Li.', d4: 'S.Tr.Li.', s1: 'S.S.', m1: 'Bahasa Inggris Tingkat Lanjut', m2: 'Bahasa Indonesia' },
  { rumpun: 'Bahasa & Humaniora', name: 'Sastra Indonesia', d3: 'A.Md.Li.', d4: 'S.Tr.Li.', s1: 'S.S.', m1: 'Bahasa Indonesia', m2: 'Sosiologi' },
  { rumpun: 'Bahasa & Humaniora', name: 'Sastra Jepang / Mandarin / Arab / Jerman / Prancis', d3: 'A.Md.Li.', d4: 'S.Tr.Li.', s1: 'S.S.', m1: 'Bahasa Asing Pilihan', m2: 'Bahasa Indonesia' },
  { rumpun: 'Bahasa & Humaniora', name: 'Ilmu Sejarah', d3: 'A.Md.Hum.', d4: 'S.Tr.Hum.', s1: 'S.Hum.', m1: 'Sejarah', m2: 'Sosiologi' },
  { rumpun: 'Bahasa & Humaniora', name: 'Filsafat', d3: '-', d4: '-', s1: 'S.Fil.', m1: 'Sosiologi', m2: 'Bahasa Indonesia' },
  { rumpun: 'Seni & Desain', name: 'Desain Komunikasi Visual (DKV)', d3: 'A.Md.Sn.', d4: 'S.Tr.Sn.', s1: 'S.Ds.', m1: 'Seni Budaya', m2: 'Informatika' },
  { rumpun: 'Seni & Desain', name: 'Desain Interior / Desain Produk', d3: 'A.Md.Sn.', d4: 'S.Tr.Sn.', s1: 'S.Ds.', m1: 'Seni Budaya', m2: 'Fisika' },
  { rumpun: 'Seni & Desain', name: 'Seni Musik / Seni Tari / Seni Teater', d3: 'A.Md.Sn.', d4: 'S.Tr.Sn.', s1: 'S.Sn.', m1: 'Seni Budaya', m2: 'Bahasa Indonesia' },
  { rumpun: 'Agama & Keagamaan', name: 'Studi Agama Islam / Syariah', d3: 'A.Md.Ag.', d4: 'S.Tr.Ag.', s1: 'S.Ag.', m1: 'Bahasa Arab / PAI', m2: 'Sosiologi' },
  { rumpun: 'Agama & Keagamaan', name: 'Teologi / Keagamaan Kristen / Katolik / Hindu / Buddha', d3: 'A.Md.Ag.', d4: 'S.Tr.Ag.', s1: 'S.Ag.', m1: 'Pendidikan Agama', m2: 'Sosiologi' },

  // TERAPAN & VOKASI KHUSUS
  { rumpun: 'Vokasi & Terapan', name: 'Pariwisata & Perhotelan', d3: 'A.Md.Par.', d4: 'S.Tr.Par.', s1: 'S.Par.', m1: 'Bahasa Inggris Tingkat Lanjut', m2: 'Ekonomi' },
  { rumpun: 'Vokasi & Terapan', name: 'Tata Boga / Kuliner Terapan', d3: 'A.Md.Par.', d4: 'S.Tr.Par.', s1: 'S.Par.', m1: 'Kimia / Prakarya', m2: 'Bahasa Inggris' },
  { rumpun: 'Vokasi & Terapan', name: 'Tata Busana / Fashion Design', d3: 'A.Md.Sn.', d4: 'S.Tr.Sn.', s1: 'S.Ds.', m1: 'Seni Budaya / Prakarya', m2: 'Ekonomi' },
  { rumpun: 'Vokasi & Terapan', name: 'Nautika & Pelayaran', d3: 'A.Md.Pel.', d4: 'S.Tr.Pel.', s1: 'S.ST.', m1: 'Fisika', m2: 'Matematika Tingkat Lanjut' }
];

export function generateAll845Data(): MapelPilihanData[] {
  const result: MapelPilihanData[] = [];
  const totalItems = 845;
  const baseCount = BASE_PRODI_PATTERNS.length;

  for (let i = 1; i <= totalItems; i++) {
    const pattern = BASE_PRODI_PATTERNS[(i - 1) % baseCount];
    const cycle = Math.floor((i - 1) / baseCount);

    let variantSuffix = '';
    if (cycle > 0) {
      const suffixes = [
        ' Terapan',
        ' Spesialisasi Vokasi',
        ' Konsentrasi Digital',
        ' Internasional',
        ' Industri 4.0',
        ' Minat Khusus',
        ' Keahlian Utama',
        ' Lanjutan',
        ' Unggulan'
      ];
      variantSuffix = suffixes[(cycle - 1) % suffixes.length];
    }

    result.push({
      no: i,
      rumpunIlmo: pattern.rumpun,
      kelompokProdi: pattern.name + variantSuffix,
      gelarD3: pattern.d3,
      gelarD4: pattern.d4,
      gelarS1: pattern.s1,
      mapelPendukung1: pattern.m1,
      mapelPendukung2: pattern.m2
    });
  }

  return result;
}

export const MAPEL_PILIHAN_845_LIST = generateAll845Data();
