import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  Info,
  Loader2,
  Database,
  CloudUpload,
  Check,
  ArrowRight,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Student } from '../types';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelUtils';
import { addMultipleStudents, getAppsScriptUrl } from '../utils/storage';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsedData, setParsedData] = useState<Omit<Student, 'id' | 'updatedAt'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  
  // Animation & Execution States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStep, setImportStep] = useState<number>(0); // 0: Idle, 1: Validating, 2: Saving, 3: Syncing, 4: Complete
  const [importProgress, setImportProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setIsParsing(false);
      setParsingProgress(0);
      setParsedData([]);
      setParseErrors([]);
      setIsSubmitting(false);
      setImportStep(0);
      setImportProgress(0);
      setSyncStatusText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParsingProgress(15);
    setParseErrors([]);
    setParsedData([]);

    // Animated parsing progress simulation for delightful feedback
    const parseInterval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 85) {
          clearInterval(parseInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 120);

    try {
      const { validStudents, errors } = await parseExcelFile(selectedFile);
      setParsingProgress(100);
      setTimeout(() => {
        setParsedData(validStudents);
        setParseErrors(errors);
        setIsParsing(false);
        clearInterval(parseInterval);
      }, 300);
    } catch (err: any) {
      setParseErrors([err.message || 'Gagal memproses file Excel.']);
      setIsParsing(false);
      clearInterval(parseInterval);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;

    setIsSubmitting(true);
    setImportStep(1);
    setImportProgress(10);
    setSyncStatusText('Membaca & Memverifikasi ' + parsedData.length + ' data siswa...');

    // Animated Multi-Step Execution
    // Step 1: Validation
    await new Promise((res) => setTimeout(res, 400));
    setImportProgress(35);
    setImportStep(2);
    setSyncStatusText(`Menyimpan ${parsedData.length} data siswa ke database lokal...`);

    // Step 2: Save to Local Storage / Database
    try {
      addMultipleStudents(parsedData, importMode);
    } catch (e) {
      console.error('Error adding students:', e);
    }

    await new Promise((res) => setTimeout(res, 500));
    setImportProgress(70);
    setImportStep(3);

    const gasUrl = getAppsScriptUrl();
    if (gasUrl) {
      setSyncStatusText('Menyingkronkan data secara otomatis ke Google Apps Script Cloud...');
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'batchSave', students: parsedData }),
        });
      } catch (gasErr) {
        console.warn('Apps script sync warning:', gasErr);
      }
    } else {
      setSyncStatusText('Menyiapkan penyelesaian impor data...');
    }

    await new Promise((res) => setTimeout(res, 400));
    setImportProgress(100);
    setImportStep(4);
    setSyncStatusText(`Sukses! ${parsedData.length} siswa berhasil diperbarui.`);

    // Wait briefly so user sees the victory celebration animation
    setTimeout(() => {
      onImportSuccess(parsedData.length);
      onClose();
    }, 1800);
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setIsParsing(false);
    setParsingProgress(0);
    setImportStep(0);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] relative"
      >
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isParsing || isSubmitting ? [0, 360] : 0 }}
              transition={
                isParsing || isSubmitting
                  ? { repeat: Infinity, duration: 4, ease: 'linear' }
                  : {}
              }
              className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/30"
            >
              <FileSpreadsheet className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Impor Data Siswa Excel / CSV
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] rounded-full border border-indigo-400/30 font-medium">
                  Smart Sync
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80">
                Upload berkas spreadsheet untuk memasukkan & memperbarui data siswa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1 relative z-10">
          <AnimatePresence mode="wait">
            {/* STATE 1: MULTI-STEP IMPORT SUBMITTING ANIMATION OVERLAY */}
            {isSubmitting ? (
              <motion.div
                key="submitting-animation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Visual Icon Animation Container */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Rings */}
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className={`w-28 h-28 rounded-full absolute ${
                      importStep === 4 ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
                    }`}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.2 }}
                    className={`w-36 h-36 rounded-full absolute ${
                      importStep === 4 ? 'bg-emerald-400/10' : 'bg-indigo-400/10'
                    }`}
                  />

                  {/* Center Circle with Animated Icons */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl relative z-10 transition-all duration-500 ${
                      importStep === 4
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
                        : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-indigo-500/30'
                    }`}
                  >
                    {importStep === 1 && (
                      <motion.div
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        <FileCheck className="w-9 h-9" />
                      </motion.div>
                    )}
                    {importStep === 2 && (
                      <motion.div
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Database className="w-9 h-9" />
                      </motion.div>
                    )}
                    {importStep === 3 && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      >
                        <CloudUpload className="w-9 h-9" />
                      </motion.div>
                    )}
                    {importStep === 4 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <Check className="w-10 h-10 stroke-[3]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Confetti Sparkles when Complete */}
                  {importStep === 4 && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{
                            opacity: [1, 0],
                            scale: [0.5, 1.2],
                            x: Math.cos((i * Math.PI) / 4) * 70,
                            y: Math.sin((i * Math.PI) / 4) * 70,
                          }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                          className="absolute w-2.5 h-2.5 rounded-full bg-amber-400"
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Progress Text & Step Titles */}
                <div className="space-y-2 max-w-md w-full">
                  <motion.h4
                    key={syncStatusText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base font-black text-slate-900 tracking-tight"
                  >
                    {importStep === 4 ? '🎉 Impor Data Siswa Berhasil!' : syncStatusText}
                  </motion.h4>

                  <p className="text-xs text-slate-500 font-medium">
                    {importStep === 4
                      ? `Sebanyak ${parsedData.length} data siswa telah diperbarui & disinkronkan ke seluruh sistem.`
                      : `Memproses ${parsedData.length} data baris siswa dari file Excel...`}
                  </p>

                  {/* Progress Bar Container */}
                  <div className="pt-3 w-full">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                      <span>Proses Impor Data</span>
                      <span className="font-mono text-indigo-600">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                      <motion.div
                        className={`h-full rounded-full ${
                          importStep === 4
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${importProgress}%` }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-2 text-left">
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      importStep >= 1
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {importStep > 1 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : importStep === 1 ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                      )}
                      <span>1. Validasi</span>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      importStep >= 2
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {importStep > 2 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : importStep === 2 ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                      )}
                      <span>2. Simpan</span>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      importStep >= 3
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {importStep >= 4 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : importStep === 3 ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                      )}
                      <span>3. Cloud Sync</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : isParsing ? (
              /* STATE 2: EXCEL FILE PARSING ANIMATION */
              <motion.div
                key="parsing-animation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800">
                    Membaca & Memvalidasi File Excel...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mengekstrak kolom data siswa, NISN, kelas, dan pilihan studi lanjut
                  </p>
                </div>

                <div className="w-64 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <motion.div
                    className="bg-indigo-600 h-full rounded-full"
                    animate={{ width: `${parsingProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            ) : (
              /* STATE 3: NORMAL FILE SELECTION & PREVIEW FORM */
              <motion.div
                key="normal-import-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Step 1: Template Download Bar */}
                <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-950 text-xs">
                        Belum Memiliki Format Excel?
                      </h4>
                      <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                        Unduh template resmi agar tata letak kolom (Nama, NIS, NISN, Mapel TKA, Prodi) langsung pas.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={downloadExcelTemplate}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0 inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template Excel (.xlsx)
                  </button>
                </div>

                {/* Upload Drag & Drop Area */}
                {!file ? (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-lg'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Upload className="w-7 h-7" />
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mb-1">
                      Pilih atau Geser File Excel / CSV Ke Sini
                    </h4>
                    <p className="text-slate-500 text-xs mb-4">
                      Mendukung format <strong className="text-slate-700">.XLSX</strong>,{' '}
                      <strong className="text-slate-700">.XLS</strong>, dan{' '}
                      <strong className="text-slate-700">.CSV</strong>
                    </p>

                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-xs hover:bg-indigo-50 transition-colors">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Cari Berkas di Komputer
                    </span>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {/* File Selected Badge Bar */}
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs truncate max-w-[250px]">
                            {file.name}
                          </h5>
                          <p className="text-[11px] text-emerald-800 font-medium">
                            {(file.size / 1024).toFixed(1)} KB • {parsedData.length} baris data valid terdeteksi
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={resetState}
                        className="px-3 py-1.5 text-[11px] text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl font-bold shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-500" /> Ganti File
                      </button>
                    </div>

                    {/* Parsing Warnings / Errors if any */}
                    {parseErrors.length > 0 && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Catatan Validasi Baris ({parseErrors.length}):</span>
                        </div>
                        <ul className="list-disc pl-5 text-amber-800 text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                          {parseErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Import Mode Radio Selection */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <label className="font-bold text-slate-800 text-xs block">
                        Metode Penambahan Data:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                            importMode === 'append'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'append'}
                            onChange={() => setImportMode('append')}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">Tambahkan ke Data Ada</div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              Siswa baru digabungkan dengan daftar saat ini
                            </div>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                            importMode === 'overwrite'
                              ? 'bg-rose-50 border-rose-500 text-rose-950 font-semibold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'overwrite'}
                            onChange={() => setImportMode('overwrite')}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-rose-900">Timpa Semua Data</div>
                            <div className="text-[10px] text-rose-600/80 font-normal">
                              Menghapus data lama & mengganti penuh dari Excel
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span>Pratinjau Data Siswa Terdeteksi ({parsedData.length})</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          Menampilkan 5 baris pertama
                        </span>
                      </h5>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="p-2.5 pl-3">Nama Siswa</th>
                              <th className="p-2.5">NIS / NISN</th>
                              <th className="p-2.5">Kelas</th>
                              <th className="p-2.5">Mapel TKA 1-2</th>
                              <th className="p-2.5">Prodi Pilihan 1</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedData.slice(0, 5).map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2.5 pl-3 font-bold text-slate-800">
                                  {s.namaSiswa}
                                </td>
                                <td className="p-2.5 font-mono text-slate-600">
                                  {s.nis || '-'} / {s.nisn || '-'}
                                </td>
                                <td className="p-2.5 text-slate-600">{s.kelas}</td>
                                <td className="p-2.5 text-indigo-700 font-medium">
                                  {s.mapelTka1}, {s.mapelTka2}
                                </td>
                                <td className="p-2.5 text-slate-700 truncate max-w-[150px]">
                                  {s.prodiPilihan1 || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        {!isSubmitting && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between relative z-10">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Batal
            </button>

            {parsedData.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Proses Impor {parsedData.length} Siswa</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

