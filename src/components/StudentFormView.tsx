import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  RotateCcw,
  BookOpen,
  GraduationCap,
  User,
  Hash,
  Phone,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Award,
  Briefcase,
  ShieldAlert,
  Info,
  Check,
  Camera,
  Upload,
  FileImage,
  XCircle,
  AlertCircle,
  Search,
  Building2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Filter,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Printer,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
  ListOrdered,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import {
  Student,
  PilihanStudiLanjutType,
  PrestasiItem,
  JenisPrestasi,
  TingkatPrestasi,
  MasterSchoolStudent,
} from '../types';
import { MAPEL_TKA_OPTIONS, PRODI_POPULAR_OPTIONS, UNIVERSITAS_POPULAR_OPTIONS } from '../data/mockStudents';
import { MAPEL_PILIHAN_845_LIST, MapelPilihanData } from '../data/mapelPilihanData';
import { SAMPLE_BANPT_DATA, findBanPtAccreditation, ProdiData } from '../data/banptData';
import { getAppsScriptUrl } from '../utils/storage';
import { formatNisn } from '../utils/sanitizer';
import { StudentFormPdfModal } from './StudentFormPdfModal';

export interface BanPtSelectionItem {
  targetChoice: 'pilihan1' | 'pilihan2';
  ptn: string;
  prodi: string;
  akreditasi?: string;
}

interface StudentFormViewProps {
  editingStudent: Student | null;
  onSaveStudent: (studentData: Omit<Student, 'id' | 'updatedAt'> | Student) => void;
  onCancel: () => void;
  onOpenBanPtDirectory?: () => void;
  prefilledBanPtSelection?: BanPtSelectionItem | null;
  onClearPrefilledBanPt?: () => void;
  userRole?: 'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'siswa' | null;
  currentUserNis?: string | null;
  isStudentFormOpen?: boolean;
  masterStudents?: MasterSchoolStudent[];
}

