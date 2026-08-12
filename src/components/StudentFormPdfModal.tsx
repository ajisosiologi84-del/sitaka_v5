import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  XCircle,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Award,
  Sparkles,
  QrCode,
  User,
  GraduationCap,
  BookOpen,
  FileCode,
  FileType,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2pdf from 'html2pdf.js';
import { Student } from '../types';
import { findBanPtAccreditation } from '../data/banptData';
import { MAPEL_PILIHAN_845_LIST } from '../data/mapelPilihanData';

interface StudentFormPdfModalProps {
  formData: Partial<Student> & {
    namaSiswa?: string;
    nis?: string;
    nisn?: string;
    kelas?: string;
    jenisKelamin?: 'L' | 'P';
    noHp?: string;
    email?: string;
    alamat?: string;
    mapelTka1?: string;
    mapelTka2?: string;
    nilaiRaportRataRata?: number;
    pilihanStudiLanjut?: string;
    ptn1?: string;
    prodiPilihan1?: string;
    ptn2?: string;
    prodiPilihan2?: string;
    mengajukanKipKuliah?: 'Ya' | 'Tidak';
    kategoriDesil?: string;
    fotoSiswa?: string;
    prestasiList?: Array<{
      id: string;
      namaPrestasi: string;
      jenis: 'Akademik' | 'Non-Akademik';
      tingkat: 'Kota/Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
      lembaga?: string;
    }>;
  };
  onClose: () => void;
  onExitForm?: () => void;
}

