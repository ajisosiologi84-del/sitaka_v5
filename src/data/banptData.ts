export interface ProdiData {
  ptn: string;
  prodi: string;
  jenjang: 'S1' | 'D4' | 'D3' | 'S2';
  akreditasi: 'Unggul' | 'A' | 'Baik Sekali' | 'B' | 'Baik';
  nomorSk: string;
  tahunKedaluwarsa: string;
  wilayah: string;
}

export const SAMPLE_BANPT_DATA: ProdiData[] = [
  // Universitas Indonesia (UI)
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Pendidikan Dokter', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0123/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Ilmu Komputer', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0154/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0188/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Teknik Industri', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0202/SK/BAN-PT/Ak/S/2022', tahunKedaluwarsa: '2027', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Hukum', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0310/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Akuntansi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0412/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Psikologi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0519/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Farmasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0588/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0612/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },

  // Institut Teknologi Bandung (ITB)
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0112/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0115/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Teknik Mesin', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0190/SK/BAN-PT/Ak/S/2022', tahunKedaluwarsa: '2027', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Sekolah Bisnis dan Manajemen (SBM)', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0231/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Teknik Sipil', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0289/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Arsitektur', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0305/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'Teknik Kimia', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0342/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },

  // Universitas Gadjah Mada (UGM)
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Pendidikan Dokter / Kedokteran', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0098/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Teknik Teknologi Informasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0142/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Ilmu Hukum', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0199/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Farmasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0210/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Manajemen', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0255/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0312/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Psikologi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0388/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },

  // Institut Teknologi Sepuluh Nopember (ITS)
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0101/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0134/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0177/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Teknik Sipil', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0223/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Sains Data', jenjang: 'S1', akreditasi: 'Baik Sekali', nomorSk: '0390/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },

  // Universitas Airlangga (UNAIR)
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Pendidikan Dokter', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0087/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Kedokteran Gigi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0105/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Farmasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0140/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Teknologi Sains Data', jenjang: 'S1', akreditasi: 'Baik Sekali', nomorSk: '0211/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Hukum', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0245/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },

  // Universitas Diponegoro (UNDIP)
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0122/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Semarang' },
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Kedokteran', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0145/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Semarang' },
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Hukum', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0201/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Semarang' },
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Psikologi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0244/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Semarang' },

  // Universitas Padjadjaran (UNPAD)
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Pendidikan Dokter', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0091/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Sumedang/Bandung' },
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0130/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Sumedang/Bandung' },
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0180/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Sumedang/Bandung' },
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Hubungan Internasional', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0215/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Sumedang/Bandung' },

  // IPB University
  { ptn: 'IPB University (IPB)', prodi: 'Ilmu Komputer', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0111/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bogor' },
  { ptn: 'IPB University (IPB)', prodi: 'Kedokteran Hewan', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0150/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bogor' },
  { ptn: 'IPB University (IPB)', prodi: 'Teknologi Pangan', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0195/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bogor' },
  { ptn: 'IPB University (IPB)', prodi: 'Bisnis', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0233/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Bogor' },

  // Universitas Brawijaya (UB)
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0129/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Malang' },
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0165/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Malang' },
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Kedokteran', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0208/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Malang' },
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Hukum', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0256/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Malang' },

  // Universitas Sebelas Maret (UNS)
  { ptn: 'Universitas Sebelas Maret (UNS)', prodi: 'Kedokteran', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0119/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surakarta' },
  { ptn: 'Universitas Sebelas Maret (UNS)', prodi: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0172/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Surakarta' },

  // Politeknik Negeri & Others
  { ptn: 'Politeknik Negeri Bandung (POLBAN)', prodi: 'Teknik Informatika', jenjang: 'D4', akreditasi: 'Unggul', nomorSk: '0089/SK/BAN-PT/Ak/D4/2023', tahunKedaluwarsa: '2028', wilayah: 'Bandung' },
  { ptn: 'Politeknik Elektronika Negeri Surabaya (PENS)', prodi: 'Teknik Informatika', jenjang: 'D4', akreditasi: 'Unggul', nomorSk: '0092/SK/BAN-PT/Ak/D4/2023', tahunKedaluwarsa: '2028', wilayah: 'Surabaya' },
  { ptn: 'Politeknik Negeri Jakarta (PNJ)', prodi: 'Teknik Informatika', jenjang: 'D4', akreditasi: 'Baik Sekali', nomorSk: '0144/SK/BAN-PT/Ak/D4/2023', tahunKedaluwarsa: '2028', wilayah: 'Depok/Jakarta' },
  { ptn: 'Universitas Negeri Yogyakarta (UNY)', prodi: 'Pendidikan Matematika', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0102/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Yogyakarta' },
  { ptn: 'Universitas Negeri Jakarta (UNJ)', prodi: 'Pendidikan Bahasa Inggris', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0118/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Jakarta' },
  { ptn: 'Universitas Hasanuddin (UNHAS)', prodi: 'Pendidikan Dokter', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0135/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Makassar' },
  { ptn: 'Universitas Andalas (UNAND)', prodi: 'Teknik Komputer', jenjang: 'S1', akreditasi: 'A', nomorSk: '0167/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Padang' },
  { ptn: 'Universitas Udayana (UNUD)', prodi: 'Kedokteran', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0178/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Denpasar/Badung' },
  { ptn: 'Universitas Sumatera Utara (USU)', prodi: 'Ilmu Komputer', jenjang: 'S1', akreditasi: 'Unggul', nomorSk: '0182/SK/BAN-PT/Ak/S/2023', tahunKedaluwarsa: '2028', wilayah: 'Medan' }
];

/**
  * Helper to search BAN-PT accreditation status by PTN name and/or Prodi name
  */
export function findBanPtAccreditation(ptnName: string, prodiName: string): ProdiData | undefined {
  if (!ptnName || !prodiName) return undefined;
  const normPtn = ptnName.toLowerCase();
  const normProdi = prodiName.toLowerCase();

  // Try exact or close match first
  return SAMPLE_BANPT_DATA.find((item) => {
    const matchPtn = item.ptn.toLowerCase().includes(normPtn) || normPtn.includes(item.ptn.toLowerCase());
    const matchProdi = item.prodi.toLowerCase().includes(normProdi) || normProdi.includes(item.prodi.toLowerCase());
    return matchPtn && matchProdi;
  }) || SAMPLE_BANPT_DATA.find((item) => {
    // Fallback: match prodi name
    return item.prodi.toLowerCase().includes(normProdi) || normProdi.includes(item.prodi.toLowerCase());
  });
}
