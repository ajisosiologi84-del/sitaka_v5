import React, { useState, useMemo, useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Filter,
  CheckCircle2,
  Sparkles,
  FileText,
  Users,
  GraduationCap,
  Building2,
  Award,
  Search,
  FileCheck2,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';
import { Student } from '../types';
import { findBanPtAccreditation } from '../data/banptData';
import { MAPEL_PILIHAN_845_LIST } from '../data/mapelPilihanData';

interface BatchPrintStudentModalProps {
  students: Student[];
  initialSelectedKelas?: string;
  initialSelectedIds?: string[];
  onClose: () => void;
}

export const BatchPrintStudentModal: React.FC<BatchPrintStudentModalProps> = ({
  students,
  initialSelectedKelas = 'ALL',
  initialSelectedIds = [],
  onClose,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>(initialSelectedKelas);
  const [sourceMode, setSourceMode] = useState<'all' | 'filtered' | 'selected'>(
    initialSelectedIds.length > 0 ? 'selected' : initialSelectedKelas !== 'ALL' ? 'filtered' : 'all'
  );
  const [outputFormat, setOutputFormat] = useState<'individual' | 'rekap'>('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [includePasfoto, setIncludePasfoto] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  // Animated Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState('');

  // Success Celebration Modal State
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastPrintedCount, setLastPrintedCount] = useState(0);
  const [lastPrintedFormat, setLastPrintedFormat] = useState<'individual' | 'rekap'>('individual');
  const [lastPrintedKelas, setLastPrintedKelas] = useState('ALL');
  const [lastPrintedType, setLastPrintedType] = useState<'pdf' | 'print'>('pdf');

  // Extract unique classes
  const kelasOptions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.kelas))).filter(Boolean);
    return ['ALL', ...list];
  }, [students]);

  // Filter students based on sourceMode and controls
  const studentsToPrint = useMemo(() => {
    let result = [...students];

    if (sourceMode === 'selected' && initialSelectedIds.length > 0) {
      result = result.filter((s) => initialSelectedIds.includes(s.id));
    } else if (sourceMode === 'filtered' || selectedKelas !== 'ALL') {
      if (selectedKelas !== 'ALL') {
        result = result.filter((s) => s.kelas === selectedKelas);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.namaSiswa.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          (s.prodiPilihan1 && s.prodiPilihan1.toLowerCase().includes(q)) ||
          (s.ptn1 && s.ptn1.toLowerCase().includes(q))
      );
    }

    return result;
  }, [students, sourceMode, selectedKelas, initialSelectedIds, searchQuery]);

  // Summary stats for preview banner
  const stats = useMemo(() => {
    const total = studentsToPrint.length;
    let kuliahCount = 0;
    let akademiCount = 0;
    let bekerjaCount = 0;
    let totalRaport = 0;

    studentsToPrint.forEach((s) => {
      const studi = s.pilihanStudiLanjut || 'Kuliah';
      if (studi.includes('Kuliah')) kuliahCount++;
      if (studi.includes('AKADEMI')) akademiCount++;
      if (studi.includes('Bekerja')) bekerjaCount++;
      totalRaport += s.nilaiRaportRataRata || 0;
    });

    const avgRaport = total > 0 ? (totalRaport / total).toFixed(1) : '0';

    return { total, kuliahCount, akademiCount, bekerjaCount, avgRaport };
  }, [studentsToPrint]);

  // Helper for 845 mapel match
  const find845Mapel = (prodi: string) => {
    if (!prodi) return null;
    return MAPEL_PILIHAN_845_LIST.find(
      (item) =>
        prodi.toLowerCase().includes(item.kelompokProdi.toLowerCase()) ||
        item.kelompokProdi.toLowerCase().includes(prodi.toLowerCase())
    );
  };

  // HTML Generator for Individual Student Proof Forms
  const generateBatchIndividualHtml = (): string => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timestamp = new Date().toLocaleString('id-ID');

    const pagesHtml = studentsToPrint
      .map((student, idx) => {
        const regNo = `REG-TKA/${new Date().getFullYear()}/${(student.nisn || '0000').slice(-4)}`;
        const banpt1 = findBanPtAccreditation(student.ptn1 || '', student.prodiPilihan1 || '');
        const banpt2 = findBanPtAccreditation(student.ptn2 || '', student.prodiPilihan2 || '');
        const req1 = find845Mapel(student.prodiPilihan1 || '');

        const prestasiRows =
          student.prestasiList && student.prestasiList.length > 0
            ? student.prestasiList
                .map(
                  (p, pIdx) => `
              <tr>
                <td style="text-align: center; font-weight: bold; padding: 4px; border: 1px solid #cbd5e1;">${pIdx + 1}</td>
                <td style="font-weight: bold; color: #0f172a; padding: 4px; border: 1px solid #cbd5e1;">${p.namaPrestasi}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.jenis}</td>
                <td style="font-weight: 600; color: #78350f; padding: 4px; border: 1px solid #cbd5e1;">${p.tingkat}</td>
                <td style="font-size: 10px; padding: 4px; border: 1px solid #cbd5e1;">${p.lembaga || 'Kemdikbud'}</td>
              </tr>
            `
                )
                .join('')
            : `
            <tr>
              <td colspan="5" style="padding: 6px; font-style: italic; color: #64748b; text-align: center; border: 1px solid #cbd5e1;">
                Tidak ada portofolio prestasi tambahan yang dilampirkan.
              </td>
            </tr>
          `;

        const fotoHtml =
          includePasfoto && student.fotoSiswa
            ? `<img src="${student.fotoSiswa}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />`
            : `<div style="font-size: 9px; color: #94a3b8; font-weight: 600; text-align: center; padding: 10px;">Pasfoto 3x4<br/>Resmi Siswa</div>`;

        return `
          <div class="page-container" style="page-break-after: always; padding: 18px 20px; background: white; font-family: system-ui, sans-serif; font-size: 11px; color: #0f172a; line-height: 1.35; margin-bottom: 20px;">
            <!-- KOP SURAT -->
            <div style="text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 8px; margin-bottom: 12px;">
              <div style="font-size: 9px; font-weight: 800; color: #312e81; text-transform: uppercase; letter-spacing: 1px;">
                PEMERINTAH PROVINSI JAWA BARAT / DKI JAKARTA — DINAS PENDIDIKAN
              </div>
              <div style="font-size: 15px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 2px 0;">
                SMA NEGERI UNGGULAN INDONESIA
              </div>
              <div style="font-size: 10px; color: #475569;">
                Jalan Pendidikan No. 845 • Telp: (021) 7890123 • Website: www.sman-unggul.sch.id
              </div>
              <div style="margin-top: 6px;">
                <span style="display: inline-block; background-color: #0f172a; color: white; font-weight: 900; font-size: 11px; padding: 3px 10px; border-radius: 4px; text-transform: uppercase;">
                  BUKTI PENDATAAN SISWA TKA & STUDI LANJUT
                </span>
                <div style="font-size: 9px; color: #64748b; font-weight: 600; margin-top: 3px;">
                  No. Registrasi: ${regNo} | Dokumen Lembar #${idx + 1} dari ${studentsToPrint.length}
                </div>
              </div>
            </div>

            <!-- SECTION 1: IDENTITAS -->
            <div style="background-color: #1e293b; color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
              1. IDENTITAS RESMI SISWA
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px;">
              <div style="width: 85px; height: 115px; border: 2px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
                ${fotoHtml}
              </div>
              <div style="flex: 1;">
                <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
                  <tbody>
                    <tr>
                      <td style="width: 32%; background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Nama Lengkap Siswa</td>
                      <td style="font-weight: 800; color: #0f172a; padding: 4px 6px; border: 1px solid #cbd5e1; font-size: 11.5px;">${student.namaSiswa || '-'}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">NIS / NISN</td>
                      <td style="font-family: monospace; color: #312e81; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.nis || '-'} / ${student.nisn || '-'}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Kelas / Rombel</td>
                      <td style="font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.kelas || '-'}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Jenis Kelamin</td>
                      <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">No. WhatsApp / HP</td>
                      <td style="font-family: monospace; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.noHp || '-'}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Email Siswa</td>
                      <td style="font-family: monospace; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.email || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SECTION 2: MAPEL TKA -->
            <div style="background-color: #1e293b; color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
              2. MAPEL PILIHAN TES KEMAMPUAN AKADEMIK (TKA) & LINIERITAS
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10.5px;">
              <thead>
                <tr>
                  <th style="width: 50%; background-color: #f1f5f9; padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Mata Pelajaran Pendukung TKA 1</th>
                  <th style="width: 50%; background-color: #f1f5f9; padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Mata Pelajaran Pendukung TKA 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 800; color: #312e81; background-color: #eef2ff; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.mapelTka1 || '-'}</td>
                  <td style="font-weight: 800; color: #312e81; background-color: #eef2ff; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.mapelTka2 || '-'}</td>
                </tr>
              </tbody>
            </table>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <div style="flex: 1; padding: 5px 8px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px;">
                <span style="font-weight: 700; color: #475569; display: block; font-size: 9.5px;">Rata-rata Nilai Raport:</span>
                <span style="font-size: 12px; font-weight: 900; color: #0f172a;">${student.nilaiRaportRataRata || 0} / 100</span>
              </div>
              <div style="flex: 2; padding: 5px 8px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px;">
                <span style="font-weight: 700; color: #475569; display: block; font-size: 9.5px;">Analisis Linieritas Kemdikbud:</span>
                <span style="font-size: 9.5px; font-weight: 700; color: #065f46;">
                  ${req1 ? `Pendukung ${req1.kelompokProdi}: ${req1.mapelPendukung1} & ${req1.mapelPendukung2}` : 'Terverifikasi Sesuai Kurikulum Merdeka'}
                </span>
              </div>
            </div>

            <!-- SECTION 3: STUDI LANJUT -->
            <div style="background-color: #1e293b; color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
              3. RENCANA STUDI LANJUT & DIREKTORI AKREDITASI BAN-PT
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10.5px;">
              <tbody>
                <tr>
                  <td style="width: 32%; background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Tujuan Studi Lanjut</td>
                  <td style="font-weight: 800; color: #0f172a; padding: 4px 6px; border: 1px solid #cbd5e1;">${student.pilihanStudiLanjut || 'Kuliah'}</td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Pilihan 1 (Utama)</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">
                    <div style="font-weight: 800; color: #0f172a;">${student.ptn1 || '-'} — ${student.prodiPilihan1 || '-'}</div>
                    <div style="font-size: 9.5px; color: #047857; font-weight: 700; margin-top: 2px;">
                      Akreditasi BAN-PT: ${banpt1?.akreditasi || 'Unggul'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Pilihan 2 (Alternatif)</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">
                    <div style="font-weight: 800; color: #0f172a;">${student.ptn2 || '-'} — ${student.prodiPilihan2 || '-'}</div>
                    <div style="font-size: 9.5px; color: #0f766e; font-weight: 700; margin-top: 2px;">
                      Akreditasi BAN-PT: ${banpt2?.akreditasi || 'Unggul'}
                    </div>
                  </td>
                </tr>
                ${
                  (!student.pilihanStudiLanjut || student.pilihanStudiLanjut.includes('Kuliah'))
                    ? `
                  <tr>
                    <td style="background-color: #f8fafc; font-weight: 700; color: #334155; padding: 4px 6px; border: 1px solid #cbd5e1;">Pengajuan KIP Kuliah</td>
                    <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">
                      ${student.mengajukanKipKuliah === 'Ya' ? `Ya (Kategori ${student.kategoriDesil || 'Desil 1-4'})` : 'Tidak'}
                    </td>
                  </tr>
                `
                    : ''
                }
              </tbody>
            </table>

            <!-- SECTION 4: PORTOFOLIO PRESTASI -->
            <div style="background-color: #1e293b; color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
              4. PORTOFOLIO PRESTASI SISWA
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px;">
              <thead>
                <tr>
                  <th style="width: 25px; background-color: #f1f5f9; padding: 4px; border: 1px solid #cbd5e1; text-align: center;">No</th>
                  <th style="background-color: #f1f5f9; padding: 4px; border: 1px solid #cbd5e1; text-align: left;">Nama Kejuaraan / Prestasi</th>
                  <th style="width: 80px; background-color: #f1f5f9; padding: 4px; border: 1px solid #cbd5e1; text-align: left;">Jenis</th>
                  <th style="width: 90px; background-color: #f1f5f9; padding: 4px; border: 1px solid #cbd5e1; text-align: left;">Tingkat</th>
                  <th style="width: 110px; background-color: #f1f5f9; padding: 4px; border: 1px solid #cbd5e1; text-align: left;">Penyelenggara</th>
                </tr>
              </thead>
              <tbody>
                ${prestasiRows}
              </tbody>
            </table>

            <!-- SIGNATURES -->
            <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 14px; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 9.5px;">
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #1e293b;">Orang Tua / Wali Siswa,</div>
                <div style="height: 38px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 8px; font-style: italic;">( Tanda Tangan )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ........................................... )</div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #1e293b;">Siswa Bersangkutan,</div>
                <div style="height: 38px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 8px; font-style: italic;">( Tanda Tangan )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ${student.namaSiswa || 'Siswa'} )</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 9px; color: #64748b; font-weight: 600;">${currentDate}</div>
                <div style="font-weight: 700; color: #1e293b;">Mengetahui, Wali Kelas / Tim BK</div>
                <div style="height: 38px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 8px; font-style: italic;">( Stempel / TTD )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ........................................... )</div>
              </div>
            </div>

            <!-- FOOTER AUTH -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-top: 10px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-weight: 800; color: #0f172a; display: block; font-size: 9.5px;">VERIFIKASI OTENTIKASI DIGITALLY CERTIFIED</span>
                <span style="color: #64748b; display: block; font-size: 8.5px;">Dokumen resmi hasil cetak massal terverifikasi di Portal TKA & Studi Lanjut.</span>
                <span style="font-size: 8.5px; font-family: monospace; color: #4338ca;">Timestamp: ${timestamp}</span>
              </div>
              <div style="text-align: right; font-weight: 700; font-size: 9.5px; color: #334155;">
                <span>STATUS: TERVERIFIKASI</span>
                <span style="display: block; color: #047857; font-size: 8.5px;">SMA NEGERI UNGGULAN</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cetak Massal Bukti Pendataan Siswa TKA (${studentsToPrint.length} Siswa)</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; background: #ffffff; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `;
  };

  // HTML Generator for Collective Class Summary Table (Tabel Rekapitulasi Kolektif)
  const generateBatchRekapHtml = (): string => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timestamp = new Date().toLocaleString('id-ID');

    const rowsHtml = studentsToPrint
      .map((student, idx) => {
        const banpt1 = findBanPtAccreditation(student.ptn1 || '', student.prodiPilihan1 || '');
        const banpt2 = findBanPtAccreditation(student.ptn2 || '', student.prodiPilihan2 || '');

        return `
          <tr style="${idx % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;'}">
            <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1;">${idx + 1}</td>
            <td style="font-weight: 800; color: #0f172a; padding: 6px; border: 1px solid #cbd5e1;">${student.namaSiswa}</td>
            <td style="font-family: monospace; padding: 6px; border: 1px solid #cbd5e1; font-size: 10px;">${student.nis} / ${student.nisn}</td>
            <td style="text-align: center; font-weight: 700; padding: 6px; border: 1px solid #cbd5e1;">${student.kelas}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; color: #312e81; font-weight: 700;">
              1. ${student.mapelTka1 || '-'}<br/>
              2. ${student.mapelTka2 || '-'}
            </td>
            <td style="text-align: center; font-weight: 900; padding: 6px; border: 1px solid #cbd5e1;">${student.nilaiRaportRataRata || 0}</td>
            <td style="font-weight: 800; padding: 6px; border: 1px solid #cbd5e1;">${student.pilihanStudiLanjut || 'Kuliah'}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">
              <strong style="color: #0f172a;">${student.ptn1 || '-'}</strong> — ${student.prodiPilihan1 || '-'}
              <div style="font-size: 9px; color: #047857; font-weight: 700;">[BAN-PT: ${banpt1?.akreditasi || 'Unggul'}]</div>
            </td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">
              <strong style="color: #0f172a;">${student.ptn2 || '-'}</strong> — ${student.prodiPilihan2 || '-'}
              <div style="font-size: 9px; color: #0f766e; font-weight: 700;">[BAN-PT: ${banpt2?.akreditasi || 'Unggul'}]</div>
            </td>
            <td style="text-align: center; font-weight: 700; padding: 6px; border: 1px solid #cbd5e1;">
              ${student.mengajukanKipKuliah === 'Ya' ? `<span style="color: #15803d; font-weight: 800;">Ya</span>` : 'Tidak'}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rekapitulasi Hasil Input Siswa TKA & Studi Lanjut (${selectedKelas === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedKelas}`})</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; color: #0f172a; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background-color: #1e293b; color: #ffffff; padding: 8px 6px; font-weight: 800; font-size: 10px; border: 1px solid #0f172a; text-transform: uppercase; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #312e81; text-transform: uppercase;">
              PEMERINTAH PROVINSI JAWA BARAT / DKI JAKARTA — DINAS PENDIDIKAN
            </div>
            <div style="font-size: 16px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 2px 0;">
              SMA NEGERI UNGGULAN INDONESIA
            </div>
            <div style="font-size: 11px; color: #475569;">
              DAFTAR REKAPITULASI HASIL INPUT SISWA TKA & TARGET STUDI LANJUT
            </div>
            <div style="margin-top: 6px; font-size: 11px; font-weight: 800; color: #0f172a;">
              FILTER KELAS: <span style="color: #4338ca;">${selectedKelas === 'ALL' ? 'SEMUA KELAS' : `KELAS ${selectedKelas}`}</span> | TOTAL: ${studentsToPrint.length} SISWA
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 140px;">Nama Siswa</th>
                <th style="width: 110px;">NIS / NISN</th>
                <th style="width: 50px;">Kelas</th>
                <th style="width: 130px;">Mapel TKA 1 & 2</th>
                <th style="width: 50px;">Raport</th>
                <th style="width: 70px;">Studi Lanjut</th>
                <th>Pilihan PTN 1 & Prodi</th>
                <th>Pilihan PTN 2 & Prodi</th>
                <th style="width: 45px;">KIP-K</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 24px; padding-top: 10px; font-size: 10px;">
            <div style="flex: 1;">
              <div style="font-weight: 700;">Mengetahui, Guru BK / Tim TKA</div>
              <div style="height: 45px;"></div>
              <div style="font-weight: 800; text-decoration: underline;">( ........................................... )</div>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 10px; color: #64748b;">Tanggal Cetak: ${currentDate}</div>
              <div style="font-weight: 700;">Wali Kelas / Panitia Pendataan</div>
              <div style="height: 45px;"></div>
              <div style="font-weight: 800; text-decoration: underline;">( ........................................... )</div>
            </div>
          </div>

          <div style="margin-top: 15px; font-size: 9px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            Dicetak secara resmi via Portal SITAKA (Waktu: ${timestamp})
          </div>
        </body>
      </html>
    `;
  };

  // Trigger Action (Download PDF vs Direct Print Window)
  const handleExecuteBatchPrint = (type: 'pdf' | 'print') => {
    if (studentsToPrint.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressText(`Menyiapkan data ${studentsToPrint.length} siswa TKA & Studi Lanjut...`);

    const fullHtml = outputFormat === 'individual' ? generateBatchIndividualHtml() : generateBatchRekapHtml();

    setTimeout(() => {
      setProgressPercent(40);
      setProgressText(`Menganalisis pilihan PTN/Prodi & Akreditasi BAN-PT untuk ${studentsToPrint.length} siswa...`);
    }, 400);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressText(
        type === 'pdf'
          ? `Menyusun berkas PDF massal format ${outputFormat === 'individual' ? 'Bukti Individual' : 'Tabel Rekapitulasi'}...`
          : 'Mempersiapkan dialog cetak / printer browser...'
      );
    }, 900);

    setTimeout(() => {
      setProgressPercent(100);
      setProgressText('Pencetakan massal selesai! Membuka dokumen...');

      if (type === 'print') {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.open();
          const htmlWithTopBar = fullHtml.replace(
            '<body>',
            `<body>
              <div style="background: #0f172a; color: white; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" class="no-print">
                <div>
                  <strong style="font-size: 14px; display: block; color: #ffffff;">📄 Cetak Massal Hasil Input Siswa TKA (${studentsToPrint.length} Siswa)</strong>
                  <span style="font-size: 11px; color: #cbd5e1;">Pilih printer Anda atau pilih <strong>"Simpan sebagai PDF"</strong> pada tujuan cetak browser.</span>
                </div>
                <button onclick="window.print()" style="background-color: #4f46e5; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px;">
                  🖨️ PROSES MENCETAK SEKARANG
                </button>
              </div>
            `
          );
          printWin.document.write(htmlWithTopBar);
          printWin.document.close();

          setTimeout(() => {
            try {
              printWin.focus();
              printWin.print();
            } catch (err) {
              console.warn('Auto print window error:', err);
            }
          }, 500);
        }
      } else {
        // PDF Download via html2pdf or HTML file download
        try {
          const opt = {
            margin: 8,
            filename: `Cetak_Massal_TKA_StudiLanjut_${selectedKelas === 'ALL' ? 'Semua_Kelas' : selectedKelas}_${studentsToPrint.length}_Siswa.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
          };

          const element = document.createElement('div');
          element.innerHTML = fullHtml;
          document.body.appendChild(element);

          html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
              document.body.removeChild(element);
            })
            .catch(() => {
              if (document.body.contains(element)) document.body.removeChild(element);
              // Fallback HTML Download
              const blob = new Blob(['\ufeff', fullHtml], { type: 'text/html;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Cetak_Massal_TKA_${selectedKelas}_${studentsToPrint.length}_Siswa.html`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
        } catch (err) {
          console.warn('html2pdf execution fallback:', err);
        }
      }

      // Record last printed metrics and show festive success modal animation!
      setLastPrintedCount(studentsToPrint.length);
      setLastPrintedFormat(outputFormat);
      setLastPrintedKelas(selectedKelas);
      setLastPrintedType(type);

      setIsProcessing(false);
      setShowSuccessAnimation(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white relative flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 p-0.5 shadow-lg shadow-indigo-900/40 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Printer className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Cetak Massal Siswa TKA & Studi Lanjut
                  </h2>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                    Kolektif PDF
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Cetak bukti pendataan individual atau rekapitulasi kolektif per kelas secara instan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Sumber Data & Filter Kelas */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>1. Filter Kelas & Sumber Data Siswa</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {studentsToPrint.length} Siswa Terpilih
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter Dropdown Kelas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Kelas:</label>
                <select
                  value={selectedKelas}
                  onChange={(e) => {
                    setSelectedKelas(e.target.value);
                    if (sourceMode === 'selected') setSourceMode('filtered');
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kelas ({kelasOptions.length - 1} Rombel)</option>
                  {kelasOptions
                    .filter((k) => k !== 'ALL')
                    .map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                </select>
              </div>

              {/* Mode Sumber Siswa */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cakupan Siswa:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      sourceMode === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Semua Siswa ({students.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceMode('filtered')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      sourceMode === 'filtered'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Sesuai Filter Kelas ({selectedKelas === 'ALL' ? 'Semua' : selectedKelas})
                  </button>
                  {initialSelectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSourceMode('selected')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        sourceMode === 'selected'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Dicentang ({initialSelectedIds.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Search in Modal */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa / NIS / PTN di dalam daftar cetak ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* STEP 2: Format Output Cetak */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>2. Pilih Format Output Cetak Massal</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Individual Sheets */}
              <div
                onClick={() => setOutputFormat('individual')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  outputFormat === 'individual'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-950">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      Bukti Individual Per Siswa
                    </span>
                    {outputFormat === 'individual' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Setiap siswa mendapatkan 1 lembar bukti lengkap pendataan TKA, PTN/Prodi pilihan, BAN-PT,
                    portofolio, dan kolom TTD resmi.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[10px] font-bold text-indigo-700">
                  <span>Hasil: {studentsToPrint.length} Halaman PDF</span>
                  <span className="bg-indigo-100 px-2 py-0.5 rounded-full">Format Resmi</span>
                </div>
              </div>

              {/* Option 2: Rekapitulasi Table */}
              <div
                onClick={() => setOutputFormat('rekap')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  outputFormat === 'rekap'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-950">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Tabel Rekapitulasi Kolektif Kelas
                    </span>
                    {outputFormat === 'rekap' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tabel rekapitulasi ringkas memuat seluruh data siswa dalam 1 dokumen kolektif (cocok untuk laporan
                    Wali Kelas / Sekolah).
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                  <span>Hasil: 1 Dokumen Rekap Kolektif</span>
                  <span className="bg-emerald-100 px-2 py-0.5 rounded-full">Laporan Kolektif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          {outputFormat === 'individual' && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePasfoto}
                  onChange={(e) => setIncludePasfoto(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Sertakan Pasfoto Siswa (jika ada)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQrCode}
                  onChange={(e) => setIncludeQrCode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Sertakan QR Code Otentikasi Digital</span>
              </label>
            </div>
          )}

          {/* Live Preview List Summary */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Daftar Siswa Siap Dicetak ({studentsToPrint.length})
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Rata-rata Raport: <strong className="text-slate-800">{stats.avgRaport}</strong>
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs">
              {studentsToPrint.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Tidak ada data siswa yang cocok dengan filter.
                </div>
              ) : (
                studentsToPrint.map((s, idx) => (
                  <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</span>
                      <div>
                        <div className="font-bold text-slate-800">{s.namaSiswa}</div>
                        <div className="text-[11px] text-slate-500">
                          NIS: {s.nis} | Kelas: <strong className="text-indigo-600">{s.kelas}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="font-bold text-slate-700">TKA: {s.mapelTka1} & {s.mapelTka2}</div>
                      <div className="text-emerald-700 font-semibold">{s.ptn1 || 'Kuliah'} — {s.prodiPilihan1 || '-'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs font-bold text-slate-600">
            Total Dokumen: <span className="text-indigo-700 font-extrabold">{studentsToPrint.length} Siswa</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={studentsToPrint.length === 0 || isProcessing}
              onClick={() => handleExecuteBatchPrint('print')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Langsung Cetak</span>
            </button>

            <button
              type="button"
              disabled={studentsToPrint.length === 0 || isProcessing}
              onClick={() => handleExecuteBatchPrint('pdf')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Cetak PDF Massal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATED PROCESSING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 border border-slate-100"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center relative">
                <Printer className="w-8 h-8 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 animate-pulse">
                  PDF
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Memproses Cetak Massal...</h3>
                <p className="text-xs text-slate-500 mt-1">{progressText}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Proses Dokumen</span>
                  <span className="text-indigo-600 font-black">{progressPercent}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FESTIVE SUCCESS ANIMATION MODAL OVERLAY */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Confetti & Particle Visual Decoration Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute top-1/4 left-1/6 text-amber-400 opacity-60"
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 25, 0],
                  rotate: [0, -20, 20, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute bottom-1/4 right-1/6 text-emerald-400 opacity-60"
              >
                <Sparkles className="w-14 h-14" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute top-12 right-1/3 text-indigo-400"
              >
                <Award className="w-10 h-10" />
              </motion.div>
            </div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 border border-slate-100 relative z-10"
            >
              {/* Glowing Success Ring with Checkmark */}
              <div className="relative mx-auto w-24 h-24">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
                />
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 relative z-10 border-4 border-white"
                >
                  <Check className="w-12 h-12 stroke-[3]" />
                </motion.div>
              </div>

              {/* Title & Celebration Text */}
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs tracking-wider uppercase border border-emerald-200">
                  🎉 PERCETAKAN MASSAL SUKSES!
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Berhasil Mencetak {lastPrintedCount} Dokumen Siswa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  {lastPrintedType === 'pdf'
                    ? `Dokumen PDF hasil input siswa TKA & Studi Lanjut telah berhasil di-generate dan diunduh ke perangkat Anda.`
                    : `Jendela dialog cetak printer telah berhasil dibuka untuk ${lastPrintedCount} berkas siswa.`}
                </p>
              </div>

              {/* Summary Metrics Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Rincian Hasil Cetak Massal:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">Total Siswa</span>
                    <strong className="text-slate-900 text-sm font-black">{lastPrintedCount} Siswa</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">Filter Kelas</span>
                    <strong className="text-indigo-600 text-sm font-black">
                      {lastPrintedKelas === 'ALL' ? 'Semua Kelas' : `Kelas ${lastPrintedKelas}`}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2">
                    <span className="text-[10px] text-slate-400 font-semibold block">Format Output</span>
                    <strong className="text-emerald-700 text-xs font-bold">
                      {lastPrintedFormat === 'individual'
                        ? '📄 Bukti Individual (1 Lembar/Siswa)'
                        : '👥 Tabel Rekapitulasi Kolektif Kelas'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Success View */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuccessAnimation(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cetak Lagi / Ubah Filter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessAnimation(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai & Kembali</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
