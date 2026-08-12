import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Laptop,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Edit2,
  Trash2,
  HardDrive,
  UserCheck,
  RotateCcw,
  Settings,
  Users,
  Building,
  Save,
  Info,
  Sliders,
  ShieldCheck,
  CheckSquare,
  Tag,
  QrCode,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import {
  Student,
  LaptopData,
  ProktorTeknisi,
  DocumentSettings,
  StatusKelayakanLaptop
} from '../types';

const SimpleBarcode: React.FC<{ value: string; height?: number }> = ({ value, height = 24 }) => {
  const bars: { width: number; isBlack: boolean }[] = [];
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const w2 = ((code * 2) % 3) + 1;
    bars.push({ width: w1, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: w2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
  }

  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <div className="inline-flex flex-col items-center">
      <svg width={Math.min(totalWidth * 1.8, 130)} height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="block">
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

interface LaptopInventoryViewProps {
  students: Student[];
  laptops: LaptopData[];
  proktorList: ProktorTeknisi[];
  docSettings: DocumentSettings;
  appsScriptUrl?: string;
  onSyncGoogleSheets?: () => Promise<boolean>;
  onNavigateToAppScript?: () => void;
  onAddLaptop: (data: Omit<LaptopData, 'id' | 'updatedAt'>) => void;
  onUpdateLaptop: (data: LaptopData) => void;
  onDeleteLaptop: (id: string) => void;
  onResetLaptops: () => void;
  onAddProktor: (data: Omit<ProktorTeknisi, 'id'>) => void;
  onUpdateProktor: (data: ProktorTeknisi) => void;
  onDeleteProktor: (id: string) => void;
  onSaveDocSettings: (settings: DocumentSettings) => void;
  onResetDocSettings: () => void;
}

export const LaptopInventoryView: React.FC<LaptopInventoryViewProps> = ({
  students,
  laptops,
  proktorList,
  docSettings,
  appsScriptUrl,
  onSyncGoogleSheets,
  onNavigateToAppScript,
  onAddLaptop,
  onUpdateLaptop,
  onDeleteLaptop,
  onResetLaptops,
  onAddProktor,
  onUpdateProktor,
  onDeleteProktor,
  onSaveDocSettings,
  onResetDocSettings,
}) => {
  // Sub-tab Navigation: 'laptops' | 'proktor' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState<'laptops' | 'proktor' | 'settings'>('laptops');

  // Sync Google Sheets State
  const [isSyncingGas, setIsSyncingGas] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'laptop' | 'proktor' | 'resetLaptops';
    id?: string;
    title: string;
    details?: string;
  } | null>(null);

  // Search & Filters for Laptop
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gelombangFilter, setGelombangFilter] = useState<string>('ALL');
  const [ruangFilter, setRuangFilter] = useState<string>('ALL');

  // Modal State for Laptop
  const [isLaptopModalOpen, setIsLaptopModalOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<LaptopData | null>(null);

  // Modal State for Proktor / Teknisi
  const [isProktorModalOpen, setIsProktorModalOpen] = useState(false);
  const [editingProktor, setEditingProktor] = useState<ProktorTeknisi | null>(null);

  // Print Preview Modal State
  const [printDocType, setPrintDocType] = useState<'surat' | 'kelengkapan' | 'stiker' | 'stiker-batch' | null>(null);
  const [selectedLaptopForPrint, setSelectedLaptopForPrint] = useState<LaptopData | null>(null);

  // Form State for Laptop
  const [laptopFormData, setLaptopFormData] = useState<{
    studentId: string;
    namaSiswa: string;
    kelas: string;
    gelombang: string;
    merkLaptop: string;
    charger: boolean;
    mouse: boolean;
    keyboard: boolean;
    kodeRuang: string;
    noUrutLaptop: string;
    namaTeknisi: string;
    statusKelayakan: StatusKelayakanLaptop;
    catatanKondisi: string;
    namaOrangTua: string;
  }>({
    studentId: '',
    namaSiswa: '',
    kelas: 'XII MIPA 1',
    gelombang: 'Gelombang 1 (26 - 29 Okt 2026)',
    merkLaptop: '',
    charger: true,
    mouse: true,
    keyboard: true,
    kodeRuang: 'Lab Komputer 1',
    noUrutLaptop: '',
    namaTeknisi: 'Budi Santoso, S.Kom',
    statusKelayakan: 'LAYAK',
    catatanKondisi: 'Laptop dalam kondisi siap pakai untuk TKA.',
    namaOrangTua: '',
  });

  // Form State for Proktor/Teknisi
  const [proktorFormData, setProktorFormData] = useState<{
    kodeRuang: string;
    noUrutLaptop: string;
    namaTeknisi: string;
    nipTeknisi: string;
    namaProktor: string;
    nipProktor: string;
    keterangan: string;
  }>({
    kodeRuang: 'Lab Komputer 1',
    noUrutLaptop: '01 - 20',
    namaTeknisi: '',
    nipTeknisi: '',
    namaProktor: '',
    nipProktor: '',
    keterangan: '',
  });

  // Local State for Document Settings Form
  const [settingsFormData, setSettingsFormData] = useState<DocumentSettings>(docSettings);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Sync settings whenever props change
  React.useEffect(() => {
    setSettingsFormData(docSettings);
  }, [docSettings]);

  // Open Add Laptop Modal
  const handleOpenAddLaptopModal = () => {
    setEditingLaptop(null);
    setLaptopFormData({
      studentId: '',
      namaSiswa: '',
      kelas: 'XII MIPA 1',
      gelombang: 'Gelombang 1 (26 - 29 Okt 2026)',
      merkLaptop: '',
      charger: true,
      mouse: true,
      keyboard: true,
      kodeRuang: proktorList.length > 0 ? proktorList[0].kodeRuang : 'Lab Komputer 1',
      noUrutLaptop: String(laptops.length + 1).padStart(2, '0'),
      namaTeknisi: proktorList.length > 0 ? proktorList[0].namaTeknisi : 'Budi Santoso, S.Kom',
      statusKelayakan: 'LAYAK',
      catatanKondisi: 'Laptop dalam kondisi siap pakai untuk TKA.',
      namaOrangTua: '',
    });
    setIsLaptopModalOpen(true);
  };

  // Open Edit Laptop Modal
  const handleOpenEditLaptopModal = (laptop: LaptopData) => {
    setEditingLaptop(laptop);
    setLaptopFormData({
      studentId: laptop.studentId || '',
      namaSiswa: laptop.namaSiswa,
      kelas: laptop.kelas,
      gelombang: laptop.gelombang,
      merkLaptop: laptop.merkLaptop,
      charger: laptop.kelengkapan.charger,
      mouse: laptop.kelengkapan.mouse,
      keyboard: laptop.kelengkapan.keyboard,
      kodeRuang: laptop.kodeRuang,
      noUrutLaptop: laptop.noUrutLaptop,
      namaTeknisi: laptop.namaTeknisi,
      statusKelayakan: laptop.statusKelayakan,
      catatanKondisi: laptop.catatanKondisi || '',
      namaOrangTua: laptop.namaOrangTua || '',
    });
    setIsLaptopModalOpen(true);
  };

  // Auto pick student details
  const handleSelectStudentChange = (stdId: string) => {
    const selected = students.find((s) => s.id === stdId);
    if (selected) {
      setLaptopFormData((prev) => ({
        ...prev,
        studentId: selected.id,
        namaSiswa: selected.namaSiswa,
        kelas: selected.kelas,
      }));
    }
  };

  // Auto pick teknisi based on room
  const handleRuangChangeInForm = (ruang: string) => {
    const matchedProktor = proktorList.find((p) => p.kodeRuang === ruang);
    setLaptopFormData((prev) => ({
      ...prev,
      kodeRuang: ruang,
      namaTeknisi: matchedProktor ? matchedProktor.namaTeknisi : prev.namaTeknisi,
    }));
  };

  // Save Laptop
  const handleSubmitLaptopForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!laptopFormData.namaSiswa || !laptopFormData.merkLaptop) {
      alert('Mohon isi nama siswa dan merk laptop.');
      return;
    }

    const payload = {
      studentId: laptopFormData.studentId,
      namaSiswa: laptopFormData.namaSiswa,
      kelas: laptopFormData.kelas,
      gelombang: laptopFormData.gelombang,
      merkLaptop: laptopFormData.merkLaptop,
      kelengkapan: {
        charger: laptopFormData.charger,
        mouse: laptopFormData.mouse,
        keyboard: laptopFormData.keyboard,
      },
      kodeRuang: laptopFormData.kodeRuang,
      noUrutLaptop: laptopFormData.noUrutLaptop,
      namaTeknisi: laptopFormData.namaTeknisi,
      statusKelayakan: laptopFormData.statusKelayakan,
      catatanKondisi: laptopFormData.catatanKondisi,
      namaOrangTua: laptopFormData.namaOrangTua,
    };

    if (editingLaptop) {
      onUpdateLaptop({
        ...payload,
        id: editingLaptop.id,
        updatedAt: editingLaptop.updatedAt,
      });
    } else {
      onAddLaptop(payload);
    }

    setIsLaptopModalOpen(false);
  };

  // Open Add Proktor Modal
  const handleOpenAddProktorModal = () => {
    setEditingProktor(null);
    setProktorFormData({
      kodeRuang: `Lab Komputer ${proktorList.length + 1}`,
      noUrutLaptop: '01 - 20',
      namaTeknisi: '',
      nipTeknisi: '',
      namaProktor: '',
      nipProktor: '',
      keterangan: '',
    });
    setIsProktorModalOpen(true);
  };

  // Open Edit Proktor Modal
  const handleOpenEditProktorModal = (p: ProktorTeknisi) => {
    setEditingProktor(p);
    setProktorFormData({
      kodeRuang: p.kodeRuang,
      noUrutLaptop: p.noUrutLaptop,
      namaTeknisi: p.namaTeknisi,
      nipTeknisi: p.nipTeknisi || '',
      namaProktor: p.namaProktor,
      nipProktor: p.nipProktor || '',
      keterangan: p.keterangan || '',
    });
    setIsProktorModalOpen(true);
  };

  // Save Proktor
  const handleSubmitProktorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proktorFormData.kodeRuang || !proktorFormData.namaTeknisi) {
      alert('Mohon isi Nomor Ruang dan Nama Teknisi.');
      return;
    }

    if (editingProktor) {
      onUpdateProktor({
        ...proktorFormData,
        id: editingProktor.id,
      });
    } else {
      onAddProktor(proktorFormData);
    }

    setIsProktorModalOpen(false);
  };

  // Save Doc Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDocSettings(settingsFormData);
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 3000);
  };

  // Filter Laptops
  const filteredLaptops = laptops.filter((laptop) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      laptop.namaSiswa.toLowerCase().includes(query) ||
      laptop.kelas.toLowerCase().includes(query) ||
      laptop.merkLaptop.toLowerCase().includes(query) ||
      laptop.kodeRuang.toLowerCase().includes(query) ||
      laptop.namaTeknisi.toLowerCase().includes(query);

    const matchStatus =
      statusFilter === 'ALL' || laptop.statusKelayakan === statusFilter;

    const matchGelombang =
      gelombangFilter === 'ALL' || laptop.gelombang === gelombangFilter;

    const matchRuang =
      ruangFilter === 'ALL' || laptop.kodeRuang === ruangFilter;

    return matchSearch && matchStatus && matchGelombang && matchRuang;
  });

  // Calculate statistics
  const totalCount = laptops.length;
  const layakCount = laptops.filter((l) => l.statusKelayakan === 'LAYAK').length;
  const tidakLayakCount = laptops.filter((l) => l.statusKelayakan === 'TIDAK LAYAK').length;
  const chargerLengkapCount = laptops.filter((l) => l.kelengkapan.charger).length;
  const mouseLengkapCount = laptops.filter((l) => l.kelengkapan.mouse).length;
  const keyboardLengkapCount = laptops.filter((l) => l.kelengkapan.keyboard).length;

  // Extract unique rooms
  const uniqueRooms = Array.from(new Set(laptops.map((l) => l.kodeRuang)));

  // Trigger Print Browser with Popup Window Fallback
  const handleTriggerPrint = () => {
    const printElem = document.getElementById('printable-pdf-document');
    if (!printElem) {
      window.print();
      return;
    }

    const docTitle =
      printDocType === 'surat'
        ? `Surat_Kesediaan_${selectedLaptopForPrint?.namaSiswa || 'Siswa'}`
        : printDocType === 'kelengkapan'
        ? `Berita_Acara_Kelengkapan_${selectedLaptopForPrint?.namaSiswa || 'Siswa'}`
        : printDocType === 'stiker'
        ? `Stiker_Laptop_${selectedLaptopForPrint?.namaSiswa || 'Siswa'}`
        : `Kumpulan_Stiker_Massal_TKA`;

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
                  padding: 24px;
                  margin: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 10mm;
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
                  }
                  tr, td, th {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 18px; background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 13px; color: #312e81;">
                <div>
                  <strong>🖨️ Halaman Dokumen Siap Cetak / PDF:</strong> Klik tombol di sebelah kanan untuk menyimpan sebagai PDF atau mencetak.
                </div>
                <button onclick="window.print()" style="background-color: #4f46e5; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">
                  🖨️ Cetak / Simpan PDF
                </button>
              </div>
              <div id="printable-pdf-document">
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
        // Fallback if popup is blocked
        window.print();
      }
    } catch (e) {
      console.error("Print popup error:", e);
      window.print();
    }
  };

  // Helper to find assigned Proktor/Teknisi for printed laptop
  const getAssignedProktorTeknisi = (kodeRuang: string) => {
    return proktorList.find((p) => p.kodeRuang === kodeRuang) || {
      namaTeknisi: selectedLaptopForPrint?.namaTeknisi || 'Teknisi Komputer',
      nipTeknisi: '-',
      namaProktor: 'Proktor Ruangan',
      nipProktor: '-',
    };
  };

  return (
    <div className="space-y-6">
      {/* CSS Print Rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
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

          /* Reset all fixed or scrollable modal overlays during print */
          .fixed, .backdrop-blur-xs, .max-h-\\[92vh\\], .overflow-y-auto {
            position: static !important;
            overflow: visible !important;
            max-height: none !important;
            background: transparent !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: auto !important;
            height: auto !important;
          }

          .no-print {
            display: none !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-pdf-document, #printable-pdf-document * {
            visibility: visible !important;
          }

          #printable-pdf-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }

          .sticker-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          table {
            break-inside: auto !important;
          }

          tr, td, th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* TOP NAVIGATION SUB-TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('laptops')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeSubTab === 'laptops'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Pendataan Laptop Siswa</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'laptops'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {laptops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('proktor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeSubTab === 'proktor'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Proktor & Teknisi</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'proktor'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {proktorList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeSubTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Setting Surat & Form PDF</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden lg:block pr-2">
          Sistem Administrasi Inventaris TKA 2026
        </div>
      </div>

      {/* GOOGLE SHEETS LIVE SYNC BANNER */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Integrasi Google Sheets Backend</span>
              {appsScriptUrl ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Tersambung
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Belum Diatur
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              Sinkronisasi data otomatis dengan Sheets: <code className="text-teal-300 font-mono">Pendataan_Laptop_Sarana</code> & <code className="text-sky-300 font-mono">Proktor_Teknisi_Lab</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {syncMessage && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${syncMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {syncMessage.text}
            </span>
          )}

          {appsScriptUrl ? (
            <button
              type="button"
              disabled={isSyncingGas}
              onClick={async () => {
                if (onSyncGoogleSheets) {
                  setIsSyncingGas(true);
                  setSyncMessage(null);
                  const ok = await onSyncGoogleSheets();
                  setIsSyncingGas(false);
                  if (ok) {
                    setSyncMessage({ type: 'success', text: 'Data dari Google Sheets berhasil diperbarui!' });
                    setTimeout(() => setSyncMessage(null), 4000);
                  } else {
                    setSyncMessage({ type: 'error', text: 'Gagal mengambil data dari Google Sheets.' });
                    setTimeout(() => setSyncMessage(null), 4000);
                  }
                }
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGas ? 'animate-spin' : ''}`} />
              <span>{isSyncingGas ? 'Menyinkronkan...' : 'Sinkronkan Google Sheets'}</span>
            </button>
          ) : (
            onNavigateToAppScript && (
              <button
                type="button"
                onClick={onNavigateToAppScript}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Atur URL Google Apps Script</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR LAPTOP SISWA */}
      {activeSubTab === 'laptops' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* STATS CARDS SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Laptop Terdata
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {totalCount} <span className="text-xs font-normal text-slate-500">Unit</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Laptop className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Status Layak Ujian
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {layakCount}{' '}
                  <span className="text-xs font-semibold text-emerald-600">
                    ({totalCount ? Math.round((layakCount / totalCount) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Status Tidak Layak
                </span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {tidakLayakCount}{' '}
                  <span className="text-xs font-semibold text-rose-600">
                    ({totalCount ? Math.round((tidakLayakCount / totalCount) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between">
              <div className="space-y-1 w-full">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Ceklist Kelengkapan
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-700">
                  <span>Charger: <strong>{chargerLengkapCount}/{totalCount}</strong></span>
                  <span>Mouse: <strong>{mouseLengkapCount}/{totalCount}</strong></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{
                      width: `${totalCount ? Math.round((chargerLengkapCount / totalCount) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TOOLBAR CONTROLS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa, kelas, merk laptop, teknisi..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="ALL">Semua Status Kelayakan</option>
                <option value="LAYAK">LAYAK Ujian</option>
                <option value="TIDAK LAYAK">TIDAK LAYAK</option>
              </select>

              <select
                value={gelombangFilter}
                onChange={(e) => setGelombangFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="ALL">Semua Gelombang</option>
                <option value="Gelombang 1 (26 - 29 Okt 2026)">Gelombang 1</option>
                <option value="Gelombang Khusus (31 Okt - 1 Nov 2026)">Gelombang Khusus</option>
                <option value="Gelombang 2 (2 - 5 Nov 2026)">Gelombang 2</option>
              </select>

              <select
                value={ruangFilter}
                onChange={(e) => setRuangFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="ALL">Semua Ruang / Lab</option>
                {uniqueRooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (filteredLaptops.length === 0) {
                    alert('Tidak ada data laptop untuk dicetak stiker.');
                    return;
                  }
                  setPrintDocType('stiker-batch');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl shadow-2xs transition-colors"
                title="Cetak Kumpulan Stiker Semua Laptop Terfilter"
              >
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Cetak Massal Stiker ({filteredLaptops.length})</span>
              </button>

              <button
                onClick={() => {
                  setDeleteConfirm({
                    type: 'resetLaptops',
                    title: 'Reset Semua Data Laptop Ke Sampel Bawaan',
                    details: 'Tindakan ini akan mengembalikan seluruh daftar laptop ke contoh sampel data awal.'
                  });
                }}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Reset Contoh Data Laptop"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenAddLaptopModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Pendataan Laptop Baru</span>
              </button>
            </div>
          </div>

          {/* TABLE DATA LAPTOP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3.5 w-10 text-center">No</th>
                    <th className="p-3.5">Nama Siswa & Ortua</th>
                    <th className="p-3.5">Gelombang & Ruang</th>
                    <th className="p-3.5">Merk & Spesifikasi</th>
                    <th className="p-3.5 text-center">Kelengkapan</th>
                    <th className="p-3.5 text-center">No Urut & Teknisi</th>
                    <th className="p-3.5 text-center">Hasil Akhir</th>
                    <th className="p-3.5 text-center w-48">Cetak PDF & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLaptops.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        <Laptop className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">Tidak ada data laptop siswa ditemukan.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLaptops.map((laptop, index) => (
                      <tr key={laptop.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-400 text-center">{index + 1}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-xs">{laptop.namaSiswa}</div>
                          <div className="text-[11px] text-indigo-700 font-medium">{laptop.kelas}</div>
                          {laptop.namaOrangTua && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Ortu: {laptop.namaOrangTua}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800 text-[11px]">{laptop.gelombang}</div>
                          <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                            Ruang: {laptop.kodeRuang}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                            <span>{laptop.merkLaptop}</span>
                          </div>
                          {laptop.catatanKondisi && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1" title={laptop.catatanKondisi}>
                              "{laptop.catatanKondisi}"
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                laptop.kelengkapan.charger
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200 line-through opacity-60'
                              }`}
                            >
                              Charger
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                laptop.kelengkapan.mouse
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200 line-through opacity-60'
                              }`}
                            >
                              Mouse
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                laptop.kelengkapan.keyboard
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200 line-through opacity-60'
                              }`}
                            >
                              Keyboard
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="font-bold text-slate-800 text-xs">No Urut: #{laptop.noUrutLaptop}</div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                            <UserCheck className="w-3 h-3 text-slate-400" /> {laptop.namaTeknisi}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          {laptop.statusKelayakan === 'LAYAK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> LAYAK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> TIDAK LAYAK
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedLaptopForPrint(laptop);
                                setPrintDocType('surat');
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 font-bold text-[10px] flex items-center gap-1"
                              title="Cetak Surat Kesediaan Meminjamkan (Siswa & Ortua)"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>Surat Ortua</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedLaptopForPrint(laptop);
                                setPrintDocType('kelengkapan');
                              }}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 font-bold text-[10px] flex items-center gap-1"
                              title="Cetak Form Berita Acara Kelengkapan & Layak (Siswa & Teknisi)"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Form Teknisi</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedLaptopForPrint(laptop);
                                setPrintDocType('stiker');
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 font-bold text-[10px] flex items-center gap-1"
                              title="Cetak Stiker Tempel Label Laptop & Sarana Ujian (Laptop, Charger, Tas)"
                            >
                              <Tag className="w-3.5 h-3.5 text-amber-600" />
                              <span>Stiker</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditLaptopModal(laptop)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Edit Laptop"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  type: 'laptop',
                                  id: laptop.id,
                                  title: `Hapus Data Laptop Pemilik: ${laptop.namaSiswa || 'Siswa'}`,
                                  details: `Merk: ${laptop.merkLaptop || '-'} | Kelas: ${laptop.kelas || '-'} | Ruang: ${laptop.kodeRuang || '-'}, Meja ${laptop.noUrutLaptop || '-'}`
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATA PROKTOR & TEKNISI */}
      {activeSubTab === 'proktor' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Manajemen Data Proktor & Teknisi Ujian</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Atur penugasan Nama Teknisi, Proktor, NIP, Nomor Ruang / Lab, dan Alokasi Nomor Urut Laptop untuk pemeriksaan TKA.
              </p>
            </div>
            <button
              onClick={handleOpenAddProktorModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proktor / Teknisi Baru</span>
            </button>
          </div>

          {/* TABLE PROKTOR & TEKNISI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3.5 w-10 text-center">No</th>
                    <th className="p-3.5">Nomor Ruang / Lab</th>
                    <th className="p-3.5 text-center">Range No Urut Laptop</th>
                    <th className="p-3.5">Teknisi Komputer</th>
                    <th className="p-3.5">Proktor Ruangan</th>
                    <th className="p-3.5">Keterangan Penugasan</th>
                    <th className="p-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proktorList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">Belum ada data proktor/teknisi ruangan.</p>
                      </td>
                    </tr>
                  ) : (
                    proktorList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-400 text-center">{index + 1}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block">
                            <Building className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />
                            {item.kodeRuang}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                          {item.noUrutLaptop}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.namaTeknisi}</div>
                          {item.nipTeknisi && (
                            <div className="text-[10px] text-slate-500">NIP: {item.nipTeknisi}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.namaProktor}</div>
                          {item.nipProktor && (
                            <div className="text-[10px] text-slate-500">NIP: {item.nipProktor}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600 italic text-[11px]">
                          {item.keterangan || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditProktorModal(item)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  type: 'proktor',
                                  id: item.id,
                                  title: `Hapus Penugasan Ruang Lab: ${item.kodeRuang}`,
                                  details: `Proktor: ${item.namaProktor || '-'} | Teknisi: ${item.namaTeknisi || '-'}`
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SETTING SURAT ORANG TUA & FORM TEKNISI */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Pengaturan Format Kop, Tanda Tangan, dan Teks Surat / Form PDF</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ubah informasi instansi sekolah, tanggal, nomor surat, nama Kepala Sekolah & NIP, serta judul/keterangan dokumen.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Kembalikan format pengaturan surat ke opsi bawaan?')) {
                  onResetDocSettings();
                }
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Bawaan
            </button>
          </div>

          {saveSettingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan dokumen berhasil disimpan! Perubahan akan langsung berlaku pada cetakan PDF.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* BOX 1: INFORMASI INSTANSI & KOP SURAT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                1. Kop Surat & Identitas Instansi Sekolah
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Panitia / Sekolah (Baris 1 Kop)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsFormData.namaSekolah}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, namaSekolah: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub Header Kop / Kementerian (Baris 2 Kop)
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.subHeader}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, subHeader: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Sekolah & Informasi Kontak / Email (Baris 3 Kop)
                </label>
                <input
                  type="text"
                  value={settingsFormData.alamatSekolah}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, alamatSekolah: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota & Tanggal Surat (Penandatanganan)
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.kotaTanggal}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, kotaTanggal: e.target.value })
                    }
                    placeholder="Contoh: Jakarta, 20 Oktober 2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prefix Nomor Surat Official
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.nomorSuratPrefix}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, nomorSuratPrefix: e.target.value })
                    }
                    placeholder="Contoh: 042/PAN-TKA/AN-2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* BOX 2: PENANDATANGAN KEPALA SEKOLAH */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                2. Data Penandatangan Kepala Sekolah (Mengetahui)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Kepala Sekolah (Gelar)
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.namaKepalaSekolah}
                    onChange={(e) =>
                      setSettingsFormData({
                        ...settingsFormData,
                        namaKepalaSekolah: e.target.value,
                      })
                    }
                    placeholder="Dr. H. Mulyadi, M.Pd."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.nipKepalaSekolah}
                    onChange={(e) =>
                      setSettingsFormData({
                        ...settingsFormData,
                        nipKepalaSekolah: e.target.value,
                      })
                    }
                    placeholder="19700505 199503 1 001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* BOX 3: KUSTOMISASI TEKS SURAT ORANG TUA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                3. Pengaturan Judul & Teks Surat Kesediaan Orang Tua
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen Surat Orang Tua</label>
                <input
                  type="text"
                  value={settingsFormData.judulSuratOrtu}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, judulSuratOrtu: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teks Paragraf Pembuka / Pernyataan</label>
                <textarea
                  rows={3}
                  value={settingsFormData.keteranganSuratOrtu}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, keteranganSuratOrtu: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* BOX 4: KUSTOMISASI TEKS FORM TEKNISI */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                4. Pengaturan Judul & Teks Form Berita Acara Teknisi
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Form Inspeksi Teknisi</label>
                <input
                  type="text"
                  value={settingsFormData.judulFormTeknisi}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, judulFormTeknisi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teks Deskripsi / Petunjuk Verifikasi</label>
                <textarea
                  rows={3}
                  value={settingsFormData.keteranganFormTeknisi}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, keteranganFormTeknisi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Dokumen</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT LAPTOP */}
      {isLaptopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingLaptop ? 'Edit Pendataan Laptop' : 'Pendataan Laptop Siswa Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Isi spesifikasi, kelengkapan, nomor ruang, dan hasil pemeriksaan teknisi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLaptopModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLaptopForm} className="space-y-4">
              {/* Select Student from master data */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Dari Master Data Siswa TKA (Opsional)
                </label>
                <select
                  value={laptopFormData.studentId}
                  onChange={(e) => handleSelectStudentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="">-- Manual Input / Pilih Siswa Terdaftar --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaSiswa} ({s.kelas}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={laptopFormData.namaSiswa}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, namaSiswa: e.target.value })}
                    placeholder="Contoh: Ahmad Rizky Pratama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={laptopFormData.kelas}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, kelas: e.target.value })}
                    placeholder="Contoh: XII MIPA 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Orang Tua / Wali (Untuk Surat Kesediaan)
                </label>
                <input
                  type="text"
                  value={laptopFormData.namaOrangTua}
                  onChange={(e) => setLaptopFormData({ ...laptopFormData, namaOrangTua: e.target.value })}
                  placeholder="Contoh: Bambang Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gelombang TKA <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={laptopFormData.gelombang}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, gelombang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <option value="Gelombang 1 (26 - 29 Okt 2026)">Gelombang 1 (26 - 29 Okt 2026)</option>
                    <option value="Gelombang Khusus (31 Okt - 1 Nov 2026)">Gelombang Khusus (31 Okt - 1 Nov 2026)</option>
                    <option value="Gelombang 2 (2 - 5 Nov 2026)">Gelombang 2 (2 - 5 Nov 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk & Spesifikasi Laptop <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={laptopFormData.merkLaptop}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, merkLaptop: e.target.value })}
                    placeholder="Contoh: Asus Vivobook 14 (Core i5 / 8GB)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Kelengkapan Checkboxes */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-800 mb-1">
                  Kelengkapan Hardware (Beri Centang):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={laptopFormData.charger}
                      onChange={(e) => setLaptopFormData({ ...laptopFormData, charger: e.target.checked })}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>Charger</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={laptopFormData.mouse}
                      onChange={(e) => setLaptopFormData({ ...laptopFormData, mouse: e.target.checked })}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>Mouse</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={laptopFormData.keyboard}
                      onChange={(e) => setLaptopFormData({ ...laptopFormData, keyboard: e.target.checked })}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>Keyboard</span>
                  </label>
                </div>
              </div>

              {/* Ruang & Teknisi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Ruang / Lab</label>
                  <select
                    value={laptopFormData.kodeRuang}
                    onChange={(e) => handleRuangChangeInForm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {proktorList.length > 0 ? (
                      proktorList.map((p) => (
                        <option key={p.id} value={p.kodeRuang}>
                          {p.kodeRuang}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Lab Komputer 1">Lab Komputer 1</option>
                        <option value="Lab Komputer 2">Lab Komputer 2</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Urut Laptop</label>
                  <input
                    type="text"
                    value={laptopFormData.noUrutLaptop}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, noUrutLaptop: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Teknisi</label>
                  <input
                    type="text"
                    value={laptopFormData.namaTeknisi}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, namaTeknisi: e.target.value })}
                    placeholder="Budi Santoso, S.Kom"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Status Kelayakan */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
                <label className="block text-xs font-extrabold text-indigo-950">
                  Hasil Pemeriksaan & Kelayakan Ujian:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLaptopFormData({ ...laptopFormData, statusKelayakan: 'LAYAK' })}
                    className={`flex-1 py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      laptopFormData.statusKelayakan === 'LAYAK'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> LAYAK UJIAN
                  </button>

                  <button
                    type="button"
                    onClick={() => setLaptopFormData({ ...laptopFormData, statusKelayakan: 'TIDAK LAYAK' })}
                    className={`flex-1 py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      laptopFormData.statusKelayakan === 'TIDAK LAYAK'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> TIDAK LAYAK
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Catatan Kondisi Perangkat
                  </label>
                  <input
                    type="text"
                    value={laptopFormData.catatanKondisi}
                    onChange={(e) => setLaptopFormData({ ...laptopFormData, catatanKondisi: e.target.value })}
                    placeholder="Contoh: Siap pakai, baterai prima, browser terinstall..."
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLaptopModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20"
                >
                  Simpan Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM PROKTOR & TEKNISI */}
      {isProktorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingProktor ? 'Edit Proktor / Teknisi' : 'Tambah Proktor / Teknisi Ruang'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur nama teknisi, proktor, dan alokasi nomor ruang/lab.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProktorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProktorForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Ruang / Lab <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proktorFormData.kodeRuang}
                    onChange={(e) => setProktorFormData({ ...proktorFormData, kodeRuang: e.target.value })}
                    placeholder="Contoh: Lab Komputer 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Range No Urut Laptop
                  </label>
                  <input
                    type="text"
                    value={proktorFormData.noUrutLaptop}
                    onChange={(e) => setProktorFormData({ ...proktorFormData, noUrutLaptop: e.target.value })}
                    placeholder="Contoh: 01 - 20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Data Teknisi */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <span className="block text-xs font-extrabold text-indigo-950">
                  Data Teknisi Komputer Ruang:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Teknisi *</label>
                    <input
                      type="text"
                      required
                      value={proktorFormData.namaTeknisi}
                      onChange={(e) => setProktorFormData({ ...proktorFormData, namaTeknisi: e.target.value })}
                      placeholder="Budi Santoso, S.Kom"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Teknisi</label>
                    <input
                      type="text"
                      value={proktorFormData.nipTeknisi}
                      onChange={(e) => setProktorFormData({ ...proktorFormData, nipTeknisi: e.target.value })}
                      placeholder="19850315 201001 1 002"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Data Proktor */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-extrabold text-slate-900">
                  Data Proktor Ruangan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Proktor</label>
                    <input
                      type="text"
                      value={proktorFormData.namaProktor}
                      onChange={(e) => setProktorFormData({ ...proktorFormData, namaProktor: e.target.value })}
                      placeholder="Drs. H. Ahmad Fauzi"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Proktor</label>
                    <input
                      type="text"
                      value={proktorFormData.nipProktor}
                      onChange={(e) => setProktorFormData({ ...proktorFormData, nipProktor: e.target.value })}
                      placeholder="19780112 200501 1 005"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={proktorFormData.keterangan}
                  onChange={(e) => setProktorFormData({ ...proktorFormData, keterangan: e.target.value })}
                  placeholder="Misal: Penanggung jawab Lab 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProktorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW PDF MODAL */}
      {printDocType && (selectedLaptopForPrint || printDocType === 'stiker-batch') && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 no-print">
              <div className="flex items-center gap-2">
                {printDocType === 'stiker' || printDocType === 'stiker-batch' ? (
                  <Tag className="w-5 h-5 text-amber-600" />
                ) : (
                  <Printer className="w-5 h-5 text-indigo-600" />
                )}
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {printDocType === 'surat'
                    ? 'Preview Cetak PDF: Surat Kesediaan Orang Tua & Siswa'
                    : printDocType === 'kelengkapan'
                    ? 'Preview Cetak PDF: Form Berita Acara Kelengkapan & Layak (Teknisi)'
                    : printDocType === 'stiker'
                    ? 'Preview Cetak PDF: Stiker Label Pendataan Laptop & Sarana Ujian TKA (Perangkat, Charger, Tas)'
                    : `Preview Cetak PDF: Kumpulan Stiker Massal (${filteredLaptops.length} Unit Laptop Terfilter)`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="Buka dialog cetak browser / simpan ke file PDF"
                >
                  <Printer className="w-4 h-4" /> Cetak / Download PDF
                </button>
                <button
                  onClick={() => setPrintDocType(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  title="Tutup Preview"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PETUNJUK DOWNLOAD PDF BANNER */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5 no-print shadow-2xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900">Tips Unduh / Simpan sebagai PDF:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Klik tombol <strong className="text-amber-950">"Cetak / Download PDF"</strong>. Pada jendela dialog cetak yang muncul, pilih <strong className="text-amber-950">Destination / Tujuan: "Simpan sebagai PDF" (Save as PDF)</strong>. Centang opsi <em>"Grafik Latar Belakang" (Background graphics)</em> agar warna stiker dan tabel tercetak presisi.
                </p>
              </div>
            </div>

            {/* PRINTABLE DOKUMEN CONTAINER WITH ID */}
            <div
              id="printable-pdf-document"
              className="bg-white p-8 border border-slate-300 text-slate-900 font-serif leading-relaxed text-xs space-y-6 shadow-xs rounded-lg"
            >
              {/* DOCUMENT 1: SURAT KESEDIAAN MEMINJAMKAN LAPTOP (SISWA & ORTU) */}
              {printDocType === 'surat' && (
                <div className="space-y-5">
                  {/* Kop Surat Header with Barcode & QR Code */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
                    <div className="shrink-0 p-1.5 bg-white border border-slate-300 rounded-lg text-center shadow-2xs">
                      <QRCodeSVG
                        value={`TKA-SURAT-ORTU|Siswa:${selectedLaptopForPrint.namaSiswa}|Kelas:${selectedLaptopForPrint.kelas}|Ruang:${selectedLaptopForPrint.kodeRuang}|No:${selectedLaptopForPrint.noUrutLaptop}`}
                        size={58}
                      />
                      <span className="text-[8px] font-mono text-slate-500 font-bold block mt-0.5">VERIFIKASI QR</span>
                    </div>
                    <div className="text-center space-y-1 flex-1">
                      <h2 className="text-sm font-black uppercase tracking-wider font-sans text-slate-900">
                        {docSettings.namaSekolah}
                      </h2>
                      <p className="text-[11px] font-sans font-bold text-slate-700">
                        {docSettings.subHeader}
                      </p>
                      <p className="text-[10px] font-sans text-slate-500 italic">
                        {docSettings.alamatSekolah}
                      </p>
                    </div>
                    <div className="shrink-0 text-right bg-slate-50 p-1.5 border border-slate-300 rounded-lg">
                      <SimpleBarcode value={`ORTU-${selectedLaptopForPrint.noUrutLaptop}`} height={30} />
                    </div>
                  </div>

                  {/* Judul & Nomor Surat */}
                  <div className="text-center space-y-1 my-3">
                    <h3 className="font-extrabold text-sm uppercase underline font-sans tracking-tight">
                      {docSettings.judulSuratOrtu}
                    </h3>
                    <p className="text-[10px] font-mono">
                      Nomor: {docSettings.nomorSuratPrefix}/{selectedLaptopForPrint.noUrutLaptop}
                    </p>
                  </div>

                  <p className="text-justify font-sans leading-relaxed">
                    {docSettings.keteranganSuratOrtu}
                  </p>

                  {/* Identitas Orang Tua & Siswa */}
                  <div className="font-sans space-y-2 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-bold text-slate-700">Nama Orang Tua / Wali</span>
                      <span className="col-span-2">: {selectedLaptopForPrint.namaOrangTua || '..........................................................'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-bold text-slate-700">Nama Siswa Peserta Ujian</span>
                      <span className="col-span-2 font-bold">: {selectedLaptopForPrint.namaSiswa}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-bold text-slate-700">Kelas</span>
                      <span className="col-span-2">: {selectedLaptopForPrint.kelas}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-bold text-slate-700">Gelombang TKA</span>
                      <span className="col-span-2">: {selectedLaptopForPrint.gelombang}</span>
                    </div>
                  </div>

                  {/* Tabel Spesifikasi Laptop */}
                  <div className="font-sans space-y-2">
                    <p className="font-bold text-slate-800 text-xs">
                      Dengan ini menyatakan SANGGUP dan BERSEDIA meminjamkan laptop pribadi dengan rincian:
                    </p>
                    <table className="w-full text-left border-collapse border border-slate-300 font-sans text-xs">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold bg-slate-100 w-1/3">Merk & Spesifikasi Laptop</td>
                          <td className="p-2 font-bold">{selectedLaptopForPrint.merkLaptop}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold bg-slate-100">Kelengkapan Dipinjamkan</td>
                          <td className="p-2">
                            {selectedLaptopForPrint.kelengkapan.charger ? '✔ Charger Adaptor | ' : '✖ Charger | '}
                            {selectedLaptopForPrint.kelengkapan.mouse ? '✔ Mouse Eksternal | ' : '✖ Mouse | '}
                            {selectedLaptopForPrint.kelengkapan.keyboard ? '✔ Keyboard Normal' : '✖ Keyboard'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold bg-slate-100">Penempatan Ruang & Meja</td>
                          <td className="p-2">
                            {selectedLaptopForPrint.kodeRuang} (Nomor Urut Laptop: #{selectedLaptopForPrint.noUrutLaptop})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-justify font-sans leading-relaxed">
                    Perangkat laptop tersebut telah diinspeksi oleh panitia teknis dan akan dikembalikan dalam keadaan lengkap serta baik setelah pelaksanaan ujian gelombang tersebut selesai.
                  </p>

                  {/* TANDA TANGAN 3 PIHAK */}
                  <div className="pt-6 font-sans">
                    <p className="text-right font-medium mb-4">{docSettings.kotaTanggal}</p>
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div className="space-y-14">
                        <p className="font-bold">Siswa Peserta Ujian,</p>
                        <div>
                          <p className="font-extrabold underline">{selectedLaptopForPrint.namaSiswa}</p>
                          <p className="text-[10px] text-slate-500">Kelas {selectedLaptopForPrint.kelas}</p>
                        </div>
                      </div>

                      <div className="space-y-14">
                        <p className="font-bold">Orang Tua / Wali Siswa,</p>
                        <div>
                          <p className="font-extrabold underline">
                            {selectedLaptopForPrint.namaOrangTua || '( ...................................................... )'}
                          </p>
                          <p className="text-[10px] text-slate-500">Tanda Tangan & Nama Terang</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 text-center space-y-14">
                      <p className="font-bold">Mengetahui,<br />Kepala Sekolah / Ketua Panitia TKA</p>
                      <div>
                        <p className="font-extrabold underline">{docSettings.namaKepalaSekolah}</p>
                        <p className="text-[10px] text-slate-500">NIP. {docSettings.nipKepalaSekolah}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT 2: FORM KELENGKAPAN LAPTOP & BERITA ACARA TEKNISI (LAYAK / TIDAK LAYAK) */}
              {printDocType === 'kelengkapan' && (
                <div className="space-y-5">
                  {/* Kop Surat Header with Barcode & QR Code */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
                    <div className="shrink-0 p-1.5 bg-white border border-slate-300 rounded-lg text-center shadow-2xs">
                      <QRCodeSVG
                        value={`TKA-FORM-TEKNISI|Siswa:${selectedLaptopForPrint.namaSiswa}|Ruang:${selectedLaptopForPrint.kodeRuang}|Status:${selectedLaptopForPrint.statusKelayakan}|No:${selectedLaptopForPrint.noUrutLaptop}`}
                        size={58}
                      />
                      <span className="text-[8px] font-mono text-slate-500 font-bold block mt-0.5">VERIFIKASI TEKNISI</span>
                    </div>
                    <div className="text-center space-y-1 flex-1">
                      <h2 className="text-sm font-black uppercase tracking-wider font-sans text-slate-900">
                        {docSettings.judulFormTeknisi}
                      </h2>
                      <p className="text-[11px] font-sans font-bold text-slate-700">
                        {docSettings.namaSekolah}
                      </p>
                    </div>
                    <div className="shrink-0 text-right bg-slate-50 p-1.5 border border-slate-300 rounded-lg">
                      <SimpleBarcode value={`TEK-${selectedLaptopForPrint.kodeRuang}-${selectedLaptopForPrint.noUrutLaptop}`} height={30} />
                    </div>
                  </div>

                  {/* Room & Identifier Box */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-100 p-3 rounded border border-slate-300 font-sans text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Nomor Ruang:</span>
                      <strong className="text-slate-900">{selectedLaptopForPrint.kodeRuang}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">No Urut Laptop:</span>
                      <strong className="text-slate-900">#{selectedLaptopForPrint.noUrutLaptop}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gelombang:</span>
                      <strong className="text-slate-900">{selectedLaptopForPrint.gelombang.split(' ')[0]}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Teknisi Penguji:</span>
                      <strong className="text-slate-900">{selectedLaptopForPrint.namaTeknisi}</strong>
                    </div>
                  </div>

                  {/* Identitas Siswa */}
                  <div className="space-y-1.5 font-sans">
                    <h4 className="font-bold text-xs uppercase border-b border-slate-300 pb-1">
                      1. Identitas Peserta & Perangkat Laptop
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div><strong>Nama Siswa:</strong> {selectedLaptopForPrint.namaSiswa}</div>
                      <div><strong>Kelas:</strong> {selectedLaptopForPrint.kelas}</div>
                      <div className="col-span-2"><strong>Merk / Spesifikasi:</strong> {selectedLaptopForPrint.merkLaptop}</div>
                    </div>
                  </div>

                  {/* Tabel Ceklist Kelengkapan */}
                  <div className="space-y-2 font-sans">
                    <h4 className="font-bold text-xs uppercase border-b border-slate-300 pb-1">
                      2. Hasil Pemeriksaan Kelengkapan Hardware
                    </h4>
                    <table className="w-full text-left border-collapse border border-slate-300 font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-200 border-b border-slate-300 font-bold">
                          <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                          <th className="p-2 border-r border-slate-300">Komponen Perangkat</th>
                          <th className="p-2 border-r border-slate-300 text-center w-28">Status Ada</th>
                          <th className="p-2">Catatan Ketersediaan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 text-center border-r border-slate-300 font-bold">1</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">Charger Adaptor Laptop</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">
                            {selectedLaptopForPrint.kelengkapan.charger ? '✔ LENGKAP' : '✖ TIDAK ADA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            {selectedLaptopForPrint.kelengkapan.charger ? 'Diterima dalam kondisi kabel utuh & mengisi' : 'Penting: Wajib membawa charger saat ujian'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 text-center border-r border-slate-300 font-bold">2</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">Mouse Eksternal</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">
                            {selectedLaptopForPrint.kelengkapan.mouse ? '✔ LENGKAP' : '✖ TIDAK ADA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            {selectedLaptopForPrint.kelengkapan.mouse ? 'Fungsi optic & klik kanan/kiri lancar' : 'Disarankan memakai mouse untuk navigasi'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 text-center border-r border-slate-300 font-bold">3</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">Keyboard Normal (Fungsional)</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">
                            {selectedLaptopForPrint.kelengkapan.keyboard ? '✔ LENGKAP' : '✖ KENDALA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            {selectedLaptopForPrint.kelengkapan.keyboard ? 'Seluruh tombol berfungsi baik' : 'Perlu diperhatikan tombol tertentu'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* KOTAK STATUS KELAYAKAN BESAR DAN TEGAS */}
                  <div className="font-sans space-y-2">
                    <h4 className="font-bold text-xs uppercase border-b border-slate-300 pb-1">
                      3. Kesimpulan Verifikasi & Status Kelayakan Ujian
                    </h4>
                    <div
                      className={`p-4 rounded-lg border-2 text-center space-y-1 ${
                        selectedLaptopForPrint.statusKelayakan === 'LAYAK'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                          : 'bg-rose-50 border-rose-600 text-rose-950'
                      }`}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider">
                        STATUS AKHIR INSPEKSI TEKNISI:
                      </p>
                      <div className="text-xl font-black tracking-widest flex items-center justify-center gap-2">
                        {selectedLaptopForPrint.statusKelayakan === 'LAYAK' ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 inline" />
                            <span>LAYAK UJIAN TKA 2026</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-rose-600 inline" />
                            <span>TIDAK LAYAK UJIAN</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs italic mt-1 font-semibold">
                        Catatan Teknisi: "{selectedLaptopForPrint.catatanKondisi || 'Kondisi telah diverifikasi oleh tim teknisi.'}"
                      </p>
                    </div>
                  </div>

                  {/* TANDA TANGAN TEKNISI & SISWA & PROKTOR */}
                  <div className="pt-6 font-sans">
                    <p className="text-right font-medium mb-3">{docSettings.kotaTanggal}</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-14">
                        <p className="font-bold">Siswa Peserta,</p>
                        <div>
                          <p className="font-extrabold underline">{selectedLaptopForPrint.namaSiswa}</p>
                          <p className="text-[10px] text-slate-500">Pemilik Laptop</p>
                        </div>
                      </div>

                      <div className="space-y-14">
                        <p className="font-bold">Teknisi Penguji,</p>
                        <div>
                          <p className="font-extrabold underline">{selectedLaptopForPrint.namaTeknisi}</p>
                          <p className="text-[10px] text-slate-500">
                            NIP: {getAssignedProktorTeknisi(selectedLaptopForPrint.kodeRuang).nipTeknisi || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-14">
                        <p className="font-bold">Proktor Ruangan,</p>
                        <div>
                          <p className="font-extrabold underline">
                            {getAssignedProktorTeknisi(selectedLaptopForPrint.kodeRuang).namaProktor || 'Proktor Ruangan'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            NIP: {getAssignedProktorTeknisi(selectedLaptopForPrint.kodeRuang).nipProktor || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT 3: STIKER TEMPEL INDIVIDUAL (LAPTOP, CHARGER, TAS) */}
              {printDocType === 'stiker' && selectedLaptopForPrint && (
                <div className="space-y-6">
                  <div className="text-center border-b border-slate-300 pb-3 font-sans">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                      STIKER TEMPEL PENDATAAN LAPTOP & SARANA UJIAN TKA 2026
                    </h3>
                    <p className="text-[11px] text-slate-700 font-bold">{docSettings.namaSekolah}</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                      Gunting mengikuti garis putus-putus dan tempelkan pada body laptop, adaptor charger, & tas perangkat.
                    </p>
                  </div>

                  {/* STIKER 1: BODY LAPTOP (UTAMA) WITH QR CODE & BARCODE */}
                  <div className="sticker-card border-2 border-slate-900 rounded-xl p-4 bg-white space-y-3 relative shadow-xs">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <QRCodeSVG
                          value={`TKA-LAPTOP|Siswa:${selectedLaptopForPrint.namaSiswa}|Ruang:${selectedLaptopForPrint.kodeRuang}|No:${selectedLaptopForPrint.noUrutLaptop}|Status:${selectedLaptopForPrint.statusKelayakan}`}
                          size={46}
                        />
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-tight font-sans text-slate-900">
                            INVENTARIS LAPTOP TKA 2026
                          </h4>
                          <p className="text-[10px] font-bold text-slate-700 font-sans">{docSettings.namaSekolah}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                          {selectedLaptopForPrint.kodeRuang}
                        </span>
                        <div className="text-base font-black text-slate-950 font-mono mt-0.5">
                          NO URUT: #{selectedLaptopForPrint.noUrutLaptop}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-sans text-xs">
                      <div className="col-span-2 space-y-1.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Nama Siswa Pemilik:</span>
                          <strong className="text-sm font-black text-slate-900">{selectedLaptopForPrint.namaSiswa}</strong>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-800">
                          <span>Kelas: <strong>{selectedLaptopForPrint.kelas}</strong></span>
                          <span>Gelombang: <strong>{selectedLaptopForPrint.gelombang.split(' ')[0]}</strong></span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Merk / Spesifikasi:</span>
                          <strong className="text-xs text-slate-900">{selectedLaptopForPrint.merkLaptop}</strong>
                        </div>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-3 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Hasil Inspeksi:</span>
                          {selectedLaptopForPrint.statusKelayakan === 'LAYAK' ? (
                            <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-400">
                              ✔ LAYAK UJIAN
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded bg-rose-100 text-rose-950 font-black text-xs border border-rose-400">
                              ✖ TIDAK LAYAK
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] space-y-0.5 text-slate-700">
                          <div>Charger: <strong>{selectedLaptopForPrint.kelengkapan.charger ? '✔ Ada' : '✖ Tidak'}</strong></div>
                          <div>Mouse: <strong>{selectedLaptopForPrint.kelengkapan.mouse ? '✔ Ada' : '✖ Tidak'}</strong></div>
                          <div>Keyboard: <strong>{selectedLaptopForPrint.kelengkapan.keyboard ? '✔ Normal' : '✖ Kendala'}</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-1.5 flex items-center justify-between text-[10px] text-slate-600 font-sans">
                      <span>Teknisi Penguji: <strong>{selectedLaptopForPrint.namaTeknisi}</strong></span>
                      <SimpleBarcode value={`TKA-${selectedLaptopForPrint.kodeRuang}-${selectedLaptopForPrint.noUrutLaptop}`} height={22} />
                    </div>
                  </div>

                  {/* GARIS PUTUS-PUTUS PERBATASAN */}
                  <div className="border-b-2 border-dashed border-slate-300 my-2 text-center">
                    <span className="bg-white px-2 text-[10px] text-slate-400 font-sans italic">✂ Potong garis stiker asesoris di bawah ✂</span>
                  </div>

                  {/* GRID STIKER ASESORIS (CHARGER & TAS) */}
                  <div className="grid grid-cols-2 gap-4 font-sans">
                    {/* STIKER CHARGER WITH QR & BARCODE */}
                    <div className="sticker-card border-2 border-slate-800 rounded-lg p-3 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-400 pb-1">
                        <div className="flex items-center gap-1.5">
                          <QRCodeSVG
                            value={`CHARGER-TKA|Siswa:${selectedLaptopForPrint.namaSiswa}|No:${selectedLaptopForPrint.noUrutLaptop}`}
                            size={32}
                          />
                          <span className="font-extrabold text-[10px] uppercase text-slate-900">
                            STIKER CHARGER TKA
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">
                          #{selectedLaptopForPrint.noUrutLaptop}
                        </span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-extrabold text-slate-900">{selectedLaptopForPrint.namaSiswa}</div>
                        <div className="text-[10px] text-slate-600">
                          Kelas {selectedLaptopForPrint.kelas} | {selectedLaptopForPrint.kodeRuang}
                        </div>
                      </div>
                      <div className="border-t border-slate-300 pt-1 text-center">
                        <SimpleBarcode value={`CHG-${selectedLaptopForPrint.noUrutLaptop}`} height={18} />
                      </div>
                    </div>

                    {/* STIKER TAS / MOUSE WITH QR & BARCODE */}
                    <div className="sticker-card border-2 border-slate-800 rounded-lg p-3 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-400 pb-1">
                        <div className="flex items-center gap-1.5">
                          <QRCodeSVG
                            value={`TAS-TKA|Siswa:${selectedLaptopForPrint.namaSiswa}|No:${selectedLaptopForPrint.noUrutLaptop}`}
                            size={32}
                          />
                          <span className="font-extrabold text-[10px] uppercase text-slate-900">
                            STIKER TAS LAPTOP TKA
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">
                          #{selectedLaptopForPrint.noUrutLaptop}
                        </span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-extrabold text-slate-900">{selectedLaptopForPrint.namaSiswa}</div>
                        <div className="text-[10px] text-slate-600">
                          Kelas {selectedLaptopForPrint.kelas} | {selectedLaptopForPrint.kodeRuang}
                        </div>
                      </div>
                      <div className="border-t border-slate-300 pt-1 text-center">
                        <SimpleBarcode value={`TAS-${selectedLaptopForPrint.noUrutLaptop}`} height={18} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT 4: KUMPULAN STIKER MASSAL ALL LAPTOPS WITH QR CODES & BARCODES */}
              {printDocType === 'stiker-batch' && (
                <div className="space-y-4 font-sans">
                  <div className="text-center border-b border-slate-300 pb-2">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                      CETAK MASSAL STIKER LAPTOP & SARANA UJIAN TKA 2026
                    </h3>
                    <p className="text-[11px] font-bold text-slate-700">{docSettings.namaSekolah}</p>
                    <p className="text-[10px] text-slate-500">
                      Total {filteredLaptops.length} Stiker Unit Laptop Terfilter | Tanggal Cetak: {docSettings.kotaTanggal}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {filteredLaptops.map((laptop) => (
                      <div
                        key={laptop.id}
                        className="sticker-card border-2 border-slate-900 rounded-lg p-3 bg-white space-y-2 relative"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <div className="flex items-center gap-1.5">
                            <QRCodeSVG
                              value={`TKA-LAPTOP|Siswa:${laptop.namaSiswa}|Ruang:${laptop.kodeRuang}|No:${laptop.noUrutLaptop}|Status:${laptop.statusKelayakan}`}
                              size={36}
                            />
                            <div>
                              <span className="font-black text-[10px] uppercase block leading-tight text-slate-900">
                                INVENTARIS TKA
                              </span>
                              <span className="text-[9px] text-indigo-700 font-bold">{laptop.kodeRuang}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-slate-900">
                              #{laptop.noUrutLaptop}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Pemilik:</span>
                            <strong className="text-xs text-slate-900 font-black block truncate">{laptop.namaSiswa}</strong>
                            <span className="text-[10px] text-slate-600 font-semibold">
                              {laptop.kelas} | {laptop.gelombang.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-800 truncate max-w-[120px]">{laptop.merkLaptop}</span>
                            {laptop.statusKelayakan === 'LAYAK' ? (
                              <span className="font-extrabold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                LAYAK
                              </span>
                            ) : (
                              <span className="font-extrabold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                                TIDAK LAYAK
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-600 border-t border-slate-200 pt-1.5">
                            <span>Chg:{laptop.kelengkapan.charger ? '✔' : '✖'} | Ms:{laptop.kelengkapan.mouse ? '✔' : '✖'}</span>
                            <SimpleBarcode value={`TKA-${laptop.kodeRuang}-${laptop.noUrutLaptop}`} height={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-slate-500">Apakah Anda yakin ingin menghapus data ini?</p>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900">{deleteConfirm.title}</p>
              {deleteConfirm.details && <p className="text-slate-600 mt-1">{deleteConfirm.details}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'laptop' && deleteConfirm.id) {
                    onDeleteLaptop(deleteConfirm.id);
                  } else if (deleteConfirm.type === 'proktor' && deleteConfirm.id) {
                    onDeleteProktor(deleteConfirm.id);
                  } else if (deleteConfirm.type === 'resetLaptops') {
                    onResetLaptops();
                  }
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
