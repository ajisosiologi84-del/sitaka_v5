import React from 'react';
import {
  ShieldCheck,
  X,
  Users,
  GraduationCap,
  Building2,
  Laptop,
  Check,
  User,
  Shield,
  KeyRound,
  FileText,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserRole } from '../types';

interface RbacMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: UserRole | null;
  currentUserNis?: string | null;
}

interface FeaturePermission {
  feature: string;
  category: string;
  superadmin: boolean | string;
  walikelas: boolean | string;
  bk: boolean | string;
  proktor: boolean | string;
  siswa: boolean | string;
}

export const RbacMatrixModal: React.FC<RbacMatrixModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserNis,
}) => {
  if (!isOpen) return null;

  const permissionsList: FeaturePermission[] = [
    {
      feature: 'Master Data Sekolah & Password Siswa',
      category: 'Master Data',
      superadmin: 'Full Control',
      walikelas: 'Read-Only',
      bk: 'Read-Only',
      proktor: 'Read-Only',
      siswa: 'Lihat NIS & Password Sendiri',
    },
    {
      feature: 'Isi & Edit Form TKA Siswa',
      category: 'Formulir TKA',
      superadmin: 'Semua Siswa',
      walikelas: 'Semua Siswa',
      bk: 'Semua Siswa',
      proktor: false,
      siswa: 'Sesuai NIS Login (Auto-Fill)',
    },
    {
      feature: '⚡ Auto-Fill Otomatis Nama & Identitas',
      category: 'Formulir TKA',
      superadmin: 'Pilih Semua Siswa',
      walikelas: 'Pilih Semua Siswa',
      bk: 'Pilih Semua Siswa',
      proktor: false,
      siswa: 'Terkunci NIS Sendiri',
    },
    {
      feature: 'Cetak Bukti Formulir (PDF & Stiker)',
      category: 'Output Dokumen',
      superadmin: true,
      walikelas: true,
      bk: true,
      proktor: true,
      siswa: true,
    },
    {
      feature: 'Direktori Akreditasi BAN-PT & PTN',
      category: 'Studi Lanjut',
      superadmin: true,
      walikelas: true,
      bk: true,
      proktor: true,
      siswa: true,
    },
    {
      feature: 'Matriks Mapel Pilihan 845 Prodi',
      category: 'Studi Lanjut',
      superadmin: true,
      walikelas: true,
      bk: true,
      proktor: true,
      siswa: true,
    },
    {
      feature: 'Simulasi Kalkulator Peluang SNBP',
      category: 'Studi Lanjut',
      superadmin: true,
      walikelas: true,
      bk: true,
      proktor: true,
      siswa: true,
    },
    {
      feature: 'Inventaris Laptop & Sarana Lab TKA',
      category: 'Infrastruktur',
      superadmin: true,
      walikelas: 'Read-Only',
      bk: 'Read-Only',
      proktor: 'Full Control',
      siswa: false,
    },
    {
      feature: 'Google Apps Script Integration Hub',
      category: 'Integrasi Database',
      superadmin: true,
      walikelas: 'Read-Only',
      bk: 'Read-Only',
      proktor: 'Read-Only',
      siswa: false,
    },
    {
      feature: 'Pengaturan Sistem, User & Reset Data',
      category: 'Keamanan System',
      superadmin: true,
      walikelas: false,
      bk: false,
      proktor: false,
      siswa: false,
    },
    {
      feature: 'Buka / Tutup Akses Form Siswa',
      category: 'Keamanan System',
      superadmin: true,
      walikelas: false,
      bk: false,
      proktor: false,
      siswa: false,
    },
  ];

  const renderCellVal = (val: boolean | string) => {
    if (typeof val === 'string') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
          {val}
        </span>
      );
    }
    if (val === true) {
      return (
        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mx-auto">
          ✓
        </span>
      );
    }
    return (
      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs mx-auto">
        ✕
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                MATRIKS OTORISASI PENGGUNA (RBAC)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-Based Access Control — Struktur Hak Akses Berdasarkan Peran Pengguna Portal TKA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
            title="Tutup Matriks RBAC"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Active User Status Card */}
        {currentUserRole && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Status Sesi Login Anda Saat Ini
                </p>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  Peran (Role):{' '}
                  <span className="uppercase text-amber-400 underline decoration-amber-500">
                    {currentUserRole === 'superadmin'
                      ? 'Super Admin (Akses Penuh)'
                      : currentUserRole === 'walikelas'
                      ? 'Wali Kelas'
                      : currentUserRole === 'bk'
                      ? 'Guru BK'
                      : currentUserRole === 'proktor'
                      ? 'Proktor / Teknisi Lab'
                      : `Siswa (NIS: ${currentUserNis || '-'})`}
                  </span>
                </h4>
              </div>
            </div>

            {currentUserRole === 'siswa' && (
              <div className="bg-emerald-950/80 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-700/60 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Auto-Fill Terkunci Sesuai NIS Login ({currentUserNis})</span>
              </div>
            )}
          </div>
        )}

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Superadmin */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                Super Admin
              </span>
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h5 className="font-bold text-xs text-slate-800">Akses Full Control</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Mengelola Master Data, Password User, Konfigurasi System, Google Sheets & Restorasi Database.
            </p>
          </div>

          {/* Wali Kelas */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                Wali Kelas
              </span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <h5 className="font-bold text-xs text-slate-800">Monitoring Rombel</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Memantau data siswa bimbingan, verifikasi kelengkapan TKA, rekapitulasi nilai & export data.
            </p>
          </div>

          {/* Guru BK */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Guru BK
              </span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h5 className="font-bold text-xs text-slate-800">Bimbingan Karir</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Pemetaan Pilihan PTN, Analisis Linieritas Mapel Pendukung 845 Prodi, BAN-PT & Simulasi SNBP.
            </p>
          </div>

          {/* Proktor */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                Proktor / Lab
              </span>
              <Laptop className="w-4 h-4 text-amber-600" />
            </div>
            <h5 className="font-bold text-xs text-slate-800">Sarana Lab Ujian</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Kelola Inventaris Laptop Siswa, Alokasi Ruang Lab, Cetak Stiker Meja & Berita Acara Ujian TKA.
            </p>
          </div>

          {/* Siswa */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-md">
                Siswa (Self-Service)
              </span>
              <GraduationCap className="w-4 h-4 text-emerald-700" />
            </div>
            <h5 className="font-bold text-xs text-emerald-950">Akses Mandiri Siswa</h5>
            <p className="text-[10px] text-emerald-800 leading-relaxed">
              Isi Form Mandiri Sesuai NIS Login, Auto-Fill Terkunci NIS, Simulasi SNBP, Cek BAN-PT & Cetak PDF.
            </p>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" /> Matriks Komparasi Hak Akses Fitur Portal
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              *Hanya Hak Akses Siswa yang dibatasi secara otomatis sesuai NIS Login
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Fitur Portal TKA</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                  <th className="py-2.5 px-3 text-center">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-center">Guru BK</th>
                  <th className="py-2.5 px-3 text-center">Proktor</th>
                  <th className="py-2.5 px-3 text-center bg-emerald-100/50 text-emerald-950">
                    Siswa (NIS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {permissionsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.feature}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{renderCellVal(item.superadmin)}</td>
                    <td className="py-2.5 px-3 text-center">{renderCellVal(item.walikelas)}</td>
                    <td className="py-2.5 px-3 text-center">{renderCellVal(item.bk)}</td>
                    <td className="py-2.5 px-3 text-center">{renderCellVal(item.proktor)}</td>
                    <td className="py-2.5 px-3 text-center bg-emerald-50/40">
                      {renderCellVal(item.siswa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Diatur oleh <strong>Pusat Kebijakan Keamanan Portal TKA 2026</strong>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Tutup Matriks RBAC
          </button>
        </div>
      </div>
    </div>
  );
};
