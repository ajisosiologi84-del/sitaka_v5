import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  School,
  TrendingUp,
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldAlert,
  Info,
  Layers,
  Search,
  User,
  ArrowRight,
  Trash2,
  Loader2
} from 'lucide-react';
import { Student } from '../types';

interface SnbpCalculatorViewProps {
  students?: Student[];
  userRole?: string | null;
}

// Popular PTN & Keketatan Reference Dataset
const POPULAR_PTN_PRODI = [
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Pendidikan Dokter', keketatan: 1.8, rumpun: 'Saintek' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Ilmu Komputer', keketatan: 2.2, rumpun: 'Saintek' },
  { ptn: 'Universitas Indonesia (UI)', prodi: 'Hukum', keketatan: 3.1, rumpun: 'Soshum' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'STEI - Komputasi', keketatan: 2.0, rumpun: 'Saintek' },
  { ptn: 'Institut Teknologi Bandung (ITB)', prodi: 'FTI - Industri', keketatan: 3.5, rumpun: 'Saintek' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Kedokteran', keketatan: 1.5, rumpun: 'Saintek' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Psikologi', keketatan: 2.8, rumpun: 'Soshum' },
  { ptn: 'Universitas Gadjah Mada (UGM)', prodi: 'Manajemen', keketatan: 3.2, rumpun: 'Soshum' },
  { ptn: 'Institut Teknologi Sepuluh Nopember (ITS)', prodi: 'Teknik Informatika', keketatan: 2.9, rumpun: 'Saintek' },
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Kedokteran', keketatan: 2.1, rumpun: 'Saintek' },
  { ptn: 'Universitas Padjadjaran (UNPAD)', prodi: 'Ilmu Komunikasi', keketatan: 3.0, rumpun: 'Soshum' },
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Hukum', keketatan: 4.1, rumpun: 'Soshum' },
  { ptn: 'Universitas Diponegoro (UNDIP)', prodi: 'Informatika', keketatan: 3.8, rumpun: 'Saintek' },
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Kedokteran', keketatan: 2.4, rumpun: 'Saintek' },
  { ptn: 'Universitas Brawijaya (UB)', prodi: 'Manajemen', keketatan: 4.5, rumpun: 'Soshum' },
  { ptn: 'Universitas Sebelas Maret (UNS)', prodi: 'Kedokteran', keketatan: 2.6, rumpun: 'Saintek' },
  { ptn: 'Universitas Airlangga (UNAIR)', prodi: 'Kedokteran', keketatan: 2.0, rumpun: 'Saintek' },
  { ptn: 'Universitas Negeri Yogyakarta (UNY)', prodi: 'Pendidikan Matematika', keketatan: 6.2, rumpun: 'Saintek' },
  { ptn: 'Universitas Negeri Malang (UM)', prodi: 'Pendidikan Bahasa Inggris', keketatan: 7.0, rumpun: 'Soshum' },
];

