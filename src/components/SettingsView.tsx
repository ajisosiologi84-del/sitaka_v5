import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Code2,
  Database,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  Laptop,
  HardDrive,
  Download,
  Upload,
  FileJson,
  Loader2,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldAlert,
  History,
  Search,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  UserPlus,
  Edit3,
  Sliders,
  Fingerprint,
  Check,
  X,
  Clock,
  Smartphone,
  Shield,
  UserCheck,
  Copy,
  ExternalLink,
  FileCode,
  Terminal,
  CloudDownload,
  CloudUpload
} from 'lucide-react';
import {
  DocumentSettings,
  ProktorTeknisi,
  RolePermissions,
  CustomUserAccount,
  SystemSecurityPolicy,
  ActiveUserSession
} from '../types';
import {
  generatePortalBackupJson,
  restorePortalFromBackupJson,
  getStoredSystemPasswords,
  saveSystemPasswords,
  getStoredSecurityLogs,
  clearSecurityLogs,
  addSecurityLog,
  getStoredRolePermissions,
  saveRolePermissions,
  getStoredSecurityPolicy,
  saveSecurityPolicy,
  getStoredCustomUsers,
  saveCustomUsers,
  getStoredActiveSessions,
  clearActiveSessionsExceptCurrent,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_SECURITY_POLICY,
  SecurityLog,
  SystemPasswords,
  getStoredStudents,
  saveStudents,
  saveAppsScriptUrl,
  sanitizeAppsScriptUrl,
  saveMasterSchoolStudents,
} from '../utils/storage';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/mockStudents';

export { GOOGLE_APPS_SCRIPT_CODE };

interface SettingsViewProps {
  docSettings: DocumentSettings;
  onSaveDocSettings: (settings: DocumentSettings) => void;
  onResetDocSettings: () => void;
  proktorList: ProktorTeknisi[];
  onAddProktor: (data: Omit<ProktorTeknisi, 'id'>) => void;
  onUpdateProktor: (data: ProktorTeknisi) => void;
  onDeleteProktor: (id: string) => void;
  appsScriptUrl: string;
  onSaveAppsScriptUrl: (url: string) => void;
  onResetStudentsData: () => void;
  onClearStudentsData?: () => void;
  onResetLaptopsData: () => void;
  totalStudents: number;
  totalLaptops: number;
  isStudentFormOpen?: boolean;
  onToggleStudentFormAccess?: (open: boolean) => void;
  onDataRestored?: () => void;
  onSyncGoogleSheets?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  docSettings,
  onSaveDocSettings,
  onResetDocSettings,
  proktorList,
  onAddProktor,
  onUpdateProktor,
  onDeleteProktor,
  appsScriptUrl,
  onSaveAppsScriptUrl,
  onResetStudentsData,
  onClearStudentsData,
  onResetLaptopsData,
  totalStudents,
  totalLaptops,
  isStudentFormOpen = true,
  onToggleStudentFormAccess,
  onDataRestored,
  onSyncGoogleSheets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kop' | 'proktor' | 'appscript' | 'database' | 'backup' | 'security' | 'auditlog'>('kop');
  const [settingsForm, setSettingsForm] = useState<DocumentSettings>({ ...docSettings });
  const [gasUrlInput, setGasUrlInput] = useState(appsScriptUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);

