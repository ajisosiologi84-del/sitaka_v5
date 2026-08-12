import React from 'react';
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  PieChart,
  Layers,
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';

interface TkaAnalysisViewProps {
  students: Student[];
}

export const TkaAnalysisView: React.FC<TkaAnalysisViewProps> = ({ students }) => {
  // Count Mapel TKA 1
  const mapel1Counts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.mapelTka1) mapel1Counts[s.mapelTka1] = (mapel1Counts[s.mapelTka1] || 0) + 1;
  });

  // Count Mapel TKA 2
  const mapel2Counts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.mapelTka2) mapel2Counts[s.mapelTka2] = (mapel2Counts[s.mapelTka2] || 0) + 1;
  });

  // Combined Mapel TKA
  const combinedMapel: Record<string, number> = {};
  students.forEach((s) => {
    if (s.mapelTka1) combinedMapel[s.mapelTka1] = (combinedMapel[s.mapelTka1] || 0) + 1;
    if (s.mapelTka2) combinedMapel[s.mapelTka2] = (combinedMapel[s.mapelTka2] || 0) + 1;
  });

  const sortedCombinedMapel = Object.entries(combinedMapel).sort((a, b) => b[1] - a[1]);

  // Count Prodi 1 & 2
  const prodi1Counts: Record<string, number> = {};
  const prodi2Counts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.prodiPilihan1) prodi1Counts[s.prodiPilihan1] = (prodi1Counts[s.prodiPilihan1] || 0) + 1;
    if (s.prodiPilihan2) prodi2Counts[s.prodiPilihan2] = (prodi2Counts[s.prodiPilihan2] || 0) + 1;
  });

  const sortedProdi1 = Object.entries(prodi1Counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Analysis Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Analisis Data Terintegrasi
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Statistik & Pemetaan Pilihan Mapel TKA vs Prodi Studi Lanjut
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Pemetaan frekuensi pilihan mata pelajaran TKA 1 & 2 serta keselarasan rumpun ilmu dengan Program Studi pilihan siswa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapel TKA 1 Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Mata Pelajaran TKA Pilihan 1 (Utama)
            </h4>
            <span className="text-xs text-slate-500 font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              Pilihan 1
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(mapel1Counts)
              .sort((a, b) => b[1] - a[1])
              .map(([mapel, count]) => {
                const pct = Math.round((count / (students.length || 1)) * 100);
                return (
                  <div key={mapel} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{mapel}</span>
                      <span className="text-slate-500">
                        {count} siswa ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Mapel TKA 2 Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Mata Pelajaran TKA Pilihan 2 (Pendamping)
            </h4>
            <span className="text-xs text-slate-500 font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              Pilihan 2
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(mapel2Counts)
              .sort((a, b) => b[1] - a[1])
              .map(([mapel, count]) => {
                const pct = Math.round((count / (students.length || 1)) * 100);
                return (
                  <div key={mapel} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{mapel}</span>
                      <span className="text-slate-500">
                        {count} siswa ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Program Studi Distribution Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Peringkat Program Studi & Perguruan Tinggi Pilihan 1
            </h4>
            <p className="text-xs text-slate-500">
              Perguruan Tinggi Negeri (PTN) dan Jurusan prioritas siswa
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Top Choice
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="p-3">Peringkat</th>
                <th className="p-3">Program Studi & Universitas</th>
                <th className="p-3 text-center">Jumlah Siswa (Pilihan 1)</th>
                <th className="p-3 text-right">Persentase Peminat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProdi1.map(([prodi, count], idx) => {
                const pct = Math.round((count / (students.length || 1)) * 100);
                return (
                  <tr key={prodi} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-700">#{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{prodi}</td>
                    <td className="p-3 text-center font-bold text-indigo-600">
                      {count} Siswa
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${pct * 3}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
