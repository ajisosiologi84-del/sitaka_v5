import * as XLSX from 'xlsx';
import { Student, PilihanStudiLanjutType, PrestasiItem } from '../types';
import { formatNisn } from './sanitizer';

export const EXCEL_HEADER_MAPPING: Record<string, keyof Omit<Student, 'id' | 'updatedAt'>> = {
  'Nama Siswa': 'namaSiswa',
  'nama siswa': 'namaSiswa',
  'NAMA SISWA': 'namaSiswa',
  'Nama': 'namaSiswa',
  'nama': 'namaSiswa',
  'NIS': 'nis',
  'nis': 'nis',
  'Nomor Induk Siswa': 'nis',
  'No Induk': 'nis',
  'NISN': 'nisn',
  'nisn': 'nisn',
  'Nomor Induk Siswa Nasional': 'nisn',
  'Kelas': 'kelas',
  'kelas': 'kelas',
  'Rombel': 'kelas',
  'rombel': 'kelas',
  'Kelas/Rombel': 'kelas',
  'Jenis Kelamin': 'jenisKelamin',
  'jenis kelamin': 'jenisKelamin',
  'JK': 'jenisKelamin',
  'jk': 'jenisKelamin',
  'Gender': 'jenisKelamin',
  'L/P': 'jenisKelamin',
  'Mata Pelajaran TKA 1': 'mapelTka1',
  'Mapel TKA 1': 'mapelTka1',
  'mapel tka 1': 'mapelTka1',
  'TKA 1': 'mapelTka1',
  'Pilihan Mapel 1': 'mapelTka1',
  'Mapel Pilihan 1': 'mapelTka1',
  'Mata Pelajaran TKA 2': 'mapelTka2',
  'Mapel TKA 2': 'mapelTka2',
  'mapel tka 2': 'mapelTka2',
  'TKA 2': 'mapelTka2',
  'Pilihan Mapel 2': 'mapelTka2',
  'Mapel Pilihan 2': 'mapelTka2',
  'Pilihan Studi Lanjut': 'pilihanStudiLanjut',
  'Studi Lanjut': 'pilihanStudiLanjut',
  'studi lanjut': 'pilihanStudiLanjut',
  'Rute Lanjutan': 'pilihanStudiLanjut',
  'Rencana Studi Lanjut': 'pilihanStudiLanjut',
  'Universitas Pilihan 1': 'ptn1',
  'Universitas 1': 'ptn1',
  'PTN 1': 'ptn1',
  'ptn 1': 'ptn1',
  'PTN Pilihan 1': 'ptn1',
  'Kampus 1': 'ptn1',
  'Perguruan Tinggi 1': 'ptn1',
  'Prodi Pilihan 1': 'prodiPilihan1',
  'prodi pilihan 1': 'prodiPilihan1',
  'Prodi 1': 'prodiPilihan1',
  'Jurusan 1': 'prodiPilihan1',
  'Program Studi 1': 'prodiPilihan1',
  'Akreditasi BAN-PT Pilihan 1': 'akreditasiPilihan1',
  'Akreditasi Pilihan 1': 'akreditasiPilihan1',
  'Akreditasi 1': 'akreditasiPilihan1',
  'akreditasi 1': 'akreditasiPilihan1',
  'Kriteria Pilihan 1': 'kriteriaPilihan1',
  'Kriteria 1': 'kriteriaPilihan1',
  'kriteria 1': 'kriteriaPilihan1',
  'Universitas Pilihan 2': 'ptn2',
  'Universitas 2': 'ptn2',
  'PTN 2': 'ptn2',
  'ptn 2': 'ptn2',
  'PTN Pilihan 2': 'ptn2',
  'Kampus 2': 'ptn2',
  'Perguruan Tinggi 2': 'ptn2',
  'Prodi Pilihan 2': 'prodiPilihan2',
  'prodi pilihan 2': 'prodiPilihan2',
  'Prodi 2': 'prodiPilihan2',
  'Jurusan 2': 'prodiPilihan2',
  'Program Studi 2': 'prodiPilihan2',
  'Akreditasi BAN-PT Pilihan 2': 'akreditasiPilihan2',
  'Akreditasi Pilihan 2': 'akreditasiPilihan2',
  'Akreditasi 2': 'akreditasiPilihan2',
  'akreditasi 2': 'akreditasiPilihan2',
  'Kriteria Pilihan 2': 'kriteriaPilihan2',
  'Kriteria 2': 'kriteriaPilihan2',
  'kriteria 2': 'kriteriaPilihan2',
  'Mengajukan KIP Kuliah': 'mengajukanKipKuliah',
  'KIP Kuliah': 'mengajukanKipKuliah',
  'KIP-K': 'mengajukanKipKuliah',
  'KIP': 'mengajukanKipKuliah',
  'Kip Kuliah': 'mengajukanKipKuliah',
  'Kategori Desil': 'kategoriDesil',
  'Desil': 'kategoriDesil',
  'Desil KIP': 'kategoriDesil',
  'No HP': 'noHp',
  'no hp': 'noHp',
  'No WA': 'noHp',
  'Nomor HP': 'noHp',
  'No Handphone': 'noHp',
  'Foto Siswa': 'fotoSiswa',
  'Foto': 'fotoSiswa',
  'Pasfoto': 'fotoSiswa',
  'foto': 'fotoSiswa',
  'Catatan': 'catatan',
  'catatan': 'catatan',
  'Keterangan': 'catatan',
};

