import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  Phone,
  FileText,
  Copy,
  Check,
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  Info,
  Camera,
  Image as ImageIcon,
  Printer
} from 'lucide-react';
import { Student } from '../types';
import { StudentFormPdfModal } from './StudentFormPdfModal';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  if (!student) return null;

  const handleCopySummary = () => {
    let prestasiSummary = 'Tidak Ada';
    if (student.prestasiList && student.prestasiList.length > 0) {
      prestasiSummary = student.prestasiList
        .map(
          (p, i) =>
            `  ${i + 1}. ${p.namaPrestasi} (${p.jenis} - ${p.tingkat} | ${p.lembaga || 'Dapodik'})`
        )
        .join('\n');
    }

    const text = `
PORTAL AKUN SISWA - DATA ADMINISTRASI SISWA TKA & STUDI LANJUT
----------------------------------------------------------------
Nama Siswa          : ${student.namaSiswa}
NIS                 : ${student.nis}
NISN                : ${student.nisn}
Kelas               : ${student.kelas}
JK                  : ${student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
No. HP              : ${student.noHp || '-'}
Status Pasfoto      : ${student.fotoSiswa ? 'Terunggah (Resmi)' : 'Belum Unggah Foto'}

PILIHAN TKA:
- Mapel TKA 1       : ${student.mapelTka1}
- Mapel TKA 2       : ${student.mapelTka2}

PILIHAN STUDI LANJUT:
- Rute Studi Lanjut : ${student.pilihanStudiLanjut || 'Kuliah'}
- Universitas 1     : ${student.ptn1 || '-'}
- Program Studi 1   : ${student.prodiPilihan1 || '-'}
- Universitas 2     : ${student.ptn2 || '-'}
- Program Studi 2   : ${student.prodiPilihan2 || '-'}${student.pilihanStudiLanjut === 'Kuliah' && student.mengajukanKipKuliah === 'Ya' ? `\n- Mengajukan KIP Kuliah: Ya\n- Kategori Desil    : ${student.kategoriDesil || '-'}\n- Cek Bansos        : https://cekbansos.kemensos.go.id` : ''}

DATA PRESTASI SISWA (TERKURASI DAPODIK):
${prestasiSummary}

Diperbarui Tanggal  : ${student.updatedAt}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            {student.fotoSiswa ? (
              <img
                src={student.fotoSiswa}
                alt={student.namaSiswa}
                className="w-14 h-18 rounded-xl object-cover border-2 border-indigo-400 shadow-md shrink-0 bg-slate-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                {student.namaSiswa.charAt(0)}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-1">
                <User className="w-3 h-3" /> Akun Profil Siswa TKA
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {student.namaSiswa}
              </h3>
              <p className="text-xs text-indigo-300 font-mono">
                NIS: {student.nis} • NISN: {student.nisn}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Section Pasfoto Display Card */}
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0">
              {student.fotoSiswa ? (
                <div className="relative group">
                  <img
                    src={student.fotoSiswa}
                    alt={student.namaSiswa}
                    className="w-24 h-32 object-cover rounded-xl border-2 border-indigo-200 shadow-md bg-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md" title="Foto Terverifikasi">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-center p-2 text-slate-400 space-y-1">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-medium leading-tight">Belum Unggah Pasfoto</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" /> Pasfoto Resmi Peserta
                </span>
                {student.fotoSiswa ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Terverifikasi
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Belum Diunggah
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {student.fotoSiswa
                  ? 'Pasfoto resmi telah terunggah dan terverifikasi untuk pencetakan Kartu TKA serta kelengkapan pendaftaran SNBP / SNBT.'
                  : 'Siswa belum mengunggah pasfoto resmi 3x4 / 4x6 (latar merah/biru). Silakan klik "Edit Data" untuk mengunggah pasfoto.'}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Kelas / Rombel
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {student.kelas}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Jenis Kelamin
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                No. HP / WA
              </span>
              <span className="font-bold text-slate-800 text-xs font-mono">
                {student.noHp || '-'}
              </span>
            </div>
          </div>

          {/* 2. TKA Subjects */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-indigo-700">
              <BookOpen className="w-4 h-4" /> 2. Pilihan Mata Pelajaran TKA
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100">
                <span className="text-[10px] text-indigo-600 font-bold uppercase block">
                  Mapel TKA 1 (Utama)
                </span>
                <span className="font-bold text-indigo-950 text-xs">
                  {student.mapelTka1}
                </span>
              </div>

              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                <span className="text-[10px] text-purple-600 font-bold uppercase block">
                  Mapel TKA 2 (Pendamping)
                </span>
                <span className="font-bold text-purple-950 text-xs">
                  {student.mapelTka2}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Pilihan Studi Lanjut */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-700">
                <GraduationCap className="w-4 h-4" /> 3. Pilihan Studi Lanjut
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  student.pilihanStudiLanjut === 'AKADEMI'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : student.pilihanStudiLanjut === 'Bekerja'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Rute: {student.pilihanStudiLanjut || 'Kuliah'}
              </span>
            </div>

            {student.pilihanStudiLanjut === 'Kuliah' || !student.pilihanStudiLanjut ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pilihan 1 */}
                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">1</span>
                      Pilihan 1 (Utama)
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-200/80 text-emerald-800 font-bold rounded text-[9px]">
                      Prioritas 1
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Universitas:</span>
                    <span className="font-bold text-emerald-950 text-xs block">
                      {student.ptn1 || 'Perguruan Tinggi Pilihan 1'}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-emerald-200/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Program Studi:</span>
                      <span className="font-extrabold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">
                        BAN-PT: {student.akreditasiPilihan1 || 'Unggul'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 text-xs block">
                      {student.prodiPilihan1 || '-'}
                    </span>
                    {student.kriteriaPilihan1 && (
                      <div className="text-[10px] bg-white/80 p-1.5 rounded-lg border border-emerald-200/80 text-slate-700 mt-1">
                        <strong className="text-emerald-950 font-bold block mb-0.5">Kriteria & Pertimbangan:</strong>
                        <span>{student.kriteriaPilihan1}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pilihan 2 */}
                <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px]">2</span>
                      Pilihan 2 (Alternatif)
                    </span>
                    <span className="px-1.5 py-0.5 bg-teal-200/80 text-teal-800 font-bold rounded text-[9px]">
                      Prioritas 2
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Universitas:</span>
                    <span className="font-bold text-teal-950 text-xs block">
                      {student.ptn2 || 'Perguruan Tinggi Pilihan 2'}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-teal-200/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Program Studi:</span>
                      <span className="font-extrabold text-teal-800 bg-teal-100/90 px-1.5 py-0.5 rounded border border-teal-200">
                        BAN-PT: {student.akreditasiPilihan2 || 'Unggul'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 text-xs block">
                      {student.prodiPilihan2 || '-'}
                    </span>
                    {student.kriteriaPilihan2 && (
                      <div className="text-[10px] bg-white/80 p-1.5 rounded-lg border border-teal-200/80 text-slate-700 mt-1">
                        <strong className="text-teal-950 font-bold block mb-0.5">Kriteria & Pertimbangan:</strong>
                        <span>{student.kriteriaPilihan2}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* KIP Kuliah & Desil Info Display if applicable */}
                {student.mengajukanKipKuliah === 'Ya' && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-emerald-700" />
                        Pengajuan KIP Kuliah: <strong className="text-emerald-700">Ya</strong>
                      </span>
                      {student.kategoriDesil && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full">
                          {student.kategoriDesil}
                        </span>
                      )}
                    </div>
                    {student.kategoriDesil && (
                      <p className="text-[11px] text-emerald-900">
                        Kategori DTKS: <strong>{student.kategoriDesil}</strong>. Cek validasi di{' '}
                        <a
                          href="https://cekbansos.kemensos.go.id"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          cekbansos.kemensos.go.id
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                Siswa memilih rute lanjutan:{' '}
                <strong className="text-slate-900">
                  {student.pilihanStudiLanjut === 'AKADEMI'
                    ? 'a. AKADEMI (TNI / POLRI / Sekolah Kedinasan)'
                    : 'b. Bekerja / Wirausaha'}
                </strong>
              </div>
            )}
          </div>

          {/* 4. Data Prestasi Siswa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-700">
                <Award className="w-4 h-4 text-amber-600" /> 4. Data Prestasi Siswa
              </h4>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {student.prestasiList?.length || 0} Sertifikat
              </span>
            </div>

            {student.prestasiList && student.prestasiList.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {student.prestasiList.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs leading-snug">
                        {p.namaPrestasi}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold rounded text-[9px] shrink-0">
                        {p.tingkat}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-amber-100">
                      <span>Jenis: <strong className="text-slate-700">{p.jenis}</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {p.lembaga || 'Terkurasi Dapodik'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs italic">
                Belum ada data prestasi / sertifikat terdaftar untuk siswa ini.
              </div>
            )}
          </div>

          {/* Catatan Tambahan */}
          {student.catatan && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs">
              <span className="font-semibold text-slate-700">Catatan Khusus:</span>{' '}
              {student.catatan}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Salin Text
                </>
              )}
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-xl border border-amber-300 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-900" /> Cetak / Export PDF
            </button>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Edit Data
            </button>
          </div>
        </div>
      </div>

      {isPdfModalOpen && (
        <StudentFormPdfModal
          formData={student}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
};
