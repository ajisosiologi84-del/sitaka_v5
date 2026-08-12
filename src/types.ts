export type UserRole = 'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'teknisi' | 'siswa';

export type PilihanStudiLanjutType = 'AKADEMI' | 'Bekerja' | 'Kuliah';

export type JenisPrestasi = 'Akademik' | 'Non-Akademik';

export type TingkatPrestasi = 'Kota/Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';

export interface PrestasiItem {
  id: string;
  namaPrestasi: string;
  jenis: JenisPrestasi;
  tingkat: TingkatPrestasi;
  lembaga: string;
}

export interface Student {
  id: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  mapelTka1: string;
  mapelTka2: string;
  pilihanStudiLanjut: PilihanStudiLanjutType;
  prodiPilihan1: string;
  prodiPilihan2: string;
  ptn1?: string;
  ptn2?: string;
  akreditasiPilihan1?: string;
  kriteriaPilihan1?: string;
  akreditasiPilihan2?: string;
  kriteriaPilihan2?: string;
  mengajukanKipKuliah?: 'Ya' | 'Tidak';
  kategoriDesil?: 'Desil 1' | 'Desil 2' | 'Desil 3' | 'Desil 4' | 'Desil 5' | '';
  noHp?: string;
  fotoSiswa?: string;
  prestasiList?: PrestasiItem[];
  catatan?: string;
  updatedAt: string;
}

export type NavigationTab = 'dashboard' | 'students' | 'schoolData' | 'form' | 'analysis' | 'appscript' | 'laptop' | 'settings' | 'banpt' | 'mapelPilihan' | 'snbpCalc';

export interface MasterSchoolStudent {
  id: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusKelayakanLaptop = 'LAYAK' | 'TIDAK LAYAK';

export interface LaptopData {
  id: string;
  studentId?: string;
  namaSiswa: string;
  kelas: string;
  gelombang: string;
  merkLaptop: string;
  kelengkapan: {
    charger: boolean;
    mouse: boolean;
    keyboard: boolean;
  };
  kodeRuang: string;
  noUrutLaptop: string;
  namaTeknisi: string;
  statusKelayakan: StatusKelayakanLaptop;
  catatanKondisi?: string;
  namaOrangTua?: string;
  updatedAt: string;
}

export interface ProktorTeknisi {
  id: string;
  kodeRuang: string; // Nomor Ruang / Lab
  noUrutLaptop: string; // Nomor Urut atau Range No Urut (misal: "01" atau "01 - 20")
  namaTeknisi: string;
  nipTeknisi?: string;
  namaProktor: string;
  nipProktor?: string;
  keterangan?: string;
}

export interface DocumentSettings {
  namaSekolah: string;
  subHeader: string;
  alamatSekolah: string;
  kotaTanggal: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  nomorSuratPrefix: string;
  judulSuratOrtu: string;
  keteranganSuratOrtu: string;
  judulFormTeknisi: string;
  keteranganFormTeknisi: string;
}

export interface StudentFilter {
  searchQuery: string;
  kelas: string;
  mapelTka: string;
  ptnProdi: string;
}

export interface MapelTkaCount {
  name: string;
  count1: number;
  count2: number;
  total: number;
}

export interface RolePermissions {
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageLaptops: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
  canAccessBanPt: boolean;
  canAccessSnbpCalc: boolean;
  canManageUsers: boolean;
  canResetDatabase: boolean;
}

export interface CustomUserAccount {
  id: string;
  username: string; // NIP / Username / Email
  fullName: string;
  role: 'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'teknisi' | 'panitia' | 'read_only';
  passwordHash: string;
  status: 'AKTIF' | 'NONAKTIF' | 'LOCKED';
  kelasAkses?: string; // e.g., "XII MIPA 1" or "ALL"
  lastLogin?: string;
  createdAt: string;
}

export interface SystemSecurityPolicy {
  minPasswordLength: number;
  requireNumbers: boolean;
  requireSpecialChar: boolean;
  requireUppercase: boolean;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  sessionTimeoutMinutes: number;
  enableTwoFactorPin: boolean;
  securityPin: string;
  forcePasswordPeriodDays: number;
}

export interface ActiveUserSession {
  sessionId: string;
  username: string;
  role: string;
  deviceInfo: string;
  ipAddress: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

