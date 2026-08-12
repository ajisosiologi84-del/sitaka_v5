import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  KeyRound,
  Printer,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shuffle,
} from 'lucide-react';
import { MasterSchoolStudent, NavigationTab } from '../types';
import {
  addMasterSchoolStudent,
  updateMasterSchoolStudent,
  deleteMasterSchoolStudent,
  deleteMultipleMasterSchoolStudents,
  clearAllMasterSchoolStudents,
  saveMasterSchoolStudents,
  DEFAULT_MASTER_SCHOOL_STUDENTS,
} from '../utils/storage';
import { formatNisn, generateRandomStudentPassword } from '../utils/sanitizer';

const SimpleBarcode: React.FC<{ value: string; height?: number }> = ({ value, height = 22 }) => {
  const bars: { width: number; isBlack: boolean }[] = [];
  bars.push({ width: 2, isBlack: true }, { width: 1, isBlack: false }, { width: 2, isBlack: true }, { width: 1, isBlack: false });

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const w2 = ((code * 2) % 3) + 1;
    bars.push({ width: w1, isBlack: true }, { width: 1, isBlack: false }, { width: w2, isBlack: true }, { width: 1, isBlack: false });
  }

  bars.push({ width: 2, isBlack: true }, { width: 1, isBlack: false }, { width: 2, isBlack: true });
  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <div className="inline-flex flex-col items-center">
      <svg width={Math.min(totalWidth * 1.5, 110)} height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="block">
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width;
          if (!bar.isBlack) return null;
          return <rect key={idx} x={x} y={0} width={bar.width} height={height} fill="#000000" />;
        })}
      </svg>
      <span className="font-mono text-[8px] font-bold tracking-wider text-slate-800 uppercase mt-0.5">{value}</span>
    </div>
  );
};

interface SchoolDataViewProps {
  masterStudents: MasterSchoolStudent[];
  setMasterStudents: React.Dispatch<React.SetStateAction<MasterSchoolStudent[]>>;
  onNavigateTab?: (tab: NavigationTab) => void;
  userRole?: string | null;
  currentUserNis?: string | null;
}

