import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Code2,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  Award,
  BookOpen,
  Calculator,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavigationTab, UserRole } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  totalStudents: number;
  appsScriptUrl: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  userRole: UserRole | null;
  currentUserNis?: string | null;
  isStudentFormOpen?: boolean;
  onLogout: () => void;
  onOpenRbacModal?: () => void;
  isSidebarMinimized: boolean;
  setIsSidebarMinimized: (minimized: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalStudents,
  appsScriptUrl,
  isMobileOpen,
  setIsMobileOpen,
  userRole,
  currentUserNis,
  isStudentFormOpen = true,
  onLogout,
  onOpenRbacModal,
  isSidebarMinimized,
  setIsSidebarMinimized,
}) => {
  const allNavItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string | number; description: string; roles: UserRole[] }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Ringkasan data & statistik',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'students',
      label: 'Data Siswa TKA',
      icon: <Users className="w-5 h-5" />,
      badge: totalStudents,
      description: 'Tabel & pencarian siswa',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'schoolData',
      label: 'INPUT DATA SEKOLAH',
      icon: <Building2 className="w-5 h-5" />,
      badge: 'Master',
      description: 'Data awal Master Siswa, NIS, NISN & Kelas',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'form',
      label: userRole === 'siswa' ? 'Formulir Data Siswa Saya' : 'Form Input Data',
      icon: <UserPlus className="w-5 h-5" />,
      badge: userRole === 'siswa' ? (isStudentFormOpen ? 'Akses Buka' : 'Ditutup') : undefined,
      description: userRole === 'siswa' ? 'Isi/Update NIS Anda' : 'Isian Mapel TKA & Prodi',
      roles: ['superadmin', 'walikelas', 'bk', 'siswa'],
    },
    {
      id: 'banpt',
      label: 'Direktori Prodi PTN',
      icon: <Award className="w-5 h-5" />,
      badge: 'BAN-PT',
      description: 'Akreditasi Prodi Seluruh Indonesia',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi', 'siswa'],
    },
    {
      id: 'mapelPilihan',
      label: 'Mata Pelajaran Pilihan',
      icon: <BookOpen className="w-5 h-5" />,
      badge: 'SNBP',
      description: 'Matriks Mapel Pendukung Prodi PTN',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi', 'siswa'],
    },
    {
      id: 'snbpCalc',
      label: 'SIMULASI KALKULATOR SNBP',
      icon: <Calculator className="w-5 h-5" />,
      badge: 'KALKULATOR',
      description: 'Hitung Rasionalisasi & Peluang Lolos SNBP',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi', 'siswa'],
    },
    {
      id: 'laptop',
      label: 'Pendataan Laptop & Sarana Ujian TKA',
      icon: <Laptop className="w-5 h-5" />,
      badge: 'PROKTOR',
      description: 'Inventaris Laptop, Lab & Suasana Ujian',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'analysis',
      label: 'Analisis Pilihan',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Matriks Mapel & Studi Lanjut',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'appscript',
      label: 'Google Apps Script Integration Hub',
      icon: <Code2 className="w-5 h-5" />,
      badge: appsScriptUrl ? 'Aktif' : 'Setup',
      description: 'Pusat Integrasi & Generator Google Sheets Backend',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
    {
      id: 'settings',
      label: 'Portal Pengaturan & Konfigurasi Portal TKA',
      icon: <Settings className="w-5 h-5" />,
      badge: 'Admin',
      description: 'Kop Surat, Lab, Password, Hak Akses & Reset Data',
      roles: ['superadmin', 'walikelas', 'bk', 'proktor', 'teknisi'],
    },
  ];

  const navItems = allNavItems.filter((item) => userRole && item.roles.includes(userRole));

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'superadmin': return 'Super Admin';
      case 'walikelas': return 'Wali Kelas';
      case 'bk': return 'Guru BK';
      case 'proktor': return 'Proktor / Teknisi Lab';
      case 'siswa': return `Siswa (NIS: ${currentUserNis || '-'})`;
      default: return 'Tamu';
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'superadmin': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'walikelas': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'bk': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'proktor': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'siswa': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full'
        } ${isSidebarMinimized ? 'lg:w-20 w-72' : 'lg:w-72 w-72'}`}
      >
        {/* Sidebar Header Brand */}
        <div className={`border-b border-slate-800/80 bg-slate-950/40 transition-all flex flex-col ${
          isSidebarMinimized ? 'lg:p-3 p-5 items-center' : 'p-5'
        }`}>
          <div className={`flex items-center w-full ${isSidebarMinimized ? 'lg:justify-center justify-between' : 'justify-between'}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              {(!isSidebarMinimized || isMobileOpen) && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-black text-lg tracking-wider text-white leading-none">
                      SITAKA
                    </h1>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                      TKA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                    Sistem Info TKA & Karir
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar toggle button (visible on desktop) */}
            <button
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title={isSidebarMinimized ? "Buka Sidebar" : "Kecilkan Sidebar"}
            >
              {isSidebarMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {(!isSidebarMinimized || isMobileOpen) && (
            <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-800/60 rounded-lg px-2.5 py-1.5 text-slate-300 border border-slate-700/50">
              <span className="flex items-center gap-1 text-indigo-300 font-semibold truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> Integrasi App Script
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                v2.6
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Options - Clean Left Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {(!isSidebarMinimized || isMobileOpen) ? (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all">
              NAVIGASI UTAMA
            </div>
          ) : (
            <div className="h-4" />
          )}
          
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isItemMinimized = isSidebarMinimized && !isMobileOpen;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center rounded-xl transition-all duration-200 group text-left ${
                  isItemMinimized ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={isItemMinimized ? `${item.label} (${item.description})` : undefined}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {(!isSidebarMinimized || isMobileOpen) && (
                    <div className="truncate">
                      <div className="text-sm tracking-tight leading-tight">
                        {item.label}
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isActive ? 'text-indigo-100/80' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>

                {(!isSidebarMinimized || isMobileOpen) && item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : item.id === 'appscript' && appsScriptUrl
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Integration Status Footer Box */}
        <div className={`m-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs transition-all ${
          (isSidebarMinimized && !isMobileOpen) ? 'p-2 flex flex-col items-center space-y-3' : 'p-3.5 space-y-3'
        }`}>
          {(!isSidebarMinimized || isMobileOpen) ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Hak Akses Login</div>
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">{getRoleDisplayName()}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${getRoleBadgeColor()}`}>
                  {userRole?.toUpperCase()}
                </span>
              </div>

              {onOpenRbacModal && userRole === 'superadmin' && (
                <button
                  onClick={onOpenRbacModal}
                  className="w-full py-2 px-3 bg-indigo-900/40 hover:bg-indigo-800/80 text-indigo-200 hover:text-white rounded-lg text-xs font-bold border border-indigo-700/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Matriks RBAC Hak Akses
                </button>
              )}

              <button
                onClick={onLogout}
                className="w-full py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold border border-rose-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Ganti Akun / Keluar
              </button>
            </>
          ) : (
            <>
              {/* Centered Avatar/Icon when Minimized */}
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 cursor-default shadow-xs ${getRoleBadgeColor()}`}
                title={`Login: ${getRoleDisplayName()}`}
              >
                {userRole?.substring(0, 2).toUpperCase()}
              </div>

              <button
                onClick={onLogout}
                className="w-9 h-9 flex items-center justify-center bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl border border-rose-500/30 transition-all shrink-0"
                title="Ganti Akun / Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
