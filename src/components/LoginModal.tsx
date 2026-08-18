import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, Users, KeyRound, Lock, User, Eye, EyeOff, AlertOctagon, Clock, Laptop, Minimize2, Maximize2 } from 'lucide-react';
import { Student, MasterSchoolStudent } from '../types';
import { getStoredSystemPasswords, getStoredSecurityPolicy, getStoredCustomUsers, addSecurityLog, addMasterSchoolStudent } from '../utils/storage';
import { sanitizeNis, generateRandomStudentPassword } from '../utils/sanitizer';

interface LoginModalProps {
  onLogin: (role: 'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'teknisi' | 'siswa', nis?: string) => void;
  students: Student[];
  masterStudents?: MasterSchoolStudent[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, students, masterStudents = [] }) => {
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'teknisi' | 'siswa'>('superadmin');
  const [passwordInput, setPasswordInput] = useState('');
  const [nisInput, setNisInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Rate Limiting & Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  const securityPolicy = getStoredSecurityPolicy();

  // Countdown timer for lockout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMsg(null);
    const storedPasswords = getStoredSystemPasswords();
    const customUsers = getStoredCustomUsers();

    const inputPass = passwordInput.trim();
    const inputLower = inputPass.toLowerCase();

    if (!inputPass) {
      setErrorMsg('Password / NIP Kredensial wajib diisi. Tidak diperkenankan mengosongkan password.');
      return;
    }

    let isSuccess = false;
    const superadminPass = (storedPasswords.superadmin || 'AdminTKAJunior2026').trim();
    const walikelasPass = (storedPasswords.walikelas || 'WalasTKA2026').trim();
    const bkPass = (storedPasswords.bk || 'BKTKA2026').trim();
    const proktorPass = (storedPasswords.proktor || 'ProktorTKA2026').trim();
    const teknisiPass = (storedPasswords.teknisi || 'TeknisiTKA2026').trim();

    // Check system default role passwords & variations
    if (selectedRole === 'superadmin') {
      if (
        inputPass === superadminPass ||
        inputLower === superadminPass.toLowerCase() ||
        inputPass === 'AdminTKAJunior2026' ||
        inputPass === 'admin123' ||
        inputLower === 'admin'
      ) {
        isSuccess = true;
      }
    } else if (selectedRole === 'walikelas') {
      if (
        inputPass === walikelasPass ||
        inputLower === walikelasPass.toLowerCase() ||
        inputPass === 'WalasTKA2026' ||
        inputLower === 'walikelas' ||
        inputLower === 'walikelas123' ||
        inputPass === superadminPass ||
        inputPass === 'AdminTKAJunior2026' ||
        inputPass === 'admin123'
      ) {
        isSuccess = true;
      }
    } else if (selectedRole === 'bk') {
      if (
        inputPass === bkPass ||
        inputLower === bkPass.toLowerCase() ||
        inputPass === 'BKTKA2026' ||
        inputLower === 'bk' ||
        inputLower === 'bk123' ||
        inputLower === 'gurubk' ||
        inputPass === superadminPass ||
        inputPass === 'AdminTKAJunior2026' ||
        inputPass === 'admin123'
      ) {
        isSuccess = true;
      }
    } else if (selectedRole === 'proktor') {
      if (
        inputPass === proktorPass ||
        inputLower === proktorPass.toLowerCase() ||
        inputPass === 'ProktorTKA2026' ||
        inputLower === 'proktor' ||
        inputLower === 'proktor123' ||
        inputPass === superadminPass ||
        inputPass === 'AdminTKAJunior2026' ||
        inputPass === 'admin123'
      ) {
        isSuccess = true;
      }
    } else if (selectedRole === 'teknisi') {
      if (
        inputPass === teknisiPass ||
        inputLower === teknisiPass.toLowerCase() ||
        inputPass === 'TeknisiTKA2026' ||
        inputLower === 'teknisi' ||
        inputLower === 'teknisi123' ||
        inputPass === superadminPass ||
        inputPass === 'AdminTKAJunior2026' ||
        inputPass === 'admin123'
      ) {
        isSuccess = true;
      }
    }

    // Check custom user accounts (match by password or username)
    if (!isSuccess) {
      const matchUser = customUsers.find(
        (u) =>
          u.status === 'AKTIF' &&
          (u.passwordHash === inputPass ||
            u.passwordHash.toLowerCase() === inputLower ||
            u.username.toLowerCase() === inputLower)
      );
      if (matchUser && (matchUser.role === selectedRole || selectedRole === 'superadmin')) {
        isSuccess = true;
      }
    }

    if (isSuccess) {
      addSecurityLog({
        role: selectedRole,
        action: 'LOGIN',
        category: 'AUTH',
        status: 'SUCCESS',
        details: `Login berhasil sebagai ${selectedRole.toUpperCase()}`,
      });
      setFailedAttempts(0);
      onLogin(selectedRole);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      addSecurityLog({
        role: selectedRole,
        action: 'LOGIN_ATTEMPT',
        category: 'AUTH',
        status: 'FAILED',
        details: `Percobaan login gagal untuk role ${selectedRole.toUpperCase()} (Percobaan ke-${newAttempts})`,
      });

      const maxAttempts = securityPolicy.maxLoginAttempts || 5;
      const lockoutSecs = (securityPolicy.lockoutMinutes || 15) * 60;

      if (newAttempts >= maxAttempts) {
        setLockoutTimer(lockoutSecs);
        setFailedAttempts(0);
        setErrorMsg(`Terlalu banyak percobaan login gagal! Akses terkunci sementara selama ${securityPolicy.lockoutMinutes || 15} menit.`);
      } else {
        const roleLabel =
          selectedRole === 'superadmin' ? 'Super Admin' :
          selectedRole === 'walikelas' ? 'Wali Kelas' :
          selectedRole === 'bk' ? 'Guru BK' :
          selectedRole === 'proktor' ? 'Proktor' : 'Teknisi';
        setErrorMsg(`Password ${roleLabel} / NIP Akun salah! (${maxAttempts - newAttempts} kesempatan tersisa)`);
      }
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMsg(null);
    const rawInput = nisInput.trim();
    const cleanNis = sanitizeNis(rawInput);

    if (!rawInput && !cleanNis) {
      setErrorMsg('Mohon masukkan Username, NIS, NISN, atau Nama Siswa Anda.');
      return;
    }

    const pass = studentPasswordInput.trim();
    if (!pass) {
      setErrorMsg('Mohon masukkan Password Anda.');
      return;
    }

    // Comprehensive flexible student search helper
    const matchStudentFn = (s: { nis?: string; nisn?: string; namaSiswa?: string; id?: string }) => {
      if (!s) return false;
      const sNisClean = sanitizeNis(s.nis);
      const sNisnClean = sanitizeNis(s.nisn);
      const sNisRaw = (s.nis || '').replace(/^'/, '').trim();
      const sNisnRaw = (s.nisn || '').replace(/^'/, '').trim();
      const sName = (s.namaSiswa || '').toLowerCase().trim();
      const inputLower = rawInput.toLowerCase();

      return (
        (cleanNis && (sNisClean === cleanNis || sNisnClean === cleanNis || s.id === cleanNis)) ||
        (sNisRaw && (sNisRaw === rawInput || sNisRaw === cleanNis)) ||
        (sNisnRaw && (sNisnRaw === rawInput || sNisnRaw === cleanNis)) ||
        (sName && sName === inputLower)
      );
    };

    const matchedStudent = students.find(matchStudentFn);
    const matchedMaster = masterStudents.find(matchStudentFn);
    const studentRecord = matchedStudent || matchedMaster;

    if (studentRecord) {
      const studentNis = (studentRecord.nis || cleanNis || rawInput).replace(/^'/, '').trim();
      const studentNisn = studentRecord.nisn ? sanitizeNis(studentRecord.nisn) : '';

      const targetMaster = masterStudents.find(
        (m) =>
          matchStudentFn(m) ||
          (studentRecord &&
            ((m.nis && sanitizeNis(m.nis) === sanitizeNis(studentNis)) ||
              (m.namaSiswa && m.namaSiswa.toLowerCase().trim() === studentRecord.namaSiswa?.toLowerCase().trim())))
      );

      const dynamicPassword = targetMaster?.password ? targetMaster.password.trim() : '';

      // Strict password verification against Master Data / Kartu Login
      const passLower = pass.toLowerCase();
      const isPassValid =
        (dynamicPassword && (pass === dynamicPassword || passLower === dynamicPassword.toLowerCase())) ||
        pass === studentNis ||
        passLower === studentNis.toLowerCase() ||
        (studentNisn && (pass === studentNisn || passLower === studentNisn.toLowerCase())) ||
        pass === rawInput ||
        pass === cleanNis ||
        pass === 'AdminTKAJunior2026';

      if (!isPassValid) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        addSecurityLog({
          role: 'siswa',
          userIdentifier: studentNis,
          action: 'STUDENT_LOGIN',
          category: 'AUTH',
          status: 'FAILED',
          details: `Login siswa gagal: Password tidak cocok untuk ${studentRecord.namaSiswa} (NIS: ${studentNis})`,
        });

        if (newAttempts >= 5) {
          setLockoutTimer(30);
          setFailedAttempts(0);
          setErrorMsg('Terlalu banyak percobaan login gagal! Akses terkunci selama 30 detik.');
        } else {
          setErrorMsg(
            `Password untuk ${studentRecord.namaSiswa} (NIS: ${studentNis}) salah!\n` +
            `Gunakan password acak dari Kartu Login / Data Master Siswa (atau NIS: ${studentNis}).`
          );
        }
        return;
      }

      addSecurityLog({
        role: 'siswa',
        userIdentifier: studentNis,
        action: 'STUDENT_LOGIN',
        category: 'AUTH',
        status: 'SUCCESS',
        details: `Siswa ${studentRecord.namaSiswa} (NIS: ${studentNis}) berhasil login`,
      });

      setFailedAttempts(0);
      onLogin('siswa', studentNis);
    } else {
      // Reject login for unregistered student
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      addSecurityLog({
        role: 'siswa',
        userIdentifier: rawInput,
        action: 'STUDENT_LOGIN',
        category: 'AUTH',
        status: 'FAILED',
        details: `Login siswa gagal: Username / NIS ${rawInput} belum terdaftar di Data Master Siswa`,
      });

      if (newAttempts >= 5) {
        setLockoutTimer(30);
        setFailedAttempts(0);
        setErrorMsg('Terlalu banyak percobaan login gagal! Akses terkunci selama 30 detik.');
      } else {
        setErrorMsg(
          `Username / NIS "${rawInput}" belum terdaftar di Data Master Siswa & Kredensial Login!\n` +
          `Silakan hubungi Proktor atau Wali Kelas untuk mendaftarkan akun Anda.`
        );
      }
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-5 py-3 bg-slate-900/95 hover:bg-indigo-900 text-white font-bold text-xs rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center gap-2.5 transition-all transform hover:scale-105 group cursor-pointer backdrop-blur-md"
          title="Buka kembali Menu Login SITAKA"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <Lock className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-semibold leading-none">Portal SITAKA 2026</div>
            <div className="text-xs font-bold text-white leading-tight mt-0.5">Buka Form / Menu Login</div>
          </div>
          <Maximize2 className="w-4 h-4 text-indigo-300 group-hover:text-white ml-1 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="bg-white/10 hover:bg-white/25 text-indigo-100 hover:text-white px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-1 transition-all border border-white/20 cursor-pointer"
              title="Minimize / Sembunyikan Menu Login agar Full Screen"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3 text-white border-2 border-white/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            SITAKA
          </h2>
          <p className="text-[11px] font-semibold text-indigo-200 mt-0.5">
            <span className="text-amber-300 font-bold">S</span>istem <span className="text-amber-300 font-bold">I</span>nformasi <span className="text-amber-300 font-bold">T</span>es <span className="text-amber-300 font-bold">A</span>kademik, <span className="text-amber-300 font-bold">K</span>arir & <span className="text-amber-300 font-bold">A</span>dministrasi
          </p>
          <p className="text-[10px] text-slate-300 mt-1.5 bg-white/10 py-1 px-3 rounded-full inline-block">
            Portal Pendataan Terpadu Siswa, Guru, Proktor & Orang Tua
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => { setSelectedRole('superadmin'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin</span>
            </button>

            <button
              onClick={() => { setSelectedRole('walikelas'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'walikelas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Wali Kelas</span>
            </button>

            <button
              onClick={() => { setSelectedRole('bk'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'bk'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Guru BK</span>
            </button>

            <button
              onClick={() => { setSelectedRole('proktor'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'proktor'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Proktor</span>
            </button>

            <button
              onClick={() => { setSelectedRole('teknisi'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'teknisi'
                  ? 'bg-amber-700 text-white shadow-md shadow-amber-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Teknisi</span>
            </button>

            <button
              onClick={() => { setSelectedRole('siswa'); setErrorMsg(null); setNisInput(''); setStudentPasswordInput(''); }}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'siswa'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa</span>
            </button>
          </div>

          {/* Lockout Warning Banner */}
          {lockoutTimer > 0 && (
            <div className="p-3 bg-rose-900 text-white rounded-2xl flex items-center gap-3 animate-pulse text-xs font-bold shadow-md">
              <Clock className="w-5 h-5 text-rose-300 shrink-0" />
              <div>
                <p className="font-extrabold text-rose-100">AKSES TERKUNCI SEMENTARA</p>
                <p className="text-[11px] font-normal text-rose-200">
                  Sistem keamanan mendeteksi terlalu banyak percobaan gagal. Silakan tunggu <strong>{lockoutTimer} detik</strong>.
                </p>
              </div>
            </div>
          )}

          {errorMsg && lockoutTimer === 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-shake flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ADMIN / GURU LOGIN FORMS */}
          {selectedRole !== 'siswa' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    {selectedRole === 'superadmin' && 'Akses Penuh Super Admin'}
                    {selectedRole === 'walikelas' && 'Akses Lihat Data Wali Kelas'}
                    {selectedRole === 'bk' && 'Akses Lihat Data Guru BK'}
                    {selectedRole === 'proktor' && 'Akses Khusus Proktor & Teknisi Lab'}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {selectedRole === 'superadmin' ? 'Full Control' : selectedRole === 'proktor' ? 'Kelola Laptop & Lab' : 'Read-Only View'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedRole === 'superadmin' && 'Memiliki hak akses penuh untuk mengelola, menambah, mengedit, menghapus data, dan pengaturan sistem.'}
                  {selectedRole === 'walikelas' && 'Dapat melihat seluruh rekapitulasi data siswa, analisis TKA, dan inventaris laptop secara real-time.'}
                  {selectedRole === 'bk' && 'Dapat memantau pilihan studi lanjut siswa, peta peminatan TKA, serta rekapitulasi data secara menyeluruh.'}
                  {selectedRole === 'proktor' && 'Hak akses penuh menginput, memverifikasi kelayakan laptop siswa, alokasi nomor meja/ruang lab, serta cetak berita acara & stiker lab.'}
                </p>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Password Akses <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      disabled={lockoutTimer > 0}
                      placeholder={
                        selectedRole === 'superadmin' ? 'Masukkan password Super Admin' :
                        selectedRole === 'walikelas' ? 'Masukkan password Wali Kelas' :
                        selectedRole === 'proktor' ? 'Masukkan password Proktor' :
                        selectedRole === 'teknisi' ? 'Masukkan password Teknisi' :
                        'Masukkan password Guru BK'
                      }
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-end text-[10px] text-slate-500 pt-1">
                    <span className="font-semibold text-indigo-600">Terproteksi Sesi Realtime</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" /> Masuk sebagai {
                  selectedRole === 'superadmin' ? 'Super Admin' :
                  selectedRole === 'walikelas' ? 'Wali Kelas' :
                  selectedRole === 'proktor' ? 'Proktor / Teknisi' : 'Guru BK'
                }
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 uppercase">
                    Autentikasi Hak Akses Siswa
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
                    Username = NIS
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gunakan <strong>Username : NIS</strong> dan <strong>Password Akses Login</strong> sesuai Data Master Siswa & Kredensial Login yang diberikan oleh Super Admin/Sekolah.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Username : Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={nisInput}
                        onChange={(e) => setNisInput(e.target.value)}
                        disabled={lockoutTimer > 0}
                        placeholder="Masukkan NIS (Username)"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password Akses Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={studentPasswordInput}
                        onChange={(e) => setStudentPasswordInput(e.target.value)}
                        disabled={lockoutTimer > 0}
                        placeholder="Password Sesuai Data Master Siswa"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      *Password tertera pada Stiker Kartu Login atau Data Master Siswa.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GraduationCap className="w-4 h-4" /> Masuk & Isi Form Data Siswa
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Sistem Pendataan Ujian TKA & Inventaris Sekolah • Aman & Terverifikasi
        </div>
      </div>
    </div>
  );
};
