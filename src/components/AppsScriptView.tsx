import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  HelpCircle,
  Download
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/mockStudents';
import { getAppsScriptUrl, saveAppsScriptUrl } from '../utils/storage';

export const AppsScriptView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [gasUrlInput, setGasUrlInput] = useState(getAppsScriptUrl());
  const [testStatus, setTestStatus] = useState<{
    type: 'idle' | 'testing' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    saveAppsScriptUrl(gasUrlInput);
    setTestStatus({
      type: 'success',
      message: 'URL Google Apps Script berhasil disimpan di memori lokal.',
    });
  };

  const handleTestConnection = async () => {
    if (!gasUrlInput.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Mohon masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    const cleanUrl = gasUrlInput.trim();

    if (cleanUrl.includes('/dev')) {
      setTestStatus({
        type: 'error',
        message: '⚠️ URL berakhiran /dev adalah URL Editor Tes. Mohon gunakan Web App URL yang berakhiran /exec dari menu Deploy > New Deployment.',
      });
      return;
    }

    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      setTestStatus({
        type: 'error',
        message: '⚠️ Format URL tidak valid. URL harus diawali dengan https://script.google.com/macros/s/.../exec',
      });
      return;
    }

    setTestStatus({
      type: 'testing',
      message: 'Menghubungkan ke Google Apps Script Web App...',
    });

    try {
      let json: any = null;
      let isSuccess = false;

      // Method 1: Try POST request with text/plain (avoids CORS preflight in browsers)
      try {
        const postRes = await fetch(cleanUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'getAll' }),
        });
        json = await postRes.json();
        if (json && json.status === 'success') {
          isSuccess = true;
        }
      } catch (_) {
        // Fallback Method 2: Try GET request
        try {
          const getRes = await fetch(cleanUrl, { method: 'GET' });
          json = await getRes.json();
          if (json && json.status === 'success') {
            isSuccess = true;
          }
        } catch (getErr) {
          console.warn('GET fallback failed:', getErr);
        }
      }

      if (isSuccess && json) {
        saveAppsScriptUrl(cleanUrl);
        const totalRows = (json.students?.length || 0) + (json.laptops?.length || 0) + (json.masterStudents?.length || 0);
        setTestStatus({
          type: 'success',
          message: `Koneksi Berhasil! Google Sheet terhubung sempurna (${totalRows} total data terdeteksi).`,
        });
      } else if (json && json.message) {
        setTestStatus({
          type: 'error',
          message: `Respon dari App Script: ${json.message}`,
        });
      } else {
        throw new Error('CORS_OR_AUTH_ERROR');
      }
    } catch (error: any) {
      setTestStatus({
        type: 'error',
        message:
          'Gagal terhubung! Penyebab di Vercel (sitakav4.vercel.app):\n' +
          '1. "Who has access" belum diset ke "Anyone" (Siapa Saja) di Apps Script.\n' +
          '2. Lupa memilih "New version" saat re-deploy.\n' +
          '3. Google meminta otorisasi izin Drive/Spreadsheet.',
      });
    }
  };

  const handleDownloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    element.href = URL.createObjectURL(file);
    element.download = 'Code.gs';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Code2 className="w-4 h-4" /> Integrasi Backend Google Apps Script (GAS)
        </div>
        <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
          Pusat Integrasi & Generator Google Sheets Backend
        </h3>
        <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
          Seluruh data administrasi siswa (Nama, NIS, NISN, Mapel TKA 1-2, dan Prodi 1-2), Pendataan Laptop & Sarana Ujian TKA, serta Proktor/Teknisi Lab dirancang untuk sinkron secara otomatis dengan Google Spreadsheet Anda menggunakan Google Apps Script tanpa memerlukan database server berbayar.
        </p>

        {/* Multi-Tab Cards Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Tab 1: Data_Siswa_TKA
            </div>
            <p className="text-[11px] text-slate-400">
              Menyimpan Identitas, Mapel TKA 1-2, Pilihan PTN/Prodi, KIP-K & Prestasi.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-teal-400" /> Tab 2: Pendataan_Laptop_Sarana
            </div>
            <p className="text-[11px] text-slate-400">
              Menyimpan Merk Laptop, Charger, Kode Lab, No Meja & Status Kelayakan.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" /> Tab 3: Proktor_Teknisi_Lab
            </div>
            <p className="text-[11px] text-slate-400">
              Menyimpan Penugasan Proktor Ujian, Teknisi Lab & Alokasi Ruang Test.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kode Ter-Salin!' : 'Salin Kode App Script (Code.gs)'}
          </button>

          <button
            onClick={handleDownloadScript}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4" /> Unduh file Code.gs
          </button>
        </div>
      </div>

      {/* URL Endpoint Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Tautkan URL Web App Google Apps Script
            </h4>
            <p className="text-xs text-slate-500">
              Masukkan Web App URL yang didapatkan setelah Deploy Apps Script dari Google Sheets
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={gasUrlInput}
            onChange={(e) => setGasUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan URL
            </button>
            <button
              onClick={handleTestConnection}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" /> Uji Koneksi
            </button>
          </div>
        </div>

        {testStatus.type !== 'idle' && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              testStatus.type === 'testing'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : testStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {testStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {testStatus.type === 'testing' && <Zap className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />}
            <span className="whitespace-pre-line">{testStatus.message}</span>
          </div>
        )}

        {/* Vercel & Web Deployment Troubleshooting Callout */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mengapa URL tidak terhubung saat diakses dari Vercel (sitakav4.vercel.app)?</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Jika Web App Apps Script berjalan di lokal namun tidak terhubung di Vercel, hal ini disebabkan oleh <strong>kebijakan CORS &amp; Otorisasi Google Apps Script</strong>. Berikut 3 langkah wajib untuk mengaktifkannya:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-amber-900 font-medium pl-1">
            <li>
              <strong>Wajib Atur "Who has access" = "Anyone" (Siapa Saja):</strong><br />
              <span className="text-slate-600 font-normal ml-5 inline-block">
                Di Apps Script editor &gt; <strong>Deploy</strong> &gt; <strong>Manage deployments</strong> &gt; Edit (Pensil) &gt; ubah <em>Who has access</em> dari <u>Only myself</u> menjadi <strong className="text-emerald-700">Anyone</strong>. Jika diset "Only myself", browser di Vercel akan memblokirnya.
              </span>
            </li>
            <li>
              <strong>Pilih "New version" (Versi Baru) saat Re-Deploy:</strong><br />
              <span className="text-slate-600 font-normal ml-5 inline-block">
                Perubahan kode tidak akan aktif sebelum Anda membuat Versi Baru di Apps Script (Deploy &gt; New deployment &gt; Deploy).
              </span>
            </li>
            <li>
              <strong>Gunakan URL yang berakhiran `/exec`:</strong><br />
              <span className="text-slate-600 font-normal ml-5 inline-block">
                Pastikan URL yang dimasukkan berakhiran <code>/exec</code> (bukan <code>/dev</code>).
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* Deployment Instructions Step-by-Step */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          Panduan Langkah Pemasangan Google Apps Script (5 Menit)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-xs">
              1
            </span>
            <h5 className="font-bold text-slate-800 text-sm">Buka Google Spreadsheet</h5>
            <p className="text-slate-600 leading-relaxed">
              Buat Google Sheet baru di Google Drive Anda. Buka menu <strong className="text-slate-800">Extensions (Ekstensi) &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-xs">
              2
            </span>
            <h5 className="font-bold text-slate-800 text-sm">Tempelkan Kode Code.gs</h5>
            <p className="text-slate-600 leading-relaxed">
              Hapus kode default di Apps Script, lalu salin dan tempelkan kode yang ada pada kotak di bawah ini ke editor <strong className="text-slate-800">Code.gs</strong>. Lalu simpan (Ctrl+S).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-xs">
              3
            </span>
            <h5 className="font-bold text-slate-800 text-sm">Deploy &amp; Otorisasi Google Drive</h5>
            <p className="text-slate-600 leading-relaxed">
              Klik tombol <strong className="text-indigo-600">Deploy &gt; New deployment</strong>. Pilih type <strong className="text-slate-800">Web app</strong>. Atur <em className="text-slate-800 font-semibold">Who has access</em> menjadi <strong className="text-emerald-700">"Anyone" (Siapa Saja)</strong>.
            </p>
            <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
              📌 <strong>Tips Folder Pasfoto:</strong> Saat Deploy/Otorisasi, berikan izin akses ke Google Drive agar folder <code>Pasfoto_Siswa_TKA</code> otomatis dibuat saat pertama kali foto disimpan.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-xs">
              4
            </span>
            <h5 className="font-bold text-slate-800 text-sm">Salin Web App URL</h5>
            <p className="text-slate-600 leading-relaxed">
              Salin URL Web App yang muncul setelah otorisasi, lalu tempelkan pada form input "Tautkan URL Web App" di atas.
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Box */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono font-bold text-indigo-400 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Code.gs (Backend Google Apps Script)
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Salin' : 'Salin Code'}</span>
          </button>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[400px]">
          <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
        </pre>
      </div>
    </div>
  );
};
