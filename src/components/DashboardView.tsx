import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Sparkles,
  FileSpreadsheet,
  Building2,
  Award,
  Calendar,
  Clock,
  Info,
  Layers,
  CalendarDays,
  FileText,
  AlertCircle,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Student, NavigationTab } from '../types';

interface DashboardViewProps {
  students: Student[];
  setActiveTab: (tab: NavigationTab) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  setActiveTab,
  onSelectStudentDetail,
}) => {
  const [scheduleSubTab, setScheduleSubTab] = useState<'timeline' | 'sessions'>('timeline');

  // Timeline data for TKA & AN 2026
  const timelineData = [
    {
      no: 1,
      tanggal: '27 Juli s.d. 27 September 2026',
      kegiatan: 'Pendaftaran Peserta TKA dan AN',
      keterangan: 'Jenjang SMA/MA/SMALB/Paket C/PKPPS Ulya dan SMK/MAK',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      no: 2,
      tanggal: '21 s.d. 27 September 2026',
      kegiatan: 'Simulasi TKA dan AN',
      keterangan: 'Uji coba teknis & infrastruktur ujian',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      no: 3,
      tanggal: '5 s.d. 11 Oktober 2026',
      kegiatan: 'Gladi Bersih TKA dan AN Gelombang 1',
      keterangan: 'Pemantapan Gladi Gelombang 1',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      no: 4,
      tanggal: '12 s.d. 18 Oktober 2026',
      kegiatan: 'Gladi Bersih TKA dan AN Gelombang 2',
      keterangan: 'Pemantapan Gladi Gelombang 2',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      no: 5,
      tanggal: '26 s.d. 29 Oktober 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Gelombang 1',
      keterangan: 'Mata Pelajaran Wajib',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      no: 6,
      tanggal: '31 Oktober s.d. 1 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Gelombang Khusus',
      keterangan: 'Gelombang Khusus Mata Pelajaran Wajib',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      no: 7,
      tanggal: '2 s.d. 5 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Gelombang 2',
      keterangan: 'Mata Pelajaran Wajib',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      no: 8,
      tanggal: '7 s.d. 8 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Gelombang Khusus',
      keterangan: 'Gelombang Khusus Mata Pelajaran Pilihan',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      no: 9,
      tanggal: '16 s.d. 19 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Susulan Gelombang 1',
      keterangan: 'Susulan Gelombang 1',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      no: 10,
      tanggal: '21 s.d. 22 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Susulan Gelombang Khusus',
      keterangan: 'Gelombang Khusus Mata Pelajaran Wajib',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      no: 11,
      tanggal: '23 s.d. 26 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Susulan Gelombang 2',
      keterangan: 'Susulan Gelombang 2',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      no: 12,
      tanggal: '28 s.d. 29 November 2026',
      kegiatan: 'Pelaksanaan TKA dan AN Susulan Gelombang Khusus',
      keterangan: 'Gelombang Khusus Mata Pelajaran Pilihan',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      no: 13,
      tanggal: '23 Desember 2026',
      kegiatan: 'Pengumuman Hasil TKA',
      keterangan: 'Pengumuman Resmi Nilai TKA',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold'
    },
  ];

  // Daily session breakdown data
  const sessionDays = [
    {
      day: 'HARI I',
      title: 'Bahasa Indonesia Wajib, Literasi Membaca & Survei Karakter',
      color: 'border-l-indigo-500 bg-indigo-50/30',
      tagColor: 'bg-indigo-100 text-indigo-800',
      sessions: [
        { ses: 'Sesi 1', wib: '07.00 – 08.45', wita: '08.00 – 09.45', wit: '09.00 – 10.45' },
        { ses: 'Sesi 2', wib: '09.30 – 11.15', wita: '10.30 – 12.15', wit: '11.30 – 13.15' },
        { ses: 'Sesi 3', wib: '12.00 – 13.45', wita: '13.00 – 14.45', wit: '14.00 – 15.45' },
      ],
      rincian: [
        'Latihan (5 menit)',
        'Bahasa Indonesia Wajib dan Literasi Membaca (75 menit)',
        'Survei Karakter (25 menit)',
      ],
    },
    {
      day: 'HARI II',
      title: 'Bahasa Inggris Wajib & Survei Lingkungan Belajar',
      color: 'border-l-blue-500 bg-blue-50/30',
      tagColor: 'bg-blue-100 text-blue-800',
      sessions: [
        { ses: 'Sesi 1', wib: '07.00 – 08.45', wita: '08.00 – 09.45', wit: '09.00 – 10.45' },
        { ses: 'Sesi 2', wib: '09.30 – 11.15', wita: '10.30 – 12.15', wit: '11.30 – 13.15' },
        { ses: 'Sesi 3', wib: '12.00 – 13.45', wita: '13.00 – 14.45', wit: '14.00 – 15.45' },
      ],
      rincian: [
        'Latihan (5 menit)',
        'Bahasa Inggris Wajib (75 menit)',
        'Survei Lingkungan Belajar (25 menit)',
      ],
    },
    {
      day: 'HARI III',
      title: 'Matematika Wajib dan Numerasi',
      color: 'border-l-teal-500 bg-teal-50/30',
      tagColor: 'bg-teal-100 text-teal-800',
      sessions: [
        { ses: 'Sesi 1', wib: '07.00 – 08.20', wita: '08.00 – 09.20', wit: '09.00 – 10.20' },
        { ses: 'Sesi 2', wib: '09.05 – 10.25', wita: '10.05 – 11.25', wit: '11.05 – 12.25' },
        { ses: 'Sesi 3', wib: '11.10 – 12.30', wita: '12.10 – 13.30', wit: '13.10 – 14.30' },
      ],
      rincian: [
        'Latihan (5 menit)',
        'Matematika Wajib dan Numerasi (75 menit)',
      ],
    },
    {
      day: 'HARI IV',
      title: 'Mata Pelajaran Pilihan Pertama & Kedua',
      color: 'border-l-purple-500 bg-purple-50/30',
      tagColor: 'bg-purple-100 text-purple-800',
      sessions: [
        { ses: 'Sesi 1', wib: '07.00 – 09.05', wita: '08.00 – 10.05', wit: '09.00 – 11.05' },
      ],
      rincian: [
        'Latihan (5 menit)',
        'Mata Pelajaran Pilihan Pertama (60 menit)',
        'Mata Pelajaran Pilihan Kedua (60 menit)',
      ],
    },
  ];
  // Calculate Mapel TKA frequencies
  const mapelFrequency: Record<string, number> = {};
  students.forEach((s) => {
    if (s.mapelTka1) mapelFrequency[s.mapelTka1] = (mapelFrequency[s.mapelTka1] || 0) + 1;
    if (s.mapelTka2) mapelFrequency[s.mapelTka2] = (mapelFrequency[s.mapelTka2] || 0) + 1;
  });

  const sortedMapel = Object.entries(mapelFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Calculate Prodi frequencies
  const prodiFrequency: Record<string, number> = {};
  students.forEach((s) => {
    if (s.prodiPilihan1) prodiFrequency[s.prodiPilihan1] = (prodiFrequency[s.prodiPilihan1] || 0) + 1;
    if (s.prodiPilihan2) prodiFrequency[s.prodiPilihan2] = (prodiFrequency[s.prodiPilihan2] || 0) + 1;
  });

  const sortedProdi = Object.entries(prodiFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Calculate completeness
  const completeCount = students.filter(
    (s) => s.namaSiswa && s.nis && s.nisn && s.mapelTka1 && s.mapelTka2 && s.prodiPilihan1 && s.prodiPilihan2
  ).length;

  // Study Pathway Distribution for Recharts
  const pathwayCounts: Record<string, number> = {
    'AKADEMI': 0,
    'Kuliah': 0,
    'Bekerja': 0,
  };
  students.forEach((s) => {
    const p = s.pilihanStudiLanjut;
    if (p) {
      if (pathwayCounts[p] !== undefined) {
        pathwayCounts[p]++;
      } else {
        pathwayCounts[p] = (pathwayCounts[p] || 0) + 1;
      }
    }
  });

  const pathwayChartData = Object.entries(pathwayCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  const PATHWAY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  const mapelChartData = Object.entries(mapelFrequency).map(([subject, count]) => ({
    subject,
    jumlah: count,
  }));

  return (
    <div className="space-y-6">
      {/* Banner Welcome */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> SITAKA 2026 • Portal Terpadu Sekolah
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mb-2">
            Selamat Datang di <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">SITAKA</span>
          </h1>
          <p className="text-slate-200 text-xs lg:text-sm leading-relaxed mb-6 font-medium">
            <strong className="text-amber-300 font-bold">SITAKA</strong> (Sistem Informasi Tes Akademik, Karir, & Administrasi) — Portal resmi pendataan siswa kelas XII untuk persiapan Tes Kemampuan Akademik (TKA), kelayakan laptop ujian, serta rujukan program studi PTN (Studi Lanjut).
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('form')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              <UserPlus className="w-4 h-4" />
              Input Data Siswa Baru
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Lihat Daftar Siswa ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('appscript')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Google Apps Script
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Data Fields Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((completeCount / (students.length || 1)) * 100)}% Lengkap
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mb-0.5">
            {students.length} Siswa
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Total Siswa Terdaftar (NIS & NISN)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Mapel 1 & Mapel 2
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mb-0.5">
            {Object.keys(mapelFrequency).length} Variasi
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Mata Pelajaran Pilihan TKA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Prodi 1 & Prodi 2
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mb-0.5">
            {Object.keys(prodiFrequency).length} Pilihan
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Program Studi Perguruan Tinggi
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Status Valid
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mb-0.5">
            {completeCount} / {students.length}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Siswa dengan Isian Data Utuh
          </p>
        </div>
      </div>

      {/* Mandatory Data Fields Highlights Panel */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Skema Isian Data Siswa TKA Terstruktur
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Aplikasi mengelola 7 atribut wajib administrasi yang terintegrasi secara otomatis dengan Google Apps Script:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-[10px] uppercase font-bold">1</div>
            <div className="font-semibold text-slate-200">Nama Siswa</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-[10px] uppercase font-bold">2</div>
            <div className="font-semibold text-slate-200">NIS</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-[10px] uppercase font-bold">3</div>
            <div className="font-semibold text-slate-200">NISN</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-indigo-400 text-[10px] uppercase font-bold">4</div>
            <div className="font-semibold text-indigo-300">Mapel TKA 1</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-indigo-400 text-[10px] uppercase font-bold">5</div>
            <div className="font-semibold text-indigo-300">Mapel TKA 2</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-emerald-400 text-[10px] uppercase font-bold">6</div>
            <div className="font-semibold text-emerald-300">Prodi Pilihan 1</div>
          </div>
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
            <div className="text-emerald-400 text-[10px] uppercase font-bold">7</div>
            <div className="font-semibold text-emerald-300">Prodi Pilihan 2</div>
          </div>
        </div>
      </div>

      {/* SECTION JADWAL TKA & AN 2026 */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 mb-1.5">
              <Calendar className="w-3.5 h-3.5" /> Agenda Resmi Nasional 2026
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Jadwal Pelaksanaan Tes Kemampuan Akademik (TKA) & Asesmen Nasional 2026
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Jenjang SMA / MA / SMALB / Paket C / PKPPS Ulya dan SMK / MAK
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setScheduleSubTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scheduleSubTab === 'timeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Lini Masa Agenda (13)
            </button>
            <button
              onClick={() => setScheduleSubTab('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scheduleSubTab === 'sessions'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Rincian Sesi & Waktu Harian
            </button>
          </div>
        </div>

        {/* TAB 1: LINI MASA TIMELINE */}
        {scheduleSubTab === 'timeline' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 mb-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Informasi Lini Masa: </span>
                Pelaksanaan TKA & AN terbagi dalam beberapa gelombang ujian utama dan susulan. Harap memantau jadwal pendaftaran, simulasi, hingga pengumuman nilai hasil TKA pada <strong>23 Desember 2026</strong>.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold rounded-lg">
                    <th className="p-3 rounded-l-xl w-12 text-center">No</th>
                    <th className="p-3 w-56">Tanggal Pelaksanaan</th>
                    <th className="p-3">Kegiatan Pelaksanaan TKA & AN</th>
                    <th className="p-3 rounded-r-xl">Keterangan / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timelineData.map((item) => (
                    <tr key={item.no} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3 font-bold text-slate-500 text-center">{item.no}</td>
                      <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{item.tanggal}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{item.kegiatan}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] border font-medium ${item.badgeColor}`}>
                          {item.keterangan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RINCIAN SESI & WAKTU HARIAN */}
        {scheduleSubTab === 'sessions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex flex-wrap gap-x-6 gap-y-1 items-center">
              <span className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Tanggal Gelombang Pelaksanaan:
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">Gel. 1: 26–29 Okt 2026</span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">Gel. Khusus (Wajib): 31 Okt – 1 Nov 2026</span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">Gel. 2: 2–5 Nov 2026</span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">Gel. Khusus (Pilihan): 7–8 Nov 2026</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessionDays.map((sd) => (
                <div key={sd.day} className={`p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 ${sd.color}`}>
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${sd.tagColor}`}>
                      {sd.day}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Jadwal Sesi & Durasi
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-snug">
                    {sd.title}
                  </h4>

                  {/* Sesi Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200/80 p-2">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-bold">
                          <th className="py-1 px-1.5">Sesi</th>
                          <th className="py-1 px-1.5 text-indigo-700">WIB</th>
                          <th className="py-1 px-1.5 text-indigo-700">WITA</th>
                          <th className="py-1 px-1.5 text-indigo-700">WIT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {sd.sessions.map((s) => (
                          <tr key={s.ses}>
                            <td className="py-1.5 px-1.5 font-bold font-sans text-slate-800">{s.ses}</td>
                            <td className="py-1.5 px-1.5 text-slate-700">{s.wib}</td>
                            <td className="py-1.5 px-1.5 text-slate-700">{s.wita}</td>
                            <td className="py-1.5 px-1.5 text-slate-700">{s.wit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Detail Alokasi Waktu */}
                  <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/60 text-[11px] space-y-1">
                    <span className="font-bold text-slate-700 text-[10px] uppercase block tracking-wider mb-1">
                      Rincian Alokasi Ujian:
                    </span>
                    {sd.rincian.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Charts & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top TKA Subjects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Mata Pelajaran TKA Favorit
              </h3>
              <p className="text-xs text-slate-500">
                Pilihan Mapel 1 dan Mapel 2 TKA terbanyak
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analysis')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sortedMapel.map(([name, count], index) => {
              const totalChoices = students.length * 2 || 1;
              const percentage = Math.round((count / totalChoices) * 100);

              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      {name}
                    </span>
                    <span className="text-slate-500">
                      {count} siswa ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage * 2.5, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Study Programs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Program Studi & PTN Terfavorit
              </h3>
              <p className="text-xs text-slate-500">
                Pilihan Prodi 1 & 2 Studi Lanjut siswa
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analysis')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sortedProdi.map(([name, count], index) => {
              const totalChoices = students.length * 2 || 1;
              const percentage = Math.round((count / totalChoices) * 100);

              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-2 truncate pr-2">
                      <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="truncate">{name}</span>
                    </span>
                    <span className="text-slate-500 shrink-0">
                      {count} siswa
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage * 3, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recharts Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Pathways Pie/Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                Visualisasi Jalur Studi Lanjut
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi pilihan siswa (Akademi, Kuliah, Bekerja)
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
              Recharts Pie
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pathwayChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pathwayChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PATHWAY_COLORS[index % PATHWAY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} siswa`, 'Jumlah']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TKA Subjects Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Grafik Batang Peminatan Mapel TKA
              </h3>
              <p className="text-xs text-slate-500">
                Frekuensi pilihan mata pelajaran TKA seluruh siswa
              </p>
            </div>
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
              Recharts Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mapelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(value: any) => [`${value} siswa`, 'Jumlah Peminat']} />
                <Bar dataKey="jumlah" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Students Table Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Pembaruan Data Siswa Terakhir
            </h3>
            <p className="text-xs text-slate-500">
              Daftar siswa yang baru diperbarui atau diinputkan
            </p>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Kelola Semua Siswa <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3 rounded-l-lg">Nama Siswa</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Mapel TKA 1 & 2</th>
                <th className="p-3">Prodi Pilihan 1</th>
                <th className="p-3 rounded-r-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      {s.fotoSiswa ? (
                        <img
                          src={s.fotoSiswa}
                          alt={s.namaSiswa}
                          className="w-7 h-7 rounded-full object-cover border border-indigo-200 shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {s.namaSiswa.charAt(0)}
                        </span>
                      )}
                      <span>{s.namaSiswa}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    {s.nis} / {s.nisn}
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {s.kelas}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit text-[11px]">
                        1. {s.mapelTka1}
                      </span>
                      <span className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded w-fit text-[11px]">
                        2. {s.mapelTka2}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-700 font-medium truncate max-w-[180px]">
                    {s.prodiPilihan1}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectStudentDetail(s)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