export const SnbpCalculatorView: React.FC<SnbpCalculatorViewProps> = ({
  students = [],
  userRole,
}) => {
  // Selected Student from SITAKA DB or Custom Entry
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Form States
  const [namaSiswa, setNamaSiswa] = useState<string>('Siswa Simulasi');
  const [sekolah, setSekolah] = useState<string>('SMA Negeri 1');
  const [akreditasiSekolah, setAkreditasiSekolah] = useState<'A' | 'B' | 'C'>('A');
  const [indeksAlumni, setIndeksAlumni] = useState<number>(85); // 50 - 100

  // Grades per Semester
  const [sem1, setSem1] = useState<number>(86);
  const [sem2, setSem2] = useState<number>(87);
  const [sem3, setSem3] = useState<number>(88);
  const [sem4, setSem4] = useState<number>(89);
  const [sem5, setSem5] = useState<number>(91);

  // Supporting Subject (Mapel Pendukung)
  const [mapelPendukung1, setMapelPendukung1] = useState<string>('Matematika Lanjut');
  const [nilaiMapel1, setNilaiMapel1] = useState<number>(90);
  const [mapelPendukung2, setMapelPendukung2] = useState<string>('Fisika');
  const [nilaiMapel2, setNilaiMapel2] = useState<number>(88);

  // Prestasi / Certificates
  const [prestasiTingkat, setPrestasiTingkat] = useState<'Internasional' | 'Nasional' | 'Provinsi' | 'Kabupaten' | 'Tidak Ada'>('Provinsi');
  const [prestasiJuara, setPrestasiJuara] = useState<'Juara 1' | 'Juara 2' | 'Juara 3' | 'Peserta / Finalis'>('Juara 1');
  const [jenisPrestasi, setJenisPrestasi] = useState<'Akademik' | 'Non-Akademik'>('Akademik');

  // Choices
  const [ptn1, setPtn1] = useState<string>('Universitas Indonesia (UI)');
  const [prodi1, setProdi1] = useState<string>('Ilmu Komputer');
  const [keketatan1, setKeketatan1] = useState<number>(2.2); // %

  const [ptn2, setPtn2] = useState<string>('Universitas Gadjah Mada (UGM)');
  const [prodi2, setProdi2] = useState<string>('Psikologi');
  const [keketatan2, setKeketatan2] = useState<number>(2.8); // %

  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Filtered Students for picker
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students.slice(0, 8);
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.namaSiswa.toLowerCase().includes(q) ||
        s.nis.includes(q) ||
        s.kelas.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [students, studentSearch]);

  // Handle selecting a student from SITAKA
  const handleSelectStudent = (st: Student) => {
    setSelectedStudentId(st.id);
    setNamaSiswa(st.namaSiswa);
    setSekolah('SMA Negeri SITAKA');
    if (st.ptn1) setPtn1(st.ptn1);
    if (st.prodiPilihan1) setProdi1(st.prodiPilihan1);
    if (st.ptn2) setPtn2(st.ptn2);
    if (st.prodiPilihan2) setProdi2(st.prodiPilihan2);
    if (st.mapelTka1) setMapelPendukung1(st.mapelTka1);
    if (st.mapelTka2) setMapelPendukung2(st.mapelTka2);
  };

  // Weight Configuration (Default: 50% Rapor + 50% Mapel Pendukung)
  const [bobotRapor, setBobotRapor] = useState<number>(50); // Maks 50%
  const bobotMapelPendukung = useMemo(() => 100 - bobotRapor, [bobotRapor]);

  // Calculations
  const rataRataRapor = useMemo(() => {
    const sum = Number(sem1) + Number(sem2) + Number(sem3) + Number(sem4) + Number(sem5);
    return Math.round((sum / 5) * 100) / 100;
  }, [sem1, sem2, sem3, sem4, sem5]);

  const rataRataMapelPendukung = useMemo(() => {
    return Math.round(((Number(nilaiMapel1) + Number(nilaiMapel2)) / 2) * 100) / 100;
  }, [nilaiMapel1, nilaiMapel2]);

  // Formula Resmi SNBP Permendikbud (Maks 50% Rapor + Maks 50% Mapel Pendukung)
  // Skala 100
  const nilaiMurni100 = useMemo(() => {
    const pRapor = (rataRataRapor * bobotRapor) / 100;
    const pMapel = (rataRataMapelPendukung * bobotMapelPendukung) / 100;
    return Math.round((pRapor + pMapel) * 100) / 100;
  }, [rataRataRapor, rataRataMapelPendukung, bobotRapor, bobotMapelPendukung]);

  // Skala 100 (Komponen 1: Max 50 Poin + Komponen 2: Max 50 Poin)
  const skorRaporPoin = useMemo(() => Math.round(((rataRataRapor * bobotRapor) / 100) * 10) / 10, [rataRataRapor, bobotRapor]);
  const skorMapelPoin = useMemo(() => Math.round(((rataRataMapelPendukung * bobotMapelPendukung) / 100) * 10) / 10, [rataRataMapelPendukung, bobotMapelPendukung]);

  // Trend Bonus (Skala 100)
  const trendRapor = useMemo(() => {
    const isUp = sem5 >= sem4 && sem4 >= sem3 && sem3 >= sem2 && sem2 >= sem1;
    if (isUp) return 1.5; // Bonus +1.5 Poin
    if (sem5 >= sem1) return 0.5;
    return 0;
  }, [sem1, sem2, sem3, sem4, sem5]);

  // Bonus Prestasi (Skala 100)
  const bonusPrestasiScore = useMemo(() => {
    if (prestasiTingkat === 'Tidak Ada') return 0;
    let base = 0;
    if (prestasiTingkat === 'Internasional') base = 5.0;
    else if (prestasiTingkat === 'Nasional') base = 3.5;
    else if (prestasiTingkat === 'Provinsi') base = 2.0;
    else if (prestasiTingkat === 'Kabupaten') base = 1.0;

    let multiplier = 1;
    if (prestasiJuara === 'Juara 1') multiplier = 1.0;
    else if (prestasiJuara === 'Juara 2') multiplier = 0.85;
    else if (prestasiJuara === 'Juara 3') multiplier = 0.7;
    else multiplier = 0.5;

    let typeBonus = jenisPrestasi === 'Akademik' ? 1.1 : 1.0;

    return Math.round(base * multiplier * typeBonus * 10) / 10;
  }, [prestasiTingkat, prestasiJuara, jenisPrestasi]);

  // Indeks Sekolah Score
  const indeksSekolahScore = useMemo(() => {
    let akredBonus = 100;
    if (akreditasiSekolah === 'B') akredBonus = 85;
    if (akreditasiSekolah === 'C') akredBonus = 70;

    return Math.round((akredBonus * 0.6) + (indeksAlumni * 0.4));
  }, [akreditasiSekolah, indeksAlumni]);

  // Final Composite Score (Skala 100)
  const skorAkhirSnbp = useMemo(() => {
    const baseSkor = skorRaporPoin + skorMapelPoin;
    const faktorSekolah = 0.85 + (indeksSekolahScore / 100) * 0.15; // range 0.85 - 1.00
    const total = baseSkor * faktorSekolah + bonusPrestasiScore + trendRapor;
    return Math.min(100, Math.max(0, Math.round(total * 10) / 10));
  }, [skorRaporPoin, skorMapelPoin, indeksSekolahScore, bonusPrestasiScore, trendRapor]);

  // Evaluate Peluang Lolos for Choice 1 & Choice 2
  const getPeluang = (keketatanPct: number) => {
    // Target minimal skor (skala 100)
    let requiredScore = 80;
    if (keketatanPct < 2) requiredScore = 88;
    else if (keketatanPct < 4) requiredScore = 84;
    else if (keketatanPct < 8) requiredScore = 79;
    else requiredScore = 73;

    const diff = skorAkhirSnbp - requiredScore;

    if (diff >= 4) {
      return {
        label: 'SANGAT TINGGI',
        color: 'bg-emerald-500 text-white border-emerald-600',
        textColor: 'text-emerald-700',
        bgLight: 'bg-emerald-50 border-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        pct: '85% - 95%',
        desc: 'Nilai rapor & rekam jejak sekolah Anda sangat kuat untuk prodi ini.'
      };
    } else if (diff >= 0) {
      return {
        label: 'OPTIMAL / TINGGI',
        color: 'bg-teal-600 text-white border-teal-700',
        textColor: 'text-teal-700',
        bgLight: 'bg-teal-50 border-teal-200',
        icon: <Sparkles className="w-5 h-5 text-teal-600" />,
        pct: '65% - 84%',
        desc: 'Kompetitif! Peluang lolos terbuka lebar jika belum ada alumni bertumpuk di prodi yang sama.'
      };
    } else if (diff >= -4) {
      return {
        label: 'MODERAT / SEDANG',
        color: 'bg-amber-500 text-white border-amber-600',
        textColor: 'text-amber-700',
        bgLight: 'bg-amber-50 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        pct: '45% - 64%',
        desc: 'Berada di batas kompetisi. Disarankan menyiapkan sertifikat pendukung atau prodi cadangan.'
      };
    } else {
      return {
        label: 'BERISIKO TINGGI',
        color: 'bg-rose-500 text-white border-rose-600',
        textColor: 'text-rose-700',
        bgLight: 'bg-rose-50 border-rose-200',
        icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
        pct: '< 45%',
        desc: 'Keketatan sangat tinggi dibanding modal nilai saat ini. Disarankan pertimbangkan Pilihan 2 yang lebih aman.'
      };
    }
  };

  const peluangChoice1 = getPeluang(keketatan1);
  const peluangChoice2 = getPeluang(keketatan2);

  // Quick autofill preset from popular list
  const handleApplyPreset1 = (item: typeof POPULAR_PTN_PRODI[0]) => {
    setPtn1(item.ptn);
    setProdi1(item.prodi);
    setKeketatan1(item.keketatan);
  };

  const handleApplyPreset2 = (item: typeof POPULAR_PTN_PRODI[0]) => {
    setPtn2(item.ptn);
    setProdi2(item.prodi);
    setKeketatan2(item.keketatan);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const [isClearingForm, setIsClearingForm] = useState(false);
  const [clearingProgress, setClearingProgress] = useState(0);

  const handleResetForm = () => {
    setIsClearingForm(true);
    setClearingProgress(15);

    setTimeout(() => {
      setClearingProgress(60);
    }, 250);

    setTimeout(() => {
      setClearingProgress(100);
    }, 550);

    setTimeout(() => {
      setSelectedStudentId('');
      setNamaSiswa('');
      setSekolah('');
      setAkreditasiSekolah('A');
      setIndeksAlumni(80);
      setSem1(0);
      setSem2(0);
      setSem3(0);
      setSem4(0);
      setSem5(0);
      setMapelPendukung1('');
      setNilaiMapel1(0);
      setMapelPendukung2('');
      setNilaiMapel2(0);
      setPrestasiTingkat('Tidak Ada');
      setPrestasiJuara('Peserta / Finalis');
      setJenisPrestasi('Akademik');
      setPtn1('');
      setProdi1('');
      setKeketatan1(2.5);
      setPtn2('');
      setProdi2('');
      setKeketatan2(3.0);

      setIsClearingForm(false);
    }, 950);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-700/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/20">
              <Calculator className="w-3.5 h-3.5 text-teal-300" /> SIMULATOR RASIONALISASI SNBP 2026
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Simulasi Kalkulator Lolos SNBP
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hitung estimasi skor rasionalisasi SNBP secara matematis berdasarkan Rata-rata Rapor (S1-S5), Mata Pelajaran Pendukung (TKA), Bonus Sertifikat Prestasi, serta Indeks Akreditasi Sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-400/30 backdrop-blur-sm transition-all"
              title="Kosongkan seluruh nilai dan pilihan prodi di form simulasi"
            >
              <RotateCcw className="w-4 h-4" /> Kosongkan Form Simulasi
            </button>
            <button
              type="button"
              onClick={handlePrintReport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak Hasil Simulasi
            </button>
          </div>
        </div>
      </div>

      {/* Student Picker from SITAKA (Optional) */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">Pilih Data Siswa dari Database SITAKA</h3>
            </div>
            <span className="text-xs text-slate-500">Otomatis mengisi nama & prodi pilihan</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama siswa / NIS..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {filteredStudents.map((st) => (
              <button
                key={st.id}
                onClick={() => handleSelectStudent(st)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  selectedStudentId === st.id
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-medium ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold truncate">{st.namaSiswa}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {st.kelas} • NIS: {st.nis}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Input Form (Left) & Calculation Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Data Identitas Siswa & Sekolah */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">1. Data Profil & Indeks Sekolah</h3>
                <p className="text-xs text-slate-500">Bobot pengaruh rekam jejak sekolah di SNBP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={namaSiswa}
                  onChange={(e) => setNamaSiswa(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah / SMA</label>
                <input
                  type="text"
                  value={sekolah}
                  onChange={(e) => setSekolah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Akreditasi Sekolah</label>
                <select
                  value={akreditasiSekolah}
                  onChange={(e) => setAkreditasiSekolah(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="A">Akreditasi A (Kuota 40% Siswa Terbaik)</option>
                  <option value="B">Akreditasi B (Kuota 25% Siswa Terbaik)</option>
                  <option value="C">Akreditasi C (Kuota 5% Siswa Terbaik)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimasi Indeks Alumni & Rekam Jejak (50 - 100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={indeksAlumni}
                    onChange={(e) => setIndeksAlumni(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    {indeksAlumni}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Nilai Rapor Semester 1 - 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2. Rata-rata Nilai Rapor (Sem 1 - 5)</h3>
                  <p className="text-xs text-slate-500">Bobot komponen utama SNBP (50% - 75%)</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">RATA-RATA RAPOR</span>
                <span className="text-lg font-black text-teal-700 bg-teal-50 px-3 py-0.5 rounded-xl border border-teal-200">
                  {rataRataRapor}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { label: 'Sem 1', val: sem1, set: setSem1 },
                { label: 'Sem 2', val: sem2, set: setSem2 },
                { label: 'Sem 3', val: sem3, set: setSem3 },
                { label: 'Sem 4', val: sem4, set: setSem4 },
                { label: 'Sem 5', val: sem5, set: setSem5 },
              ].map((s, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">{s.label}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={s.val}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full text-center font-extrabold text-sm py-1 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {trendRapor > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Grafik Nilai Positif!</strong> Anda mendapatkan bonus estimasi trend kenaikan nilai konsisten sebesar <strong>+{trendRapor} Poin</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Mata Pelajaran Pendukung (TKA) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">3. Mata Pelajaran Pendukung Prodi (TKA)</h3>
                  <p className="text-xs text-slate-500">Nilai mata pelajaran pilihan / spesifik yang relevan</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">RATA MAPEL PENDUKUNG</span>
                <span className="text-lg font-black text-sky-700 bg-sky-50 px-3 py-0.5 rounded-xl border border-sky-200">
                  {rataRataMapelPendukung}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Mapel Pendukung 1</label>
                <input
                  type="text"
                  value={mapelPendukung1}
                  onChange={(e) => setMapelPendukung1(e.target.value)}
                  placeholder="Misal: Matematika Lanjut"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Nilai Rapor Mapel 1:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilaiMapel1}
                    onChange={(e) => setNilaiMapel1(Number(e.target.value))}
                    className="w-20 text-center font-bold px-2 py-1 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Mapel Pendukung 2</label>
                <input
                  type="text"
                  value={mapelPendukung2}
                  onChange={(e) => setMapelPendukung2(e.target.value)}
                  placeholder="Misal: Fisika / Biologi"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Nilai Rapor Mapel 2:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilaiMapel2}
                    onChange={(e) => setNilaiMapel2(Number(e.target.value))}
                    className="w-20 text-center font-bold px-2 py-1 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Bonus Sertifikat & Prestasi */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">4. Sertifikat & Prestasi Tambahan</h3>
                  <p className="text-xs text-slate-500">Nilai tambah kompetisi akademik / non-akademik</p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                +{bonusPrestasiScore} Poin Bonus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Prestasi</label>
                <select
                  value={prestasiTingkat}
                  onChange={(e) => setPrestasiTingkat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                >
                  <option value="Tidak Ada">Tidak Ada Sertifikat</option>
                  <option value="Kabupaten">Kota / Kabupaten</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Internasional">Internasional</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capaian Juara</label>
                <select
                  value={prestasiJuara}
                  onChange={(e) => setPrestasiJuara(e.target.value as any)}
                  disabled={prestasiTingkat === 'Tidak Ada'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium disabled:opacity-50"
                >
                  <option value="Juara 1">Juara 1 (Emas)</option>
                  <option value="Juara 2">Juara 2 (Perak)</option>
                  <option value="Juara 3">Juara 3 (Perunggu)</option>
                  <option value="Peserta / Finalis">Peserta / Finalis Top</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Bidang</label>
                <select
                  value={jenisPrestasi}
                  onChange={(e) => setJenisPrestasi(e.target.value as any)}
                  disabled={prestasiTingkat === 'Tidak Ada'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium disabled:opacity-50"
                >
                  <option value="Akademik">Akademik (OSN, Karya Tulis, dll)</option>
                  <option value="Non-Akademik">Non-Akademik (O2SN, FLS2N, OSIS)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Target PTN & Prodi Pilihan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">5. Target PTN & Program Studi Pilihan</h3>
                <p className="text-xs text-slate-500">Pilihan 1 dan Pilihan 2 di Portal SNPMB</p>
              </div>
            </div>

            {/* Quick Reference Preset */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-2">
              <span className="font-bold text-indigo-900 block">💡 Referensi Cepat Prodi & PTN Favorit:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {POPULAR_PTN_PRODI.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyPreset1(item)}
                    className="px-2 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 rounded-lg text-[11px] font-medium transition-all"
                  >
                    {item.ptn.split(' ')[0]} - {item.prodi} ({item.keketatan}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Pilihan 1 & Pilihan 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Choice 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-lg">PILAN 1 (UTAMA)</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Keketatan: {keketatan1}%</span>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">PTN Pilihan 1</label>
                  <input
                    type="text"
                    value={ptn1}
                    onChange={(e) => setPtn1(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Program Studi 1</label>
                  <input
                    type="text"
                    value={prodi1}
                    onChange={(e) => setProdi1(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Persentase Keketatan Prodi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={keketatan1}
                    onChange={(e) => setKeketatan1(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Choice 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-lg">PILIHAN 2 (CADANGAN)</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Keketatan: {keketatan2}%</span>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">PTN Pilihan 2</label>
                  <input
                    type="text"
                    value={ptn2}
                    onChange={(e) => setPtn2(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Program Studi 2</label>
                  <input
                    type="text"
                    value={prodi2}
                    onChange={(e) => setProdi2(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Persentase Keketatan Prodi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={keketatan2}
                    onChange={(e) => setKeketatan2(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Results Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Calculation Summary Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">HASIL RASIONALISASI</span>
                <h3 className="text-xl font-black text-white">Skor Akhir SNBP</h3>
              </div>
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>

            {/* Score Display */}
            <div className="text-center py-4 bg-slate-950/70 rounded-2xl border border-slate-800 relative space-y-2">
              <div>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">NILAI MURNI SNBP (SKALA 100)</span>
                <div className="text-4xl font-black text-teal-300 font-mono tracking-tight">
                  {nilaiMurni100} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Formula: ({bobotRapor}% × {rataRataRapor}) + ({bobotMapelPendukung}% × {rataRataMapelPendukung})
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">SKOR RASIONALISASI PTN (SKALA 100)</span>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-300 to-amber-300 tracking-tight">
                  {skorAkhirSnbp} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  Predikat: {skorAkhirSnbp >= 85 ? '🌟 DENGAN PUJIAN / SUPER KETAT' : skorAkhirSnbp >= 78 ? '✨ SANGAT KOMPETITIF' : '👍 CUKUP BAIK'}
                </span>
              </div>
            </div>

            {/* Config Bobot Slider */}
            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">Pengaturan Bobot Komponen:</span>
                <button
                  type="button"
                  onClick={() => setBobotRapor(50)}
                  className="text-[10px] text-indigo-400 hover:underline font-bold"
                >
                  Reset Default (50% : 50%)
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rapor Seluruh Mapel: <strong className="text-teal-300">{bobotRapor}%</strong> (Maks 50%)</span>
                  <span>Mapel Pendukung Prodi: <strong className="text-sky-300">{bobotMapelPendukung}%</strong> (Maks 50%)</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  step="5"
                  value={bobotRapor}
                  onChange={(e) => setBobotRapor(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>
            </div>

            {/* Visual Breakdown Bars */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Komposisi Bobot Skor:</h4>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">1. Rata Rapor ({rataRataRapor}) - Bobot {bobotRapor}%</span>
                  <span className="font-bold text-teal-300">{skorRaporPoin} / {bobotRapor} Poin</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${(rataRataRapor / 100) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">2. Mapel Pendukung ({rataRataMapelPendukung}) - Bobot {bobotMapelPendukung}%</span>
                  <span className="font-bold text-sky-300">{skorMapelPoin} / {bobotMapelPendukung} Poin</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${(rataRataMapelPendukung / 100) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">3. Penyesuaian Indeks Sekolah</span>
                  <span className="font-bold text-indigo-300">{indeksSekolahScore}% Akreditasi/Alumni</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${indeksSekolahScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">4. Bonus Prestasi & Trend Nilai</span>
                  <span className="font-bold text-amber-300">+{bonusPrestasiScore + trendRapor} Poin Bonus</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (bonusPrestasiScore + trendRapor) * 10)}%` }} />
                </div>
              </div>
            </div>

            {/* Peluang Pilihan 1 & Pilihan 2 */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Prediksi Peluang Kelolosan:</h4>

              {/* Choice 1 Result */}
              <div className={`p-4 rounded-2xl border ${peluangChoice1.bgLight} transition-all space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {peluangChoice1.icon}
                    <span className="font-extrabold text-xs text-slate-900">PILIHAN 1</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${peluangChoice1.color}`}>
                    {peluangChoice1.label}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{ptn1} - {prodi1}</div>
                <p className="text-[11px] text-slate-600 leading-tight">{peluangChoice1.desc}</p>
              </div>

              {/* Choice 2 Result */}
              <div className={`p-4 rounded-2xl border ${peluangChoice2.bgLight} transition-all space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {peluangChoice2.icon}
                    <span className="font-extrabold text-xs text-slate-900">PILIHAN 2</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${peluangChoice2.color}`}>
                    {peluangChoice2.label}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{ptn2} - {prodi2}</div>
                <p className="text-[11px] text-slate-600 leading-tight">{peluangChoice2.desc}</p>
              </div>
            </div>
          </div>

          {/* Rekomendasi Guru BK / Analisis Strategis */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-sm text-slate-900">💡 Catatan Rekomendasi Guru BK</h4>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="p-1 bg-indigo-50 text-indigo-600 rounded shrink-0 font-bold text-[10px]">1</span>
                <span><strong>Lakukan Kroscek Alumni:</strong> Pastikan tidak bertumpuk dengan siswa lain dari SMA Anda di prodi {prodi1} PTN {ptn1} untuk menghindari kanibalisasi internal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="p-1 bg-indigo-50 text-indigo-600 rounded shrink-0 font-bold text-[10px]">2</span>
                <span><strong>Portofolio & Sertifikat:</strong> Jika memilih prodi Seni / Olahraga, sertakan portofolio sesuai standar resmi SNPMB 2026.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="p-1 bg-indigo-50 text-indigo-600 rounded shrink-0 font-bold text-[10px]">3</span>
                <span><strong>Kombinasi Strategis:</strong> Usahakan Pilihan 2 memiliki keketatan lebih longgar (&gt; 5%) dibanding Pilihan 1 sebagai jaring pengaman utama.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animated Process Modal Overlay for SNBP Form Clear */}
      {isClearingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5 border border-slate-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              {clearingProgress < 100 ? (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" />
                  <Trash2 className="w-7 h-7 text-rose-600 animate-pulse" />
                </>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-800">
                Membersihkan Data Simulasi SNBP...
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {clearingProgress < 50
                  ? 'Menghapus nilai rapor & pilihan prodi...'
                  : clearingProgress < 100
                  ? 'Mereset parameter kalkulator rasionalisasi...'
                  : 'Selesai! Form simulasi telah dibersihkan.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${clearingProgress}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold text-right">
                {clearingProgress}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
