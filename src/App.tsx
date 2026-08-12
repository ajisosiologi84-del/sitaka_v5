import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab, Student, LaptopData, ProktorTeknisi, DocumentSettings, UserRole, MasterSchoolStudent } from './types';
import {
  getStoredStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  deleteMultipleStudents,
  resetToDefaultData,
  clearAllStudentsData,
  getAppsScriptUrl,
  saveAppsScriptUrl,
  getStoredLaptops,
  addLaptop,
  updateLaptop,
  deleteLaptop,
  resetLaptopsData,
  getStoredProktorTeknisi,
  addProktorTeknisi,
  updateProktorTeknisi,
  deleteProktorTeknisi,
  getStoredDocSettings,
  saveDocSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  addSecurityLog,
  saveStudents,
  saveLaptops,
  saveProktorTeknisi,
  saveSystemPasswords,
  saveCustomUsers,
  saveRolePermissions,
  saveSecurityPolicy,
  getStoredStudentFormAccess,
  saveStudentFormAccess,
  isExcludedStudentName,
  getStoredMasterSchoolStudents,
  saveMasterSchoolStudents,
} from './utils/storage';
import { formatNisn } from './utils/sanitizer';
import {
  subscribeStudentsFromFirestore,
  subscribeLaptopsFromFirestore,
  syncStudentToFirestore,
  deleteStudentFromFirestore,
  fetchSystemSettingsFromFirestore,
  subscribeSystemSettingFromFirestore,
  subscribeMasterSchoolStudentsFromFirestore,
} from './firebase';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentList } from './components/StudentList';
import { SchoolDataView } from './components/SchoolDataView';
import { StudentFormView } from './components/StudentFormView';
import { TkaAnalysisView } from './components/TkaAnalysisView';
import { AppsScriptView } from './components/AppsScriptView';
import { LaptopInventoryView } from './components/LaptopInventoryView';
import { SettingsView } from './components/SettingsView';
import { BanPtDirectoryView } from './components/BanPtDirectoryView';
import { MapelPilihanView } from './components/MapelPilihanView';
import { SnbpCalculatorView } from './components/SnbpCalculatorView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LoginModal } from './components/LoginModal';
import { RbacMatrixModal } from './components/RbacMatrixModal';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('tka_user_role_v1');
      return (saved as UserRole) || null;
    } catch (_) {
      return null;
    }
  });
  const [currentUserNis, setCurrentUserNis] = useState<string | null>(() => {
    try {
      return localStorage.getItem('tka_user_nis_v1') || null;
    } catch (_) {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [masterSchoolStudents, setMasterSchoolStudents] = useState<MasterSchoolStudent[]>(getStoredMasterSchoolStudents);
  const [laptops, setLaptops] = useState<LaptopData[]>([]);
  const [proktorList, setProktorList] = useState<ProktorTeknisi[]>([]);
  const [docSettings, setDocSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sitaka_sidebar_minimized_v1') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [isStudentFormOpen, setIsStudentFormOpen] = useState<boolean>(() => getStoredStudentFormAccess());
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [pendingBanPtSelection, setPendingBanPtSelection] = useState<{
    targetChoice: 'pilihan1' | 'pilihan2';
    ptn: string;
    prodi: string;
    akreditasi?: string;
  } | null>(null);

  const syncFromGoogleSheets = async (urlOverride?: string): Promise<boolean> => {
    const url = urlOverride || appsScriptUrl || getAppsScriptUrl();
    if (!url) return false;

    try {
      let json: any = null;
      try {
        // Try POST with action 'getAll' first (most compatible across browser CORS modes)
        const postRes = await fetch(url.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'getAll' }),
        });
        json = await postRes.json();
      } catch (postErr) {
        // Fallback to GET request
        const getRes = await fetch(url.trim(), { method: 'GET' });
        json = await getRes.json();
      }

      if (json && json.status === 'success') {
        if (json.laptops && Array.isArray(json.laptops)) {
          saveLaptops(json.laptops, false);
          setLaptops(json.laptops);
        }
        if (json.proktorList && Array.isArray(json.proktorList)) {
          saveProktorTeknisi(json.proktorList, false);
          setProktorList(json.proktorList);
        }
        if (json.masterStudents && Array.isArray(json.masterStudents)) {
          const cleanMaster = json.masterStudents.map((ms: any) => ({
            ...ms,
            nis: ms.nis ? String(ms.nis).replace(/^'/, '').trim() : '',
            nisn: formatNisn(ms.nisn),
          }));
          saveMasterSchoolStudents(cleanMaster, false);
          setMasterSchoolStudents(cleanMaster);
        }
        const studentData = json.students || json.data;
        if (studentData && Array.isArray(studentData)) {
          const cleanStudents = studentData
            .filter(
              (s: any) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101'
            )
            .map((s: any) => ({
              ...s,
              nis: s.nis ? String(s.nis).replace(/^'/, '').trim() : '',
              nisn: formatNisn(s.nisn),
            }));
          saveStudents(cleanStudents);
          setStudents(cleanStudents);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Sync from Google Sheets error:', err);
      return false;
    }
  };

  // Initial load & Realtime Sync across ALL devices & Auto Sync Google Sheets
  useEffect(() => {
    const localList = getStoredStudents();
    setStudents(localList);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    const gasUrl = getAppsScriptUrl();
    setAppsScriptUrl(gasUrl);
    if (gasUrl) {
      syncFromGoogleSheets(gasUrl);
    }

    // Initial fetch of system settings from Firebase Firestore
    fetchSystemSettingsFromFirestore('passwords').then((remotePass) => {
      if (remotePass) saveSystemPasswords(remotePass, false);
    });
    fetchSystemSettingsFromFirestore('customUsers').then((remoteUsers) => {
      if (remoteUsers) saveCustomUsers(remoteUsers, false);
    });
    fetchSystemSettingsFromFirestore('rolePermissions').then((remoteMatrix) => {
      if (remoteMatrix) saveRolePermissions(remoteMatrix, false);
    });
    fetchSystemSettingsFromFirestore('securityPolicy').then((remotePolicy) => {
      if (remotePolicy) saveSecurityPolicy(remotePolicy, false);
    });
    fetchSystemSettingsFromFirestore('appsScriptUrl').then((remoteGasUrl) => {
      if (typeof remoteGasUrl === 'string' && remoteGasUrl.trim()) {
        const cleanRemoteUrl = remoteGasUrl.trim();
        setAppsScriptUrl(cleanRemoteUrl);
        saveAppsScriptUrl(cleanRemoteUrl, false);
        syncFromGoogleSheets(cleanRemoteUrl);
      }
    });

    // Realtime Subscriptions for ALL System Settings across all connected devices/browsers
    const unsubPasswords = subscribeSystemSettingFromFirestore('passwords', (remotePass) => {
      if (remotePass) saveSystemPasswords(remotePass, false);
    });

    const unsubCustomUsers = subscribeSystemSettingFromFirestore('customUsers', (remoteUsers) => {
      if (remoteUsers) saveCustomUsers(remoteUsers, false);
    });

    const unsubRolePerms = subscribeSystemSettingFromFirestore('rolePermissions', (remoteMatrix) => {
      if (remoteMatrix) saveRolePermissions(remoteMatrix, false);
    });

    const unsubSecPolicy = subscribeSystemSettingFromFirestore('securityPolicy', (remotePolicy) => {
      if (remotePolicy) saveSecurityPolicy(remotePolicy, false);
    });

    const unsubProktor = subscribeSystemSettingFromFirestore('proktorList', (remoteProktor) => {
      if (remoteProktor && Array.isArray(remoteProktor)) {
        setProktorList(remoteProktor);
        saveProktorTeknisi(remoteProktor, false);
      }
    });

    const unsubDocSettings = subscribeSystemSettingFromFirestore('docSettings', (remoteDocSettings) => {
      if (remoteDocSettings) {
        setDocSettings(remoteDocSettings);
        saveDocSettings(remoteDocSettings, false);
      }
    });

    // Real-time listener for Google Apps Script Web App URL
    const unsubscribeGasUrl = subscribeSystemSettingFromFirestore('appsScriptUrl', (remoteGasUrl) => {
      if (typeof remoteGasUrl === 'string' && remoteGasUrl.trim()) {
        const cleanRemoteUrl = remoteGasUrl.trim();
        setAppsScriptUrl(cleanRemoteUrl);
        saveAppsScriptUrl(cleanRemoteUrl, false);
        syncFromGoogleSheets(cleanRemoteUrl);
      }
    });

    // Real-time listener for Student Form Access Status (Open/Closed)
    const unsubscribeFormAccess = subscribeSystemSettingFromFirestore('studentFormAccess', (remoteAccess) => {
      if (typeof remoteAccess === 'boolean') {
        setIsStudentFormOpen(remoteAccess);
        saveStudentFormAccess(remoteAccess, false);
      }
    });

    // Real-time listener for Master School Students collection
    const unsubMasterStudents = subscribeMasterSchoolStudentsFromFirestore((remoteMaster) => {
      if (Array.isArray(remoteMaster)) {
        setMasterSchoolStudents(remoteMaster);
        saveMasterSchoolStudents(remoteMaster, false);
      }
    });

    // Real-time listener for Laptops collection
    const unsubLaptops = subscribeLaptopsFromFirestore((remoteLaptops) => {
      if (Array.isArray(remoteLaptops)) {
        setLaptops(remoteLaptops);
        saveLaptops(remoteLaptops, false);
      }
    });

    // Real-time listener for Students collection
    const unsubscribeStudents = subscribeStudentsFromFirestore((remoteStudents) => {
      if (Array.isArray(remoteStudents)) {
        const cleanRemote = remoteStudents.filter(
          (s: any) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101' && !isExcludedStudentName(s.namaSiswa)
        );
        setStudents(cleanRemote);
        saveStudents(cleanRemote);
      } else {
        const cleanLocal = getStoredStudents().filter(
          (s) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101' && !isExcludedStudentName(s.namaSiswa)
        );
        setStudents(cleanLocal);
        saveStudents(cleanLocal);
      }
    });

    // Auto sync with Google Sheets periodically (every 30 seconds) & on window focus
    const intervalId = setInterval(() => {
      const currentUrl = getAppsScriptUrl();
      if (currentUrl) {
        syncFromGoogleSheets(currentUrl);
      }
    }, 30000);

    const handleFocus = () => {
      const currentGasUrl = getAppsScriptUrl();
      if (currentGasUrl) {
        syncFromGoogleSheets(currentGasUrl);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubPasswords();
      unsubCustomUsers();
      unsubRolePerms();
      unsubSecPolicy();
      unsubProktor();
      unsubDocSettings();
      unsubLaptops();
      unsubMasterStudents();
      unsubscribeGasUrl();
      unsubscribeFormAccess();
      unsubscribeStudents();
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Inactivity Auto-Logout Timeout (15 minutes = 900 seconds)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userRole) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        addSecurityLog({
          role: userRole || 'UNKNOWN',
          userIdentifier: currentUserNis || undefined,
          action: 'AUTO_LOGOUT',
          category: 'AUTH',
          status: 'WARNING',
          details: `Sesi berakhir otomatis (Idle 15 menit tanpa aktivitas)`,
        });
        setUserRole(null);
        setCurrentUserNis(null);
        setEditingStudent(null);
        setActiveTab('dashboard');
        alert('🔒 Sesi Anda telah berakhir secara otomatis demi keamanan karena tidak ada aktivitas selama 15 menit.');
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Event listeners to detect activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [userRole, currentUserNis]);

  // Guard active tab for Siswa role - only allow form, banpt, mapelPilihan, and snbpCalc
  useEffect(() => {
    if (userRole === 'siswa') {
      const allowedSiswaTabs: NavigationTab[] = ['form', 'banpt', 'mapelPilihan', 'snbpCalc'];
      if (!allowedSiswaTabs.includes(activeTab)) {
        setActiveTab('form');
      }
    }
  }, [userRole, activeTab]);

  // Persist sidebar minimize state
  useEffect(() => {
    try {
      localStorage.setItem('sitaka_sidebar_minimized_v1', String(isSidebarMinimized));
    } catch (_) {}
  }, [isSidebarMinimized]);

  const handleLogin = (role: UserRole, nis?: string) => {
    setUserRole(role);
    try {
      localStorage.setItem('tka_user_role_v1', role);
      if (nis) localStorage.setItem('tka_user_nis_v1', nis);
      else localStorage.removeItem('tka_user_nis_v1');
    } catch (_) {}

    if (role === 'siswa' && nis) {
      setCurrentUserNis(nis);
      const list = getStoredStudents();
      const found = list.find((s) => s.nis === nis || (s.nisn && s.nisn === nis));
      if (found) {
        setEditingStudent(found);
      } else {
        const masterFound = masterSchoolStudents.find((m) => m.nis === nis || (m.nisn && m.nisn === nis));
        if (masterFound) {
          setEditingStudent({
            id: '',
            namaSiswa: masterFound.namaSiswa,
            nis: masterFound.nis,
            nisn: masterFound.nisn,
            kelas: masterFound.kelas || 'XII MIPA 1',
            jenisKelamin: 'L',
            mapelTka1: 'Matematika',
            mapelTka2: 'Fisika',
            pilihanStudiLanjut: 'Kuliah',
            prodiPilihan1: '',
            prodiPilihan2: '',
            updatedAt: new Date().toISOString()
          });
        } else {
          setEditingStudent({
            id: '',
            namaSiswa: '',
            nis: nis,
            nisn: '',
            kelas: 'XII MIPA 1',
            jenisKelamin: 'L',
            mapelTka1: 'Matematika',
            mapelTka2: 'Fisika',
            pilihanStudiLanjut: 'Kuliah',
            prodiPilihan1: '',
            prodiPilihan2: '',
            updatedAt: new Date().toISOString()
          });
        }
      }
      setActiveTab('form');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    if (userRole) {
      addSecurityLog({
        role: userRole,
        userIdentifier: currentUserNis || undefined,
        action: 'LOGOUT',
        category: 'AUTH',
        status: 'SUCCESS',
        details: `Pengguna keluar (Logout) dari sistem`,
      });
    }
    setUserRole(null);
    setCurrentUserNis(null);
    setEditingStudent(null);
    try {
      localStorage.removeItem('tka_user_role_v1');
      localStorage.removeItem('tka_user_nis_v1');
    } catch (_) {}
    setActiveTab('dashboard');
  };

  // Laptop handlers
  const handleAddLaptop = (data: Omit<LaptopData, 'id' | 'updatedAt'>) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    const newLaptop = addLaptop(data);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'laptop', action: 'saveLaptop', laptop: newLaptop }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleUpdateLaptop = (data: LaptopData) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    updateLaptop(data);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'laptop', action: 'saveLaptop', laptop: data }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleDeleteLaptop = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    const targetLaptop = laptops.find((l) => l.id === id);
    deleteLaptop(id);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'laptop',
            action: 'deleteLaptop',
            id,
            studentId: targetLaptop?.studentId,
          }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleResetLaptops = () => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    const resetList = resetLaptopsData();
    setLaptops(resetList);
  };

  // Proktor / Teknisi handlers
  const handleAddProktor = (data: Omit<ProktorTeknisi, 'id'>) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    const newProktor = addProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'saveProktor', proktor: newProktor }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
  };

  const handleUpdateProktor = (data: ProktorTeknisi) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    updateProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'saveProktor', proktor: data }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
  };

  const handleDeleteProktor = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    deleteProktorTeknisi(id);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'deleteProktor', id }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
  };

  // Doc Settings handlers
  const handleSaveDocSettings = (settings: DocumentSettings) => {
    if (userRole !== 'superadmin') return;
    saveDocSettings(settings);
    setDocSettings(settings);
  };

  const handleResetDocSettings = () => {
    if (userRole !== 'superadmin') return;
    saveDocSettings(DEFAULT_DOCUMENT_SETTINGS);
    setDocSettings(DEFAULT_DOCUMENT_SETTINGS);
  };

  // Save / Update Student handler
  const handleSaveStudent = (dataInput: Omit<Student, 'id' | 'updatedAt'> | Student) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }

    const data = {
      ...dataInput,
      nisn: formatNisn(dataInput.nisn),
    };

    let savedStudentObj: Student;
    const list = getStoredStudents();

    if ('id' in data && data.id) {
      savedStudentObj = {
        ...data,
        updatedAt: new Date().toISOString(),
      } as Student;
      updateStudent(savedStudentObj);
      addSecurityLog({
        role: userRole || 'siswa',
        userIdentifier: currentUserNis || undefined,
        action: 'UPDATE_STUDENT',
        category: 'DATA_CHANGE',
        status: 'SUCCESS',
        details: `Memperbarui data siswa (${data.namaSiswa}, NIS: ${data.nis})`,
      });
    } else {
      const existing = data.nis ? list.find((s) => s.nis === data.nis) : null;
      if (existing) {
        savedStudentObj = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString(),
        } as Student;
        updateStudent(savedStudentObj);
      } else {
        const newObj: Student = {
          id: 'std-' + Date.now(),
          ...data,
          updatedAt: new Date().toISOString(),
        } as Student;
        addStudent(newObj);
        savedStudentObj = newObj;
      }
      addSecurityLog({
        role: userRole || 'siswa',
        userIdentifier: currentUserNis || undefined,
        action: 'ADD_STUDENT',
        category: 'DATA_CHANGE',
        status: 'SUCCESS',
        details: `Menambah/memperbarui data siswa (${data.namaSiswa || 'Siswa'}, NIS: ${data.nis || '-'})`,
      });
    }

    // Realtime Apps Script Auto Sync with Google Sheets
    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'save',
            student: savedStudentObj,
          }),
        }).catch((err) => console.log('Apps Script Student sync note:', err));
      } catch (err) {}
    }

    const refreshed = getStoredStudents();
    setStudents(refreshed);
    setEditingStudent(null);
    setActiveTab('students');
  };

  // Delete Student handler
  const handleDeleteStudent = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }
    const target = students.find((s) => s.id === id);
    deleteStudent(id);

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'delete',
            id,
            nis: target?.nis,
            nisn: target?.nisn,
          }),
        }).catch((err) => console.log('Apps Script Student delete note:', err));
      } catch (err) {}
    }

    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'DELETE_STUDENT',
      category: 'DATA_CHANGE',
      status: 'SUCCESS',
      details: `Menghapus data siswa (${target?.namaSiswa || id}, NIS: ${target?.nis || '-'})`,
    });
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    if (detailStudent?.id === id) {
      setDetailStudent(null);
    }
  };

  // Delete multiple selected / filtered students
  const handleDeleteMultipleStudents = (ids: string[]) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }
    deleteMultipleStudents(ids);

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'deleteMultiple',
            ids: ids,
          }),
        }).catch((err) => console.log('Apps Script Student deleteMultiple note:', err));
      } catch (err) {}
    }

    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'DELETE_MULTIPLE_STUDENTS',
      category: 'DATA_CHANGE',
      status: 'SUCCESS',
      details: `Menghapus ${ids.length} data siswa terfilter/terpilih`,
    });

    const refreshed = getStoredStudents();
    setStudents(refreshed);
    if (detailStudent && ids.includes(detailStudent.id)) {
      setDetailStudent(null);
    }
  };

  // Clear all students
  const handleClearAllStudents = () => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }
    const cleared = clearAllStudentsData();
    setStudents(cleared);

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'clearAll',
          }),
        }).catch((err) => console.log('Apps Script Student clearAll note:', err));
      } catch (err) {}
    }

    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'CLEAR_ALL_STUDENTS',
      category: 'SYSTEM',
      status: 'WARNING',
      details: 'Pengguna menghapus seluruh data siswa TKA & Studi Lanjut',
    });
  };

  // Reset to default sample students
  const handleResetData = () => {
    if (userRole !== 'superadmin') return;
    if (window.confirm('Apakah Anda yakin ingin mengembalikan data ke contoh bawaan awal?')) {
      const defaultList = resetToDefaultData();
      setStudents(defaultList);
      addSecurityLog({
        role: 'superadmin',
        action: 'RESET_STUDENTS_DATA',
        category: 'SYSTEM',
        status: 'WARNING',
        details: 'Super Admin mereset seluruh database siswa ke sampel awal bawaan',
      });
    }
  };

  // Edit action from list or detail modal
  const handleSelectEdit = (student: Student) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Wali Kelas dan Guru BK hanya memiliki akses melihat data.');
      return;
    }
    setEditingStudent(student);
    setActiveTab('form');
  };

  // Toggle Student Form Access (Open / Close)
  const handleToggleStudentFormAccess = (isOpen: boolean) => {
    setIsStudentFormOpen(isOpen);
    saveStudentFormAccess(isOpen);
    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'TOGGLE_STUDENT_FORM_ACCESS',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: `Admin ${isOpen ? 'MEMBUKA' : 'MENUTUP'} akses Formulir Pendataan Siswa`,
    });
  };

  // Refresh trigger
  const handleRefreshData = () => {
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    setAppsScriptUrl(getAppsScriptUrl());
    setIsStudentFormOpen(getStoredStudentFormAccess());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex">
      {!userRole && (
        <LoginModal onLogin={handleLogin} students={students} masterStudents={masterSchoolStudents} />
      )}

      {/* Left Sidebar Menu Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'form') setEditingStudent(null);
        }}
        totalStudents={students.length}
        appsScriptUrl={appsScriptUrl}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        userRole={userRole}
        currentUserNis={currentUserNis}
        isStudentFormOpen={isStudentFormOpen}
        onLogout={handleLogout}
        onOpenRbacModal={() => setIsRbacModalOpen(true)}
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
      />

      {/* Main Content Area right of left sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all ${
        isSidebarMinimized ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'form') setEditingStudent(null);
          }}
          students={students}
          setIsMobileOpen={setIsMobileOpen}
          onRefreshData={handleRefreshData}
          isCompactMode={isCompactMode}
          setIsCompactMode={setIsCompactMode}
          userRole={userRole}
          onOpenRbacModal={() => setIsRbacModalOpen(true)}
          isSidebarMinimized={isSidebarMinimized}
          setIsSidebarMinimized={setIsSidebarMinimized}
        />

        {/* Dynamic View Content */}
        <main className={`flex-1 ${isCompactMode ? 'p-2 text-xs max-w-full' : 'p-4 lg:p-8 max-w-7xl'} w-full mx-auto transition-all`}>
          {activeTab === 'dashboard' && userRole !== 'siswa' && (
            <DashboardView
              students={students}
              setActiveTab={setActiveTab}
              onSelectStudentDetail={setDetailStudent}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              students={students}
              onEditStudent={handleSelectEdit}
              onDeleteStudent={handleDeleteStudent}
              onDeleteMultipleStudents={handleDeleteMultipleStudents}
              onSelectStudentDetail={setDetailStudent}
              onAddNewStudent={() => {
                if (userRole === 'walikelas' || userRole === 'bk') return;
                setEditingStudent(null);
                setActiveTab('form');
              }}
              onResetData={handleResetData}
              onClearData={handleClearAllStudents}
              onRefreshData={handleRefreshData}
              isReadOnly={userRole === 'walikelas' || userRole === 'bk'}
              userRole={userRole}
            />
          )}

          {activeTab === 'schoolData' && (
            <SchoolDataView
              masterStudents={masterSchoolStudents}
              setMasterStudents={setMasterSchoolStudents}
              onNavigateTab={(tab) => setActiveTab(tab)}
              userRole={userRole}
              currentUserNis={currentUserNis}
            />
          )}

          {activeTab === 'form' && (
            <StudentFormView
              editingStudent={editingStudent}
              onSaveStudent={handleSaveStudent}
              onCancel={() => {
                setEditingStudent(null);
                if (userRole === 'siswa') {
                  setActiveTab('banpt');
                } else {
                  setActiveTab('students');
                }
              }}
              onOpenBanPtDirectory={() => setActiveTab('banpt')}
              prefilledBanPtSelection={pendingBanPtSelection}
              onClearPrefilledBanPt={() => setPendingBanPtSelection(null)}
              userRole={userRole}
              currentUserNis={currentUserNis}
              isStudentFormOpen={isStudentFormOpen}
              masterStudents={masterSchoolStudents}
            />
          )}

          {activeTab === 'analysis' && userRole !== 'siswa' && <TkaAnalysisView students={students} />}

          {activeTab === 'laptop' && userRole !== 'siswa' && (
            <LaptopInventoryView
              students={students}
              laptops={laptops}
              proktorList={proktorList}
              docSettings={docSettings}
              appsScriptUrl={appsScriptUrl}
              onSyncGoogleSheets={syncFromGoogleSheets}
              onNavigateToAppScript={() => setActiveTab('appscript')}
              onAddLaptop={handleAddLaptop}
              onUpdateLaptop={handleUpdateLaptop}
              onDeleteLaptop={handleDeleteLaptop}
              onResetLaptops={handleResetLaptops}
              onAddProktor={handleAddProktor}
              onUpdateProktor={handleUpdateProktor}
              onDeleteProktor={handleDeleteProktor}
              onSaveDocSettings={handleSaveDocSettings}
              onResetDocSettings={handleResetDocSettings}
            />
          )}

          {activeTab === 'appscript' && userRole !== 'siswa' && <AppsScriptView />}

          {activeTab === 'settings' && userRole !== 'siswa' && (
            <SettingsView
              docSettings={docSettings}
              onSaveDocSettings={handleSaveDocSettings}
              onResetDocSettings={handleResetDocSettings}
              proktorList={proktorList}
              onAddProktor={handleAddProktor}
              onUpdateProktor={handleUpdateProktor}
              onDeleteProktor={handleDeleteProktor}
              appsScriptUrl={appsScriptUrl}
              onSaveAppsScriptUrl={(url) => {
                saveAppsScriptUrl(url);
                setAppsScriptUrl(url);
              }}
              onResetStudentsData={() => {
                const refreshed = resetToDefaultData();
                setStudents(refreshed);
              }}
              onClearStudentsData={() => {
                const cleared = clearAllStudentsData();
                setStudents(cleared);
                addSecurityLog({
                  role: 'superadmin',
                  action: 'CLEAR_ALL_STUDENTS',
                  category: 'SYSTEM',
                  status: 'WARNING',
                  details: 'Super Admin mengosongkan seluruh database siswa (menghapus data dummy)',
                });
              }}
              onResetLaptopsData={handleResetLaptops}
              totalStudents={students.length}
              totalLaptops={laptops.length}
              isStudentFormOpen={isStudentFormOpen}
              onToggleStudentFormAccess={handleToggleStudentFormAccess}
              onDataRestored={() => {
                setStudents(getStoredStudents());
                setLaptops(getStoredLaptops());
                setProktorList(getStoredProktorTeknisi());
                setDocSettings(getStoredDocSettings());
                setAppsScriptUrl(getAppsScriptUrl());
                setIsStudentFormOpen(getStoredStudentFormAccess());
              }}
              onSyncGoogleSheets={syncFromGoogleSheets}
            />
          )}

          {activeTab === 'banpt' && (
            <BanPtDirectoryView
              onSelectProdiForForm={(ptn, prodi, choice, akreditasi) => {
                setPendingBanPtSelection({ targetChoice: choice, ptn, prodi, akreditasi });
                setActiveTab('form');
              }}
            />
          )}

          {activeTab === 'mapelPilihan' && <MapelPilihanView userRole={userRole} />}

          {activeTab === 'snbpCalc' && <SnbpCalculatorView students={students} userRole={userRole} />}
        </main>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        onEdit={handleSelectEdit}
      />

      {/* Matriks Otorisasi Pengguna (RBAC) Modal */}
      <RbacMatrixModal
        isOpen={isRbacModalOpen}
        onClose={() => setIsRbacModalOpen(false)}
        currentUserRole={userRole}
        currentUserNis={currentUserNis}
      />
    </div>
  );
}
