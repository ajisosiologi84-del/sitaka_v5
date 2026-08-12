import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  Award,
  Filter,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  Info,
  Download,
  Globe,
  ChevronLeft,
  ChevronRight,
  Hash,
  Layers,
  ArrowRightLeft,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { MAPEL_PILIHAN_845_LIST, MapelPilihanData } from '../data/mapelPilihanData';
import { getStoredLiveSheetsAccess, saveLiveSheetsAccess } from '../utils/storage';

interface MapelPilihanViewProps {
  userRole?: 'superadmin' | 'walikelas' | 'bk' | 'siswa' | null;
}

export const MapelPilihanView: React.FC<MapelPilihanViewProps> = ({ userRole }) => {
  const [activeViewMode, setActiveViewMode] = useState<'table' | 'sheet'>('table');
  const [isLiveSheetsOpen, setIsLiveSheetsOpen] = useState<boolean>(() => getStoredLiveSheetsAccess());

  const handleToggleLiveSheets = (isOpen: boolean) => {
    setIsLiveSheetsOpen(isOpen);
    saveLiveSheetsAccess(isOpen);
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRumpun, setSelectedRumpun] = useState<string>('ALL');
  const [selectedRange, setSelectedRange] = useState<string>('ALL');
  const [specificNo, setSpecificNo] = useState<string>('');

  // Custom range
  const [customMinNo, setCustomMinNo] = useState<number>(1);
  const [customMaxNo, setCustomMaxNo] = useState<number>(845);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  const GOOGLE_SHEETS_URL =
    'https://docs.google.com/spreadsheets/d/1h8Fe8nBN2y9AywM3uIfc1y-JbZ0dFSUZEr1JOMqSLdU/edit?usp=sharing';
  const GOOGLE_SHEETS_EMBED_URL =
    'https://docs.google.com/spreadsheets/d/1h8Fe8nBN2y9AywM3uIfc1y-JbZ0dFSUZEr1JOMqSLdU/preview?rm=minimal';

  const rumpunOptions = useMemo(() => {
    return Array.from(new Set(MAPEL_PILIHAN_845_LIST.map((item) => item.rumpunIlmo)));
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return MAPEL_PILIHAN_845_LIST.filter((item) => {
      // Specific Number Filter
      if (specificNo.trim() !== '') {
        const target = parseInt(specificNo.trim(), 10);
        if (!isNaN(target) && item.no !== target) {
          return false;
        }
      }

      // Range Filter
      if (selectedRange !== 'ALL') {
        if (selectedRange === '1-100' && (item.no < 1 || item.no > 100)) return false;
        if (selectedRange === '101-200' && (item.no < 101 || item.no > 200)) return false;
        if (selectedRange === '201-300' && (item.no < 201 || item.no > 300)) return false;
        if (selectedRange === '301-400' && (item.no < 301 || item.no > 400)) return false;
        if (selectedRange === '401-500' && (item.no < 401 || item.no > 500)) return false;
        if (selectedRange === '501-600' && (item.no < 501 || item.no > 600)) return false;
        if (selectedRange === '601-700' && (item.no < 601 || item.no > 700)) return false;
        if (selectedRange === '701-800' && (item.no < 701 || item.no > 800)) return false;
        if (selectedRange === '801-845' && (item.no < 801 || item.no > 845)) return false;
        if (selectedRange === 'CUSTOM' && (item.no < customMinNo || item.no > customMaxNo)) return false;
      }

      // Rumpun Filter
      if (selectedRumpun !== 'ALL' && item.rumpunIlmo !== selectedRumpun) {
        return false;
      }

      // Keyword Search Filter
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesQuery =
          item.kelompokProdi.toLowerCase().includes(q) ||
          item.mapelPendukung1.toLowerCase().includes(q) ||
          item.mapelPendukung2.toLowerCase().includes(q) ||
          item.gelarS1.toLowerCase().includes(q) ||
          item.gelarD4.toLowerCase().includes(q) ||
          item.gelarD3.toLowerCase().includes(q) ||
          item.rumpunIlmo.toLowerCase().includes(q) ||
          item.no.toString() === q;

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [selectedRange, selectedRumpun, searchTerm, specificNo, customMinNo, customMaxNo]);

  // Reset page when filters change
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleExportCsv = () => {
    const headers = [
      'No',
      'Rumpun Ilmu',
      'Kelompok Program Studi',
      'Gelar D3',
      'Gelar D4',
      'Gelar S1',
      'Mata Pelajaran SMA Pendukung 1',
      'Mata Pelajaran SMA Pendukung 2'
    ];

    const rows = filteredData.map((item) => [
      item.no,
      `"${item.rumpunIlmo}"`,
      `"${item.kelompokProdi}"`,
      `"${item.gelarD3}"`,
      `"${item.gelarD4}"`,
      `"${item.gelarS1}"`,
      `"${item.mapelPendukung1}"`,
      `"${item.mapelPendukung2}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mata_Pelajaran_Pilihan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedRumpun('ALL');
    setSelectedRange('ALL');
    setSpecificNo('');
    setCustomMinNo(1);
    setCustomMaxNo(845);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            Panduan Kurikulum Merdeka & SNBP Kemdikbudristek
          </div>

          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Matriks Mata Pelajaran Pilihan Pendukung Program Studi PTN
          </h1>

          <p className="text-xs lg:text-sm text-emerald-100/90 leading-relaxed">
            Daftar lengkap 845 kelompok program studi beserta linieritas mata pelajaran pilihan SMA pendukung 1 & 2 untuk persiapan SNBP dan Kurikulum Merdeka.
          </p>
        </div>
      </div>

      {/* Super Admin Control Panel for Live Google Sheets Access */}
      {userRole === 'superadmin' && (
        <div className="bg-slate-900 border border-slate-800 text-white p-4.5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Pengaturan Akses Super Admin: Tampilan Live Google Sheets
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isLiveSheetsOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isLiveSheetsOpen ? 'STATUS: DIBUKA (Semua User)' : 'STATUS: DITUTUP (Khusus Super Admin)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Atur status akses tampilan embedded Live Google Sheets untuk pengguna umum (Siswa, Wali Kelas, Guru BK). Jika ditutup, hanya Super Admin yang dapat membukanya.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleToggleLiveSheets(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                isLiveSheetsOpen
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Akses</span>
            </button>

            <button
              onClick={() => handleToggleLiveSheets(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                !isLiveSheetsOpen
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Tutup Akses</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 w-full sm:w-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveViewMode('table')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeViewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tabel Matriks Interaktif</span>
          </button>

          <button
            onClick={() => setActiveViewMode('sheet')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeViewMode === 'sheet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {!isLiveSheetsOpen ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>Tampilan Live Google Sheets</span>
            {!isLiveSheetsOpen && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black">
                {userRole === 'superadmin' ? 'Khusus Admin' : 'Ditutup Admin'}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            {isLiveSheetsOpen
              ? 'Tampilan Live Google Sheets DIBUKA untuk seluruh pengguna.'
              : 'Tampilan Live Google Sheets DITUTUP oleh Super Admin (Khusus Admin).'}
          </span>
        </div>
      </div>

      {/* View Mode 1: Table with Comprehensive Filters */}
      {activeViewMode === 'table' && (
        <div className="space-y-4">
          {/* Main Filter Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Filter Lanjutan Data Nomor 1 s.d. 845
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">
                  Total Data: <strong className="text-emerald-700">{filteredData.length}</strong> / 845
                </span>
                <button
                  onClick={resetAllFilters}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Filter Range Nomor (1-845) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Filter Rentang Nomor</span>
                </label>
                <select
                  value={selectedRange}
                  onChange={(e) => {
                    setSelectedRange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                >
                  <option value="ALL">Semua Nomor (1 - 845)</option>
                  <option value="1-100">Nomor 1 - 100</option>
                  <option value="101-200">Nomor 101 - 200</option>
                  <option value="201-300">Nomor 201 - 300</option>
                  <option value="301-400">Nomor 301 - 400</option>
                  <option value="401-500">Nomor 401 - 500</option>
                  <option value="501-600">Nomor 501 - 600</option>
                  <option value="601-700">Nomor 601 - 700</option>
                  <option value="701-800">Nomor 701 - 800</option>
                  <option value="801-845">Nomor 801 - 845</option>
                  <option value="CUSTOM">Rentang Kustom (Bebas)</option>
                </select>
              </div>

              {/* 2. Cari Nomor Spesifik */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lompat ke Nomor Tertentu</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="845"
                  value={specificNo}
                  onChange={(e) => {
                    setSpecificNo(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Ketik angka (1 - 845)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                />
              </div>

              {/* 3. Filter Rumpun Ilmu */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rumpun Ilmu</span>
                </label>
                <select
                  value={selectedRumpun}
                  onChange={(e) => {
                    setSelectedRumpun(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                >
                  <option value="ALL">Semua Rumpun Ilmu</option>
                  {rumpunOptions.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Pencarian Kata Kunci */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cari Nama Prodi / Mapel Pendukung
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cth: Kedokteran, Informatika, S.T..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom Range Inputs (if selectedRange === 'CUSTOM') */}
            {selectedRange === 'CUSTOM' && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3 bg-emerald-50/50 p-3 rounded-xl text-xs">
                <span className="font-bold text-emerald-900">Masukkan Range Angka Kustom:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Dari No:</span>
                  <input
                    type="number"
                    min="1"
                    max="845"
                    value={customMinNo}
                    onChange={(e) => {
                      setCustomMinNo(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-emerald-900"
                  />
                  <span className="text-slate-600 font-medium">s.d. No:</span>
                  <input
                    type="number"
                    min="1"
                    max="845"
                    value={customMaxNo}
                    onChange={(e) => {
                      setCustomMaxNo(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-emerald-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Pagination Control Top */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Tampilkan baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              >
                <option value={25}>25 data</option>
                <option value={50}>50 data</option>
                <option value={100}>100 data</option>
                <option value={250}>250 data</option>
                <option value={845}>Tampilkan Semua (845 Data)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Menampilkan <strong>{paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> -{' '}
                <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> dari{' '}
                <strong>{totalItems}</strong> baris
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-3 text-center w-16 bg-slate-100/80 text-slate-800 border-r border-slate-200">
                      No
                    </th>
                    <th className="py-3.5 px-4">Rumpun Ilmu</th>
                    <th className="py-3.5 px-4">Kelompok Program Studi</th>
                    <th className="py-3.5 px-3 text-center">Gelar D3</th>
                    <th className="py-3.5 px-3 text-center">Gelar D4</th>
                    <th className="py-3.5 px-3 text-center">Gelar S1</th>
                    <th className="py-3.5 px-4 text-center bg-emerald-50/80 text-emerald-950 font-black">
                      Mata Pelajaran SMA Pendukung 1
                    </th>
                    <th className="py-3.5 px-4 text-center bg-teal-50/80 text-teal-950 font-black">
                      Mata Pelajaran SMA Pendukung 2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <tr key={row.no} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-black text-slate-700 bg-slate-50/80 border-r border-slate-200/80">
                          {row.no}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] border border-slate-200 font-medium inline-block">
                            {row.rumpunIlmo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {row.kelompokProdi}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {row.gelarD3}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {row.gelarD4}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                          {row.gelarS1}
                        </td>
                        <td className="py-3 px-4 text-center font-bold bg-emerald-50/20">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-lg text-[11px] inline-flex items-center gap-1 shadow-2xs">
                            <Award className="w-3 h-3 text-emerald-600" />
                            {row.mapelPendukung1}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold bg-teal-50/20">
                          <span className="px-2.5 py-1 bg-teal-100 text-teal-900 border border-teal-200/80 rounded-lg text-[11px] inline-flex items-center gap-1 shadow-2xs">
                            <Award className="w-3 h-3 text-teal-600" />
                            {row.mapelPendukung2}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        Tidak ada data program studi pada nomor/filter ini.
                        <div className="mt-2">
                          <button
                            onClick={resetAllFilters}
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            Klik untuk reset semua filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terhubung dengan Google Sheets Data No. 1 s.d. 845 lengkap.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
                >
                  Sebelumnya
                </button>
                <span className="px-2 font-bold text-slate-800">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode 2: Embedded Google Sheet */}
      {activeViewMode === 'sheet' && (
        userRole === 'superadmin' || isLiveSheetsOpen ? (
          <div className="space-y-3">
            {/* Super Admin Notice Banner when closed for general users */}
            {!isLiveSheetsOpen && userRole === 'superadmin' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Mode Super Admin:</strong> Akses Tampilan Live Google Sheets saat ini disetting <strong>DITUTUP</strong> untuk pengguna umum (Siswa/Guru). Sebagai Super Admin, Anda tetap dapat mengakses tampilan ini.
                  </span>
                </div>
                <button
                  onClick={() => handleToggleLiveSheets(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs flex-shrink-0"
                >
                  Buka untuk Semua User
                </button>
              </div>
            )}

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheets Live Data Viewer</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Data di bawah tersambung secara realtime dengan basis data dokumen Google Spreadsheet resmi.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden h-[750px] flex flex-col">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Tampilan Live Google Sheets Data Matriks</span>
                </div>
              </div>

              <iframe
                src={GOOGLE_SHEETS_EMBED_URL}
                title="Google Sheets Mata Pelajaran Pilihan"
                className="w-full flex-1 border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ) : (
          /* Restricted Screen for Non-SuperAdmin Users when Live Sheets is Closed */
          <div className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-200/80 shadow-md text-center max-w-2xl mx-auto my-6 space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-rose-200">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Tampilan Live Google Sheets Ditutup
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                Super Admin telah menonaktifkan tampilan Live Google Sheets untuk pengguna umum. Silakan gunakan <strong>Tabel Matriks Interaktif</strong> di bawah ini untuk mencari, memfilter, dan mengekspor data linieritas mata pelajaran pendukung prodi.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveViewMode('table')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Tabel Matriks Interaktif</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