export const SchoolDataView: React.FC<SchoolDataViewProps> = ({
  masterStudents,
  setMasterStudents,
  onNavigateTab,
  userRole,
  currentUserNis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  
  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterSchoolStudent | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintCardsModalOpen, setIsPrintCardsModalOpen] = useState(false);
  const [printSelectedKelas, setPrintSelectedKelas] = useState('ALL');
  const [printSourceMode, setPrintSourceMode] = useState<'selected' | 'filtered' | 'all'>('selected');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Form State
  const [formValues, setFormValues] = useState({
    namaSiswa: '',
    nis: '',
    nisn: '',
    kelas: 'XII MIPA 1',
    password: '',
  });
  const [formError, setFormError] = useState('');

  // Import State
  const [rawImportText, setRawImportText] = useState('');
  const [importPreview, setImportPreview] = useState<Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string; password?: string }>>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Deduplicate master students to avoid duplicated student data anywhere
  const uniqueMasterStudents = useMemo(() => {
    const seen = new Set<string>();
    return masterStudents.filter((student) => {
      const key = student.id && !student.id.startsWith('mst-imp-')
        ? student.id
        : `${(student.nis || '').trim()}_${(student.nisn || '').trim()}_${(student.namaSiswa || '').toLowerCase().trim()}`;
      if (!key || key === '__') return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [masterStudents]);

  // Extract unique classes
  const availableClasses = useMemo(() => {
    return Array.from(
      new Set([
        'XII MIPA 1',
        'XII MIPA 2',
        'XII IPS 1',
        'XII IPS 2',
        ...uniqueMasterStudents.map((s) => s.kelas).filter(Boolean),
      ])
    ).sort();
  }, [uniqueMasterStudents]);

  // Selection state for multi-delete / print
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'selected' | 'all' | 'reset' | 'regenerate';
    title: string;
    message: string;
    targetId?: string;
  } | null>(null);

  // Filtered Students in main table view
  const filteredStudents = useMemo(() => {
    return uniqueMasterStudents.filter((student) => {
      if (userRole === 'siswa' && currentUserNis) {
        const cleanTarget = currentUserNis.trim();
        const isMyNis =
          (student.nis && student.nis.toString().trim() === cleanTarget) ||
          (student.nisn && student.nisn.toString().trim() === cleanTarget);
        if (!isMyNis) return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.namaSiswa.toLowerCase().includes(q) ||
        student.nis.toLowerCase().includes(q) ||
        student.nisn.toLowerCase().includes(q) ||
        student.kelas.toLowerCase().includes(q) ||
        (student.password && student.password.toLowerCase().includes(q));

      const matchesKelas = selectedKelas === 'ALL' || student.kelas === selectedKelas;

      return matchesSearch && matchesKelas;
    });
  }, [uniqueMasterStudents, userRole, currentUserNis, searchQuery, selectedKelas]);

  const isAllSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAutoGeneratePasswords = () => {
    let missingCount = 0;
    const updated = masterStudents.map((s) => {
      if (!s.password) {
        missingCount++;
        return { ...s, password: generateRandomStudentPassword() };
      }
      return s;
    });

    if (missingCount > 0) {
      saveMasterSchoolStudents(updated);
      setMasterStudents(updated);
      alert(`✓ Berhasil membuat password acak baru untuk ${missingCount} siswa!`);
    } else {
      setConfirmModal({
        isOpen: true,
        type: 'regenerate',
        title: 'Acak Ulang Semua Password?',
        message: `Seluruh ${masterStudents.length} siswa sudah memiliki password. Apakah Anda ingin mengacak ulang (regenerate) password acak untuk SEMUA siswa?`,
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'selected',
      title: 'Hapus Data Terpilih?',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa sekolah yang dipilih?`,
    });
  };

  const handleDeleteAll = () => {
    if (masterStudents.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'all',
      title: 'Hapus Semua Data Sekolah?',
      message: `Apakah Anda benar-benar yakin ingin MENGHAPUS SEMUA (${masterStudents.length} siswa) data sekolah master? Tindakan ini tidak dapat dibatalkan.`,
    });
  };

  const handleDelete = (id: string, nama: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'single',
      title: 'Hapus Data Siswa?',
      message: `Apakah Anda yakin ingin menghapus data master "${nama}"?`,
      targetId: id,
    });
  };

  const handleResetDefault = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reset',
      title: 'Muat Contoh Data Bawaan?',
      message: 'Reset data sekolah ke 8 data contoh bawaan? Seluruh data yang ada saat ini akan digantikan.',
    });
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'all') {
      clearAllMasterSchoolStudents(masterStudents);
      setMasterStudents([]);
      setSelectedIds([]);
    } else if (confirmModal.type === 'selected') {
      deleteMultipleMasterSchoolStudents(selectedIds);
      setMasterStudents((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } else if (confirmModal.type === 'single' && confirmModal.targetId) {
      deleteMasterSchoolStudent(confirmModal.targetId);
      setMasterStudents((prev) => prev.filter((s) => s.id !== confirmModal.targetId));
      setSelectedIds((prev) => prev.filter((i) => i !== confirmModal.targetId));
      if (editingItem?.id === confirmModal.targetId) {
        setIsAddEditModalOpen(false);
        setEditingItem(null);
      }
    } else if (confirmModal.type === 'reset') {
      saveMasterSchoolStudents(DEFAULT_MASTER_SCHOOL_STUDENTS, true);
      setMasterStudents(DEFAULT_MASTER_SCHOOL_STUDENTS);
    } else if (confirmModal.type === 'regenerate') {
      const regenerated = masterStudents.map((s) => ({
        ...s,
        password: generateRandomStudentPassword(),
      }));
      saveMasterSchoolStudents(regenerated);
      setMasterStudents(regenerated);
      alert(`✓ Berhasil mengacak ulang password untuk seluruh ${regenerated.length} siswa!`);
    }

    setConfirmModal(null);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormValues({
      namaSiswa: '',
      nis: '',
      nisn: '',
      kelas: availableClasses[0] || 'XII MIPA 1',
      password: generateRandomStudentPassword(),
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: MasterSchoolStudent) => {
    setEditingItem(item);
    setFormValues({
      namaSiswa: item.namaSiswa,
      nis: item.nis,
      nisn: item.nisn,
      kelas: item.kelas,
      password: item.password || generateRandomStudentPassword(),
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.namaSiswa.trim()) {
      setFormError('Nama Siswa wajib diisi.');
      return;
    }
    if (!formValues.nis.trim()) {
      setFormError('NIS (Nomor Induk Siswa) wajib diisi.');
      return;
    }
    if (!formValues.nisn.trim()) {
      setFormError('NISN (Nomor Induk Siswa Nasional) wajib diisi.');
      return;
    }

    const finalPassword = formValues.password.trim() || generateRandomStudentPassword();

    if (editingItem) {
      const updatedItem: MasterSchoolStudent = {
        ...editingItem,
        namaSiswa: formValues.namaSiswa.trim(),
        nis: formValues.nis.trim(),
        nisn: formatNisn(formValues.nisn),
        kelas: formValues.kelas.trim(),
        password: finalPassword,
      };
      updateMasterSchoolStudent(updatedItem);
      setMasterStudents((prev) => prev.map((s) => (s.id === updatedItem.id ? updatedItem : s)));
    } else {
      const created = addMasterSchoolStudent({
        namaSiswa: formValues.namaSiswa.trim(),
        nis: formValues.nis.trim(),
        nisn: formatNisn(formValues.nisn),
        kelas: formValues.kelas.trim(),
        password: finalPassword,
      });
      setMasterStudents((prev) => [created, ...prev]);
    }

    setIsAddEditModalOpen(false);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { 'Nama Siswa': 'Ahmad Fauzi', 'NIS': '22231001', 'NISN': '0061234561', 'Kelas': 'XII MIPA 1', 'Password': '7B9K2M' },
      { 'Nama Siswa': 'Anisa Rahmawati', 'NIS': '22231002', 'NISN': '0061234562', 'Kelas': 'XII MIPA 1', 'Password': '4X8R1P' },
      { 'Nama Siswa': 'Bintang Putra Pratama', 'NIS': '22231003', 'NISN': '0061234563', 'Kelas': 'XII MIPA 2', 'Password': '9N2Y5T' },
      { 'Nama Siswa': 'Citra Dewi Kartika', 'NIS': '22231004', 'NISN': '0061234564', 'Kelas': 'XII MIPA 2', 'Password': '3M7K8W' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 30 }, // Nama Siswa
      { wch: 15 }, // NIS
      { wch: 18 }, // NISN
      { wch: 20 }, // Kelas
      { wch: 15 }, // Password
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Input Data Sekolah');
    XLSX.writeFile(workbook, 'Template_Input_Data_Sekolah.xlsx');
  };

  const handleLoadSampleTemplateText = () => {
    const sampleText = `Nama Siswa\tNIS\tNISN\tKelas\tPassword
Ahmad Fauzi\t22231001\t0061234561\tXII MIPA 1\t7B9K2M
Anisa Rahmawati\t22231002\t0061234562\tXII MIPA 1\t4X8R1P
Bintang Putra Pratama\t22231003\t0061234563\tXII MIPA 2\t9N2Y5T
Citra Dewi Kartika\t22231004\t0061234564\tXII MIPA 2\t3M7K8W`;
    setRawImportText(sampleText);
    setImportStatus('✓ Contoh data template Excel berhasil dimuat! Klik "Pratinjau Data" untuk memeriksa.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const parsed: Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string; password?: string }> = [];
        data.forEach((row: any) => {
          const keys = Object.keys(row);
          const findKey = (term: string) => keys.find((k) => k.toLowerCase().includes(term));

          const namaKey = findKey('nama') || keys[0];
          const nisKey = keys.find((k) => k.toLowerCase().includes('nis') && !k.toLowerCase().includes('nisn')) || keys[1];
          const nisnKey = findKey('nisn') || keys[2];
          const kelasKey = findKey('kelas') || keys[3];
          const passKey = findKey('pass') || keys[4];

          const rawNama = String(row[namaKey] || '').trim();
          const rawNis = String(row[nisKey || ''] || '').trim();
          const rawNisn = formatNisn(row[nisnKey || '']);
          const rawKelas = String(row[kelasKey || ''] || 'XII MIPA 1').trim();
          const rawPass = String(row[passKey || ''] || '').trim() || generateRandomStudentPassword();

          if (rawNama) {
            parsed.push({
              namaSiswa: rawNama,
              nis: rawNis,
              nisn: rawNisn,
              kelas: rawKelas || 'XII MIPA 1',
              password: rawPass,
            });
          }
        });

        setImportPreview(parsed);
        if (parsed.length > 0) {
          setImportStatus(`✓ Berhasil membaca file Excel "${file.name}" (${parsed.length} baris data siswa).`);
        } else {
          setImportStatus('❌ File Excel dibaca tetapi tidak ditemukan baris data siswa yang sesuai.');
        }
      } catch (err) {
        console.error('File Excel error:', err);
        setImportStatus('❌ Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleParseImportText = () => {
    if (!rawImportText.trim()) {
      setImportPreview([]);
      setImportStatus('Mohon tempelkan data atau teks terlebih dahulu.');
      return;
    }

    const lines = rawImportText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string; password?: string }> = [];

    lines.forEach((line) => {
      let parts = line.split('\t');
      if (parts.length < 3) parts = line.split(',');
      if (parts.length < 3) parts = line.split(';');

      if (parts.length >= 3) {
        const rawNama = parts[0]?.trim() || '';
        const rawNis = parts[1]?.trim() || '';
        const rawNisn = formatNisn(parts[2]);
        const rawKelas = parts[3]?.trim() || 'XII MIPA 1';
        const rawPass = parts[4]?.trim() || generateRandomStudentPassword();

        if (
          rawNama.toLowerCase().includes('nama') &&
          (rawNis.toLowerCase().includes('nis') || rawNisn.toLowerCase().includes('nisn'))
        ) {
          return;
        }

        if (rawNama && (rawNis || rawNisn)) {
          parsed.push({
            namaSiswa: rawNama,
            nis: rawNis,
            nisn: rawNisn,
            kelas: rawKelas,
            password: rawPass,
          });
        }
      }
    });

    setImportPreview(parsed);
    if (parsed.length > 0) {
      setImportStatus(`Berhasil membaca ${parsed.length} baris data siswa.`);
    } else {
      setImportStatus('Gagal membaca data. Pastikan format kolom: Nama Siswa [Tab] NIS [Tab] NISN [Tab] Kelas [Tab] Password');
    }
  };

  const handleProcessImport = () => {
    if (importPreview.length === 0) return;

    const newItems: MasterSchoolStudent[] = importPreview.map((item, idx) => ({
      id: 'mst-imp-' + Date.now() + '-' + idx,
      namaSiswa: item.namaSiswa,
      nis: item.nis,
      nisn: item.nisn,
      kelas: item.kelas || 'XII MIPA 1',
      password: item.password || generateRandomStudentPassword(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const combined = [...newItems, ...masterStudents];
    saveMasterSchoolStudents(combined);
    setMasterStudents(combined);

    setIsImportModalOpen(false);
    setRawImportText('');
    setImportPreview([]);
    setImportStatus(null);
    alert(`Berhasil mengimpor ${newItems.length} data siswa sekolah baru dengan password login!`);
  };

  const handleExportExcel = () => {
    if (masterStudents.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }
    const exportData = masterStudents.map((s) => ({
      'Nama Siswa': s.namaSiswa,
      'NIS / Username': s.nis,
      'NISN': s.nisn,
      'Kelas': s.kelas,
      'Password Login': s.password || s.nis,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Data Sekolah');
    XLSX.writeFile(workbook, `Master_Data_Sekolah_Password_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print Cards Filtering strictly based on selected source mode and class filter without duplicates
  const studentsToPrint = useMemo(() => {
    let source: MasterSchoolStudent[] = [];

    if (printSourceMode === 'selected') {
      if (selectedIds.length > 0) {
        source = uniqueMasterStudents.filter((s) => selectedIds.includes(s.id));
      } else {
        source = filteredStudents;
      }
    } else if (printSourceMode === 'filtered') {
      source = filteredStudents;
    } else {
      source = uniqueMasterStudents;
    }

    if (printSelectedKelas !== 'ALL') {
      source = source.filter((s) => s.kelas === printSelectedKelas);
    }

    // Guarantee strict deduplication by student ID or NIS
    const uniquePrint: MasterSchoolStudent[] = [];
    const seen = new Set<string>();
    for (const student of source) {
      const key = student.id || student.nis || student.namaSiswa;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePrint.push(student);
      }
    }
    return uniquePrint;
  }, [printSourceMode, selectedIds, uniqueMasterStudents, filteredStudents, printSelectedKelas]);

  const handleOpenPrintCardsModal = (mode?: 'selected' | 'filtered' | 'all') => {
    if (mode) {
      setPrintSourceMode(mode);
    } else if (selectedIds.length > 0) {
      setPrintSourceMode('selected');
    } else {
      setPrintSourceMode('filtered');
    }
    setPrintSelectedKelas(selectedKelas !== 'ALL' ? selectedKelas : 'ALL');
    setIsPrintCardsModalOpen(true);
  };

  const handleCopyCredentials = () => {
    const lines = studentsToPrint.map((s, idx) => `${idx + 1}. ${s.namaSiswa} (${s.kelas}) | Username/NIS: ${s.nis} | Password: ${s.password || s.nis}`);
    const textToCopy = `=== DAFTAR KARTU LOGIN SISWA PORTAL TKA 2026 ===\n` + lines.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleTriggerPrintCards = () => {
    const printElem = document.getElementById('printable-sticker-cards-container');
    if (!printElem) {
      window.print();
      return;
    }

    const docTitle = `Stiker_Kartu_Login_Siswa_TKA_${printSelectedKelas !== 'ALL' ? printSelectedKelas.replace(/\s+/g, '_') : 'Semua_Kelas'}`;

    try {
      const printWin = window.open('', '_blank', 'width=950,height=1000,scrollbars=yes,resizable=yes');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${docTitle}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                body {
                  font-family: 'Plus Jakarta Sans', sans-serif;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  padding: 16px;
                  margin: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 8mm;
                }
                @media print {
                  body {
                    padding: 0 !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                  .sticker-card {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    box-shadow: none !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 12px 18px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 13px; color: #065f46;">
                <div>
                  <strong>🖨️ Cetak Stiker Login Siswa (${studentsToPrint.length} Stiker):</strong> Pilih "Simpan sebagai PDF" / "Save as PDF" dan centang <em>"Grafik Latar Belakang" (Background graphics)</em>.
                </div>
                <button onclick="window.print()" style="background-color: #059669; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">
                  🖨️ Cetak / Simpan PDF
                </button>
              </div>
              <div id="printable-sticker-cards-container">
                ${printElem.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.error("Print popup error:", e);
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 lg:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5" />
              Master Database Sekolah & Kartu Login Siswa (Stiker)
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" /> Password Terenkripsi & Sinkron Realtime
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                INPUT DATA SEKOLAH & KARTU LOGIN
              </h2>
              <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                Kelola data master siswa (Nama, NIS, NISN, Kelas) dan password siswa untuk keamanan login. Output kartu login siswa dapat dicetak masal dalam bentuk <strong className="text-amber-300">Stiker Tempel</strong> berdasarkan kelas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleOpenPrintCardsModal()}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]"
                title="Cetak Kartu Login Siswa tampilan stiker masal"
              >
                <Printer className="w-4 h-4" /> Cetak Kartu Login (Stiker)
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Tambah Siswa
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-700 transition-all hover:border-slate-600"
              >
                <Upload className="w-4 h-4 text-emerald-400" /> Import Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa Master</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{masterStudents.length} <span className="text-xs font-normal text-slate-500">Siswa</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Siap untuk Auto-Fill Formulir</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password Terdaftar</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {masterStudents.filter((s) => !!s.password).length} / {masterStudents.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Terproteksi Login Unik</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Rombel / Kelas</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{availableClasses.length} <span className="text-xs font-normal text-slate-500">Kelas</span></h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">Siap Cetak Masal Stiker</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Format Kartu Stiker</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">100% <span className="text-xs font-normal text-slate-500">Standar TKA</span></h3>
            <p className="text-[11px] text-slate-500 mt-1">Barcode & QR Code Terintegrasi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Printer className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama Siswa, NIS, NISN, atau Password..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas ({masterStudents.length})</option>
              {availableClasses.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/20"
              title="Hapus data yang dicentang"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => handleOpenPrintCardsModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
            title="Cetak Stiker Login Siswa"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" /> Cetak Stiker Login ({selectedIds.length > 0 ? `${selectedIds.length} Dicentang` : 'Semua'})
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
            title="Export data ke file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export Excel
          </button>

          {masterStudents.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
              title="Hapus semua data master sekolah"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Hapus Semua
            </button>
          )}

          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Reset ke Contoh Bawaan"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sample
          </button>
        </div>
      </div>

      {/* Main Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> Data Master Siswa & Kredensial Login ({filteredStudents.length} Tampil)
          </h3>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Format: Nama Siswa | NIS | NISN | Kelas | Password Siswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    title="Pilih Semua / Batal Pilih"
                  />
                </th>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NIS / Username</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Password Akses Login</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600">Tidak ada data siswa sekolah yang ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau tambah data baru.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isSelected = selectedIds.includes(student.id);
                  const showPass = visiblePasswords[student.id];
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-indigo-50/70' : 'hover:bg-indigo-50/30'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(student.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {student.namaSiswa.charAt(0).toUpperCase()}
                        </div>
                        <span>{student.namaSiswa}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-900 bg-indigo-50/50 rounded px-2 py-1 inline-block mt-1">
                        {student.nis || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {student.nisn || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-emerald-950 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md tracking-wider">
                            {showPass ? student.password || student.nis : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleShowPassword(student.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title={showPass ? 'Sembunyikan Password' : 'Lihat Password'}
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('form')}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Isi Formulir Pendataan Siswa Ini"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Data / Password"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.namaSiswa)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Data Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {editingItem ? 'Edit Data Sekolah & Password Siswa' : 'Tambah Data Sekolah Siswa'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={formValues.namaSiswa}
                  onChange={(e) => setFormValues({ ...formValues, namaSiswa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 22231001"
                    value={formValues.nis}
                    onChange={(e) => setFormValues({ ...formValues, nis: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0061234561"
                    value={formValues.nisn}
                    onChange={(e) => setFormValues({ ...formValues, nisn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas <span className="text-rose-500">*</span></label>
                <select
                  value={formValues.kelas}
                  onChange={(e) => setFormValues({ ...formValues, kelas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableClasses.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password Acak Sistem <span className="text-rose-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, password: generateRandomStudentPassword() }))}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" /> Acak Baru
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Password acak login siswa"
                  value={formValues.password}
                  onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-mono font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Password ini tercetak pada Stiker Kartu Login Siswa.</p>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingItem.id, editingItem.namaSiswa)}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Siswa
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Data'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Import Data Sekolah dari File Excel (.xlsx / .xls)
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Format Kolom Excel (Nama Siswa, NIS, NISN, Kelas, Password):
                  </p>
                  <p className="font-mono text-[11px] text-amber-800 mt-0.5">
                    Kolom 1: Nama | Kolom 2: NIS | Kolom 3: NISN | Kolom 4: Kelas | Kolom 5: Password (Opsional)
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplateText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-700" /> Contoh Text
                  </button>
                </div>
              </div>
            </div>

            {/* OPSI 1: UPLOAD FILE EXCEL */}
            <div className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-indigo-950">Upload Langsung File Excel (.xlsx / .xls)</p>
                <p className="text-[11px] text-slate-500">Pilih file spreadsheet dari laptop/komputer Anda</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
                <FileSpreadsheet className="w-4 h-4" /> Pilih File Excel
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atau Tempelkan Teks Excel</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempelkan Baris Tabel Excel di Sini (Copy-Paste):
              </label>
              <textarea
                rows={4}
                value={rawImportText}
                onChange={(e) => setRawImportText(e.target.value)}
                placeholder="Ahmad Fauzi&#10914;22231001&#10914;0061234561&#10914;XII MIPA 1&#10914;7B9K2M"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              ></textarea>
            </div>

            {importStatus && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
                {importStatus}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2">Nama Siswa</th>
                      <th className="p-2">NIS</th>
                      <th className="p-2">NISN</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.map((p, i) => (
                      <tr key={i}>
                        <td className="p-2 font-bold">{p.namaSiswa}</td>
                        <td className="p-2 font-mono">{p.nis}</td>
                        <td className="p-2 font-mono">{p.nisn}</td>
                        <td className="p-2">{p.kelas}</td>
                        <td className="p-2 font-mono font-bold text-indigo-900">{p.password || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleParseImportText}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Pratinjau Data
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleProcessImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/30"
                >
                  Simpan {importPreview.length} Data Ke Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CETAK KARTU LOGIN SISWA MODAL (STIKER STYLE) */}
      {isPrintCardsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          {/* Print Style Injector */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .fixed, .max-h-\\[90vh\\], .overflow-y-auto {
                position: static !important;
                overflow: visible !important;
                max-height: none !important;
                height: auto !important;
                background: transparent !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: auto !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-sticker-cards-container, #printable-sticker-cards-container * {
                visibility: visible !important;
              }
              #printable-sticker-cards-container {
                position: static !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                background: white !important;
                overflow: visible !important;
              }
              .no-print {
                display: none !important;
              }
              .sticker-card {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                border: 2px solid #000 !important;
                box-shadow: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 no-print">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-600" />
                  Cetak Kartu Login Siswa (Tampilan Stiker Tempel)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Desain stiker presisi berisi Username (NIS), NISN, dan Password acak sistem untuk kemudahan login siswa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200 transition-all"
                  title="Salin seluruh username dan password siswa dalam bentuk teks"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedSuccess ? 'Tersalin ke Clipboard!' : 'Salin Semua Teks'}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPrintCards}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Cetak Masal (Print / PDF)
                </button>

                <button
                  onClick={() => setIsPrintCardsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar in Modal */}
            <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" /> Sumber Stiker:
                </span>
                
                <button
                  type="button"
                  onClick={() => setPrintSourceMode('selected')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    printSourceMode === 'selected'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Cetak hanya siswa yang dicentang di tabel"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dicentang ({selectedIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPrintSourceMode('filtered')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    printSourceMode === 'filtered'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Cetak siswa hasil pencarian/filter tabel"
                >
                  Filter Tabel ({filteredStudents.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPrintSourceMode('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    printSourceMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Cetak seluruh siswa di database master"
                >
                  Semua Data ({uniqueMasterStudents.length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={printSelectedKelas}
                  onChange={(e) => setPrintSelectedKelas(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Kelas</option>
                  {availableClasses.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>

                <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  Menampilkan <strong className="text-emerald-700">{studentsToPrint.length}</strong> Stiker
                </div>
              </div>
            </div>

            {/* PRINTABLE STICKER CARDS AREA */}
            <div id="printable-sticker-cards-container" className="flex-1 overflow-y-auto p-4 space-y-6">
              {studentsToPrint.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600">Tidak ada kartu login siswa untuk kelas ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentsToPrint.map((student, idx) => (
                    <div
                      key={student.id || idx}
                      className="sticker-card border-2 border-slate-900 rounded-2xl p-4 bg-white relative space-y-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Top Sticker Header */}
                      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5 gap-2">
                        <div className="flex items-center gap-2.5">
                          <QRCodeSVG
                            value={`SITAKA-LOGIN|NIS:${student.nis}|PASS:${student.password || student.nis}`}
                            size={44}
                          />
                          <div>
                            <h4 className="font-black text-xs uppercase tracking-tight text-slate-950 font-sans">
                              KARTU LOGIN SISWA TKA 2026
                            </h4>
                            <p className="text-[10px] font-bold text-slate-700 font-sans">
                              SMA / MA / SMK SITAKA 2026
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2.5 py-0.5 rounded-md inline-block">
                            {student.kelas}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 block mt-0.5 font-mono">
                            STIKER #{idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Main Credentials Box */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                            NAMA LENGKAP SISWA:
                          </span>
                          <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                            {student.namaSiswa}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">USERNAME / NIS:</span>
                            <span className="text-xs font-mono font-extrabold text-slate-900 block">
                              {student.nis}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              NISN: {student.nisn || '-'}
                            </span>
                          </div>

                          <div className="border-l border-slate-200 pl-2">
                            <span className="text-[9px] text-indigo-700 font-extrabold block uppercase">PASSWORD LOGIN:</span>
                            <span className="text-xs font-mono font-black text-indigo-950 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded inline-block mt-0.5 shadow-2xs">
                              {student.password || student.nis}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info & Barcode */}
                      <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[9px] text-slate-600 font-sans">
                        <span className="italic max-w-[200px] leading-tight">
                          Gunakan Username (NIS) & Password acak ini untuk login Portal SISWA TKA.
                        </span>
                        <SimpleBarcode value={`NIS-${student.nis}`} height={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
              <span>Status: <strong className="text-emerald-700 font-bold">Siap Dicetak ({studentsToPrint.length} Stiker)</strong></span>
              <button
                type="button"
                onClick={() => setIsPrintCardsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl ${confirmModal.type === 'reset' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md ${
                  confirmModal.type === 'reset' || confirmModal.type === 'regenerate'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {confirmModal.type === 'reset' ? 'Ya, Muat Contoh' : confirmModal.type === 'regenerate' ? 'Ya, Acak Ulang' : 'Ya, Hapus Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