/**
 * Downloads a pre-formatted Excel template for easy data entry
 */
export function downloadExcelTemplate(): void {
  const templateData = [
    {
      'Nama Siswa': 'Contoh Budi Santoso',
      'NIS': '22231011',
      'NISN': '0061234571',
      'Kelas': 'XII MIPA 1',
      'Jenis Kelamin': 'L',
      'Mata Pelajaran TKA 1': 'Matematika',
      'Mata Pelajaran TKA 2': 'Fisika',
      'Pilihan Studi Lanjut': 'Kuliah',
      'Universitas Pilihan 1': 'Institut Teknologi Bandung (ITB)',
      'Prodi Pilihan 1': 'Teknik Informatika / Ilmu Komputer',
      'Akreditasi Pilihan 1': 'Unggul / A',
      'Kriteria Pilihan 1': 'Prioritas Utama',
      'Universitas Pilihan 2': 'Universitas Indonesia (UI)',
      'Prodi Pilihan 2': 'Pendidikan Dokter / Kedokteran Umum',
      'Akreditasi Pilihan 2': 'Unggul / A',
      'Kriteria Pilihan 2': 'Pilihan Cadangan',
      'Mengajukan KIP Kuliah': 'Ya',
      'Kategori Desil': 'Desil 2',
      'Data Prestasi Siswa': 'Juara 1 OSN Matematika (Akademik - Nasional - Puspresnas)',
      'No HP': '081234567890',
      'Catatan': 'Aktif dalam organisasi OSIS',
    },
    {
      'Nama Siswa': 'Contoh Taruna Rian',
      'NIS': '22231012',
      'NISN': '0061234572',
      'Kelas': 'XII MIPA 2',
      'Jenis Kelamin': 'L',
      'Mata Pelajaran TKA 1': 'Biologi',
      'Mata Pelajaran TKA 2': 'Kimia',
      'Pilihan Studi Lanjut': 'AKADEMI',
      'Universitas Pilihan 1': '-',
      'Prodi Pilihan 1': '-',
      'Akreditasi Pilihan 1': '-',
      'Kriteria Pilihan 1': '-',
      'Universitas Pilihan 2': '-',
      'Prodi Pilihan 2': '-',
      'Akreditasi Pilihan 2': '-',
      'Kriteria Pilihan 2': '-',
      'Mengajukan KIP Kuliah': 'Tidak',
      'Kategori Desil': '',
      'Data Prestasi Siswa': 'Juara 2 Karate O2SN (Non-Akademik - Provinsi - Dispora)',
      'No HP': '081234567891',
      'Catatan': 'Persiapan fisik AKMIL',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for nice appearance
  worksheet['!cols'] = [
    { wch: 25 }, // Nama
    { wch: 12 }, // NIS
    { wch: 15 }, // NISN
    { wch: 15 }, // Kelas
    { wch: 12 }, // JK
    { wch: 25 }, // Mapel TKA 1
    { wch: 25 }, // Mapel TKA 2
    { wch: 20 }, // Studi Lanjut
    { wch: 32 }, // Universitas 1
    { wch: 30 }, // Prodi 1
    { wch: 20 }, // Akreditasi 1
    { wch: 20 }, // Kriteria 1
    { wch: 32 }, // Universitas 2
    { wch: 30 }, // Prodi 2
    { wch: 20 }, // Akreditasi 2
    { wch: 20 }, // Kriteria 2
    { wch: 20 }, // KIP Kuliah
    { wch: 15 }, // Desil
    { wch: 45 }, // Data Prestasi
    { wch: 15 }, // No HP
    { wch: 25 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa TKA');
  XLSX.writeFile(workbook, 'Template_Pendataan_Siswa_TKA.xlsx');
}

/**
 * Export current students to XLSX format
 */
export function exportStudentsToExcel(students: Student[]): void {
  const exportData = students.map((s, idx) => {
    let prestasiText = '-';
    if (s.prestasiList && s.prestasiList.length > 0) {
      prestasiText = s.prestasiList
        .map(
          (p, i) =>
            `${i + 1}. ${p.namaPrestasi} (${p.jenis} - ${p.tingkat}${
              p.lembaga ? ' - ' + p.lembaga : ''
            })`
        )
        .join('; ');
    }

    return {
      'No': idx + 1,
      'Nama Siswa': s.namaSiswa,
      'NIS': s.nis,
      'NISN': formatNisn(s.nisn),
      'Kelas': s.kelas,
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
      'Mata Pelajaran TKA 1': s.mapelTka1,
      'Mata Pelajaran TKA 2': s.mapelTka2,
      'Pilihan Studi Lanjut': s.pilihanStudiLanjut || 'Kuliah',
      'Universitas Pilihan 1': s.ptn1 || '-',
      'Prodi Pilihan 1': s.prodiPilihan1 || '-',
      'Akreditasi Pilihan 1': s.akreditasiPilihan1 || '-',
      'Kriteria Pilihan 1': s.kriteriaPilihan1 || '-',
      'Universitas Pilihan 2': s.ptn2 || '-',
      'Prodi Pilihan 2': s.prodiPilihan2 || '-',
      'Akreditasi Pilihan 2': s.akreditasiPilihan2 || '-',
      'Kriteria Pilihan 2': s.kriteriaPilihan2 || '-',
      'Mengajukan KIP Kuliah': s.mengajukanKipKuliah || 'Tidak',
      'Kategori Desil': s.kategoriDesil || '-',
      'Data Prestasi Siswa (Max 15)': prestasiText,
      'No HP': s.noHp || '-',
      'Catatan': s.catatan || '-',
      'Tanggal Diperbarui': s.updatedAt,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 28 }, // Nama
    { wch: 12 }, // NIS
    { wch: 15 }, // NISN
    { wch: 15 }, // Kelas
    { wch: 16 }, // JK
    { wch: 25 }, // Mapel TKA 1
    { wch: 25 }, // Mapel TKA 2
    { wch: 20 }, // Studi Lanjut
    { wch: 32 }, // Univ 1
    { wch: 30 }, // Prodi 1
    { wch: 20 }, // Akr 1
    { wch: 20 }, // Kri 1
    { wch: 32 }, // Univ 2
    { wch: 30 }, // Prodi 2
    { wch: 20 }, // Akr 2
    { wch: 20 }, // Kri 2
    { wch: 20 }, // KIP
    { wch: 15 }, // Desil
    { wch: 50 }, // Data Prestasi
    { wch: 15 }, // No HP
    { wch: 25 }, // Catatan
    { wch: 18 }, // Tanggal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa TKA');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Data_Siswa_TKA_StudiLanjut_${dateStr}.xlsx`);
}

/**
 * Parses an uploaded Excel or CSV file into Student array objects with validation
 */
export async function parseExcelFile(
  file: File
): Promise<{ validStudents: Omit<Student, 'id' | 'updatedAt'>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
        });

        const validStudents: Omit<Student, 'id' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, index) => {
          const rowNumber = index + 2; // 1-indexed sheet + header row

          let namaSiswa = '';
          let nis = '';
          let nisn = '';
          let kelas = 'XII MIPA 1';
          let jenisKelamin: 'L' | 'P' = 'L';
          let mapelTka1 = 'Matematika';
          let mapelTka2 = 'Fisika';
          let pilihanStudiLanjut: PilihanStudiLanjutType = 'Kuliah';
          let ptn1 = '';
          let prodiPilihan1 = '';
          let akreditasiPilihan1 = '';
          let kriteriaPilihan1 = '';
          let ptn2 = '';
          let prodiPilihan2 = '';
          let akreditasiPilihan2 = '';
          let kriteriaPilihan2 = '';
          let mengajukanKipKuliah: 'Ya' | 'Tidak' = 'Tidak';
          let kategoriDesil: 'Desil 1' | 'Desil 2' | 'Desil 3' | 'Desil 4' | 'Desil 5' | '' = '';
          let noHp = '';
          let fotoSiswa = '';
          let catatan = '';
          let prestasiList: PrestasiItem[] = [];

          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim();
            const val = String(row[key] ?? '').trim();
            const mappedField = EXCEL_HEADER_MAPPING[cleanKey] || EXCEL_HEADER_MAPPING[cleanKey.toLowerCase()];

            if (mappedField === 'namaSiswa') namaSiswa = val;
            else if (mappedField === 'nis') nis = val;
            else if (mappedField === 'nisn') nisn = formatNisn(val);
            else if (mappedField === 'kelas') {
              if (val) kelas = val;
            } else if (mappedField === 'jenisKelamin') {
              if (val.toUpperCase().startsWith('P') || val.toLowerCase().includes('perempuan')) {
                jenisKelamin = 'P';
              } else if (val.toUpperCase().startsWith('L') || val.toLowerCase().includes('laki')) {
                jenisKelamin = 'L';
              }
            } else if (mappedField === 'mapelTka1') {
              if (val) mapelTka1 = val;
            } else if (mappedField === 'mapelTka2') {
              if (val) mapelTka2 = val;
            } else if (mappedField === 'pilihanStudiLanjut') {
              if (
                val.toUpperCase().includes('AKADEMI') ||
                val.toUpperCase().includes('TNI') ||
                val.toUpperCase().includes('POLRI') ||
                val.toUpperCase().includes('KEDINASAN')
              ) {
                pilihanStudiLanjut = 'AKADEMI';
              } else if (
                val.toLowerCase().includes('kerja') ||
                val.toLowerCase().includes('bekerja') ||
                val.toLowerCase().includes('wirausaha')
              ) {
                pilihanStudiLanjut = 'Bekerja';
              } else if (val) {
                pilihanStudiLanjut = 'Kuliah';
              }
            } else if (mappedField === 'ptn1') {
              if (val) ptn1 = val;
            } else if (mappedField === 'prodiPilihan1') {
              if (val) prodiPilihan1 = val;
            } else if (mappedField === 'akreditasiPilihan1') {
              if (val) akreditasiPilihan1 = val;
            } else if (mappedField === 'kriteriaPilihan1') {
              if (val) kriteriaPilihan1 = val;
            } else if (mappedField === 'ptn2') {
              if (val) ptn2 = val;
            } else if (mappedField === 'prodiPilihan2') {
              if (val) prodiPilihan2 = val;
            } else if (mappedField === 'akreditasiPilihan2') {
              if (val) akreditasiPilihan2 = val;
            } else if (mappedField === 'kriteriaPilihan2') {
              if (val) kriteriaPilihan2 = val;
            } else if (mappedField === 'mengajukanKipKuliah') {
              if (val.toLowerCase().includes('ya') || val === '1' || val.toLowerCase() === 'y') {
                mengajukanKipKuliah = 'Ya';
              } else {
                mengajukanKipKuliah = 'Tidak';
              }
            } else if (mappedField === 'kategoriDesil') {
              if (val.includes('1')) kategoriDesil = 'Desil 1';
              else if (val.includes('2')) kategoriDesil = 'Desil 2';
              else if (val.includes('3')) kategoriDesil = 'Desil 3';
              else if (val.includes('4')) kategoriDesil = 'Desil 4';
              else if (val.includes('5')) kategoriDesil = 'Desil 5';
            } else if (mappedField === 'noHp') noHp = val;
            else if (mappedField === 'fotoSiswa') fotoSiswa = val;
            else if (mappedField === 'catatan') catatan = val;

            // Parse prestasi string if column present
            if (
              cleanKey.toLowerCase().includes('prestasi') ||
              cleanKey.toLowerCase().includes('sertifikat')
            ) {
              if (val && val !== '-') {
                const items = val.split(/;|\n/);
                items.forEach((itemStr, idx) => {
                  if (itemStr.trim()) {
                    prestasiList.push({
                      id: 'p-imp-' + Date.now() + '-' + idx,
                      namaPrestasi: itemStr.trim(),
                      jenis: itemStr.toLowerCase().includes('non') ? 'Non-Akademik' : 'Akademik',
                      tingkat: itemStr.toLowerCase().includes('internasional')
                        ? 'Internasional'
                        : itemStr.toLowerCase().includes('nasional')
                        ? 'Nasional'
                        : itemStr.toLowerCase().includes('provinsi')
                        ? 'Provinsi'
                        : 'Kota/Kabupaten',
                      lembaga: 'Hasil Impor Excel (Dapodik)',
                    });
                  }
                });
              }
            }
          });

          // Validation
          if (!namaSiswa && !nis && !nisn) {
            return;
          }

          if (!namaSiswa) {
            errors.push(`Baris ${rowNumber}: Nama Siswa tidak boleh kosong.`);
            return;
          }

          if (!nis) {
            errors.push(`Baris ${rowNumber} (${namaSiswa}): NIS tidak boleh kosong.`);
            return;
          }

          if (!nisn) {
            errors.push(`Baris ${rowNumber} (${namaSiswa}): NISN tidak boleh kosong.`);
            return;
          }

          validStudents.push({
            namaSiswa,
            nis,
            nisn,
            kelas,
            jenisKelamin,
            mapelTka1,
            mapelTka2,
            pilihanStudiLanjut,
            ptn1,
            prodiPilihan1,
            akreditasiPilihan1,
            kriteriaPilihan1,
            ptn2,
            prodiPilihan2,
            akreditasiPilihan2,
            kriteriaPilihan2,
            mengajukanKipKuliah,
            kategoriDesil,
            noHp,
            fotoSiswa,
            catatan,
            prestasiList,
          });
        });

        resolve({ validStudents, errors });
      } catch (err: any) {
        reject(new Error('Gagal membaca file Excel/CSV: ' + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