export const StudentFormView: React.FC<StudentFormViewProps> = ({
  editingStudent,
  onSaveStudent,
  onCancel,
  onOpenBanPtDirectory,
  prefilledBanPtSelection,
  onClearPrefilledBanPt,
  userRole,
  currentUserNis,
  isStudentFormOpen = true,
  masterStudents = [],
}) => {
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nis: '',
    nisn: '',
    kelas: 'XII MIPA 1',
    jenisKelamin: 'L' as 'L' | 'P',
    mapelTka1: 'Matematika',
    mapelTka2: 'Fisika',
    pilihanStudiLanjut: 'Kuliah' as PilihanStudiLanjutType,
    ptn1: '',
    prodiPilihan1: '',
    akreditasiPilihan1: '',
    kriteriaPilihan1: '',
    ptn2: '',
    prodiPilihan2: '',
    akreditasiPilihan2: '',
    kriteriaPilihan2: '',
    mengajukanKipKuliah: 'Tidak' as 'Ya' | 'Tidak',
    kategoriDesil: '' as 'Desil 1' | 'Desil 2' | 'Desil 3' | 'Desil 4' | 'Desil 5' | '',
    noHp: '',
    fotoSiswa: '',
    catatan: '',
  });

  const [prestasiList, setPrestasiList] = useState<PrestasiItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appsScriptStatus, setAppsScriptStatus] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);

  // --- STATE & HELPERS FOR INTEGRATION OF MAPEL PILIHAN 845, BAN-PT DIRECTORY & PDF PRINT ---
  const [mapelSearchQuery, setMapelSearchQuery] = useState('');
  const [isBanPtModalOpen, setIsBanPtModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(true);
  const [banPtTarget, setBanPtTarget] = useState<'pilihan1' | 'pilihan2'>('pilihan1');
  const [banPtSearchPtn, setBanPtSearchPtn] = useState('');
  const [banPtSearchProdi, setBanPtSearchProdi] = useState('');
  const [banPtSearchJenjang, setBanPtSearchJenjang] = useState('ALL');
  const [banPtSearchAkreditasi, setBanPtSearchAkreditasi] = useState('ALL');
  const [banPtAlertMessage, setBanPtAlertMessage] = useState<string | null>(null);

  // Master Student Auto-Fill search state
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [autoFillNotification, setAutoFillNotification] = useState<string | null>(null);

  // Filter master students available for auto-fill.
  // If userRole === 'siswa', restrict STRICTLY to the student's logged-in NIS/NISN.
  const availableMasterStudents = useMemo(() => {
    if (userRole === 'siswa') {
      const targetNis = (currentUserNis || editingStudent?.nis || '').trim();
      if (targetNis) {
        return masterStudents.filter(
          (m) =>
            (m.nis && m.nis.toString().trim() === targetNis) ||
            (m.nisn && m.nisn.toString().trim() === targetNis)
        );
      }
    }
    return masterStudents;
  }, [masterStudents, userRole, currentUserNis, editingStudent]);

  const handleSelectMasterStudent = (masterId: string) => {
    setSelectedMasterId(masterId);
    if (!masterId) return;
    const searchList = userRole === 'siswa' ? availableMasterStudents : masterStudents;
    const found = searchList.find((m) => m.id === masterId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        namaSiswa: found.namaSiswa,
        nis: found.nis,
        nisn: found.nisn,
        kelas: found.kelas || prev.kelas,
      }));
      setAutoFillNotification(
        `✓ Data terhubung & otomatis terisi dari Input Data Sekolah: ${found.namaSiswa} (${found.kelas}) - NIS: ${found.nis}, NISN: ${found.nisn}`
      );
      setTimeout(() => setAutoFillNotification(null), 6000);
    }
  };

  // Effect to automatically auto-fill logged-in student data matching NIS
  useEffect(() => {
    if (userRole === 'siswa' && availableMasterStudents.length > 0) {
      const matched = availableMasterStudents[0];
      setSelectedMasterId(matched.id);
      setFormData((prev) => ({
        ...prev,
        namaSiswa: matched.namaSiswa || prev.namaSiswa,
        nis: matched.nis || prev.nis,
        nisn: matched.nisn || prev.nisn,
        kelas: matched.kelas || prev.kelas,
      }));
      setAutoFillNotification(
        `⚡ Auto-Fill Otomatis Berhasil dari Input Data Sekolah: ${matched.namaSiswa} (${matched.kelas}) - NIS: ${matched.nis}`
      );
    }
  }, [userRole, availableMasterStudents]);

  // Effect to handle selection coming from BAN-PT main menu directory
  useEffect(() => {
    if (prefilledBanPtSelection) {
      const { targetChoice, ptn, prodi, akreditasi } = prefilledBanPtSelection;
      if (targetChoice === 'pilihan1') {
        setFormData((prev) => ({
          ...prev,
          ptn1: ptn,
          prodiPilihan1: prodi,
          akreditasiPilihan1: akreditasi || prev.akreditasiPilihan1 || 'Unggul',
        }));
        setBanPtAlertMessage(`Pilihan 1 berhasil diisi dari BAN-PT: ${prodi} (${ptn}) [${akreditasi || 'Terverifikasi'}]`);
      } else {
        setFormData((prev) => ({
          ...prev,
          ptn2: ptn,
          prodiPilihan2: prodi,
          akreditasiPilihan2: akreditasi || prev.akreditasiPilihan2 || 'Unggul',
        }));
        setBanPtAlertMessage(`Pilihan 2 berhasil diisi dari BAN-PT: ${prodi} (${ptn}) [${akreditasi || 'Terverifikasi'}]`);
      }
      if (onClearPrefilledBanPt) {
        onClearPrefilledBanPt();
      }
      setTimeout(() => {
        setBanPtAlertMessage(null);
      }, 6000);
    }
  }, [prefilledBanPtSelection, onClearPrefilledBanPt]);

  // Helper to match target prodi name to 845 database
  const findMapel845Data = (prodiName: string): MapelPilihanData | null => {
    if (!prodiName || prodiName.trim() === '') return null;
    const clean = prodiName.toLowerCase();

    let matched = MAPEL_PILIHAN_845_LIST.find(
      (item) => item.kelompokProdi.toLowerCase().includes(clean) || clean.includes(item.kelompokProdi.toLowerCase())
    );

    if (!matched) {
      const keywords = clean.split(/[\s/,\-\(\)]+/).filter((k) => k.length >= 3);
      for (const kw of keywords) {
        matched = MAPEL_PILIHAN_845_LIST.find((item) => item.kelompokProdi.toLowerCase().includes(kw));
        if (matched) break;
      }
    }

    return matched || null;
  };

  // Helper to evaluate linearity score
  const evaluateLinearity = (prodiName: string, mapel1: string, mapel2: string) => {
    const data = findMapel845Data(prodiName);
    if (!data) {
      return {
        matchedData: null,
        score: 0,
        status: 'Data Linieritas Tidak Spesifik',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        m1Match: false,
        m2Match: false,
      };
    }

    const req1 = data.mapelPendukung1.toLowerCase();
    const req2 = data.mapelPendukung2.toLowerCase();
    const m1 = mapel1.toLowerCase();
    const m2 = mapel2.toLowerCase();

    const m1Match = m1.includes(req1) || req1.includes(m1) || m1.includes(req2) || req2.includes(m1);
    const m2Match = m2.includes(req1) || req1.includes(m2) || m2.includes(req2) || req2.includes(m2);

    let matchCount = 0;
    if (m1Match) matchCount++;
    if (m2Match) matchCount++;

    if (matchCount === 2) {
      return {
        matchedData: data,
        score: 2,
        status: '🟢 Sangat Linier (2/2 Mapel Sesuai)',
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        m1Match: true,
        m2Match: true,
      };
    } else if (matchCount === 1) {
      return {
        matchedData: data,
        score: 1,
        status: '🟡 Cukup Linier (1/2 Mapel Sesuai)',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        m1Match,
        m2Match,
      };
    } else {
      return {
        matchedData: data,
        score: 0,
        status: '🔴 Belum Linier (Perlu Penyesuaian Mapel TKA)',
        color: 'bg-rose-100 text-rose-900 border-rose-300',
        m1Match: false,
        m2Match: false,
      };
    }
  };

  useEffect(() => {
    if (editingStudent) {
      const parseUnivAndProdi = (univ?: string, prodiCombo?: string, defaultUniv: string = '', defaultProdi: string = '') => {
        if (univ && univ.trim() !== '') {
          return { univ, prodi: prodiCombo || '' };
        }
        if (prodiCombo && prodiCombo.includes(' - ')) {
          const parts = prodiCombo.split(' - ');
          return { univ: parts[0].trim(), prodi: parts.slice(1).join(' - ').trim() };
        }
        return { univ: defaultUniv, prodi: prodiCombo || defaultProdi };
      };

      const choice1 = parseUnivAndProdi(
        editingStudent.ptn1,
        editingStudent.prodiPilihan1,
        '',
        ''
      );

      const choice2 = parseUnivAndProdi(
        editingStudent.ptn2,
        editingStudent.prodiPilihan2,
        '',
        ''
      );

      let initNama = editingStudent.namaSiswa || '';
      let initNis = editingStudent.nis || '';
      let initNisn = editingStudent.nisn || '';
      let initKelas = editingStudent.kelas || 'XII MIPA 1';

      if (masterStudents.length > 0) {
        const searchList = userRole === 'siswa' ? availableMasterStudents : masterStudents;
        const cleanNis = (userRole === 'siswa' && currentUserNis ? currentUserNis : initNis).trim();
        const cleanNisn = initNisn.trim();
        const masterFound = searchList.find(
          (m) =>
            (cleanNis && m.nis && m.nis.toString().trim() === cleanNis) ||
            (cleanNisn && m.nisn && m.nisn.toString().trim() === cleanNisn) ||
            (cleanNis && m.nisn && m.nisn.toString().trim() === cleanNis) ||
            (userRole !== 'siswa' && initNama && m.namaSiswa && m.namaSiswa.toLowerCase().trim() === initNama.toLowerCase().trim())
        );
        if (masterFound) {
          setSelectedMasterId(masterFound.id);
          if (!initNama || initNama === 'Siswa') initNama = masterFound.namaSiswa;
          if (!initNis || userRole === 'siswa') initNis = masterFound.nis;
          if (!initNisn) initNisn = masterFound.nisn;
          if (masterFound.kelas) initKelas = masterFound.kelas;
          setAutoFillNotification(
            `⚡ Terhubung & Terisi Otomatis dari Input Data Sekolah: ${masterFound.namaSiswa} (${initKelas}) - NIS: ${masterFound.nis} | NISN: ${masterFound.nisn}`
          );
        }
      }

      setFormData({
        namaSiswa: initNama,
        nis: initNis,
        nisn: initNisn,
        kelas: initKelas,
        jenisKelamin: editingStudent.jenisKelamin || 'L',
        mapelTka1: editingStudent.mapelTka1 || MAPEL_TKA_OPTIONS[0],
        mapelTka2: editingStudent.mapelTka2 || MAPEL_TKA_OPTIONS[1],
        pilihanStudiLanjut: editingStudent.pilihanStudiLanjut || 'Kuliah',
        ptn1: choice1.univ,
        prodiPilihan1: choice1.prodi,
        akreditasiPilihan1: editingStudent.akreditasiPilihan1 || '',
        kriteriaPilihan1: editingStudent.kriteriaPilihan1 || '',
        ptn2: choice2.univ,
        prodiPilihan2: choice2.prodi,
        akreditasiPilihan2: editingStudent.akreditasiPilihan2 || '',
        kriteriaPilihan2: editingStudent.kriteriaPilihan2 || '',
        mengajukanKipKuliah: editingStudent.mengajukanKipKuliah || 'Tidak',
        kategoriDesil: editingStudent.kategoriDesil || '',
        noHp: editingStudent.noHp || '',
        fotoSiswa: editingStudent.fotoSiswa || '',
        catatan: editingStudent.catatan || '',
      });
      setPrestasiList(editingStudent.prestasiList || []);
    }
  }, [editingStudent, masterStudents, availableMasterStudents, userRole, currentUserNis]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Real-time Auto-Fill lookup from Input Data Sekolah (masterStudents) based on NIS or NISN
      const searchList = userRole === 'siswa' ? availableMasterStudents : masterStudents;
      if ((field === 'nis' || field === 'nisn') && value && searchList.length > 0) {
        const cleanVal = String(value).trim();
        if (cleanVal.length >= 2) {
          const masterFound = searchList.find(
            (m) =>
              (m.nis && String(m.nis).trim() === cleanVal) ||
              (m.nisn && String(m.nisn).trim() === cleanVal)
          );
          if (masterFound) {
            setSelectedMasterId(masterFound.id);
            if (masterFound.namaSiswa) updated.namaSiswa = masterFound.namaSiswa;
            if (masterFound.nis) updated.nis = masterFound.nis;
            if (masterFound.nisn) updated.nisn = masterFound.nisn;
            if (masterFound.kelas) updated.kelas = masterFound.kelas;
            setAutoFillNotification(
              `⚡ Terhubung & Terisi Otomatis dari Input Data Sekolah: ${masterFound.namaSiswa} (${masterFound.kelas}) - NIS: ${masterFound.nis} | NISN: ${masterFound.nisn}`
            );
          } else {
            setSelectedMasterId('');
          }
        }
      }
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto terlalu besar! Maksimal 5 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Format file tidak valid! Pilih file gambar (JPG, JPEG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultStr = event.target?.result as string;
      if (!resultStr) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          handleChange('fotoSiswa', compressedBase64);
        } else {
          handleChange('fotoSiswa', resultStr);
        }
      };
      img.onerror = () => {
        handleChange('fotoSiswa', resultStr);
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    handleChange('fotoSiswa', '');
  };

  // Prestasi handlers
  const handleAddPrestasi = () => {
    if (prestasiList.length >= 15) {
      alert('Maksimal 15 sertifikat prestasi yang dapat ditambahkan.');
      return;
    }

    const newItem: PrestasiItem = {
      id: 'pres-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      namaPrestasi: '',
      jenis: 'Akademik',
      tingkat: 'Kota/Kabupaten',
      lembaga: '',
    };

    setPrestasiList((prev) => [...prev, newItem]);
  };

  const handleRemovePrestasi = (id: string) => {
    setPrestasiList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePrestasi = (id: string, field: keyof PrestasiItem, value: any) => {
    setPrestasiList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === 'siswa' && !isStudentFormOpen) {
      alert('Akses Formulir Pendataan Siswa saat ini sedang DITUTUP oleh Admin / Panitia.');
      return;
    }

    if (!formData.namaSiswa.trim() || !formData.nis.trim() || !formData.nisn.trim()) {
      alert('Mohon isi Nama Siswa, NIS, dan NISN secara lengkap.');
      return;
    }

    if (formData.mapelTka1 === formData.mapelTka2) {
      alert('Mata Pelajaran TKA Pilihan 1 dan Pilihan 2 tidak boleh sama.');
      return;
    }

    // If choices other than Kuliah, normalize prodi choices
    const finalProdi1 =
      formData.pilihanStudiLanjut === 'Kuliah'
        ? formData.prodiPilihan1 || '-'
        : `-${formData.pilihanStudiLanjut}-`;
    const finalProdi2 =
      formData.pilihanStudiLanjut === 'Kuliah'
        ? formData.prodiPilihan2 || '-'
        : `-${formData.pilihanStudiLanjut}-`;

    setIsSubmitting(true);
    setAppsScriptStatus(null);

    const gasUrl = getAppsScriptUrl();

    const payloadData = {
      ...formData,
      nisn: formatNisn(formData.nisn),
      prodiPilihan1: finalProdi1,
      prodiPilihan2: finalProdi2,
      prestasiList: prestasiList.filter((p) => p.namaPrestasi.trim() !== ''),
    };

    if (editingStudent) {
      const studentToSave: Student = {
        ...editingStudent,
        ...payloadData,
      };

      if (gasUrl) {
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'update', student: studentToSave }),
          });
          setAppsScriptStatus('Tersimpan di Lokal & Google Sheets!');
        } catch (err) {
          console.warn('Apps Script sync failed:', err);
        }
      }

      onSaveStudent(studentToSave);
      setSubmittedStudent(studentToSave);
    } else {
      const newStudentObj: Student = {
        id: 'std-' + Date.now(),
        ...payloadData,
        createdAt: new Date().toISOString().split('T')[0],
      };

      if (gasUrl) {
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'save', student: payloadData }),
          });
          setAppsScriptStatus('Tersimpan di Lokal & Google Sheets!');
        } catch (err) {
          console.warn('Apps Script sync failed:', err);
        }
      }

      onSaveStudent(payloadData);
      setSubmittedStudent(newStudentObj);
    }

    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              {editingStudent ? 'Edit Data Siswa TKA' : 'Isian Formulir Data Siswa TKA'}
            </h3>
            <p className="text-xs text-slate-500">
              Lengkapi Pendataan TKA, Pilihan Studi Lanjut, dan Portofolio Prestasi Siswa.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-300 shadow-2xs"
                title="Keluar dari formulir"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Kembali</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-slate-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all border border-indigo-700/50 hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak / Export PDF</span>
            </button>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 w-fit">
              {editingStudent ? 'Mode Edit Data' : 'Data Siswa Baru'}
            </span>
          </div>
        </div>

        {/* BANNER ACCESS CLOSED WARNING FOR SISWA */}
        {userRole === 'siswa' && !isStudentFormOpen && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 mb-4 text-amber-900 shadow-md flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 text-amber-700 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="font-extrabold text-base text-amber-950">
                  Akses Formulir Pendataan Siswa Sedang DITUTUP
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                  DITUTUP ADMIN
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Pengisian dan pembaruan data Formulir Pendataan Siswa TKA &amp; Studi Lanjut saat ini sedang <strong>DITUTUP oleh Admin/Panitia Sekolah</strong>. Anda masih dapat melihat data Anda, tetapi tidak dapat mengubah data. Silakan hubungi Wali Kelas atau Admin Sekolah jika Anda membutuhkan bantuan perbaikan data.
              </p>
            </div>
          </div>
        )}

        {/* PANDUAN LANGKAH PENGISIAN FORM & CETAK BUKTI PDF UNTUK SISWA */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 lg:p-5 shadow-lg border border-indigo-700/50 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shrink-0">
                <BookOpenCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  Panduan Pengisian Form Nilai / TKA & Cetak Bukti PDF
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    5 Langkah Resmi
                  </span>
                </h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Petunjuk alur mandiri bagi siswa dari pengisian data, mata pelajaran TKA, hingga cetak dokumen bukti pendataan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Pratinjau PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                className="p-1.5 bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 rounded-xl transition-all border border-indigo-600/40"
                title={isGuideExpanded ? 'Sembunyikan Panduan' : 'Tampilkan Panduan'}
              >
                {isGuideExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isGuideExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1 text-xs">
              {/* Step 1 */}
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Langkah 1
                  </span>
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Identitas & Pasfoto</h5>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  Isi Nama, NIS, NISN, Kelas, serta unggah <strong>Pasfoto Resmi (3x4)</strong> rasio tegak. Foto tercetak di lembar PDF.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Langkah 2
                  </span>
                  <BookOpen className="w-4 h-4 text-sky-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Mapel Pilihan TKA</h5>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  Pilih <strong>Mapel TKA 1 & Mapel TKA 2</strong> yang diambil semester ini sesuai arahan Wali Kelas & BK.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Langkah 3
                  </span>
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Studi Lanjut & PTN</h5>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  Pilih Jalur Studi, isikan <strong>PTN & Prodi Pilihan 1-2</strong>, lalu periksa akreditasi pada menu Direktori BAN-PT.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Langkah 4
                  </span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Prestasi & KIP-K</h5>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  Input hingga 15 sertifikat prestasi pendukung dan isi status pengajuan Beasiswa KIP-Kuliah jika mendaftar.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500/30 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Langkah 5
                  </span>
                  <Printer className="w-4 h-4 text-amber-400" />
                </div>
                <h5 className="font-bold text-amber-200 text-xs">Simpan & Cetak PDF</h5>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  Klik <strong>"Simpan Data Siswa"</strong>, lalu tekan tombol <strong>"Cetak / Export PDF"</strong> untuk mengunduh bukti resmi ber-Kop & QR Code.
                </p>
              </div>
            </div>
          )}
        </div>

        {appsScriptStatus && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {appsScriptStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: IDENTITAS SISWA (Nama, NIS, NISN) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" /> 1. Identitas Siswa & Pasfoto (Wajib)
            </h4>

            {/* SUB-SECTION: UNGGAN PASFOTO SISWA & KETENTUAN */}
            <div className="p-4 lg:p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Upload Pasfoto Resmi Siswa
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                    Sesuai Ketentuan TKA & SNBP
                  </span>
                </label>
              </div>

              <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Upload Preview & Action Box */}
                <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
                  <div className="relative w-32 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden border-2 border-dashed border-indigo-300 bg-white flex flex-col items-center justify-center text-center p-2 group shadow-xs">
                    {formData.fotoSiswa ? (
                      <>
                        <img
                          src={formData.fotoSiswa}
                          alt="Pasfoto Siswa"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md"
                          title="Hapus Foto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-slate-400 space-y-1.5">
                        <FileImage className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Belum ada foto
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Rasio 3x4 / 4x6
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-2xs transition-colors w-full sm:w-auto">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.fotoSiswa ? 'Ganti Foto' : 'Unggah Foto'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.fotoSiswa && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* Ketentuan Pasfoto Rule Box */}
                <div className="flex-1 bg-white p-4 rounded-xl border border-indigo-100/80 text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs border-b border-indigo-50 pb-2">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Ketentuan Pasfoto Resmi Siswa (Syarat Wajib):</span>
                  </div>

                  <ul className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Pakaian & Pose:</strong> Wajib memakai seragam sekolah resmi atau jas, wajah menghadap lurus ke depan, terlihat jelas, dan tanpa kacamata hitam / topi.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Latar Belakang (Background):</strong> Latar belakang polos berwarna <strong>Merah</strong> (Tahun Lahir Ganjil) atau <strong>Biru</strong> (Tahun Lahir Genap).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Spesifikasi File:</strong> Format file <strong>JPG, JPEG, atau PNG</strong> dengan ukuran file maksimal <strong>2 MB</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Penggunaan Foto:</strong> Foto ini akan langsung ditampilkan di <strong>Portal Akun Siswa</strong>, Kartu Peserta Ujian TKA, serta berkas seleksi SNBP / SNBT / Kedinasan.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AUTO-FILL DARI INPUT DATA SEKOLAH */}
            {userRole === 'siswa' ? (
              availableMasterStudents.length > 0 ? (
                <div className="bg-gradient-to-r from-emerald-50 via-indigo-50/50 to-blue-50 border-2 border-emerald-300/80 p-4 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      ⚡ Auto-Fill Otomatis Sesuai NIS Login ({currentUserNis})
                    </label>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Matriks Hak Akses NIS Terverifikasi
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Data diri Anda terhubung langsung secara otomatis dari <strong>Input Data Sekolah (Data Master Super Admin)</strong> khusus untuk nama & NIS akun Anda:
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider">
                        Nama Siswa Terhubung:
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        {availableMasterStudents[0]?.namaSiswa || 'Siswa'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Kelas: <span className="font-bold text-slate-700">{availableMasterStudents[0]?.kelas || '-'}</span> | NIS: <span className="font-bold text-slate-700">{availableMasterStudents[0]?.nis || '-'}</span> | NISN: <span className="font-bold text-slate-700">{availableMasterStudents[0]?.nisn || '-'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectMasterStudent(availableMasterStudents[0].id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Terapkan Ke Form</span>
                    </button>
                  </div>

                  {autoFillNotification && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{autoFillNotification}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl space-y-1.5 text-xs text-amber-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Status Integrasi Input Data Sekolah</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    NIS/NISN akun Anda (<strong>{currentUserNis || '-'}</strong>) belum terdaftar pada Input Data Sekolah oleh Super Admin. Silakan lengkapi data formulir di bawah ini secara manual.
                  </p>
                </div>
              )
            ) : (
              masterStudents.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      ⚡ Auto-Fill Otomatis dari Input Data Sekolah
                    </label>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                      {masterStudents.length} Master Siswa
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pilih nama siswa dari data master sekolah untuk langsung mengisi <strong>Nama Siswa, NIS, NISN, dan Kelas</strong> secara otomatis:
                  </p>

                  <select
                    value={selectedMasterId}
                    onChange={(e) => handleSelectMasterStudent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">-- Pilih Nama Siswa dari Input Data Sekolah --</option>
                    {masterStudents.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.namaSiswa} — {m.kelas} (NIS: {m.nis} | NISN: {m.nisn})
                      </option>
                    ))}
                  </select>

                  {autoFillNotification && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{autoFillNotification}</span>
                    </div>
                  )}
                </div>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nama Siswa */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Siswa Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSiswa}
                  onChange={(e) => handleChange('namaSiswa', e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi Nurrahman"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* NIS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={(e) => handleChange('nis', e.target.value)}
                  placeholder="Contoh: 22231001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {(() => {
                  const currentCleanNis = (formData.nis || '').trim();
                  const matchedMaster = masterStudents.find(
                    (m) =>
                      (currentCleanNis && m.nis && m.nis.toString().trim() === currentCleanNis) ||
                      (selectedMasterId && m.id === selectedMasterId)
                  );
                  if (matchedMaster) {
                    return (
                      <div className="mt-1.5 p-2 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-xl text-[11px] font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Terhubung: <strong>{matchedMaster.namaSiswa}</strong> ({matchedMaster.kelas})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectMasterStudent(matchedMaster.id)}
                          className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2 py-0.5 rounded-md transition-colors"
                        >
                          Sematkan
                        </button>
                      </div>
                    );
                  } else if (currentCleanNis.length >= 3 && masterStudents.length > 0) {
                    return (
                      <p className="mt-1 text-[10px] text-amber-700 font-medium">
                        💡 NIS belum terdaftar di Master Data Sekolah (Super Admin).
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => handleChange('nisn', e.target.value)}
                  placeholder="Contoh: 0061234561"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => handleChange('kelas', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="XII MIPA 1">XII MIPA 1</option>
                  <option value="XII MIPA 2">XII MIPA 2</option>
                  <option value="XII IPS 1">XII IPS 1</option>
                  <option value="XII IPS 2">XII IPS 2</option>
                </select>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="flex items-center space-x-4 pt-1.5">
                  <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="L"
                      checked={formData.jenisKelamin === 'L'}
                      onChange={() => handleChange('jenisKelamin', 'L')}
                      className="text-indigo-600 focus:ring-indigo-500 mr-1.5"
                    />
                    Laki-laki (L)
                  </label>
                  <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="P"
                      checked={formData.jenisKelamin === 'P'}
                      onChange={() => handleChange('jenisKelamin', 'P')}
                      className="text-indigo-600 focus:ring-indigo-500 mr-1.5"
                    />
                    Perempuan (P)
                  </label>
                </div>
              </div>

              {/* No HP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No HP / WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => handleChange('noHp', e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 2: PILIHAN MATA PELAJARAN TKA (Mapel 1 & Mapel 2) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" /> 2. Pilihan Mata Pelajaran TKA (Wajib)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mapel TKA 1 */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  Mata Pelajaran Pilihan 1 TKA <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.mapelTka1}
                  onChange={(e) => handleChange('mapelTka1', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {MAPEL_TKA_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-indigo-600/80 mt-1">
                  Mapel peminatan utama untuk ujian TKA.
                </p>
              </div>

              {/* Mapel TKA 2 */}
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <label className="block text-xs font-bold text-purple-900 mb-1">
                  Mata Pelajaran Pilihan 2 TKA <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.mapelTka2}
                  onChange={(e) => handleChange('mapelTka2', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  {MAPEL_TKA_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-purple-600/80 mt-1">
                  Mapel peminatan pendamping untuk ujian TKA.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 3: PILIHAN STUDI LANJUT */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" /> 3. Pilihan Studi Lanjut (Wajib)
            </h4>

            {/* 3 Main Choice Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option A: AKADEMI */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.pilihanStudiLanjut === 'AKADEMI'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <input
                      type="radio"
                      name="pilihanStudiLanjut"
                      value="AKADEMI"
                      checked={formData.pilihanStudiLanjut === 'AKADEMI'}
                      onChange={() => handleChange('pilihanStudiLanjut', 'AKADEMI')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>a. AKADEMI</span>
                  </div>
                  <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold">
                    TNI / POLRI / Kedinasan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Sekolah Kedinasan, AKMIL, AKPOL, STIN, IPDN, STAN, dll.
                </p>
              </label>

              {/* Option B: Bekerja */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.pilihanStudiLanjut === 'Bekerja'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <input
                      type="radio"
                      name="pilihanStudiLanjut"
                      value="Bekerja"
                      checked={formData.pilihanStudiLanjut === 'Bekerja'}
                      onChange={() => handleChange('pilihanStudiLanjut', 'Bekerja')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>b. Bekerja</span>
                  </div>
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Dunia Kerja
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Memasuki dunia kerja, wirausaha, atau pelatihan kerja profesional.
                </p>
              </label>

              {/* Option C: Kuliah */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.pilihanStudiLanjut === 'Kuliah'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <input
                      type="radio"
                      name="pilihanStudiLanjut"
                      value="Kuliah"
                      checked={formData.pilihanStudiLanjut === 'Kuliah'}
                      onChange={() => handleChange('pilihanStudiLanjut', 'Kuliah')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>c. Kuliah</span>
                  </div>
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                    Perguruan Tinggi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Lanjut studi perguruan tinggi negeri (PTN), PTS, atau Luar Negeri.
                </p>
              </label>
            </div>

            {/* CONDITIONAL SUB-SECTION: If Kuliah is selected */}
            {formData.pilihanStudiLanjut === 'Kuliah' ? (
              <div className="p-4.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                {banPtAlertMessage && (
                  <div className="p-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span>{banPtAlertMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBanPtAlertMessage(null)}
                      className="text-emerald-200 hover:text-white font-black text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>3.1 Isian Pilihan Universitas & Program Studi (Terhubung BAN-PT)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenBanPtDirectory && (
                      <button
                        type="button"
                        onClick={onOpenBanPtDirectory}
                        className="text-[10px] font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/80 flex items-center gap-1 transition-colors"
                      >
                        <Building2 className="w-3 h-3 text-indigo-600" />
                        <span>Buka Direktori Prodi PTN (Menu Utama)</span>
                        <ExternalLink className="w-2.5 h-2.5 text-indigo-500" />
                      </button>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Direktori BAN-PT Integrated
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* PILIHAN 1 CARD */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 border-b border-emerald-50 pb-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">1</span>
                      <span>Pilihan 1 (Prioritas Utama)</span>
                    </div>

                    {/* Universitas 1 */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Universitas / Perguruan Tinggi Pilihan 1 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="universitas-list"
                        required
                        value={formData.ptn1}
                        onChange={(e) => handleChange('ptn1', e.target.value)}
                        placeholder="Contoh: Institut Teknologi Bandung (ITB)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    {/* Program Studi 1 */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Program Studi Pilihan 1 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="prodi-list"
                        required
                        value={formData.prodiPilihan1}
                        onChange={(e) => handleChange('prodiPilihan1', e.target.value)}
                        placeholder="Contoh: Teknik Informatika / Ilmu Komputer"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    {/* BAN-PT Verification Card for Choice 1 */}
                    {(() => {
                      const banpt1 = findBanPtAccreditation(formData.ptn1, formData.prodiPilihan1);
                      return (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Akreditasi BAN-PT Pilihan 1
                            </span>
                            {banpt1 ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-300">
                                🌟 Database: {banpt1.akreditasi}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                                Tidak Ada di DB
                              </span>
                            )}
                          </div>
                          {banpt1 ? (
                            <div className="text-[10px] text-slate-600 space-y-0.5">
                              <p className="font-semibold text-slate-800 truncate">{banpt1.ptn} - {banpt1.prodi}</p>
                              <p className="text-slate-500">No. SK: {banpt1.nomorSk} (s.d {banpt1.tahunKedaluwarsa})</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500">
                              Verifikasi akreditasi resmi prodi PTN ini di direktori BAN-PT atau isi manual di bawah.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setBanPtTarget('pilihan1');
                              setBanPtSearchPtn(formData.ptn1);
                              setBanPtSearchProdi(formData.prodiPilihan1);
                              setIsBanPtModalOpen(true);
                            }}
                            className="w-full py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Search className="w-3 h-3 text-emerald-600" />
                            <span>Cari & Pilih di Direktori BAN-PT</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Manual Entry Akreditasi & Kriteria Pilihan 1 */}
                    <div className="pt-2 border-t border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Entry Manual Akreditasi BAN-PT & Kriteria (Pilihan 1)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Akreditasi BAN-PT Pilihan 1:
                          </label>
                          <input
                            type="text"
                            list="akreditasi-options"
                            value={formData.akreditasiPilihan1}
                            onChange={(e) => handleChange('akreditasiPilihan1', e.target.value)}
                            placeholder="Unggul / A / Baik Sekali / B / ASIIN"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Kriteria & Pertimbangan Pilihan 1:
                          </label>
                          <input
                            type="text"
                            value={formData.kriteriaPilihan1}
                            onChange={(e) => handleChange('kriteriaPilihan1', e.target.value)}
                            placeholder="Daya tampung 120, Keketatan 2%, PTN-BH"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          />
                        </div>
                      </div>

                      {/* Quick Tag Chips for Kriteria Pilihan 1 */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold">Rekomendasi Kriteria:</span>
                        {['Daya Tampung Besar', 'Akreditasi Internasional (ASIIN)', 'PTN-BH Utama', 'KIP-Kuliah Friendly', 'Prospek Karir Tinggi'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              const current = formData.kriteriaPilihan1 ? formData.kriteriaPilihan1 + ', ' : '';
                              if (!formData.kriteriaPilihan1.includes(chip)) {
                                handleChange('kriteriaPilihan1', current + chip);
                              }
                            }}
                            className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 rounded-md transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PILIHAN 2 CARD */}
                  <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-teal-950 border-b border-teal-50 pb-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">2</span>
                      <span>Pilihan 2 (Prioritas Alternatif)</span>
                    </div>

                    {/* Universitas 2 */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Universitas / Perguruan Tinggi Pilihan 2 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="universitas-list"
                        required
                        value={formData.ptn2}
                        onChange={(e) => handleChange('ptn2', e.target.value)}
                        placeholder="Contoh: Universitas Indonesia (UI)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      />
                    </div>

                    {/* Program Studi 2 */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Program Studi Pilihan 2 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="prodi-list"
                        required
                        value={formData.prodiPilihan2}
                        onChange={(e) => handleChange('prodiPilihan2', e.target.value)}
                        placeholder="Contoh: Pendidikan Dokter / Kedokteran Umum"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      />
                    </div>

                    {/* BAN-PT Verification Card for Choice 2 */}
                    {(() => {
                      const banpt2 = findBanPtAccreditation(formData.ptn2, formData.prodiPilihan2);
                      return (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Akreditasi BAN-PT Pilihan 2
                            </span>
                            {banpt2 ? (
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-extrabold text-[10px] rounded-md border border-teal-300">
                                🌟 Database: {banpt2.akreditasi}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                                Tidak Ada di DB
                              </span>
                            )}
                          </div>
                          {banpt2 ? (
                            <div className="text-[10px] text-slate-600 space-y-0.5">
                              <p className="font-semibold text-slate-800 truncate">{banpt2.ptn} - {banpt2.prodi}</p>
                              <p className="text-slate-500">No. SK: {banpt2.nomorSk} (s.d {banpt2.tahunKedaluwarsa})</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500">
                              Verifikasi akreditasi resmi prodi PTN ini di direktori BAN-PT atau isi manual di bawah.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setBanPtTarget('pilihan2');
                              setBanPtSearchPtn(formData.ptn2);
                              setBanPtSearchProdi(formData.prodiPilihan2);
                              setIsBanPtModalOpen(true);
                            }}
                            className="w-full py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Search className="w-3 h-3 text-teal-600" />
                            <span>Cari & Pilih di Direktori BAN-PT</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Manual Entry Akreditasi & Kriteria Pilihan 2 */}
                    <div className="pt-2 border-t border-teal-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-teal-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-teal-700" />
                          <span>Entry Manual Akreditasi BAN-PT & Kriteria (Pilihan 2)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Akreditasi BAN-PT Pilihan 2:
                          </label>
                          <input
                            type="text"
                            list="akreditasi-options"
                            value={formData.akreditasiPilihan2}
                            onChange={(e) => handleChange('akreditasiPilihan2', e.target.value)}
                            placeholder="Unggul / A / Baik Sekali / B / C"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Kriteria & Pertimbangan Pilihan 2:
                          </label>
                          <input
                            type="text"
                            value={formData.kriteriaPilihan2}
                            onChange={(e) => handleChange('kriteriaPilihan2', e.target.value)}
                            placeholder="Cadangan Aman, Alumni Banyak, Lokasi Dekat"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          />
                        </div>
                      </div>

                      {/* Quick Tag Chips for Kriteria Pilihan 2 */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold">Rekomendasi Kriteria:</span>
                        {['Passing Grade Aman', 'Pilihan Cadangan Prioritas', 'Lokasi Dekat Rumah', 'Fasilitas Lengkap', 'Akreditasi Terjamin'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              const current = formData.kriteriaPilihan2 ? formData.kriteriaPilihan2 + ', ' : '';
                              if (!formData.kriteriaPilihan2.includes(chip)) {
                                handleChange('kriteriaPilihan2', current + chip);
                              }
                            }}
                            className="text-[9px] font-bold px-2 py-0.5 bg-teal-100/70 hover:bg-teal-200 text-teal-800 rounded-md transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTEGRATION PANEL: LINIERITAS MAPEL TKA VS DATABASE MAPEL PILIHAN (845 DATA) */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-indigo-800/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-700/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                        <Layers className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-white">
                          Analisis Linieritas TKA & Matrix Database (845 Prodi)
                        </h5>
                        <p className="text-[11px] text-indigo-200">
                          Keterhubungan Mapel TKA dengan Database Kurikulum Merdeka & SNBP Kemdikbud Ristek.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 px-2.5 py-1 rounded-full shrink-0">
                      Kemdikbud 845 Matrix
                    </span>
                  </div>

                  {/* Cross-Check Cards for Section 3 Choices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Choice 1 Cross-Check */}
                    {(() => {
                      const eval1 = evaluateLinearity(formData.prodiPilihan1, formData.mapelTka1, formData.mapelTka2);
                      return (
                        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-200 text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                              Linieritas Pilihan 1
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${eval1.color}`}>
                              {eval1.status}
                            </span>
                          </div>
                          <p className="font-bold text-white text-xs truncate">
                            {formData.prodiPilihan1 || 'Belum diisi'}
                          </p>
                          {eval1.matchedData ? (
                            <div className="space-y-1 bg-black/20 p-2 rounded-lg text-[11px]">
                              <div className="flex justify-between text-indigo-200">
                                <span>Mapel Pendukung Resmi:</span>
                              </div>
                              <div className="font-semibold text-amber-300">
                                1. {eval1.matchedData.mapelPendukung1}
                              </div>
                              <div className="font-semibold text-amber-300">
                                2. {eval1.matchedData.mapelPendukung2}
                              </div>
                              {eval1.score < 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleChange('mapelTka1', eval1.matchedData?.mapelPendukung1 || formData.mapelTka1);
                                    handleChange('mapelTka2', eval1.matchedData?.mapelPendukung2 || formData.mapelTka2);
                                  }}
                                  className="mt-1.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Sesuaikan Mapel TKA ke Pilihan 1 Ini</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-300 italic">
                              Masukkan nama program studi spesifik untuk melihat rekomendasi mapel pendukung resmi.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Choice 2 Cross-Check */}
                    {(() => {
                      const eval2 = evaluateLinearity(formData.prodiPilihan2, formData.mapelTka1, formData.mapelTka2);
                      return (
                        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-200 text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center text-[9px] font-bold">2</span>
                              Linieritas Pilihan 2
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${eval2.color}`}>
                              {eval2.status}
                            </span>
                          </div>
                          <p className="font-bold text-white text-xs truncate">
                            {formData.prodiPilihan2 || 'Belum diisi'}
                          </p>
                          {eval2.matchedData ? (
                            <div className="space-y-1 bg-black/20 p-2 rounded-lg text-[11px]">
                              <div className="flex justify-between text-indigo-200">
                                <span>Mapel Pendukung Resmi:</span>
                              </div>
                              <div className="font-semibold text-teal-300">
                                1. {eval2.matchedData.mapelPendukung1}
                              </div>
                              <div className="font-semibold text-teal-300">
                                2. {eval2.matchedData.mapelPendukung2}
                              </div>
                              {eval2.score < 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleChange('mapelTka1', eval2.matchedData?.mapelPendukung1 || formData.mapelTka1);
                                    handleChange('mapelTka2', eval2.matchedData?.mapelPendukung2 || formData.mapelTka2);
                                  }}
                                  className="mt-1.5 w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Sesuaikan Mapel TKA ke Pilihan 2 Ini</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-300 italic">
                              Masukkan nama program studi spesifik untuk melihat rekomendasi mapel pendukung resmi.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quick Search Widget in 845 Database */}
                  <div className="bg-black/25 p-3.5 rounded-xl border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Cari Rekomendasi Mapel untuk Program Studi Lain (Database 845 Data):</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={mapelSearchQuery}
                      onChange={(e) => setMapelSearchQuery(e.target.value)}
                      placeholder="Ketik jurusan tujuan (contoh: Kedokteran, Informatika, Hukum, Psikologi, Farmasi)..."
                      className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    />

                    {mapelSearchQuery.trim() !== '' && (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 pt-1">
                        {MAPEL_PILIHAN_845_LIST.filter(
                          (item) =>
                            item.kelompokProdi.toLowerCase().includes(mapelSearchQuery.toLowerCase()) ||
                            item.rumpunIlmo.toLowerCase().includes(mapelSearchQuery.toLowerCase())
                        )
                          .slice(0, 5)
                          .map((item) => (
                            <div
                              key={item.no}
                              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg border border-white/10 flex items-center justify-between gap-2 text-xs transition-colors"
                            >
                              <div>
                                <div className="font-bold text-white text-xs">{item.kelompokProdi}</div>
                                <div className="text-[10px] text-indigo-200 flex items-center gap-2 mt-0.5">
                                  <span>Rumpun: {item.rumpunIlmo}</span>
                                  <span>•</span>
                                  <span className="text-amber-300 font-semibold">
                                    Pendukung: {item.mapelPendukung1} & {item.mapelPendukung2}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange('mapelTka1', item.mapelPendukung1);
                                  handleChange('mapelTka2', item.mapelPendukung2);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-md shrink-0 transition-colors"
                              >
                                Terapkan Mapel
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel Pertimbangan Matang untuk Siswa & Orang Tua */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 rounded-2xl border border-indigo-900/60 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-indigo-800/60 pb-2.5">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h5 className="font-bold text-xs text-white">
                        Panel Pertimbangan Studi Lanjut (Orang Tua & Siswa)
                      </h5>
                      <p className="text-[10px] text-indigo-200">
                        Checklist pertimbangan matang berdasarkan akreditasi BAN-PT dan linieritas TKA
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">1. Akreditasi BAN-PT</span>
                        <span className="text-indigo-200 text-[10px]">
                          Pilihan 1 & 2 telah diverifikasi dengan database BAN-PT untuk jaminan mutu.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">2. Linieritas Mapel TKA</span>
                        <span className="text-indigo-200 text-[10px]">
                          Mapel TKA 1 & 2 diselaraskan dengan syarat pendukung resmi SNBP Kemdikbud.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <datalist id="universitas-list">
                  {UNIVERSITAS_POPULAR_OPTIONS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>

                <datalist id="prodi-list">
                  {PRODI_POPULAR_OPTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>

                <datalist id="akreditasi-options">
                  <option value="Unggul" />
                  <option value="A" />
                  <option value="Baik Sekali" />
                  <option value="B" />
                  <option value="Baik" />
                  <option value="C" />
                  <option value="Terakreditasi Internasional (ASIIN/IABEE)" />
                  <option value="Dalam Proses Akreditasi" />
                </datalist>

                {/* KIP Kuliah & Desil Section */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                    <div>
                      <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-emerald-600" />
                        Pengajuan KIP Kuliah & Kategori Desil
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Informasi pengajuan Kartu Indonesia Pintar (KIP) Kuliah dan DTKS Kemensos.
                      </p>
                    </div>
                  </div>

                  {/* Mengajukan KIP Kuliah? */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Mengajukan KIP Kuliah? <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center space-x-6">
                      <label className="inline-flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="mengajukanKipKuliah"
                          value="Ya"
                          checked={formData.mengajukanKipKuliah === 'Ya'}
                          onChange={() => handleChange('mengajukanKipKuliah', 'Ya')}
                          className="text-emerald-600 focus:ring-emerald-500 mr-2"
                        />
                        Ya (Mengajukan KIP Kuliah)
                      </label>
                      <label className="inline-flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="mengajukanKipKuliah"
                          value="Tidak"
                          checked={formData.mengajukanKipKuliah === 'Tidak'}
                          onChange={() => {
                            handleChange('mengajukanKipKuliah', 'Tidak');
                            handleChange('kategoriDesil', '');
                          }}
                          className="text-emerald-600 focus:ring-emerald-500 mr-2"
                        />
                        Tidak
                      </label>
                    </div>
                  </div>

                  {/* If Mengajukan KIP Kuliah === 'Ya' */}
                  {formData.mengajukanKipKuliah === 'Ya' && (
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-emerald-950">
                        Pilihan Kategori Desil (Berdasarkan DTKS / Data Kemensos) <span className="text-rose-500">*</span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(['Desil 1', 'Desil 2', 'Desil 3', 'Desil 4', 'Desil 5'] as const).map((desil) => (
                          <label
                            key={desil}
                            className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center ${
                              formData.kategoriDesil === desil
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold'
                                : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50 font-medium text-xs'
                            }`}
                          >
                            <input
                              type="radio"
                              name="kategoriDesil"
                              value={desil}
                              checked={formData.kategoriDesil === desil}
                              onChange={() => handleChange('kategoriDesil', desil)}
                              className="sr-only"
                            />
                            <span className="text-xs">{desil}</span>
                          </label>
                        ))}
                      </div>

                      {/* Rincian Kategori Desil & Link */}
                      <div className="mt-3 bg-white p-3 rounded-lg border border-emerald-200/80 text-[11px] space-y-2 text-slate-700">
                        <div className="font-bold text-emerald-900 flex items-center justify-between">
                          <span>📋 Rincian Kategori Desil (1 s.d. 5):</span>
                          <a
                            href="https://cekbansos.kemensos.go.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 text-[10px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200"
                          >
                            🔗 Cek Bansos Kemensos
                          </a>
                        </div>
                        <ul className="space-y-1 text-[10.5px] text-slate-600 leading-relaxed pl-3 list-disc">
                          <li><strong>Desil 1:</strong> Kelompok sangat miskin atau 10% penduduk dengan tingkat kesejahteraan paling rendah (miskin ekstrem).</li>
                          <li><strong>Desil 2:</strong> Kelompok masyarakat yang masuk kategori miskin.</li>
                          <li><strong>Desil 3:</strong> Kelompok masyarakat yang dikategorikan hampir miskin.</li>
                          <li><strong>Desil 4:</strong> Kelompok masyarakat yang masuk kategori rentan miskin.</li>
                          <li><strong>Desil 5:</strong> Kelompok masyarakat dengan kondisi pas-pasan atau batas bawah kelas menengah (cenderung stabil secara ekonomi tetapi belum mapan).</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Siswa memilih rute <strong>{formData.pilihanStudiLanjut}</strong>. Pengisian nama Program Studi Perguruan Tinggi dilewati secara otomatis.
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 4: DATA PRESTASI SISWA (Maksimal 15 Sertifikat) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> 4. Data Prestasi Siswa
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tuliskan data prestasi akademik atau Non-Akademik selama SMA (Maksimal 15 Sertifikat).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  {prestasiList.length} / 15 Sertifikat
                </span>

                <button
                  type="button"
                  onClick={handleAddPrestasi}
                  disabled={prestasiList.length >= 15}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sertifikat</span>
                </button>
              </div>
            </div>

            {/* Note badge regarding Dapodik curation */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Catatan Penting Dapodik:</strong> Pastikan seluruh nama kejuaraan, tingkat prestasi, dan lembaga pengeluar sudah dikurasi dan terdaftar di bagian <strong>Dapodik Sekolah</strong> untuk keperluan verifikasi SNBP / SNBT.
              </div>
            </div>

            {/* Empty State or Certificate List */}
            {prestasiList.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                Belum ada data prestasi yang dimasukkan. Klik tombol <strong>+ Tambah Sertifikat</strong> di atas jika siswa memiliki sertifikat kejuaraan.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {prestasiList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        Sertifikat #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemovePrestasi(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Sertifikat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Nama Prestasi */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nama Prestasi / Kejuaraan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={item.namaPrestasi}
                          onChange={(e) =>
                            handleUpdatePrestasi(item.id, 'namaPrestasi', e.target.value)
                          }
                          placeholder="Contoh: Juara 1 Olimpiade Sains Nasional (OSN) Matematika"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      {/* Jenis Prestasi */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Jenis Prestasi
                        </label>
                        <div className="flex items-center space-x-3 pt-1">
                          <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`jenis-${item.id}`}
                              value="Akademik"
                              checked={item.jenis === 'Akademik'}
                              onChange={() =>
                                handleUpdatePrestasi(item.id, 'jenis', 'Akademik')
                              }
                              className="text-amber-600 focus:ring-amber-500 mr-1"
                            />
                            Akademik
                          </label>
                          <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`jenis-${item.id}`}
                              value="Non-Akademik"
                              checked={item.jenis === 'Non-Akademik'}
                              onChange={() =>
                                handleUpdatePrestasi(item.id, 'jenis', 'Non-Akademik')
                              }
                              className="text-amber-600 focus:ring-amber-500 mr-1"
                            />
                            Non-Akademik
                          </label>
                        </div>
                      </div>

                      {/* Tingkat Prestasi */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tingkat Prestasi
                        </label>
                        <select
                          value={item.tingkat}
                          onChange={(e) =>
                            handleUpdatePrestasi(
                              item.id,
                              'tingkat',
                              e.target.value as TingkatPrestasi
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        >
                          <option value="Kota/Kabupaten">Tingkat Kota / Kabupaten</option>
                          <option value="Provinsi">Tingkat Provinsi</option>
                          <option value="Nasional">Tingkat Nasional</option>
                          <option value="Internasional">Tingkat Internasional</option>
                        </select>
                      </div>

                      {/* Lembaga yang Mengeluarkan */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Lembaga yang Mengeluarkan (Terkurasi Dapodik)
                        </label>
                        <input
                          type="text"
                          value={item.lembaga}
                          onChange={(e) =>
                            handleUpdatePrestasi(item.id, 'lembaga', e.target.value)
                          }
                          placeholder="Contoh: Puspresnas / Kemendikbudristek / Dinas Pendidikan"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-2xs hover:scale-[1.01]"
            >
              <Printer className="w-4 h-4 text-amber-800" />
              <span>Cetak / Export Hasil Formulir (PDF)</span>
            </button>

            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (userRole === 'siswa' && !isStudentFormOpen)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                  userRole === 'siswa' && !isStudentFormOpen
                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 disabled:opacity-50'
                }`}
              >
                {userRole === 'siswa' && !isStudentFormOpen ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Akses Formulir Ditutup Admin</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Siswa'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* STUDENT FORM PDF MODAL */}
      {isPdfModalOpen && (
        <StudentFormPdfModal
          formData={{
            ...formData,
            prestasiList,
          }}
          onClose={() => setIsPdfModalOpen(false)}
          onExitForm={onCancel}
        />
      )}

      {/* BAN-PT DIRECTORY SELECTION MODAL */}
      {isBanPtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 relative shrink-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <Building2 className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Pilih PTN & Program Studi dari Direktori BAN-PT</span>
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    Siswa & Orang Tua: Mengisi untuk <strong className="text-amber-300">{banPtTarget === 'pilihan1' ? 'Pilihan 1 (Utama)' : 'Pilihan 2 (Alternatif)'}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenBanPtDirectory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsBanPtModalOpen(false);
                      onOpenBanPtDirectory();
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 border border-indigo-300/40 text-xs font-bold rounded-xl transition-all"
                    title="Ke Halaman Utama Direktori BAN-PT untuk pencarian tabel lengkap"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Menu Utama Direktori</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsBanPtModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-slate-50 border-b border-slate-200">
              {/* Category Abbreviations Quick Guide Banner */}
              <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] space-y-1">
                <div className="font-extrabold text-amber-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Keterangan Jenis Perguruan Tinggi (BAN-PT):</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-200">
                  <span><strong className="text-emerald-300">PTN:</strong> Perguruan Tinggi Negeri</span>
                  <span><strong className="text-sky-300">PTAN:</strong> Perguruan Tinggi Agama Negeri</span>
                  <span><strong className="text-purple-300">PTAS:</strong> Perguruan Tinggi Agama Swasta</span>
                  <span><strong className="text-amber-300">PTKL:</strong> Perguruan Tinggi Kementerian Lain</span>
                  <span><strong className="text-rose-300">01-17:</strong> PTS di bawah LLDIKTI (01 s.d. 17)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cari Perguruan Tinggi:
                  </label>
                  <input
                    type="text"
                    value={banPtSearchPtn}
                    onChange={(e) => setBanPtSearchPtn(e.target.value)}
                    placeholder="Contoh: ITB, UI, UGM..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cari Program Studi:
                  </label>
                  <input
                    type="text"
                    value={banPtSearchProdi}
                    onChange={(e) => setBanPtSearchProdi(e.target.value)}
                    placeholder="Contoh: Kedokteran, Informatika..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Filter Jenjang:
                  </label>
                  <select
                    value={banPtSearchJenjang}
                    onChange={(e) => setBanPtSearchJenjang(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="ALL">Semua Jenjang</option>
                    <option value="S1">S1 (Sarjana)</option>
                    <option value="D4">D4 (Sarjana Terapan)</option>
                    <option value="D3">D3 (Diploma Tiga)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Akreditasi BAN-PT:
                  </label>
                  <select
                    value={banPtSearchAkreditasi}
                    onChange={(e) => setBanPtSearchAkreditasi(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="ALL">Semua Akreditasi</option>
                    <option value="Unggul">Unggul</option>
                    <option value="A">A</option>
                    <option value="Baik Sekali">Baik Sekali</option>
                    <option value="B">B</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {SAMPLE_BANPT_DATA.filter((item) => {
                const matchPtn = !banPtSearchPtn || item.ptn.toLowerCase().includes(banPtSearchPtn.toLowerCase());
                const matchProdi = !banPtSearchProdi || item.prodi.toLowerCase().includes(banPtSearchProdi.toLowerCase());
                const matchJenjang = banPtSearchJenjang === 'ALL' || item.jenjang === banPtSearchJenjang;
                const matchAkreditasi = banPtSearchAkreditasi === 'ALL' || item.akreditasi === banPtSearchAkreditasi;
                return matchPtn && matchProdi && matchJenjang && matchAkreditasi;
              }).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                      <span>{item.ptn}</span>
                      <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-200">
                        {item.akreditasi}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium">{item.prodi} ({item.jenjang})</div>
                    <div className="text-[10px] text-slate-400">
                      SK: {item.nomorSk} | s.d {item.tahunKedaluwarsa} | Wilayah: {item.wilayah}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('ptn1', item.ptn);
                        handleChange('prodiPilihan1', item.prodi);
                        handleChange('akreditasiPilihan1', item.akreditasi);
                        setBanPtAlertMessage(`Pilihan 1 berhasil diisi: ${item.prodi} (${item.ptn}) [Akreditasi ${item.akreditasi}]`);
                        setIsBanPtModalOpen(false);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      title="Set sebagai Pilihan 1 (Prioritas Utama)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Pilihan 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('ptn2', item.ptn);
                        handleChange('prodiPilihan2', item.prodi);
                        handleChange('akreditasiPilihan2', item.akreditasi);
                        setBanPtAlertMessage(`Pilihan 2 berhasil diisi: ${item.prodi} (${item.ptn}) [Akreditasi ${item.akreditasi}]`);
                        setIsBanPtModalOpen(false);
                      }}
                      className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10px] rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      title="Set sebagai Pilihan 2 (Prioritas Alternatif)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Pilihan 2</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED SUCCESS MODAL (DATA SUDAH TERKIRIM) */}
      {isSuccessModalOpen && submittedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            
            {/* Top Decorative Background Glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 opacity-15 -z-10" />

            {/* Animated Checkmark Circle with Pulse */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 border-4 border-white animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>

            {/* Header Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Data Berhasil Terkirim!
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Formulir Pengisian Selesai & Tersimpan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data Isian Mata Pelajaran TKA, Studi Lanjut, dan Identitas Siswa Anda telah diverifikasi oleh sistem dan tersimpan dengan aman secara real-time.
              </p>
            </div>

            {/* Student Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-800">{submittedStudent.namaSiswa}</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  {submittedStudent.kelas}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">NIS / NISN</p>
                  <p className="font-mono text-slate-700 font-semibold">{submittedStudent.nis} / {submittedStudent.nisn}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Studi Lanjut</p>
                  <p className="font-semibold text-slate-700">{submittedStudent.pilihanStudiLanjut}</p>
                </div>
              </div>

              {submittedStudent.pilihanStudiLanjut === 'Kuliah' && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-indigo-600" /> Pilihan PTN & Prodi
                  </p>
                  <p className="text-[11px] text-slate-800 font-bold truncate">
                    1. {submittedStudent.ptn1} - {submittedStudent.prodiPilihan1}
                  </p>
                  {submittedStudent.ptn2 && (
                    <p className="text-[11px] text-slate-600 truncate">
                      2. {submittedStudent.ptn2} - {submittedStudent.prodiPilihan2}
                    </p>
                  )}
                </div>
              )}

              {/* Multi-Destination Sync Badges */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Status Sinkronisasi Sistem:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Memori Lokal Browser</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Database Cloud Firestore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsPdfModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Pratinjau PDF Bukti Pendaftaran</span>
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    onCancel();
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-rose-500/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Selesai & Keluar dari Formulir</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Tetap di Form (Edit Lagi)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
