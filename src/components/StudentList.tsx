import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Download,
  RotateCcw,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  FileUp,
  Award,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2
} from 'lucide-react';
import { Student } from '../types';
import { MAPEL_TKA_OPTIONS } from '../data/mockStudents';
import { exportStudentsToCSV } from '../utils/storage';
import { exportStudentsToExcel } from '../utils/excelUtils';
import { ImportExcelModal } from './ImportExcelModal';

interface StudentListProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteMultipleStudents?: (ids: string[]) => void;
  onSelectStudentDetail: (student: Student) => void;
  onAddNewStudent: () => void;
  onResetData: () => void;
  onClearData?: () => void;
  onRefreshData?: () => void;
  isReadOnly?: boolean;
  userRole?: 'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'siswa' | null;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onEditStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onSelectStudentDetail,
  onAddNewStudent,
  onResetData,
  onClearData,
  onRefreshData,
  isReadOnly = false,
  userRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [selectedMapel, setSelectedMapel] = useState('ALL');
  const [selectedStudiLanjut, setSelectedStudiLanjut] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilterDeleteModal, setShowFilterDeleteModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animated process state for clearing/resetting data
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processType, setProcessType] = useState<'clear' | 'reset' | null>(null);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStepText, setProcessStepText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<'clear' | 'reset' | null>(null);

  const startAnimatedProcess = (type: 'clear' | 'reset') => {
    setShowConfirmModal(null);
    setProcessType(type);
    setIsProcessModalOpen(true);
    setProcessProgress(10);
    setProcessStepText(
      type === 'clear'
        ? 'Menyiapkan penghapusan seluruh data siswa TKA & Google Sheets...'
        : 'Menyiapkan pemulihan 13 data sampel bawaan...'
    );

    setTimeout(() => {
      setProcessProgress(40);
      setProcessStepText(
        type === 'clear'
          ? 'Menghapus record siswa TKA dari database & menyinkronkan ke Google Sheets...'
          : 'Memuat data sampel siswa TKA & target studi lanjut...'
      );
    }, 350);

    setTimeout(() => {
      setProcessProgress(80);
      setProcessStepText('Membersihkan indeks data & memperbarui Google Sheets secara realtime...');
    }, 750);

    setTimeout(() => {
      setProcessProgress(100);
      setProcessStepText('Selesai! Seluruh data siswa berhasil dihapus (0 siswa).');
    }, 1150);

    setTimeout(() => {
      if (type === 'clear' && onClearData) {
        onClearData();
        setSelectedIds([]);
        showToast('Seluruh data siswa TKA berhasil dihapus (0 siswa). Update realtime ke Google Sheets!');
      } else if (type === 'reset') {
        onResetData();
        setSelectedIds([]);
        showToast('Data siswa berhasil direset ke 13 data sampel bawaan.');
      }
      setIsProcessModalOpen(false);
      setProcessType(null);
    }, 1650);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Extract unique kelas
  const kelasOptions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.kelas))).filter(Boolean);
    return ['ALL', ...list];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.namaSiswa.toLowerCase().includes(q) ||
        student.nis.toLowerCase().includes(q) ||
        student.nisn.toLowerCase().includes(q) ||
        student.mapelTka1.toLowerCase().includes(q) ||
        student.mapelTka2.toLowerCase().includes(q) ||
        student.prodiPilihan1.toLowerCase().includes(q) ||
        student.prodiPilihan2.toLowerCase().includes(q);

      const matchesKelas = selectedKelas === 'ALL' || student.kelas === selectedKelas;

      const matchesMapel =
        selectedMapel === 'ALL' ||
        student.mapelTka1 === selectedMapel ||
        student.mapelTka2 === selectedMapel;

      const matchesStudi =
        selectedStudiLanjut === 'ALL' ||
        (selectedStudiLanjut === 'Kuliah' && (!student.pilihanStudiLanjut || student.pilihanStudiLanjut === 'Kuliah')) ||
        student.pilihanStudiLanjut === selectedStudiLanjut;

      return matchesSearch && matchesKelas && matchesMapel && matchesStudi;
    });
  }, [students, searchQuery, selectedKelas, selectedMapel, selectedStudiLanjut]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Nama Siswa, NIS, NISN, Mapel TKA, atau Prodi..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu Grid</span>
              </button>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Impor Excel</span>
              </button>
            )}

            <button
              onClick={() => {
                exportStudentsToExcel(filteredStudents);
                showToast(`Berhasil mengunduh ${filteredStudents.length} data siswa (.xlsx)`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            {userRole === 'superadmin' && (
              <button
                onClick={() => {
                  exportStudentsToCSV(filteredStudents);
                  showToast(`Berhasil mengunduh ${filteredStudents.length} data siswa (.csv)`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
            )}

            {!isReadOnly && (
              <>
                {onClearData && (
                  <button
                    onClick={() => setShowConfirmModal('clear')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                    title="Hapus seluruh data siswa TKA & Studi Lanjut di database dan Google Sheets"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Data seluruh siswa</span>
                  </button>
                )}
                <button
                  onClick={onAddNewStudent}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Siswa</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Filter Kelas */}
            <select
              value={selectedKelas}
              onChange={(e) => {
                setSelectedKelas(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Kelas ({kelasOptions.length - 1})</option>
              {kelasOptions
                .filter((k) => k !== 'ALL')
                .map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
            </select>

            {/* Filter Mapel TKA */}
            <select
              value={selectedMapel}
              onChange={(e) => {
                setSelectedMapel(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Mapel TKA</option>
              {MAPEL_TKA_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Filter Studi Lanjut */}
            <select
              value={selectedStudiLanjut}
              onChange={(e) => {
                setSelectedStudiLanjut(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Studi Lanjut</option>
              <option value="Kuliah">Kuliah (PTN/PTS)</option>
              <option value="AKADEMI">AKADEMI (TNI/POLRI/Kedinasan)</option>
              <option value="Bekerja">Bekerja / Wirausaha</option>
            </select>

            {(selectedKelas !== 'ALL' || selectedMapel !== 'ALL' || selectedStudiLanjut !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedKelas('ALL');
                  setSelectedMapel('ALL');
                  setSelectedStudiLanjut('ALL');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold ml-1"
              >
                Reset Filter
              </button>
            )}

            {/* Filter Delete / Selection Delete Button */}
            {!isReadOnly &&
              (selectedIds.length > 0 ||
                ((selectedKelas !== 'ALL' || selectedMapel !== 'ALL' || selectedStudiLanjut !== 'ALL' || searchQuery) &&
                  filteredStudents.length > 0)) && (
                <button
                  onClick={() => setShowFilterDeleteModal(true)}
                  className="ml-auto sm:ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all animate-in fade-in"
                  title="Hapus data siswa hasil filter / terpilih dan update ke Google Sheets"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedIds.length > 0
                      ? `Hapus Data Terpilih (${selectedIds.length})`
                      : `Hapus Hasil Filter (${filteredStudents.length} Siswa)`}
                  </span>
                </button>
              )}
          </div>

          <div className="text-slate-500 font-medium flex items-center gap-2">
            {selectedIds.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-indigo-200">
                {selectedIds.length} terpilih
              </span>
            )}
            <span>
              Menampilkan <span className="font-bold text-slate-800">{filteredStudents.length}</span> dari {students.length} siswa
            </span>
          </div>
        </div>
      </div>

      {/* Main View: Table OR Grid */}
      {viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div>
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 space-y-2">
              <p className="font-semibold text-sm text-slate-700">Tidak ada data siswa ditemukan</p>
              <p className="text-xs">Coba ubah kata kunci pencarian atau reset filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedStudents.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    {/* Card Header: Avatar & Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s.fotoSiswa ? (
                          <img
                            src={s.fotoSiswa}
                            alt={s.namaSiswa}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-100 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-base shrink-0 shadow-2xs">
                            {s.namaSiswa.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {s.namaSiswa}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            NIS: {s.nis} | <span className="font-sans text-indigo-600 font-semibold">{s.kelas}</span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          s.pilihanStudiLanjut === 'AKADEMI'
                            ? 'bg-indigo-100 text-indigo-800'
                            : s.pilihanStudiLanjut === 'Bekerja'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.pilihanStudiLanjut || 'Kuliah'}
                      </span>
                    </div>

                    {/* TKA Mapel Chips */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mapel TKA Pilihan:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-indigo-100/80 text-indigo-900 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                          1. {s.mapelTka1}
                        </span>
                        <span className="bg-purple-100/80 text-purple-900 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                          2. {s.mapelTka2}
                        </span>
                      </div>
                    </div>

                    {/* Target PTN / Prodi */}
                    <div className="text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Studi / PTN:</div>
                      {s.pilihanStudiLanjut === 'Kuliah' || !s.pilihanStudiLanjut ? (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-emerald-950 truncate" title={`${s.ptn1} - ${s.prodiPilihan1}`}>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded mr-1">P1</span>
                            {s.ptn1 ? `${s.ptn1} - ${s.prodiPilihan1}` : s.prodiPilihan1}
                          </p>
                          <p className="text-xs text-slate-600 truncate" title={`${s.ptn2} - ${s.prodiPilihan2}`}>
                            <span className="text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded mr-1">P2</span>
                            {s.ptn2 ? `${s.ptn2} - ${s.prodiPilihan2}` : s.prodiPilihan2}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 italic">
                          Persiapan {s.pilihanStudiLanjut === 'AKADEMI' ? 'AKADEMI (TNI/Kedinasan)' : 'Dunia Kerja & Karir'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      NISN: {s.nisn || '-'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onSelectStudentDetail(s)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                      {!isReadOnly && (
                        <>
                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-100 font-bold tracking-wider uppercase text-[11px]">
                  {!isReadOnly && (
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredStudents.length > 0 &&
                          filteredStudents.every((s) => selectedIds.includes(s.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allFilteredIds = filteredStudents.map((s) => s.id);
                            setSelectedIds(Array.from(new Set([...selectedIds, ...allFilteredIds])));
                          } else {
                            const filteredSet = new Set(filteredStudents.map((s) => s.id));
                            setSelectedIds(selectedIds.filter((id) => !filteredSet.has(id)));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        title="Pilih / Batalkan semua siswa hasil filter"
                      />
                    </th>
                  )}
                  <th className="p-3.5 pl-4">Nama Siswa</th>
                  <th className="p-3.5">NIS / NISN</th>
                  <th className="p-3.5">Mapel TKA 1-2</th>
                  <th className="p-3.5">Studi Lanjut</th>
                  <th className="p-3.5">Prodi Pilihan 1 & 2</th>
                  <th className="p-3.5">Data Prestasi Siswa</th>
                  <th className="p-3.5 text-center">Kelas</th>
                  <th className="p-3.5 text-right pr-5">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isReadOnly ? 8 : 9} className="p-12 text-center text-slate-400">
                      <p className="font-semibold text-sm mb-1">
                        Tidak ada data siswa ditemukan
                      </p>
                      <p className="text-xs">
                        Coba ubah kata kunci pencarian atau reset filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        selectedIds.includes(s.id) ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {!isReadOnly && (
                        <td className="p-3.5 pl-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, s.id]);
                              } else {
                                setSelectedIds(selectedIds.filter((id) => id !== s.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                      )}
                      {/* Nama Siswa */}
                      <td className="p-3.5 pl-5 font-bold text-slate-800 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          {s.fotoSiswa ? (
                            <img
                              src={s.fotoSiswa}
                              alt={s.namaSiswa}
                              className="w-8 h-8 rounded-full object-cover border border-indigo-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {s.namaSiswa.charAt(0)}
                            </span>
                          )}
                          <div>
                            <span className="block leading-tight text-slate-900">{s.namaSiswa}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIS / NISN */}
                      <td className="p-3.5 font-mono text-slate-700 font-medium">
                        <div className="text-xs">{s.nis}</div>
                        <div className="text-[10px] text-slate-400">{s.nisn}</div>
                      </td>

                      {/* Mapel TKA 1 & 2 */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200/60 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            1. {s.mapelTka1}
                          </span>
                          <br />
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200/60 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            2. {s.mapelTka2}
                          </span>
                        </div>
                      </td>

                      {/* Studi Lanjut Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                            s.pilihanStudiLanjut === 'AKADEMI'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : s.pilihanStudiLanjut === 'Bekerja'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {s.pilihanStudiLanjut || 'Kuliah'}
                        </span>
                      </td>

                      {/* Prodi & Universitas Pilihan 1 & 2 */}
                      <td className="p-3.5 font-medium text-slate-800 max-w-[220px]">
                        {s.pilihanStudiLanjut === 'Kuliah' || !s.pilihanStudiLanjut ? (
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold text-emerald-950 leading-tight" title={s.ptn1 ? `${s.ptn1} - ${s.prodiPilihan1}` : s.prodiPilihan1}>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded mr-1">P1</span>
                              {s.ptn1 ? `${s.ptn1} - ${s.prodiPilihan1}` : s.prodiPilihan1}
                            </div>
                            <div className="text-[10px] text-slate-600 leading-tight" title={s.ptn2 ? `${s.ptn2} - ${s.prodiPilihan2}` : s.prodiPilihan2}>
                              <span className="text-[9px] font-bold text-teal-700 bg-teal-100/80 px-1.5 py-0.2 rounded mr-1">P2</span>
                              {s.ptn2 ? `${s.ptn2} - ${s.prodiPilihan2}` : s.prodiPilihan2}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Persiapan {s.pilihanStudiLanjut === 'AKADEMI' ? 'AKADEMI (TNI/Kedinasan)' : 'Dunia Kerja'}
                          </span>
                        )}
                      </td>

                      {/* Prestasi Dapodik */}
                      <td className="p-3.5">
                        {s.prestasiList && s.prestasiList.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]"
                            title={s.prestasiList.map((p) => p.namaPrestasi).join(', ')}
                          >
                            <Award className="w-3 h-3 text-amber-600" />
                            {s.prestasiList.length} Sertifikat
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* Kelas */}
                      <td className="p-3.5 text-center">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {s.kelas}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onSelectStudentDetail(s)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Lihat Detail Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => onEditStudent(s)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Data Siswa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(s.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Data Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Sebelunnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-xl font-bold transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Berikutnya <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Table Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Format Isian Data Sesuai Standar Administrasi TKA & Studi Lanjut</span>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-3">
            {onClearData && (
              <button
                onClick={() => setShowConfirmModal('clear')}
                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 underline font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Data seluruh siswa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Filter / Selected Students Delete */}
      {showFilterDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Hapus {selectedIds.length > 0 ? `${selectedIds.length} Siswa Terpilih` : `${filteredStudents.length} Siswa Hasil Filter`}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Apakah Anda yakin ingin menghapus{' '}
                  <span className="font-bold text-slate-800">
                    {selectedIds.length > 0 ? selectedIds.length : filteredStudents.length} data siswa
                  </span>{' '}
                  ini? Data akan dihapus dari aplikasi, database Firestore, dan diperbarui secara realtime di Google Sheets.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFilterDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const targetIds = selectedIds.length > 0 ? selectedIds : filteredStudents.map((s) => s.id);
                  if (onDeleteMultipleStudents) {
                    onDeleteMultipleStudents(targetIds);
                  } else {
                    targetIds.forEach((id) => onDeleteStudent(id));
                  }
                  setSelectedIds([]);
                  setShowFilterDeleteModal(false);
                  showToast(`Berhasil menghapus ${targetIds.length} data siswa dan memperbarui Google Sheets!`);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
              >
                Ya, Hapus {selectedIds.length > 0 ? `${selectedIds.length} Data` : `${filteredStudents.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Hapus Seluruh Data Siswa TKA &amp; Studi Lanjut?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Tindakan ini akan MENGHAPUS SELURUH ({students.length}) data siswa TKA dari aplikasi, database Firestore, dan Google Sheets secara realtime.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => startAnimatedProcess('clear')}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all bg-rose-600 hover:bg-rose-700"
              >
                Ya, Hapus Seluruh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Process Modal Overlay */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5 border border-slate-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              {processProgress < 100 ? (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  {processType === 'clear' ? (
                    <Trash2 className="w-7 h-7 text-rose-600 animate-pulse" />
                  ) : (
                    <RotateCcw className="w-7 h-7 text-amber-600 animate-spin" style={{ animationDuration: '2s' }} />
                  )}
                </>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {processType === 'clear' ? 'Memproses Pengosongan Data Dummy...' : 'Memuat Data Sampel...'}
              </h3>
              <p className="text-xs text-slate-500 font-medium min-h-[32px] flex items-center justify-center leading-snug px-2">
                {processStepText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    processType === 'clear' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${processProgress}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold text-right">
                {processProgress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          showToast(`Berhasil mengimpor ${count} data siswa dari file Excel/CSV!`);
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-800">
              Konfirmasi Hapus Siswa
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

