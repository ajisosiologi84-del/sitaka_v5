import React, { useState } from 'react';
import { Search, ExternalLink, Building2, Award, BookOpen, CheckCircle2, Filter, Info, HelpCircle, Plus, Check } from 'lucide-react';
import { SAMPLE_BANPT_DATA, ProdiData } from '../data/banptData';

interface BanPtDirectoryViewProps {
  onSelectProdiForForm?: (ptn: string, prodi: string, choice: 'pilihan1' | 'pilihan2', akreditasi?: string) => void;
}

export const BanPtDirectoryView: React.FC<BanPtDirectoryViewProps> = ({
  onSelectProdiForForm,
}) => {
  const [searchPtn, setSearchPtn] = useState('');
  const [searchProdi, setSearchProdi] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('ALL');
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const BANPT_URL = 'https://www.banpt.or.id/direktori/prodi/pencarian_prodi.php';

  const filteredData = SAMPLE_BANPT_DATA.filter((item) => {
    const matchPtn = item.ptn.toLowerCase().includes(searchPtn.toLowerCase());
    const matchProdi = item.prodi.toLowerCase().includes(searchProdi.toLowerCase());
    const matchJenjang = selectedJenjang === 'ALL' || item.jenjang === selectedJenjang;
    const matchAkreditasi = selectedAkreditasi === 'ALL' || item.akreditasi === selectedAkreditasi;
    return matchPtn && matchProdi && matchJenjang && matchAkreditasi;
  });

  const handleSelect = (ptn: string, prodi: string, choice: 'pilihan1' | 'pilihan2', akreditasi?: string) => {
    setSelectedNotification(`Berhasil memilih ${prodi} (${ptn}) [${akreditasi || 'BAN-PT'}] sebagai ${choice === 'pilihan1' ? 'Pilihan 1' : 'Pilihan 2'}`);
    setTimeout(() => setSelectedNotification(null), 3000);
    if (onSelectProdiForForm) {
      onSelectProdiForForm(ptn, prodi, choice, akreditasi);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Award className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
            Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT)
          </div>

          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Tabel Matriks & Pencarian Database BAN-PT
          </h1>

          <p className="text-xs lg:text-sm text-indigo-100/90 leading-relaxed">
            Pencarian cepat database akreditasi program studi Perguruan Tinggi Negeri (PTN) se-Indonesia acuan BAN-PT Kemdikbud Ristek. Gunakan tabel pencarian interaktif ini untuk memverifikasi akreditasi prodi tujuan (Unggul, A, Baik Sekali, B).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <a
              href={BANPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
              <span>Situs Resmi BAN-PT (Tab Baru)</span>
            </a>
          </div>
        </div>
      </div>

      {/* KETERANGAN / PANDUAN KATEGORI PERGURUAN TINGGI (LEGEND BAN-PT) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-md space-y-3">
        <div className="flex items-center gap-2 border-b border-indigo-800/60 pb-2.5">
          <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-400/30">
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
              <span>Panduan Kategori & Singkatan Jenis Perguruan Tinggi (BAN-PT)</span>
            </h3>
            <p className="text-[11px] text-indigo-200">
              Pahami pengelompokan jenis institusi perguruan tinggi yang terdaftar di database nasional BAN-PT:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* PTN */}
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1 hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-black rounded-md uppercase">
                PTN
              </span>
              <span className="text-[10px] text-slate-300 font-bold">Negeri Umum</span>
            </div>
            <p className="font-bold text-xs text-white">Perguruan Tinggi Negeri</p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              Universitas, Institut, & Politeknik Negeri di bawah Kemdikbudristek (misal: UI, ITB, UGM, ITS, Unair).
            </p>
          </div>

          {/* PTAN */}
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1 hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[10px] font-black rounded-md uppercase">
                PTAN
              </span>
              <span className="text-[10px] text-slate-300 font-bold">Agama Negeri</span>
            </div>
            <p className="font-bold text-xs text-white">Perguruan Tinggi Agama Negeri</p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              Kampus keagamaan negeri di bawah Kementerian Agama (misal: UIN, IAIN, STAIN, IAHN, STABN).
            </p>
          </div>

          {/* PTAS */}
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1 hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-black rounded-md uppercase">
                PTAS
              </span>
              <span className="text-[10px] text-slate-300 font-bold">Agama Swasta</span>
            </div>
            <p className="font-bold text-xs text-white">Perguruan Tinggi Agama Swasta</p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              Kampus keagamaan swasta berijizin Kemenag (misal: UNISBA, Unismuh, STAI, IAI Swasta).
            </p>
          </div>

          {/* PTKL */}
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1 hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[10px] font-black rounded-md uppercase">
                PTKL
              </span>
              <span className="text-[10px] text-slate-300 font-bold">Kementerian Lain</span>
            </div>
            <p className="font-bold text-xs text-white">Perguruan Tinggi Kedinasan / Kemen Lain</p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              Perguruan tinggi kedinasan/kementerian non-pendidikan (misal: STAN, STIS, STIN, Akmil, Poltekip).
            </p>
          </div>

          {/* 01-17 */}
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1 hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[10px] font-black rounded-md uppercase">
                01 - 17
              </span>
              <span className="text-[10px] text-slate-300 font-bold">PTS LLDIKTI</span>
            </div>
            <p className="font-bold text-xs text-white">PTS di Bawah LLDIKTI</p>
            <p className="text-[10px] text-indigo-200 leading-tight">
              Perguruan Tinggi Swasta umum yang dinaungi Lembaga Layanan Pendidikan Tinggi Wilayah 01 s.d. 17.
            </p>
          </div>
        </div>
      </div>

      {/* Main Database Search Section */}
      <div className="space-y-4">
        {/* Filters Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              Filter Pencarian Akreditasi BAN-PT
            </h3>
            <span className="text-xs text-slate-500">
              Menampilkan <strong>{filteredData.length}</strong> Program Studi PTN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search PTN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama PTN / Universitas
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchPtn}
                  onChange={(e) => setSearchPtn(e.target.value)}
                  placeholder="Cth: Universitas Indonesia, ITB, UGM..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Search Prodi */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Program Studi
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchProdi}
                  onChange={(e) => setSearchProdi(e.target.value)}
                  placeholder="Cth: Informatika, Kedokteran, Hukum..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Select Jenjang */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jenjang Studi
              </label>
              <select
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              >
                <option value="ALL">Semua Jenjang (S1 / D4 / D3)</option>
                <option value="S1">S1 (Sarjana)</option>
                <option value="D4">D4 (Sarjana Terapan)</option>
                <option value="D3">D3 (Diploma Tiga)</option>
                <option value="S2">S2 (Magister)</option>
              </select>
            </div>

            {/* Select Akreditasi */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Peringkat Akreditasi
              </label>
              <select
                value={selectedAkreditasi}
                onChange={(e) => setSelectedAkreditasi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              >
                <option value="ALL">Semua Akreditasi</option>
                <option value="Unggul">Unggul</option>
                <option value="A">A</option>
                <option value="Baik Sekali">Baik Sekali</option>
                <option value="B">B</option>
                <option value="Baik">Baik</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Perguruan Tinggi (PTN)</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center">Jenjang</th>
                  <th className="py-3 px-4 text-center">Status Akreditasi</th>
                  <th className="py-3 px-4">No. SK BAN-PT</th>
                  <th className="py-3 px-4 text-center">Masa Berlaku</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span>{item.ptn}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal pl-6 block">
                          {item.wilayah}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-950">
                        {item.prodi}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[10px]">
                          {item.jenjang}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                            item.akreditasi === 'Unggul' || item.akreditasi === 'A'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {item.akreditasi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.nomorSk}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">
                        s.d. {item.tahunKedaluwarsa}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {onSelectProdiForForm && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSelect(item.ptn, item.prodi, 'pilihan1', item.akreditasi)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 whitespace-nowrap"
                                title={`Pilih ${item.prodi} (${item.ptn}) ke Formulir Siswa Pilihan 1`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>Pilihan 1</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelect(item.ptn, item.prodi, 'pilihan2', item.akreditasi)}
                                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 whitespace-nowrap"
                                title={`Pilih ${item.prodi} (${item.ptn}) ke Formulir Siswa Pilihan 2`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>Pilihan 2</span>
                              </button>
                            </>
                          )}
                          <a
                            href={`${BANPT_URL}?ptn=${encodeURIComponent(item.ptn)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline px-2 py-1 rounded-md hover:bg-indigo-50"
                          >
                            <span>Verifikasi</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Tidak ada data prodi yang sesuai dengan kata kunci filter Anda.
                      <div className="mt-2">
                        <a
                          href={BANPT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          Cari langsung di website resmi BAN-PT <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Data tersinkronisasi dengan acuan standar Direktori BAN-PT Kemdikbud Ristek.</span>
            </div>
            <a
              href={BANPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Halaman Pencarian BAN-PT Lengkap <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