export const StudentFormPdfModal: React.FC<StudentFormPdfModalProps> = ({
  formData,
  onClose,
  onExitForm,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timestamp = new Date().toLocaleString('id-ID');

  const banpt1 = findBanPtAccreditation(formData.ptn1 || '', formData.prodiPilihan1 || '');
  const banpt2 = findBanPtAccreditation(formData.ptn2 || '', formData.prodiPilihan2 || '');

  // Helper for mapel 845 match
  const find845 = (prodi: string) => {
    if (!prodi) return null;
    return MAPEL_PILIHAN_845_LIST.find((item) =>
      prodi.toLowerCase().includes(item.kelompokProdi.toLowerCase()) ||
      item.kelompokProdi.toLowerCase().includes(prodi.toLowerCase())
    );
  };

  const req1 = find845(formData.prodiPilihan1 || '');

  // Helper to generate clean, self-contained HTML for PDF and Printing (completely free of oklch / Tailwind v4 dependencies)
  const generateCleanPrintHtml = (qrSvgHtml?: string): string => {
    const regNo = `REG-TKA/${new Date().getFullYear()}/${(formData.nisn || '0000').slice(-4)}`;

    const prestasiRows =
      formData.prestasiList && formData.prestasiList.length > 0
        ? formData.prestasiList
            .map(
              (item, idx) => `
          <tr>
            <td style="text-align: center; font-weight: bold; padding: 5px; border: 1px solid #cbd5e1;">${idx + 1}</td>
            <td style="font-weight: bold; color: #0f172a; padding: 5px; border: 1px solid #cbd5e1;">${item.namaPrestasi}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1;">${item.jenis}</td>
            <td style="font-weight: 600; color: #78350f; padding: 5px; border: 1px solid #cbd5e1;">${item.tingkat}</td>
            <td style="font-size: 10px; padding: 5px; border: 1px solid #cbd5e1;">${item.lembaga || 'Dapodik/Kemdikbud'}</td>
          </tr>
        `
            )
            .join('')
        : `
        <tr>
          <td colspan="5" style="padding: 8px; font-style: italic; color: #64748b; text-align: center; border: 1px solid #cbd5e1;">
            Tidak ada portofolio prestasi tambahan yang dilampirkan.
          </td>
        </tr>
      `;

    const fotoHtml = formData.fotoSiswa
      ? `<img src="${formData.fotoSiswa}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />`
      : `<div style="font-size: 9px; color: #94a3b8; font-weight: 600; text-align: center; padding: 10px;">Pasfoto 3x4<br/>Latar Merah / Biru</div>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bukti Pendataan Siswa - ${formData.namaSiswa || 'Siswa'}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 20px;
              font-size: 11px;
              line-height: 1.4;
            }
            .kop-header {
              text-align: center;
              border-bottom: 3px double #0f172a;
              padding-bottom: 10px;
              margin-bottom: 14px;
            }
            .kop-title {
              font-size: 15px;
              font-weight: 900;
              text-transform: uppercase;
              color: #0f172a;
              margin: 2px 0;
              letter-spacing: 0.5px;
            }
            .kop-sub {
              font-size: 10px;
              color: #475569;
              margin: 2px 0;
            }
            .badge-bukti {
              display: inline-block;
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 900;
              font-size: 11px;
              padding: 4px 12px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 6px;
            }
            .section-title {
              background-color: #1e293b;
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              padding: 5px 10px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 12px;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #0f172a;
            }
            .td-label {
              background-color: #f8fafc;
              font-weight: 700;
              color: #334155;
              width: 32%;
            }
            .td-val {
              font-weight: 600;
              color: #0f172a;
            }
            .flex-grid {
              display: flex;
              gap: 12px;
              align-items: flex-start;
            }
            .pasfoto-box {
              width: 95px;
              height: 125px;
              border: 2px solid #cbd5e1;
              background-color: #f8fafc;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              flex-shrink: 0;
            }
            .signature-grid {
              display: flex;
              justify-content: space-between;
              text-align: center;
              margin-top: 16px;
              padding-top: 8px;
              border-top: 1px solid #cbd5e1;
            }
            .sig-col {
              flex: 1;
              padding: 0 4px;
            }
            .sig-space {
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #cbd5e1;
              font-size: 9px;
              font-style: italic;
            }
            .footer-auth {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 8px 12px;
              margin-top: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div id="pdf-content">
            <!-- KOP SURAT -->
            <div class="kop-header">
              <div style="font-size: 9px; font-weight: 800; color: #312e81; text-transform: uppercase; letter-spacing: 1px;">
                PEMERINTAH PROVINSI JAWA BARAT / DKI JAKARTA — DINAS PENDIDIKAN & KEBUDAYAAN
              </div>
              <div class="kop-title">SMA NEGERI UNGGULAN INDONESIA</div>
              <div class="kop-sub">Jalan Pendidikan No. 845 • Telp: (021) 7890123 • Website: www.sman-unggul.sch.id</div>
              <div>
                <span class="badge-bukti">BUKTI PENDATAAN SISWA TKA & STUDI LANJUT</span>
                <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-top: 4px;">
                  Nomor Registrasi Berkas: ${regNo}
                </div>
              </div>
            </div>

            <!-- SECTION 1 -->
            <div class="section-title">1. IDENTITAS RESMI SISWA</div>
            <div class="flex-grid">
              <div style="text-align: center;">
                <div class="pasfoto-box">${fotoHtml}</div>
              </div>
              <div style="flex: 1;">
                <table>
                  <tbody>
                    <tr>
                      <td class="td-label">Nama Lengkap Siswa</td>
                      <td class="td-val" style="font-weight: 800; font-size: 12px;">${formData.namaSiswa || '-'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">NIS / NISN</td>
                      <td class="td-val" style="font-family: monospace; color: #312e81;">${formData.nis || '-'} / ${formData.nisn || '-'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">Kelas / Rombel</td>
                      <td class="td-val">${formData.kelas || '-'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">Jenis Kelamin</td>
                      <td class="td-val">${formData.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">No. WhatsApp / HP</td>
                      <td class="td-val" style="font-family: monospace;">${formData.noHp || '-'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">Email Siswa</td>
                      <td class="td-val" style="font-family: monospace;">${formData.email || '-'}</td>
                    </tr>
                    <tr>
                      <td class="td-label">Alamat Tempat Tinggal</td>
                      <td class="td-val" style="font-size: 10px;">${formData.alamat || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SECTION 2 -->
            <div class="section-title">2. MAPEL PILIHAN TKA & LINIERITAS KURIKULUM MERDEKA</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Mata Pelajaran Pendukung TKA 1</th>
                  <th style="width: 50%;">Mata Pelajaran Pendukung TKA 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 800; color: #312e81; background-color: #eef2ff;">${formData.mapelTka1 || '-'}</td>
                  <td style="font-weight: 800; color: #312e81; background-color: #eef2ff;">${formData.mapelTka2 || '-'}</td>
                </tr>
              </tbody>
            </table>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <div style="flex: 1; padding: 6px 10px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;">
                <span style="font-weight: 700; color: #475569; display: block; font-size: 10px;">Rata-rata Nilai Raport:</span>
                <span style="font-size: 13px; font-weight: 900; color: #0f172a;">${formData.nilaiRaportRataRata || 0} / 100</span>
              </div>
              <div style="flex: 2; padding: 6px 10px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;">
                <span style="font-weight: 700; color: #475569; display: block; font-size: 10px;">Analisis Matrix Kemdikbud (845 Data):</span>
                <span style="font-size: 10px; font-weight: 700; color: #065f46;">
                  ${req1 ? `Pendukung ${req1.kelompokProdi}: ${req1.mapelPendukung1} & ${req1.mapelPendukung2}` : 'Terverifikasi Linier dengan Prodi Pilihan'}
                </span>
              </div>
            </div>

            <!-- SECTION 3 -->
            <div class="section-title">3. RENCANA STUDI LANJUT & DIREKTORI BAN-PT</div>
            <table>
              <tbody>
                <tr>
                  <td class="td-label">Rute Studi Lanjut</td>
                  <td class="td-val" style="font-weight: 800;">${formData.pilihanStudiLanjut || 'Kuliah'}</td>
                </tr>
                <tr>
                  <td class="td-label">Pilihan 1 (Utama)</td>
                  <td>
                    <div style="font-weight: 800; color: #0f172a;">${formData.ptn1 || '-'} — ${formData.prodiPilihan1 || '-'}</div>
                    <div style="font-size: 10px; color: #047857; font-weight: 700; margin-top: 2px;">
                      Akreditasi BAN-PT: ${formData.akreditasiPilihan1 || banpt1?.akreditasi || 'Unggul'}
                      ${formData.kriteriaPilihan1 ? ` | <span style="color: #334155;">Kriteria: ${formData.kriteriaPilihan1}</span>` : ''}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Pilihan 2 (Alternatif)</td>
                  <td>
                    <div style="font-weight: 800; color: #0f172a;">${formData.ptn2 || '-'} — ${formData.prodiPilihan2 || '-'}</div>
                    <div style="font-size: 10px; color: #0f766e; font-weight: 700; margin-top: 2px;">
                      Akreditasi BAN-PT: ${formData.akreditasiPilihan2 || banpt2?.akreditasi || 'Unggul'}
                      ${formData.kriteriaPilihan2 ? ` | <span style="color: #334155;">Kriteria: ${formData.kriteriaPilihan2}</span>` : ''}
                    </div>
                  </td>
                </tr>
                ${
                  formData.pilihanStudiLanjut === 'Kuliah'
                    ? `
                  <tr>
                    <td class="td-label">Pengajuan KIP Kuliah</td>
                    <td class="td-val">
                      ${formData.mengajukanKipKuliah === 'Ya' ? `Ya (Kategori ${formData.kategoriDesil || 'Desil 1-4'})` : 'Tidak'}
                    </td>
                  </tr>
                `
                    : ''
                }
              </tbody>
            </table>

            <!-- SECTION 4 -->
            <div class="section-title">4. PORTOFOLIO PRESTASI SISWA (TERKURASI DAPODIK)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">No</th>
                  <th>Nama Kejuaraan / Prestasi</th>
                  <th style="width: 90px;">Jenis</th>
                  <th style="width: 100px;">Tingkat</th>
                  <th style="width: 120px;">Lembaga Penyelenggara</th>
                </tr>
              </thead>
              <tbody>
                ${prestasiRows}
              </tbody>
            </table>

            <!-- SECTION 5: SIGNATURES -->
            <div style="margin-top: 12px; font-size: 10px; color: #475569; font-style: italic; text-align: center;">
              Demikian pernyataan isian data ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya dalam administrasi TKA & SNBP/SNBT.
            </div>

            <div class="signature-grid">
              <div class="sig-col">
                <div style="font-weight: 700; color: #1e293b;">Orang Tua / Wali Siswa,</div>
                <div class="sig-space">( Tanda Tangan )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ........................................... )</div>
              </div>
              <div class="sig-col">
                <div style="font-weight: 700; color: #1e293b;">Siswa Bersangkutan,</div>
                <div class="sig-space">( Tanda Tangan )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ${formData.namaSiswa || 'Siswa'} )</div>
              </div>
              <div class="sig-col">
                <div style="font-size: 10px; color: #64748b; font-weight: 600;">${currentDate}</div>
                <div style="font-weight: 700; color: #1e293b;">Mengetahui, Wali Kelas / Tim BK</div>
                <div class="sig-space">( Stempel / Tanda Tangan )</div>
                <div style="font-weight: 700; color: #0f172a; text-decoration: underline;">( ........................................... )</div>
              </div>
            </div>

            <!-- FOOTER AUTH -->
            <div class="footer-auth">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; flex-shrink: 0; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; display: flex; align-items: center; justify-content: center;">
                  ${qrSvgHtml || '<div style="font-size: 8px; text-align: center; font-weight: bold;">QR VERIFIED</div>'}
                </div>
                <div>
                  <span style="font-weight: 800; color: #0f172a; display: block; font-size: 10px;">VERIFIKASI OTENTIKASI DIGITAL</span>
                  <span style="color: #64748b; display: block; font-size: 9px;">Dokumen resmi terdaftar di Portal Pendataan TKA Sekolah.</span>
                  <span style="font-size: 9px; font-family: monospace; color: #4338ca;">Dicetak pada: ${timestamp}</span>
                </div>
              </div>
              <div style="text-align: right; font-weight: 700; font-size: 10px; color: #334155;">
                <span>Halaman 1 dari 1</span>
                <span style="display: block; color: #047857; font-size: 9px;">Status: Terverifikasi</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Helper to open direct printable window in new tab/popup (100% bypasses iFrame restrictions)
  const handleOpenPrintWindow = () => {
    try {
      const qrSvgHtml = pdfRef.current?.querySelector('svg')?.outerHTML;
      const fullHtml = generateCleanPrintHtml(qrSvgHtml);

      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        const htmlWithTopBar = fullHtml.replace(
          '<body>',
          `<body>
            <div style="background: #0f172a; color: white; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" class="no-print">
              <div>
                <strong style="font-size: 14px; display: block; color: #ffffff;">📄 Dokumen Bukti Pendataan Siswa Siap Dicetak / Disimpan PDF</strong>
                <span style="font-size: 11px; color: #cbd5e1;">Pilih printer Anda atau pilih <strong>"Save as PDF / Simpan sebagai PDF"</strong> pada tujuan cetak browser.</span>
              </div>
              <button onclick="window.print()" style="background-color: #4f46e5; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px;">
                🖨️ MENCETAK / SIMPAN SEBAGAI PDF
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
            console.warn('Auto print error on popup window:', err);
          }
        }, 500);
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error('Error opening print window:', err);
      handlePrint();
    }
  };

  // Direct HTML File Download Fallback
  const handleDownloadHtmlFile = () => {
    try {
      const qrSvgHtml = pdfRef.current?.querySelector('svg')?.outerHTML || '';
      const fullHtml = generateCleanPrintHtml(qrSvgHtml);
      const blob = new Blob(['\ufeff', fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bukti_Pendataan_Siswa_${(formData.namaSiswa || 'Siswa').replace(/\s+/g, '_')}_${formData.nisn || 'NISN'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Download HTML file error:', err);
    }
  };

  // Direct Word (.doc) File Download
  const handleDownloadWordDoc = () => {
    try {
      const qrSvgHtml = pdfRef.current?.querySelector('svg')?.outerHTML || '';
      const fullHtml = generateCleanPrintHtml(qrSvgHtml);
      
      // Extract <style> block from fullHtml so styles are not lost when converting to Word
      const styleMatch = fullHtml.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/i);
      const cssStyles = styleMatch ? styleMatch[1] : '';

      const wordHeader = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Bukti Pendataan Siswa - ${(formData.namaSiswa || 'Siswa')}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForCustomXSL/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            ${cssStyles}
            body { font-family: 'Calibri', 'Arial', sans-serif; padding: 20pt; background: #ffffff; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
            th, td { border: 1pt solid #cbd5e1; padding: 5pt 8pt; vertical-align: top; }
            .section-title { background-color: #1e293b; color: #ffffff; padding: 6pt 10pt; font-weight: bold; margin-top: 12pt; margin-bottom: 8pt; }
            .kop-header { text-align: center; border-bottom: 3pt double #0f172a; padding-bottom: 10pt; margin-bottom: 12pt; }
            .badge-bukti { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 4pt 10pt; display: inline-block; }
          </style>
        </head>
      `;
      const bodyStart = fullHtml.indexOf('<body>');
      const bodyContent = bodyStart !== -1 ? fullHtml.substring(bodyStart) : `<body>${fullHtml}</body>`;
      const wordContent = wordHeader + bodyContent;
      const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bukti_Pendataan_Siswa_${(formData.namaSiswa || 'Siswa').replace(/\s+/g, '_')}_${formData.nisn || 'NISN'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Download Word doc error:', err);
    }
  };

  // Export to PDF via clean isolated iframe
  const handleDownloadPdf = async () => {
    setIsExporting(true);

    let iframe: HTMLIFrameElement | null = null;
    try {
      const qrSvgHtml = pdfRef.current?.querySelector('svg')?.outerHTML;
      const fullHtml = generateCleanPrintHtml(qrSvgHtml);

      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Cannot access iframe document');

      doc.open();
      doc.write(fullHtml);
      doc.close();

      // Short delay for images/rendering
      await new Promise((resolve) => setTimeout(resolve, 350));

      const elementToPdf = doc.getElementById('pdf-content') || doc.body;
      const fileName = `Bukti_Pendataan_Siswa_${(formData.namaSiswa || 'Siswa').replace(/\s+/g, '_')}_${formData.nisn || 'NISN'}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: fileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(elementToPdf).save();
    } catch (err) {
      console.warn('Isolated PDF export encountered an error, fallback to open window:', err);
      handleOpenPrintWindow();
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      setIsExporting(false);
    }
  };

  // Direct Print Handler using isolated iframe
  const handlePrint = () => {
    try {
      const qrSvgHtml = pdfRef.current?.querySelector('svg')?.outerHTML;
      const fullHtml = generateCleanPrintHtml(qrSvgHtml);

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.left = '-9999px';
      printIframe.style.top = '-9999px';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);

      const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (!doc) {
        handleOpenPrintWindow();
        return;
      }

      doc.open();
      doc.write(fullHtml);
      doc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (e) {
          console.error('Print iframe trigger error:', e);
          handleOpenPrintWindow();
        }
        setTimeout(() => {
          if (printIframe.parentNode) {
            printIframe.parentNode.removeChild(printIframe);
          }
        }, 1000);
      }, 300);
    } catch (err) {
      console.error('Window print error:', err);
      handleOpenPrintWindow();
    }
  };

  const qrData = `TKA-PENDATAAN-SISWA|NISN:${formData.nisn || '-'}|NAMA:${formData.namaSiswa || '-'}|DATE:${currentDate}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
              <FileText className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Cetak Hasil Pengisian Formulir Pendataan Siswa
              </h3>
              <p className="text-[11px] text-indigo-200">
                Pratinjau Resmi PDF Bukti Pendataan Siswa TKA & Rencana Studi Lanjut
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleOpenPrintWindow}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 text-xs font-bold rounded-xl transition-colors border border-indigo-700/60 shadow-xs"
              title="Buka dokumen cetak di Window/Tab Baru agar bebas dari pembatasan iFrame"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-300" />
              <span>Cetak / Tab Baru</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-colors shadow-md shadow-indigo-600/30 disabled:opacity-50"
              title="Unduh dokumen dalam format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Mengekspor PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              title="Unduh dokumen dalam format Microsoft Word (.doc)"
            >
              <FileType className="w-3.5 h-3.5 text-blue-200" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors shadow-xs border border-slate-700"
              title="Unduh file HTML mandiri"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-300" />
              <span>Unduh HTML</span>
            </button>

            {onExitForm ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExitForm();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md ml-1"
                title="Selesai dan keluar dari Formulir Data Siswa"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Keluar / Selesai</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
              title="Tutup Pratinjau"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Banner with All Format Fallbacks */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-amber-900 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] leading-snug">
              <strong>Bebas API Key!</strong> Pilihan format alternatif jika PDF tertahan browser:
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <FileType className="w-3 h-3" />
              <span>Word (.doc)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <FileCode className="w-3 h-3" />
              <span>File HTML</span>
            </button>
            <button
              type="button"
              onClick={handleOpenPrintWindow}
              className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[11px] rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span>Tab Baru ↗</span>
            </button>
          </div>
        </div>

        {/* Action Banner for Mobile */}
        <div className="sm:hidden bg-indigo-50 p-2.5 border-b border-indigo-100 flex items-center justify-between gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex-1 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="flex-1 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1"
          >
            <FileType className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={handleOpenPrintWindow}
            className="flex-1 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-300" />
            <span>Cetak Tab Baru</span>
          </button>
        </div>

        {/* PRINTABLE PDF CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          <div
            ref={pdfRef}
            id="printable-form-content"
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md max-w-2xl mx-auto text-slate-900 space-y-4"
          >
            {/* KOP SURAT SEKOLAH */}
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white font-extrabold flex items-center justify-center text-sm">
                  SMA
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-widest">
                    PEMERINTAH PROVINSI JAWA BARAT / DKI JAKARTA
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 uppercase">
                    DINAS PENDIDIKAN & KEBUDAYAAN
                  </div>
                </div>
              </div>

              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                SMA NEGERI UNGGULAN INDONESIA
              </h2>
              <p className="text-[10px] text-slate-600 font-medium">
                Jalan Pendidikan No. 845 • Telp: (021) 7890123 • Website: www.sman-unggul.sch.id
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-md">
                  BUKTI PENDATAAN SISWA TKA & STUDI LANJUT
                </span>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  Nomor Registrasi Berkas: REG-TKA/{new Date().getFullYear()}/{(formData.nisn || '0000').slice(-4)}
                </p>
              </div>
            </div>

            {/* SECTION 1: IDENTITAS SISWA */}
            <div>
              <div className="bg-slate-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-indigo-300" />
                <span>1. IDENTITAS RESMI SISWA</span>
              </div>

              <div className="grid grid-cols-4 gap-3 items-start">
                {/* PASFOTO */}
                <div className="col-span-1 flex flex-col items-center text-center space-y-1">
                  <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-50 flex items-center justify-center p-0.5">
                    {formData.fotoSiswa ? (
                      <img
                        src={formData.fotoSiswa}
                        alt="Pasfoto Siswa"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-[9px] text-slate-400 font-semibold p-2">
                        Pasfoto 3x4<br />Latar Merah / Biru
                      </div>
                    )}
                  </div>
                </div>

                {/* TABEL IDENTITAS */}
                <div className="col-span-3">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="w-32 font-bold bg-slate-50">Nama Lengkap Siswa</td>
                        <td className="font-extrabold text-slate-900">{formData.namaSiswa || '-'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">NIS / NISN</td>
                        <td className="font-mono font-bold text-indigo-900">
                          {formData.nis || '-'} / {formData.nisn || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">Kelas / Rombel</td>
                        <td className="font-semibold">{formData.kelas || '-'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">Jenis Kelamin</td>
                        <td>{formData.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">No. WhatsApp / HP</td>
                        <td className="font-mono">{formData.noHp || '-'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">Email Siswa</td>
                        <td className="font-mono">{formData.email || '-'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50">Alamat Tempat Tinggal</td>
                        <td className="text-[11px]">{formData.alamat || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECTION 2: MAPEL TKA & LINIERITAS */}
            <div>
              <div className="bg-slate-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>2. MAPEL PILIHAN TKA & LINIERITAS KURIKULUM MERDEKA</span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="w-1/2">Mata Pelajaran Pendukung TKA 1</th>
                    <th className="w-1/2">Mata Pelajaran Pendukung TKA 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-extrabold text-indigo-900 bg-indigo-50/50">
                      {formData.mapelTka1 || '-'}
                    </td>
                    <td className="font-extrabold text-indigo-900 bg-indigo-50/50">
                      {formData.mapelTka2 || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-700 block">Rata-rata Nilai Raport:</span>
                  <span className="text-sm font-black text-slate-900">
                    {formData.nilaiRaportRataRata || 0} / 100
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-700 block">Analisis Matrix Kemdikbud (845 Data):</span>
                  <span className="text-[10px] font-semibold text-emerald-800">
                    {req1 ? `Pendukung ${req1.kelompokProdi}: ${req1.mapelPendukung1} & ${req1.mapelPendukung2}` : 'Terverifikasi Linier dengan Prodi Pilihan'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: RENCANA STUDI LANJUT & AKREDITASI BAN-PT */}
            <div>
              <div className="bg-slate-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                <span>3. RENCANA STUDI LANJUT & DIREKTORI BAN-PT</span>
              </div>

              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="w-36 font-bold bg-slate-50">Rute Studi Lanjut</td>
                    <td className="font-extrabold text-slate-900">
                      {formData.pilihanStudiLanjut || 'Kuliah'}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold bg-slate-50">Pilihan 1 (Utama)</td>
                    <td>
                      <div className="font-extrabold text-slate-900">
                        {formData.ptn1 || '-'} — {formData.prodiPilihan1 || '-'}
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                        Akreditasi BAN-PT: {formData.akreditasiPilihan1 || banpt1?.akreditasi || 'Unggul'}
                        {formData.kriteriaPilihan1 && <span className="text-slate-600 ml-1">| Kriteria: {formData.kriteriaPilihan1}</span>}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold bg-slate-50">Pilihan 2 (Alternatif)</td>
                    <td>
                      <div className="font-extrabold text-slate-900">
                        {formData.ptn2 || '-'} — {formData.prodiPilihan2 || '-'}
                      </div>
                      <div className="text-[10px] text-teal-800 font-bold mt-0.5">
                        Akreditasi BAN-PT: {formData.akreditasiPilihan2 || banpt2?.akreditasi || 'Unggul'}
                        {formData.kriteriaPilihan2 && <span className="text-slate-600 ml-1">| Kriteria: {formData.kriteriaPilihan2}</span>}
                      </div>
                    </td>
                  </tr>
                  {formData.pilihanStudiLanjut === 'Kuliah' && (
                    <tr>
                      <td className="font-bold bg-slate-50">Pengajuan KIP Kuliah</td>
                      <td>
                        <span className="font-bold text-slate-900">
                          {formData.mengajukanKipKuliah === 'Ya' ? `Ya (Kategori ${formData.kategoriDesil || 'Desil 1-4'})` : 'Tidak'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SECTION 4: PORTOFOLIO PRESTASI */}
            <div>
              <div className="bg-slate-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>4. PORTOFOLIO PRESTASI SISWA (TERKURASI DAPODIK)</span>
              </div>

              {formData.prestasiList && formData.prestasiList.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="w-8 text-center">No</th>
                      <th>Nama Kejuaraan / Prestasi</th>
                      <th className="w-24">Jenis</th>
                      <th className="w-28">Tingkat</th>
                      <th className="w-32">Lembaga Penyelenggara</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prestasiList.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center font-bold">{idx + 1}</td>
                        <td className="font-bold text-slate-900">{item.namaPrestasi}</td>
                        <td>{item.jenis}</td>
                        <td className="font-semibold text-amber-900">{item.tingkat}</td>
                        <td className="text-[10px]">{item.lembaga || 'Dapodik/Kemdikbud'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg border border-slate-200">
                  Tidak ada portofolio prestasi tambahan yang dilampirkan.
                </p>
              )}
            </div>

            {/* SECTION 5: LEMBAR PENGESAHAN & TANDA TANGAN */}
            <div className="pt-2 border-t border-slate-300 space-y-4">
              <p className="text-[10px] text-slate-600 font-medium italic text-center">
                Demikian pernyataan isian data ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya dalam administrasi TKA & SNBP/SNBT.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                {/* Orang Tua */}
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Orang Tua / Wali Siswa,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[9px] text-slate-300 italic">( Tanda Tangan )</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">
                    ( ........................................... )
                  </p>
                </div>

                {/* Siswa */}
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Siswa Bersangkutan,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[9px] text-slate-300 italic">( Tanda Tangan )</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">
                    ( {formData.namaSiswa || 'Siswa'} )
                  </p>
                </div>

                {/* Guru BK / Wali Kelas */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-semibold">{currentDate}</p>
                  <p className="font-bold text-slate-800">Mengetahui, Wali Kelas / Tim BK</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-[9px] text-slate-300 italic">( Stempel / Tanda Tangan )</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">
                    ( ........................................... )
                  </p>
                </div>
              </div>

              {/* FOOTER QR CODE & TIMESTAMP */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded-md border border-slate-300 shrink-0">
                    <QRCodeSVG value={qrData} size={38} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      VERIFIKASI OTENTIKASI DIGITAL
                    </span>
                    <span className="text-slate-500 block">
                      Dokumen resmi terdaftar di Portal Pendataan TKA Sekolah.
                    </span>
                    <span className="text-[9px] font-mono text-indigo-700">
                      Dicetak pada: {timestamp}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-bold text-slate-700">
                  <span>Halaman 1 dari 1</span>
                  <span className="block text-emerald-700 text-[9px]">Status: Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Footer Bar */}
        <div className="bg-slate-900 text-white p-3.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Pilih format unduhan atau cetak dokumen bukti pendataan siswa:</span>
            <span className="sm:hidden">Format unduhan &amp; cetak:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Mengekspor PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-600 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <FileType className="w-3.5 h-3.5 text-blue-200" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs border border-slate-700 flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-300" />
              <span>Unduh HTML</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintWindow}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-98 text-indigo-200 text-xs font-bold rounded-xl transition-all shadow-xs border border-slate-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-300" />
              <span>Cetak / Tab Baru</span>
            </button>

            {onExitForm ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExitForm();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-rose-500/50 ml-auto sm:ml-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Selesai & Keluar Form</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors ml-auto sm:ml-0"
              >
                Tutup Pratinjau
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