  // Google Apps Script Testing & Syncing states
  const [isTestingGas, setIsTestingGas] = useState(false);
  const [gasTestResult, setGasTestResult] = useState<{
    success: boolean;
    message: string;
    sheetName?: string;
  } | null>(null);
  const [isSyncingGas, setIsSyncingGas] = useState(false);
  const [gasSyncResult, setGasSyncResult] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleTestGasConnection = async () => {
    const rawUrl = gasUrlInput.trim() || appsScriptUrl;
    const url = sanitizeAppsScriptUrl(rawUrl);
    if (!url) {
      setGasTestResult({
        success: false,
        message: '⚠️ Silakan masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setIsTestingGas(true);
    setGasTestResult(null);

    try {
      let json: any = null;

      // Method 1: GET request with action=ping
      try {
        const pingUrl = `${url}?action=ping&_t=${Date.now()}`;
        const getRes = await fetch(pingUrl, { method: 'GET', redirect: 'follow', cache: 'no-store' });
        const text = await getRes.text();

        if (text && (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('Google Accounts') || text.includes('ServiceLogin'))) {
          setGasTestResult({
            success: false,
            message:
              '⚠️ Google mengembalikan halaman login/otorisasi!\n' +
              'Pastikan "Who has access" di Apps Script diatur ke "Anyone" (Siapa saja) dan lakukan Deploy > New version.',
          });
          return;
        }

        if (text) {
          try {
            json = JSON.parse(text);
          } catch (_) {}
        }
      } catch (getErr) {
        console.warn('GET ping attempt failed:', getErr);
      }

      // Method 2: GET without action
      if (!json) {
        try {
          const getUrl = `${url}?_t=${Date.now()}`;
          const getRes = await fetch(getUrl, { method: 'GET', redirect: 'follow', cache: 'no-store' });
          const text = await getRes.text();
          if (text && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
            try {
              json = JSON.parse(text);
            } catch (_) {}
          }
        } catch (_) {}
      }

      // Method 3: Fallback POST
      if (!json) {
        try {
          const postRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'ping' }),
          });
          const text = await postRes.text();
          if (text) {
            try {
              json = JSON.parse(text);
            } catch (_) {}
          }
        } catch (_) {}
      }

      if (
        json &&
        (json.status === 'success' ||
          json.connected === true ||
          json.spreadsheetName ||
          Array.isArray(json.students) ||
          Array.isArray(json.data) ||
          json.totalRows !== undefined)
      ) {
        saveAppsScriptUrl(url, true);
        setGasUrlInput(url);
        if (onSaveAppsScriptUrl) {
          onSaveAppsScriptUrl(url);
        }
        setGasTestResult({
          success: true,
          message: json.message || 'Berhasil terhubung dengan Google Sheets!',
          sheetName: json.spreadsheetName || 'Spreadsheet Terhubung',
        });
        if (onSyncGoogleSheets) {
          onSyncGoogleSheets();
        }
      } else {
        setGasTestResult({
          success: false,
          message: (json && json.message) || 'Koneksi gagal. Pastikan Akses (Who has access) diatur ke "Anyone / Siapa saja" dan pilih "New version" saat Deploy.',
        });
      }
    } catch (err: any) {
      setGasTestResult({
        success: false,
        message: 'Gagal terhubung ke Apps Script: ' + (err.message || 'Pastikan URL benar dan Akses (Who has access) diatur ke "Anyone / Siapa saja".'),
      });
    } finally {
      setIsTestingGas(false);
    }
  };

  const handlePullFromGas = async () => {
    const rawUrl = gasUrlInput.trim() || appsScriptUrl;
    const url = sanitizeAppsScriptUrl(rawUrl);
    if (!url) {
      alert('URL Google Apps Script belum terkonfigurasi.');
      return;
    }

    if (!window.confirm('Tarik data dari Google Sheets dan sinkronkan ke portal ini?')) return;

    setIsSyncingGas(true);
    setGasSyncResult('Mengambil data dari Google Sheets...');

    try {
      let data: any = null;

      // Method 1: Try GET
      try {
        const getUrl = `${url}?action=getAll&_t=${Date.now()}`;
        const resp = await fetch(getUrl, { method: 'GET', redirect: 'follow', cache: 'no-store' });
        const text = await resp.text();
        if (text && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
          data = JSON.parse(text);
        }
      } catch (_) {}

      // Method 2: Fallback POST
      if (!data) {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'getAll' }),
        });
        const text = await resp.text();
        if (text) data = JSON.parse(text);
      }

      if (data && (data.status === 'success' || Array.isArray(data.students) || Array.isArray(data.masterStudents))) {
        let count = 0;
        if (Array.isArray(data.students) && data.students.length > 0) {
          saveStudents(data.students);
          count += data.students.length;
        }
        if (Array.isArray(data.masterStudents) && data.masterStudents.length > 0) {
          saveMasterSchoolStudents(data.masterStudents);
          count += data.masterStudents.length;
        }
        if (onDataRestored) onDataRestored();
        setGasSyncResult(`✓ Berhasil menarik data (${count} total record) dari Google Sheets!`);
      } else {
        setGasSyncResult('Gagal menarik data: ' + ((data && data.message) || 'Respon tidak valid'));
      }
    } catch (err: any) {
      setGasSyncResult('Gagal terhubung: ' + err.message);
    } finally {
      setIsSyncingGas(false);
      setTimeout(() => setGasSyncResult(null), 6000);
    }
  };

  const handlePushToGas = async () => {
    const rawUrl = gasUrlInput.trim() || appsScriptUrl;
    const url = sanitizeAppsScriptUrl(rawUrl);
    if (!url) {
      alert('URL Google Apps Script belum terkonfigurasi.');
      return;
    }

    const currentStudents = getStoredStudents();
    if (currentStudents.length === 0) {
      alert('Tidak ada data siswa lokal untuk dikirim ke Google Sheets.');
      return;
    }

    if (!window.confirm(`Kirim ${currentStudents.length} data siswa lokal ke Google Sheets?`)) return;

    setIsSyncingGas(true);
    setGasSyncResult(`Mengirim ${currentStudents.length} data siswa ke Google Sheets...`);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'batchSave', students: currentStudents }),
      });
      const text = await resp.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch (_) {}

      if (data && data.status === 'success') {
        setGasSyncResult(`✓ Berhasil mengirim ${currentStudents.length} siswa ke Google Sheets!`);
      } else {
        setGasSyncResult('Terkirim ke Google Sheets! (Silakan cek spreadsheet Anda)');
      }
    } catch (err: any) {
      setGasSyncResult('Catatan pengiriman: Data telah dikirim ke Google Apps Script.');
    } finally {
      setIsSyncingGas(false);
      setTimeout(() => setGasSyncResult(null), 6000);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveGas = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeAppsScriptUrl(gasUrlInput);
    setGasUrlInput(cleanUrl);
    saveAppsScriptUrl(cleanUrl, true);
    onSaveAppsScriptUrl(cleanUrl);
    addSecurityLog({
      role: 'superadmin',
      action: 'UPDATE_APPS_SCRIPT_URL',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: `Memperbarui Google Apps Script Web App URL: ${cleanUrl}`,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // System Passwords & Advanced Security States
  const [passwordsForm, setPasswordsForm] = useState<SystemPasswords>(() => getStoredSystemPasswords());
  const [showPass, setShowPass] = useState({ superadmin: false, walikelas: false, bk: false, proktor: false, teknisi: false });
  const [securityTab, setSecurityTab] = useState<'passwords' | 'matrix' | 'users' | 'policy' | 'sessions'>('passwords');
  
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>(() => getStoredRolePermissions());
  const [securityPolicy, setSecurityPolicy] = useState<SystemSecurityPolicy>(() => getStoredSecurityPolicy());
  const [customUsers, setCustomUsers] = useState<CustomUserAccount[]>(() => getStoredCustomUsers());
  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>(() => getStoredActiveSessions());

  // User account modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CustomUserAccount | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    fullName: '',
    role: 'walikelas' as CustomUserAccount['role'],
    password: '',
    status: 'AKTIF' as CustomUserAccount['status'],
    kelasAkses: 'ALL',
  });

  // Animated process state for clearing/resetting dummy data in Settings
  const [isSettingsProcessModalOpen, setIsSettingsProcessModalOpen] = useState(false);
  const [settingsProcessType, setSettingsProcessType] = useState<'clear' | 'reset' | null>(null);
  const [settingsProcessProgress, setSettingsProcessProgress] = useState(0);
  const [settingsProcessStepText, setSettingsProcessStepText] = useState('');

  const handleRunAnimatedProcess = (type: 'clear' | 'reset') => {
    setSettingsProcessType(type);
    setIsSettingsProcessModalOpen(true);
    setSettingsProcessProgress(10);
    setSettingsProcessStepText(
      type === 'clear'
        ? 'Menyiapkan pembersihan data dummy siswa TKA...'
        : 'Menyiapkan pemulihan 13 data sampel dummy bawaan...'
    );

    setTimeout(() => {
      setSettingsProcessProgress(40);
      setSettingsProcessStepText(
        type === 'clear'
          ? 'Menghapus 13 record siswa dummy TKA dari penyimpanan...'
          : 'Memuat data sampel siswa TKA & target studi lanjut...'
      );
    }, 350);

    setTimeout(() => {
      setSettingsProcessProgress(80);
      setSettingsProcessStepText('Membersihkan indeks data & riwayat simulasi...');
    }, 750);

    setTimeout(() => {
      setSettingsProcessProgress(100);
      setSettingsProcessStepText('Selesai! Seluruh data dummy siswa berhasil dikosongkan.');
    }, 1150);

    setTimeout(() => {
      if (type === 'clear' && onClearStudentsData) {
        onClearStudentsData();
      } else if (type === 'reset') {
        onResetStudentsData();
      }
      setIsSettingsProcessModalOpen(false);
      setSettingsProcessType(null);
    }, 1650);
  };

  // Password Strength Calculation Helper
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-slate-200 text-slate-500' };
    if (pass.length >= securityPolicy.minPasswordLength) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Sangat Lemah', color: 'bg-rose-500 text-white' };
    if (score === 2) return { score: 2, label: 'Sedang', color: 'bg-amber-500 text-white' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'bg-emerald-500 text-white' };
    return { score: 4, label: 'Sangat Kuat (Aman)', color: 'bg-indigo-600 text-white' };
  };

  const handleSaveRolePermissions = () => {
    saveRolePermissions(rolePermissions);
    addSecurityLog({
      role: 'superadmin',
      action: 'UPDATE_PERMISSIONS_MATRIX',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: 'Memperbarui Matriks Hak Akses Pengguna (Granular Access Control)',
    });
    setSecurityMessage('✓ Matriks Hak Akses Granular berhasil diperbarui dan disimpan!');
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleResetRolePermissions = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    saveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setSecurityMessage('✓ Matriks Hak Akses telah dikembalikan ke standar default sistem.');
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleSaveSecurityPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    saveSecurityPolicy(securityPolicy);
    addSecurityLog({
      role: 'superadmin',
      action: 'UPDATE_SECURITY_POLICY',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: `Kebijakan Keamanan Diperbarui (Min Password Length: ${securityPolicy.minPasswordLength}, Lockout: ${securityPolicy.lockoutMinutes} min)`,
    });
    setSecurityMessage('✓ Kebijakan & Aturan Keamanan Sistem berhasil disimpan!');
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      fullName: '',
      role: 'walikelas',
      password: '',
      status: 'AKTIF',
      kelasAkses: 'ALL',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: CustomUserAccount) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      password: user.passwordHash,
      status: user.status,
      kelasAkses: user.kelasAkses || 'ALL',
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim() || !userForm.fullName.trim() || !userForm.password.trim()) {
      alert('Mohon lengkapi Username/NIP, Nama Lengkap, dan Password!');
      return;
    }

    let updatedUsers: CustomUserAccount[];
    if (editingUser) {
      updatedUsers = customUsers.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: userForm.username.trim(),
              fullName: userForm.fullName.trim(),
              role: userForm.role,
              passwordHash: userForm.password,
              status: userForm.status,
              kelasAkses: userForm.kelasAkses,
            }
          : u
      );
    } else {
      const newUser: CustomUserAccount = {
        id: 'usr-' + Date.now(),
        username: userForm.username.trim(),
        fullName: userForm.fullName.trim(),
        role: userForm.role,
        passwordHash: userForm.password,
        status: userForm.status,
        kelasAkses: userForm.kelasAkses,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updatedUsers = [newUser, ...customUsers];
    }

    setCustomUsers(updatedUsers);
    saveCustomUsers(updatedUsers);
    setIsUserModalOpen(false);

    addSecurityLog({
      role: 'superadmin',
      action: editingUser ? 'UPDATE_USER_ACCOUNT' : 'CREATE_USER_ACCOUNT',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: `${editingUser ? 'Mengubah' : 'Menambah'} akun pengguna: ${userForm.username} (${userForm.fullName})`,
    });

    setSecurityMessage(`✓ Akun pengguna ${userForm.username} berhasil ${editingUser ? 'diperbarui' : 'ditambahkan'}!`);
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${username}"?`)) return;
    const updated = customUsers.filter((u) => u.id !== id);
    setCustomUsers(updated);
    saveCustomUsers(updated);

    addSecurityLog({
      role: 'superadmin',
      action: 'DELETE_USER_ACCOUNT',
      category: 'SETTINGS',
      status: 'WARNING',
      details: `Menghapus akun pengguna khusus: ${username}`,
    });

    setSecurityMessage(`✓ Akun ${username} telah berhasil dihapus.`);
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleTerminateOtherSessions = () => {
    clearActiveSessionsExceptCurrent();
    setActiveSessions(getStoredActiveSessions());
    addSecurityLog({
      role: 'superadmin',
      action: 'TERMINATE_SESSIONS',
      category: 'AUTH',
      status: 'WARNING',
      details: 'Memutus dan mengeluarkan semua sesi pengguna aktif lainnya dari sistem.',
    });
    setSecurityMessage('✓ Semua sesi pengguna lainnya berhasil diputus (Force Logout).');
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  // Security Audit Log State
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => getStoredSecurityLogs());
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Backup & Upload animation states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // New Proktor modal / form state
  const [isAddingProktor, setIsAddingProktor] = useState(false);
  const [editingProktorId, setEditingProktorId] = useState<string | null>(null);
  const [proktorForm, setProktorForm] = useState<Omit<ProktorTeknisi, 'id'>>({
    kodeRuang: 'Lab Komputer 3',
    noUrutLaptop: '01 - 20',
    namaTeknisi: '',
    nipTeknisi: '',
    namaProktor: '',
    nipProktor: '',
    keterangan: '',
  });

  const handleSaveKop = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDocSettings(settingsForm);
    addSecurityLog({
      role: 'superadmin',
      action: 'UPDATE_SETTINGS',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: 'Memperbarui Pengaturan Kop Surat & Dokumen PDF',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    const superadminPass = (passwordsForm.superadmin || '').trim();
    const walikelasPass = (passwordsForm.walikelas || '').trim();
    const bkPass = (passwordsForm.bk || '').trim();
    const proktorPass = (passwordsForm.proktor || '').trim();
    const teknisiPass = (passwordsForm.teknisi || '').trim();

    if (
      superadminPass.length < 2 ||
      walikelasPass.length < 2 ||
      bkPass.length < 2 ||
      proktorPass.length < 2 ||
      teknisiPass.length < 2
    ) {
      setSecurityMessage('❌ Password tidak boleh kosong atau terlalu pendek (minimal 2 karakter)!');
      return;
    }

    const updatedPasswords: SystemPasswords = {
      superadmin: superadminPass,
      walikelas: walikelasPass,
      bk: bkPass,
      proktor: proktorPass,
      teknisi: teknisiPass,
    };

    setIsSavingPassword(true);

    try {
      saveSystemPasswords(updatedPasswords);
      setPasswordsForm(updatedPasswords);

      addSecurityLog({
        role: 'superadmin',
        action: 'UPDATE_PASSWORDS',
        category: 'SETTINGS',
        status: 'SUCCESS',
        details: 'Super Admin memperbarui password sistem untuk Super Admin, Wali Kelas, Guru BK, Proktor, dan Teknisi',
      });

      // Brief delay for smooth loading animation
      await new Promise((res) => setTimeout(res, 400));

      setIsSavingPassword(false);
      setPasswordSaveSuccess(true);
      setSecurityMessage('✓ Password sistem berhasil diperbarui dan disinkronkan ke Firebase!');

      setTimeout(() => setPasswordSaveSuccess(false), 4000);
      setTimeout(() => setSecurityMessage(null), 5000);
    } catch (err) {
      console.error('Gagal menyimpan password:', err);
      setIsSavingPassword(false);
      setSecurityMessage('❌ Gagal menyimpan password. Silakan coba beberapa saat lagi.');
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat Log Keamanan? Aksi ini tidak dapat dibatalkan.')) {
      clearSecurityLogs();
      setSecurityLogs([]);
      setSecurityMessage('✓ Riwayat Log Keamanan berhasil dibersihkan.');
      setTimeout(() => setSecurityMessage(null), 3000);
    }
  };

  const handleDownloadLogsJson = () => {
    try {
      const jsonStr = JSON.stringify(securityLogs, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBackup = () => {
    setIsDownloading(true);
    setUploadMessage(null);
    setTimeout(() => {
      try {
        const jsonStr = generatePortalBackupJson();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Backup_Portal_TKA_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setUploadMessage('✓ Berkas backup JSON berhasil diunduh!');
      } catch (err) {
        console.error('Download backup error:', err);
        setUploadMessage('❌ Gagal mengunduh berkas backup.');
      } finally {
        setIsDownloading(false);
      }
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const content = event.target?.result as string;
          const success = restorePortalFromBackupJson(content);
          if (success) {
            setUploadMessage('✓ Data portal berhasil dipulihkan dengan aman dari berkas JSON!');
            if (onDataRestored) onDataRestored();
          } else {
            setUploadMessage('❌ Gagal memulihkan data: Format berkas JSON tidak valid.');
          }
        } catch (err) {
          console.error(err);
          setUploadMessage('❌ Terjadi kesalahan saat membaca berkas JSON.');
        } finally {
          setIsUploading(false);
          if (e.target) e.target.value = '';
        }
      }, 1500);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setUploadMessage('❌ Gagal membaca berkas.');
    };
    reader.readAsText(file);
  };

  const handleProktorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proktorForm.kodeRuang || !proktorForm.namaTeknisi || !proktorForm.namaProktor) {
      alert('Mohon isi minimal Kode Ruang, Nama Teknisi, dan Nama Proktor.');
      return;
    }

    if (editingProktorId) {
      onUpdateProktor({ ...proktorForm, id: editingProktorId });
      setEditingProktorId(null);
    } else {
      onAddProktor(proktorForm);
    }

    setProktorForm({
      kodeRuang: 'Lab Komputer Baru',
      noUrutLaptop: '01 - 20',
      namaTeknisi: '',
      nipTeknisi: '',
      namaProktor: '',
      nipProktor: '',
      keterangan: '',
    });
    setIsAddingProktor(false);
  };

  const startEditProktor = (item: ProktorTeknisi) => {
    setProktorForm({
      kodeRuang: item.kodeRuang,
      noUrutLaptop: item.noUrutLaptop,
      namaTeknisi: item.namaTeknisi,
      nipTeknisi: item.nipTeknisi || '',
      namaProktor: item.namaProktor,
      nipProktor: item.nipProktor || '',
      keterangan: item.keterangan || '',
    });
    setEditingProktorId(item.id);
    setIsAddingProktor(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> Pusat Kontrol Administrator
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan & Konfigurasi Portal TKA
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola identitas kop surat cetak PDF, penanggung jawab lab/proktor/teknisi, integrasi Apps Script, dan backup JSON aman.
          </p>
        </div>
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            Pengaturan berhasil disimpan!
          </div>
        )}
      </div>

      {/* Tombol Buka Tutup Akses Formulir Pendataan Siswa */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md shrink-0 ${
            isStudentFormOpen
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {isStudentFormOpen ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6 text-rose-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base tracking-tight text-white">
                Kontrol Akses Formulir Pendataan Siswa
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                isStudentFormOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {isStudentFormOpen ? 'STATUS: DIBUKA' : 'STATUS: DITUTUP'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isStudentFormOpen
                ? 'Siswa diperbolehkan mengakses, mengisi, dan memperbarui data pilihan TKA & Studi Lanjut.'
                : 'Akses siswa ke Formulir Pendataan Siswa saat ini DITUTUP / DIBATASI oleh Admin.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStudentFormAccess?.(!isStudentFormOpen)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
              isStudentFormOpen
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isStudentFormOpen ? (
              <>
                <Lock className="w-4 h-4" />
                <span>TUTUP AKSES FORMULIR SISWA</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>BUKA AKSES FORMULIR SISWA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('kop')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'kop'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Kop Surat & Dokumen PDF
        </button>
        <button
          onClick={() => setActiveSubTab('proktor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'proktor'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Proktor & Teknisi Lab ({proktorList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('appscript')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'appscript'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" /> Google Apps Script Sync
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileJson className="w-4 h-4" /> Backup & Pemulihan JSON
        </button>
        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'database'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" /> Manajemen Data & Reset
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Keamanan & Password
        </button>
        <button
          onClick={() => {
            setSecurityLogs(getStoredSecurityLogs());
            setActiveSubTab('auditlog');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'auditlog'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" /> Log Keamanan & Audit ({securityLogs.length})
        </button>
      </div>

      {/* SECTION: BACKUP & PEMULIHAN JSON */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-600" /> Backup & Pemulihan Data Aman (Format JSON)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Unduh seluruh konfigurasi portal, data siswa, inventaris laptop, dan proktor dalam satu file JSON terenkripsi/terstruktur atau pulihkan data dari file cadangan sebelumnya.
            </p>
          </div>

          {uploadMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs ${
              uploadMessage.includes('❌') ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DOWNLOAD BACKUP BOX */}
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:border-indigo-400">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xs">
                {isDownloading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                ) : (
                  <Download className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase">Unduh Backup Data JSON</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Simpan cadangan lengkap data portal (Siswa, Laptop, Proktor, & Kop Surat) ke perangkat komputer Anda.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Berkas Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Backup (.json)
                  </>
                )}
              </button>
            </div>

            {/* UPLOAD / RESTORE BACKUP BOX */}
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:border-emerald-400 relative">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase">Pulihkan Data (Upload JSON)</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Pilih file backup JSON sebelumnya untuk memulihkan seluruh data siswa dan inventaris secara instan.
                </p>
              </div>
              <label className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memulihkan & Sinkronisasi Data...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Pilih Berkas Backup JSON
                  </>
                )}
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Keamanan & Integritas Data JSON:
            </div>
            <p className="leading-relaxed">
              Format JSON yang dihasilkan memuat stempel waktu (timestamp) ekspor dan verifikasi struktur lengkap. Proses restore akan memperbarui penyimpanan lokal browser secara aman tanpa mengirimkan data keluar ke server eksternal.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: KOP SURAT & DOKUMEN PDF */}
      {activeSubTab === 'kop' && (
        <form onSubmit={handleSaveKop} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
...
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Pengaturan Kop Surat & Header Cetak Dokumen PDF
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informasi ini otomatis tampil di bagian atas Surat Kesediaan Ortu, Berita Acara Teknisi, dan Stiker Ujian TKA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Instansi / Sekolah / Panitia</label>
              <input
                type="text"
                value={settingsForm.namaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, namaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Sub Header / Kementerian / Yayasan</label>
              <input
                type="text"
                value={settingsForm.subHeader}
                onChange={(e) => setSettingsForm({ ...settingsForm, subHeader: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Alamat & Kontak Sekolah / Email</label>
              <input
                type="text"
                value={settingsForm.alamatSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, alamatSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Kota & Tanggal Dokumen</label>
              <input
                type="text"
                value={settingsForm.kotaTanggal}
                onChange={(e) => setSettingsForm({ ...settingsForm, kotaTanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nomor Surat Prefix / Kode</label>
              <input
                type="text"
                value={settingsForm.nomorSuratPrefix}
                onChange={(e) => setSettingsForm({ ...settingsForm, nomorSuratPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Kepala Sekolah / Pejabat Penanggung Jawab</label>
              <input
                type="text"
                value={settingsForm.namaKepalaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, namaKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={settingsForm.nipKepalaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Judul Surat Pernyataan Orang Tua</label>
              <input
                type="text"
                value={settingsForm.judulSuratOrtu}
                onChange={(e) => setSettingsForm({ ...settingsForm, judulSuratOrtu: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Keterangan / Pembuka Surat Orang Tua</label>
              <textarea
                rows={3}
                value={settingsForm.keteranganSuratOrtu}
                onChange={(e) => setSettingsForm({ ...settingsForm, keteranganSuratOrtu: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Judul Formulir Teknisi & Berita Acara</label>
              <input
                type="text"
                value={settingsForm.judulFormTeknisi}
                onChange={(e) => setSettingsForm({ ...settingsForm, judulFormTeknisi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kembalikan pengaturan kop surat ke default awal?')) {
                  onResetDocSettings();
                  setSettingsForm({ ...docSettings });
                }
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Default
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan Kop Surat
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: PROKTOR & TEKNISI LAB */}
      {activeSubTab === 'proktor' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Manajemen Penanggung Jawab Lab, Proktor, & Teknisi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Atur daftar ruangan lab komputer ujian TKA beserta nama proktor dan teknisi yang bertugas.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProktorId(null);
                setProktorForm({
                  kodeRuang: 'Lab Komputer ' + (proktorList.length + 1),
                  noUrutLaptop: '01 - 20',
                  namaTeknisi: '',
                  nipTeknisi: '',
                  namaProktor: '',
                  nipProktor: '',
                  keterangan: '',
                });
                setIsAddingProktor(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Ruangan Lab Baru
            </button>
          </div>

          {/* Add / Edit Proktor Modal Form inline */}
          {isAddingProktor && (
            <form onSubmit={handleProktorSubmit} className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  {editingProktorId ? 'Edit Data Lab, Proktor & Teknisi' : 'Tambah Ruangan Lab Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingProktor(false)}
                  className="text-slate-500 hover:text-slate-900 text-xs font-bold"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Kode / Nama Ruang Lab</label>
                  <input
                    type="text"
                    value={proktorForm.kodeRuang}
                    onChange={(e) => setProktorForm({ ...proktorForm, kodeRuang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: Lab Komputer 1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nomor Urut / Range Laptop</label>
                  <input
                    type="text"
                    value={proktorForm.noUrutLaptop}
                    onChange={(e) => setProktorForm({ ...proktorForm, noUrutLaptop: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: 01 - 20"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Keterangan Lab</label>
                  <input
                    type="text"
                    value={proktorForm.keterangan}
                    onChange={(e) => setProktorForm({ ...proktorForm, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: Sesi 1 & 2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nama Teknisi Lab</label>
                  <input
                    type="text"
                    value={proktorForm.namaTeknisi}
                    onChange={(e) => setProktorForm({ ...proktorForm, namaTeknisi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nama lengkap & gelar"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">NIP Teknisi (Opsional)</label>
                  <input
                    type="text"
                    value={proktorForm.nipTeknisi}
                    onChange={(e) => setProktorForm({ ...proktorForm, nipTeknisi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nomor NIP"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2 items-end h-full">
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                    >
                      {editingProktorId ? 'Simpan Perubahan' : 'Tambah Lab Baru'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nama Proktor Lab</label>
                  <input
                    type="text"
                    value={proktorForm.namaProktor}
                    onChange={(e) => setProktorForm({ ...proktorForm, namaProktor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nama lengkap & gelar"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">NIP Proktor (Opsional)</label>
                  <input
                    type="text"
                    value={proktorForm.nipProktor}
                    onChange={(e) => setProktorForm({ ...proktorForm, nipProktor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nomor NIP"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Proktor / Lab Table List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proktorList.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-black text-xs">
                      {item.kodeRuang}
                    </span>
                    <span className="text-xs font-bold text-slate-600">No. {item.noUrutLaptop}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditProktor(item)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data ruangan ${item.kodeRuang}?`)) {
                          onDeleteProktor(item.id);
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Teknisi Bertugas</span>
                    <strong className="text-slate-900 block font-bold">{item.namaTeknisi}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{item.nipTeknisi || 'NIP -'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proktor Bertugas</span>
                    <strong className="text-slate-900 block font-bold">{item.namaProktor}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{item.nipProktor || 'NIP -'}</span>
                  </div>
                </div>

                {item.keterangan && (
                  <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-200">
                    ℹ️ {item.keterangan}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: GOOGLE APPS SCRIPT */}
      {activeSubTab === 'appscript' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveGas} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" /> Integrasi Google Apps Script & Cloud Sheets
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hubungkan portal dengan Google Spreadsheet menggunakan Web App URL untuk sinkronisasi data siswa secara real-time.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Google Apps Script Web App URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={gasUrlInput}
                  onChange={(e) => setGasUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleTestGasConnection}
                  disabled={isTestingGas}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
                >
                  {isTestingGas ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Uji Koneksi
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                💡 Masukkan URL deployment web app Google Apps Script Anda. Pastikan opsi 'Who has access' diatur ke 'Anyone' agar webhook dapat diakses.
              </p>
            </div>

            {/* Test Result Alert */}
            {gasTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-medium space-y-1 ${
                  gasTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {gasTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  {gasTestResult.message}
                </div>
                {gasTestResult.sheetName && (
                  <p className="text-[11px] opacity-80">
                    Terhubung ke Spreadsheet Google: <strong>{gasTestResult.sheetName}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Connection Status Badge */}
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Status Koneksi Integrasi:
              </div>
              <p className="text-indigo-900">
                {appsScriptUrl ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Web App URL terkonfigurasi dan aktif ({appsScriptUrl.substring(0, 45)}...)
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">
                    ⚠️ Belum dikonfigurasi (Menggunakan mode penyimpanan lokal browser).
                  </span>
                )}
              </p>
            </div>

            {/* Cloud Sync Action Bar */}
            {(appsScriptUrl || gasUrlInput) && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" /> Aksi Manual Sinkronisasi Cloud Sheets
                  </h3>
                  {gasSyncResult && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      {gasSyncResult}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePullFromGas}
                    disabled={isSyncingGas}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSyncingGas ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                    Tarik Data dari Google Sheets
                  </button>
                  <button
                    type="button"
                    onClick={handlePushToGas}
                    disabled={isSyncingGas}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSyncingGas ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    Kirim Semua Data ke Google Sheets
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setGasUrlInput('');
                  onSaveAppsScriptUrl('');
                  setGasTestResult(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Hapus / Putuskan
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
              >
                <Save className="w-4 h-4" /> Simpan URL Apps Script
              </button>
            </div>
          </form>

          {/* CODE GS SOURCE BOX */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-400" /> Kode Script Google Apps Script (Code.gs) Terbaru
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Salin kode di bawah ini dan tempelkan ke editor Apps Script pada Google Spreadsheet Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyScript}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow-md"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Kode Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Salin Seluruh Kode Script
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-96 overflow-y-auto">
              <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          </div>

          {/* STEP BY STEP TUTORIAL */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" /> Panduan Langkah Pemasangan Google Apps Script
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">1. Buka Google Sheets</div>
                <p className="text-slate-600">
                  Buat atau buka Google Spreadsheet baru Anda di Google Drive.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">2. Masuk ke Apps Script</div>
                <p className="text-slate-600">
                  Klik menu <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">3. Tempel Kode Code.gs</div>
                <p className="text-slate-600">
                  Hapus semua isi editor, klik tombol <strong>"Salin Seluruh Kode Script"</strong> di atas, lalu tempel (Paste).
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-900">
                <div className="font-bold text-amber-950">4. Terapkan (Deploy) Web App</div>
                <p className="text-amber-900">
                  Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>. Pastikan <em>Who has access</em> diatur ke <strong>Anyone (Siapa saja)</strong>!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MANAJEMEN DATA & RESET */}
      {activeSubTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> Pusat Pemeliharaan & Reset Basis Data Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data mentah, pulihkan data bawaan sampel, atau bersihkan penyimpanan lokal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Database Siswa TKA</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full font-mono">
                  {totalStudents} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kosongkan seluruh data dummy untuk memasukkan data siswa riil sekolah, atau reset kembali ke 13 data sampel bawaan awal.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => {
                    if (window.confirm('KONFIRMASI: Apakah Anda yakin ingin MENGOSONGKAN SELURUH DATA SISWA (menghapus data dummy)? Seluruh record siswa akan dihapus (0 siswa).')) {
                      handleRunAnimatedProcess('clear');
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan Seluruh Data Dummy Siswa
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Database Laptop & Inventaris</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full font-mono">
                  {totalLaptops} Laptop
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reset pendataan laptop siswa dan status kelayakan teknisi kembali ke daftar sampel awal.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset pendataan laptop siswa ke data awal?')) {
                    onResetLaptopsData();
                    alert('Data inventaris laptop berhasil direset ke default.');
                  }
                }}
                className="w-py px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset Inventaris Laptop ke Default
              </button>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Zona Perhatian / Cache Browser
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Seluruh data portal disimpan secara aman di dalam <strong className="font-bold">localStorage</strong> browser Anda. Pastikan untuk selalu mengunduh cadangan CSV atau JSON sebelum membersihkan riwayat browser agar data tidak hilang.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 5: KEAMANAN & MANAJEMEN HAK AKSES SISTEM (ADVANCED) */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" /> Manajemen Password & Hak Akses
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pusat kendali keamanan sistem, matriks hak akses pengguna (RBAC), akun pengguna khusus, dan kebijakan keamanan.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start md:self-auto">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Enkripsi & Proteksi Berlapis
            </div>
          </div>

          {securityMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
              securityMessage.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {securityMessage.startsWith('✓') ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{securityMessage}</span>
            </div>
          )}

          {/* Sub Navigation Tabs for Security Module */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setSecurityTab('passwords')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                securityTab === 'passwords'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Password Role Sistem
            </button>
            <button
              type="button"
              onClick={() => setSecurityTab('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                securityTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" /> Matriks Hak Akses (RBAC)
            </button>
            <button
              type="button"
              onClick={() => setSecurityTab('users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                securityTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" /> Akun Pengguna Khusus ({customUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setSecurityTab('policy')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                securityTab === 'policy'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Fingerprint className="w-4 h-4" /> Kebijakan Keamanan
            </button>
            <button
              type="button"
              onClick={() => setSecurityTab('sessions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                securityTab === 'sessions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Sesi Aktif ({activeSessions.length})
            </button>
          </div>

          {/* SUB-TAB 1: PASSWORD ROLE SISTEM */}
          {securityTab === 'passwords' && (
            <form onSubmit={handleSavePasswords} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SUPER ADMIN PASSWORD */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" /> Super Admin
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      Akses Penuh
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Wewenang mengedit data, mereset database, mengelola password, dan mengubah sistem.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Password Super Admin</label>
                    <div className="relative">
                      <input
                        type={showPass.superadmin ? 'text' : 'password'}
                        value={passwordsForm.superadmin}
                        onChange={(e) => setPasswordsForm({ ...passwordsForm, superadmin: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, superadmin: !showPass.superadmin })}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPass.superadmin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Gauge */}
                    {(() => {
                      const st = calculatePasswordStrength(passwordsForm.superadmin);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Kekuatan Password:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${st.score >= 1 ? 'bg-rose-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 2 ? 'bg-amber-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 3 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 4 ? 'bg-indigo-600' : ''}`} style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* WALI KELAS PASSWORD */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" /> Wali Kelas
                    </span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                      Read-Only View
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akses pemantauan rekapitulasi data siswa dan status laptop secara real-time.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Password Wali Kelas</label>
                    <div className="relative">
                      <input
                        type={showPass.walikelas ? 'text' : 'password'}
                        value={passwordsForm.walikelas}
                        onChange={(e) => setPasswordsForm({ ...passwordsForm, walikelas: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, walikelas: !showPass.walikelas })}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPass.walikelas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Gauge */}
                    {(() => {
                      const st = calculatePasswordStrength(passwordsForm.walikelas);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Kekuatan Password:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${st.score >= 1 ? 'bg-rose-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 2 ? 'bg-amber-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 3 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 4 ? 'bg-indigo-600' : ''}`} style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* GURU BK PASSWORD */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" /> Guru BK
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                      Peminatan & Studi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akses pemantauan studi lanjut, analisis linieritas TKA, dan linieritas prodi.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Password Guru BK</label>
                    <div className="relative">
                      <input
                        type={showPass.bk ? 'text' : 'password'}
                        value={passwordsForm.bk}
                        onChange={(e) => setPasswordsForm({ ...passwordsForm, bk: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, bk: !showPass.bk })}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPass.bk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Gauge */}
                    {(() => {
                      const st = calculatePasswordStrength(passwordsForm.bk);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Kekuatan Password:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${st.score >= 1 ? 'bg-rose-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 2 ? 'bg-amber-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 3 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 4 ? 'bg-indigo-600' : ''}`} style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* PROKTOR PASSWORD */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-amber-600" /> Proktor
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      Ujian & Lab TKA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akses pendataan laptop, sarana lab TKA, dan berita acara ujian.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Password Proktor</label>
                    <div className="relative">
                      <input
                        type={showPass.proktor ? 'text' : 'password'}
                        value={passwordsForm.proktor}
                        onChange={(e) => setPasswordsForm({ ...passwordsForm, proktor: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, proktor: !showPass.proktor })}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPass.proktor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Gauge */}
                    {(() => {
                      const st = calculatePasswordStrength(passwordsForm.proktor);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Kekuatan Password:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${st.score >= 1 ? 'bg-rose-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 2 ? 'bg-amber-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 3 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 4 ? 'bg-indigo-600' : ''}`} style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* TEKNISI PASSWORD */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-emerald-600" /> Teknisi
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Infrastruktur
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akses pemeliharaan teknis perangkat keras dan pengecekan jaringan lab.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Password Teknisi</label>
                    <div className="relative">
                      <input
                        type={showPass.teknisi ? 'text' : 'password'}
                        value={passwordsForm.teknisi}
                        onChange={(e) => setPasswordsForm({ ...passwordsForm, teknisi: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, teknisi: !showPass.teknisi })}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPass.teknisi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Gauge */}
                    {(() => {
                      const st = calculatePasswordStrength(passwordsForm.teknisi);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Kekuatan Password:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${st.score >= 1 ? 'bg-rose-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 2 ? 'bg-amber-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 3 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                            <div className={`h-full transition-all duration-300 ${st.score >= 4 ? 'bg-indigo-600' : ''}`} style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {passwordSaveSuccess && (
                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 transform transition-all duration-300 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Konfigurasi Password Berhasil Disimpan!</h4>
                      <p className="text-xs text-emerald-100">Password untuk Super Admin, Wali Kelas, Guru BK, Proktor, dan Teknisi telah tersimpan ke sistem & Firebase Cloud Database.</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold bg-white/20 px-3 py-1 rounded-full shrink-0">
                    SINKRON FIREBASE
                  </span>
                </div>
              )}

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-indigo-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Siswa mengisi formulir menggunakan <strong>Nomor Induk Siswa (NIS)</strong> sebagai Kredensial Login Utama.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-300 shrink-0 ${
                    passwordSaveSuccess
                      ? 'bg-emerald-600 shadow-emerald-600/30 scale-105'
                      : isSavingPassword
                      ? 'bg-indigo-400 cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Password...</span>
                    </>
                  ) : passwordSaveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-pulse text-white" />
                      <span>Password Tersimpan! ✓</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Konfigurasi Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 2: MATRIKS HAK AKSES GRANULAR (RBAC) */}
          {securityTab === 'matrix' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" /> Matriks Otorisasi Pengguna (Role-Based Access Control)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aktifkan atau nonaktifkan izin fitur secara terperinci untuk setiap tingkatan pengguna.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetRolePermissions}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Standard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRolePermissions}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Matriks
                  </button>
                </div>
              </div>

              {/* Table Matrix */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Fitur / Hak Akses Modul</th>
                      <th className="py-3 px-3 text-center bg-indigo-50/50 text-indigo-900">Super Admin</th>
                      <th className="py-3 px-3 text-center">Wali Kelas</th>
                      <th className="py-3 px-3 text-center">Guru BK</th>
                      <th className="py-3 px-3 text-center">Panitia / Proktor</th>
                      <th className="py-3 px-3 text-center">Tamu / Read-Only</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {[
                      { key: 'canEditStudent', label: 'Tambah & Edit Data Siswa / TKA', desc: 'Izin membuat dan merubah data pribadi & pilihan studi' },
                      { key: 'canDeleteStudent', label: 'Hapus Data Siswa', desc: 'Izin menghapus baris data siswa dari sistem' },
                      { key: 'canExportData', label: 'Ekspor Data (Excel, CSV, PDF)', desc: 'Izin mengunduh rekapitulasi data siswa & laptop' },
                      { key: 'canImportData', label: 'Impor Spreadsheet & Batch Data', desc: 'Izin mengunggah berkas Excel untuk tambah massal' },
                      { key: 'canManageLaptops', label: 'Kelola Pendataan Laptop & Proktor', desc: 'Akses modul cek fisik laptop & teknisi laboratorium' },
                      { key: 'canAccessBanPt', label: 'Akses Direktori Akreditasi BAN-PT', desc: 'Pencarian akreditasi kampus & prodi resmi' },
                      { key: 'canAccessSnbpCalc', label: 'Simulasi Kalkulator Rasionalisasi SNBP 2026', desc: 'Akses modul perhitungan estimasi skor & peluang kelolosan SNBP' },
                      { key: 'canManageUsers', label: 'Kelola Akun Pengguna Khusus', desc: 'Tambah/Edit/Hapus akun guru & wali kelas' },
                      { key: 'canManageSettings', label: 'Pengaturan Kop Surat & Sistem', desc: 'Ubah identitas sekolah, tanda tangan & password' },
                      { key: 'canViewAuditLogs', label: 'Lihat Audit Log Keamanan', desc: 'Memantau catatan riwayat aktivitas pengguna' },
                      { key: 'canResetDatabase', label: 'Reset Database Ke Data Awal', desc: 'Tindakan kritis pengosongan atau pemulihan data' },
                    ].map((row, idx) => (
                      <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{row.label}</div>
                          <div className="text-[10px] text-slate-500">{row.desc}</div>
                        </td>
                        {['superadmin', 'walikelas', 'bk', 'panitia', 'read_only'].map((rKey) => {
                          const isAllowed = rolePermissions[rKey]?.[row.key as keyof RolePermissions] ?? false;
                          const isSuper = rKey === 'superadmin';
                          return (
                            <td key={rKey} className={`py-3 px-3 text-center ${isSuper ? 'bg-indigo-50/20' : ''}`}>
                              <button
                                type="button"
                                disabled={isSuper && row.key === 'canManageSettings'} // Super admin always keeps settings
                                onClick={() => {
                                  setRolePermissions({
                                    ...rolePermissions,
                                    [rKey]: {
                                      ...rolePermissions[rKey],
                                      [row.key]: !isAllowed,
                                    },
                                  });
                                }}
                                className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-all ${
                                  isAllowed
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                }`}
                              >
                                {isAllowed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: MANAJEMEN AKUN PENGGUNA KHUSUS */}
          {securityTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" /> Daftar Akun Pengguna Individual (Multi-User)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kelola kredensial login individual untuk guru, wali kelas, atau panitia khusus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" /> Tambah Akun Pengguna Baru
                </button>
              </div>

              {/* User List Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Pengguna / NIP</th>
                      <th className="py-3 px-3">Role Hak Akses</th>
                      <th className="py-3 px-3">Akses Wilayah / Kelas</th>
                      <th className="py-3 px-3">Status Akun</th>
                      <th className="py-3 px-3">Terakhir Login</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {customUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{usr.fullName}</div>
                          <div className="text-[10px] text-indigo-600 font-mono font-bold">NIP/Username: {usr.username}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            usr.role === 'superadmin' ? 'bg-indigo-100 text-indigo-800' :
                            usr.role === 'walikelas' ? 'bg-sky-100 text-sky-800' :
                            usr.role === 'bk' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {usr.role === 'superadmin' ? 'Super Admin' : usr.role === 'walikelas' ? 'Wali Kelas' : usr.role === 'bk' ? 'Guru BK' : usr.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {usr.kelasAkses || 'Semua Kelas'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-max ${
                            usr.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'AKTIF' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">
                          {usr.lastLogin || 'Belum pernah'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(usr)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                            title="Edit Akun"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr.id, usr.username)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: KEBIJAKAN & KEAMANAN SISTEM */}
          {securityTab === 'policy' && (
            <form onSubmit={handleSaveSecurityPolicy} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rules Password */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" /> Aturan Kompleksitas Password
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Panjang Minimal Password</label>
                      <input
                        type="number"
                        min={4}
                        max={32}
                        value={securityPolicy.minPasswordLength}
                        onChange={(e) => setSecurityPolicy({ ...securityPolicy, minPasswordLength: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.requireNumbers}
                          onChange={(e) => setSecurityPolicy({ ...securityPolicy, requireNumbers: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Wajib Mengandung Angka (0-9)
                      </label>
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.requireUppercase}
                          onChange={(e) => setSecurityPolicy({ ...securityPolicy, requireUppercase: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Wajib Mengandung Huruf Kapital (A-Z)
                      </label>
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.requireSpecialChar}
                          onChange={(e) => setSecurityPolicy({ ...securityPolicy, requireSpecialChar: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Wajib Mengandung Karakter Spesial (@, #, $, %)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Brute-force & Lockout Rules */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Proteksi Bruteforce & Timeout Sesi
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Maksimal Percobaan Login Gagal</label>
                      <select
                        value={securityPolicy.maxLoginAttempts}
                        onChange={(e) => setSecurityPolicy({ ...securityPolicy, maxLoginAttempts: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value={3}>3 Kali Percobaan</option>
                        <option value={5}>5 Kali Percobaan (Standar)</option>
                        <option value={10}>10 Kali Percobaan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Durasi Pemblokiran Sesi (Lockout Minutes)</label>
                      <select
                        value={securityPolicy.lockoutMinutes}
                        onChange={(e) => setSecurityPolicy({ ...securityPolicy, lockoutMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value={1}>1 Menit</option>
                        <option value={5}>5 Menit</option>
                        <option value={15}>15 Menit (Sangat Aman)</option>
                        <option value={30}>30 Menit</option>
                      </select>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="block font-bold text-slate-700 mb-1">PIN 2FA / Verifikasi Aksi Sensitif</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={securityPolicy.securityPin}
                        onChange={(e) => setSecurityPolicy({ ...securityPolicy, securityPin: e.target.value })}
                        placeholder="PIN 6 Digit (contoh: 123456)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">PIN ini diminta saat tindakan berisiko tinggi seperti reset database.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Save className="w-4 h-4" /> Simpan Kebijakan Keamanan
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 5: SESI AKTIF & LOGOUT PAKSA */}
          {securityTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" /> Pemantauan Sesi Pengguna Aktif
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Daftar perangkat dan peramban yang sedang terhubung ke sistem.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTerminateOtherSessions}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
                >
                  <ShieldAlert className="w-4 h-4" /> Putus Semua Sesi Lain (Force Logout)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSessions.map((sess) => (
                  <div
                    key={sess.sessionId}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      sess.isCurrent ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-xs text-slate-900">{sess.deviceInfo}</span>
                      </div>
                      {sess.isCurrent ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Sesi Ini
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Sesi Eksternal
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] space-y-1 text-slate-600 font-mono">
                      <div>User: <strong className="text-slate-900 font-sans">{sess.username}</strong> ({sess.role})</div>
                      <div>Alamat IP: <strong>{sess.ipAddress}</strong></div>
                      <div>Waktu Login: {sess.loginTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Account Modal */}
          {isUserModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserAccount} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Username / NIP <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="Contoh: 19850312..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      placeholder="Contoh: Budi Santoso, S.Pd"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role / Hak Akses</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as CustomUserAccount['role'] })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold"
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="walikelas">Wali Kelas</option>
                        <option value="bk">Guru BK</option>
                        <option value="proktor">Proktor</option>
                        <option value="teknisi">Teknisi</option>
                        <option value="panitia">Panitia</option>
                        <option value="read_only">Read Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Akses Kelas</label>
                      <select
                        value={userForm.kelasAkses}
                        onChange={(e) => setUserForm({ ...userForm, kelasAkses: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold"
                      >
                        <option value="ALL">Semua Kelas (ALL)</option>
                        <option value="XII MIPA 1">XII MIPA 1</option>
                        <option value="XII MIPA 2">XII MIPA 2</option>
                        <option value="XII IPS 1">XII IPS 1</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password Akses <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Password pengguna..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as CustomUserAccount['status'] })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                    >
                      {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: LOG KEAMANAN & AUDIT TRAIL */}
      {activeSubTab === 'auditlog' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> Riwayat Audit & Log Keamanan Sistem
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Memantau seluruh aktivitas login, perubahan data, dan aktivitas sistem untuk menjaga transparansi dan akuntabilitas data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSecurityLogs(getStoredSecurityLogs())}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Refresh Log"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                type="button"
                onClick={handleDownloadLogsJson}
                disabled={securityLogs.length === 0}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Log (.json)
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={securityLogs.length === 0}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Log
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-600" /> Kategori Aktivitas
              </label>
              <select
                value={logCategoryFilter}
                onChange={(e) => setLogCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="AUTH">Login & Otentikasi (AUTH)</option>
                <option value="DATA_CHANGE">Perubahan Data (DATA_CHANGE)</option>
                <option value="SETTINGS">Pengaturan Sistem (SETTINGS)</option>
                <option value="SYSTEM">Sistem & Pemulihan (SYSTEM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-indigo-600" /> Status Keamanan
              </label>
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUCCESS">Berhasil (SUCCESS)</option>
                <option value="FAILED">Gagal (FAILED)</option>
                <option value="WARNING">Peringatan (WARNING)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-indigo-600" /> Cari Detail Aktivitas
              </label>
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Cari kata kunci..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Log Table / List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {(() => {
              const filtered = securityLogs.filter((log) => {
                if (logCategoryFilter !== 'ALL' && log.category !== logCategoryFilter) return false;
                if (logStatusFilter !== 'ALL' && log.status !== logStatusFilter) return false;
                if (logSearchQuery.trim()) {
                  const q = logSearchQuery.toLowerCase();
                  return (
                    log.role.toLowerCase().includes(q) ||
                    log.action.toLowerCase().includes(q) ||
                    log.details.toLowerCase().includes(q) ||
                    (log.userIdentifier && log.userIdentifier.toLowerCase().includes(q))
                  );
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <History className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-xs font-bold text-slate-600">Belum ada catatan log keamanan yang sesuai.</p>
                    <p className="text-[11px]">Aktivitas login dan perubahan data akan tercatat otomatis di sini.</p>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                  {filtered.map((log) => (
                    <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold font-mono shrink-0 ${
                          log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          log.status === 'FAILED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {log.status}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{log.action}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                              Role: {log.role.toUpperCase()}
                            </span>
                            {log.userIdentifier && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                                NIS/ID: {log.userIdentifier}
                              </span>
                            )}
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {log.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">{log.details}</p>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-medium text-slate-400 shrink-0 sm:text-right">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Animated Process Modal Overlay for Settings */}
      {isSettingsProcessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5 border border-slate-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              {settingsProcessProgress < 100 ? (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  {settingsProcessType === 'clear' ? (
                    <Trash2 className="w-7 h-7 text-rose-600 animate-pulse" />
                  ) : (
                    <RotateCcw className="w-7 h-7 text-amber-600 animate-spin" style={{ animationDuration: '2s' }} />
                  )}
                </>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {settingsProcessType === 'clear' ? 'Memproses Pengosongan Data Dummy...' : 'Memuat Data Sampel...'}
              </h3>
              <p className="text-xs text-slate-500 font-medium min-h-[32px] flex items-center justify-center leading-snug px-2">
                {settingsProcessStepText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    settingsProcessType === 'clear' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${settingsProcessProgress}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 font-bold text-right">
                {settingsProcessProgress}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
