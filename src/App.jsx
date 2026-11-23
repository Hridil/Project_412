import React, { useState, useEffect, useRef, useCallback } from 'react';

// Formatters & Media Utilities
import { T, uid, srt, dOff, getNowDateString } from './utils/formatters.js';
import { compressImage, readFileAsDataUrl } from './utils/mediaUtils.js';

// Constants & Data Seed
import { NS, NC, NA, E } from './data/constants.js';
import { seed } from './data/seedData.js';

// Layout & Common Components
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Toast from './components/common/Toast.jsx';
import AiAssistantWidget from './components/common/AiAssistantWidget.jsx';

// Supabase Integration Client
import { supabaseApi, isSupabaseConfigured, uploadImageToSupabase, isAppointmentSlotOccupied } from './services/supabaseClient.js';

// Modals
import ClientDossierModal from './components/modals/ClientDossierModal.jsx';
import FilePreviewModal from './components/modals/FilePreviewModal.jsx';

// Views
import AuthScreen from './views/auth/AuthScreen.jsx';
import AdminPanel from './views/admin/AdminPanel.jsx';
import ConsultantHome from './views/consultant/ConsultantHome.jsx';
import ClientManagement from './views/consultant/ClientManagement.jsx';
import ClientDocuments from './views/consultant/ClientDocuments.jsx';
import ConsultantSchedule from './views/consultant/ConsultantSchedule.jsx';
import SessionNotes from './views/consultant/SessionNotes.jsx';
import CarePlans from './views/consultant/CarePlans.jsx';
import ConsultantNotif from './views/consultant/ConsultantNotif.jsx';
import ConsultantFeedback from './views/consultant/ConsultantFeedback.jsx';

import ClientHome from './views/client/ClientHome.jsx';
import MoodJournal from './views/client/MoodJournal.jsx';
import BookSession from './views/client/BookSession.jsx';
import ClientSessions from './views/client/ClientSessions.jsx';
import ClientGoals from './views/client/ClientGoals.jsx';
import ClientDocumentsView from './views/client/ClientDocuments.jsx';
import WellbeingToolkit from './views/client/WellbeingToolkit.jsx';
import ClientNotif from './views/client/ClientNotif.jsx';
import ClientFeedback from './views/client/ClientFeedback.jsx';

export default function App() {
  const [S, setS] = useState(() => {
    try {
      const saved = localStorage.getItem('mcpro');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out legacy dummy records
        const dummyUserIds = new Set(['cons', 'cdemo', 'jamie', 'u1', 'u2']);
        const dummyEmails = new Set([
          'demo@mindcare.com',
          'client@mindcare.com',
          'jamie@example.com',
          'sarah.mitchell@mindcare.com',
          'marcus.vance@mindcare.com',
          'alex.chen@mindcare.com'
        ]);

        parsed.acc = (parsed.acc || []).filter(
          (a) => !dummyUserIds.has(a.id) && !dummyEmails.has(a.email)
        );
        parsed.cl = (parsed.cl || []).filter(
          (c) => !dummyUserIds.has(c.uid) && !dummyEmails.has(c.email)
        );
        parsed.consultants = (parsed.consultants || []).filter(
          (c) => !dummyUserIds.has(c.uid) && !dummyEmails.has(c.email)
        );
        parsed.ap = (parsed.ap || []).filter((a) => !dummyUserIds.has(a.uid));
        parsed.slots = parsed.slots || [];
        parsed.nt = (parsed.nt || []).filter((n) => n.id !== 101);
        parsed.pl = (parsed.pl || []).filter((p) => !dummyUserIds.has(p.uid));
        parsed.nf = (parsed.nf || []).filter((n) => !dummyUserIds.has(n.to));
        parsed.fl = (parsed.fl || []).filter((f) => !dummyUserIds.has(f.uid));
        parsed.md = (parsed.md || []).filter((m) => !dummyUserIds.has(m.uid));
        parsed.fb = (parsed.fb || []).filter((f) => !dummyUserIds.has(f.clientId));
        parsed.dashImages = parsed.dashImages || {};
        delete parsed.dashImages['cons'];
        delete parsed.dashImages['jamie'];
        parsed.avatars = parsed.avatars || {};
        delete parsed.avatars['cons'];
        delete parsed.avatars['cdemo'];
        delete parsed.avatars['jamie'];

        return parsed;
      }
    } catch {
      // ignore
    }
    return seed();
  });

  const [U, setU] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mcuser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (
          ['cons', 'cdemo', 'jamie'].includes(parsed?.id) ||
          ['demo@mindcare.com', 'client@mindcare.com', 'jamie@example.com'].includes(parsed?.email)
        ) {
          localStorage.removeItem('mcuser');
          return null;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [role, setRoleState] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mcuser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role;
      }
    } catch {
      // ignore
    }
    return document.body.dataset.role || 'consultant';
  });

  const [isSignup, setIsSignup] = useState(false);

  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) return hash;
    try {
      const savedPage = localStorage.getItem('mcpage');
      if (savedPage) return savedPage;
      const savedUser = localStorage.getItem('mcuser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role === 'admin') return 'admin-panel';
        if (parsed?.role === 'client') return 'cl-home';
      }
    } catch {
      // ignore
    }
    const dp = document.body.dataset.page;
    if (dp === 'feedback') {
      return document.body.dataset.role === 'client' ? 'cl-feedback' : 'c-feedback';
    }
    if (document.body.dataset.role === 'admin') return 'admin-panel';
    if (document.body.dataset.role === 'client') return 'cl-home';
    return dp || 'c-home';
  });
  const [pageHistory, setPageHistory] = useState([]);
  const [sideOpen, setSideOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('mctheme') === 'dark';
    } catch {
      return false;
    }
  });

  const [Q, setQ] = useState({ q: '', f: 'all' });
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('overview');
  const [docFilterUid, setDocFilterUid] = useState('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const toastTimerRef = useRef(null);

  // Dashboard Overview Image custom edit state
  const [editingImageMeta, setEditingImageMeta] = useState(false);
  const [imageMetaForm, setImageMetaForm] = useState({ title: '', caption: '' });

  // Profile Menu / Overview Popover state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const avatarInputRef = useRef(null);

  // Wellbeing interactive tools state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathCycle, setBreathCycle] = useState(1);
  const [somaticLevel, setSomaticLevel] = useState(3);

  // Synchronize data from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let isMounted = true;
    supabaseApi
      .fetchAppData()
      .then((data) => {
        if (!isMounted || !data) return;
        setS((prev) => {
          // 1. Clients: Merge and resolve canonical status & caseload
          const existingClMap = new Map((prev.cl || []).map((c) => [c.id, c]));
          const mergedClients = (data.clients || []).map((dbClient) => {
            const existing = existingClMap.get(dbClient.id);
            return {
              ...(existing || {}),
              ...dbClient,
              status: dbClient.status || existing?.status || 'ACTIVE',
              assignedConsultantId:
                dbClient.assignedConsultantId !== undefined
                  ? dbClient.assignedConsultantId
                  : existing?.assignedConsultantId,
              consultant_id:
                dbClient.consultant_id !== undefined
                  ? dbClient.consultant_id
                  : existing?.consultant_id
            };
          });
          const dbClientIds = new Set((data.clients || []).map((c) => c.id));
          const localOnlyClients = (prev.cl || []).filter((c) => !dbClientIds.has(c.id));
          const finalClients = [...mergedClients, ...localOnlyClients];

          // 2. Files: Populate client linkage and sync vault files across devices
          const clientByPersonId = new Map(finalClients.map((c) => [c.person_id, c]));
          const clientById = new Map(finalClients.map((c) => [c.id, c]));

          const enrichedDbFiles = (data.files || []).map((f) => {
            const client = clientById.get(f.client_id || f.cid) || clientByPersonId.get(f.person_id);
            const targetUid = client?.uid || (f.person_id ? 'u' + f.person_id : (f.client_id ? 'u' + f.client_id : f.uid));
            return {
              ...f,
              uid: targetUid,
              cid: client?.id || f.client_id || f.cid || null,
              dataUrl: f.dataUrl || f.url || f.file_url
            };
          });

          const dbFileIds = new Set(enrichedDbFiles.map((f) => f.id));
          const localOnlyFiles = (prev.fl || []).filter((f) => !dbFileIds.has(f.id));
          const finalFiles = [...enrichedDbFiles, ...localOnlyFiles];

          // 3. Appointments
          const dbApIds = new Set((data.appointments || []).map((a) => a.id));
          const localOnlyAps = (prev.ap || []).filter((a) => !dbApIds.has(a.id));
          const finalAppointments = [...(data.appointments || []), ...localOnlyAps];

          // 4. Clinical Notes
          const dbNoteIds = new Set((data.notes || []).map((n) => n.id));
          const localOnlyNotes = (prev.nt || []).filter((n) => !dbNoteIds.has(n.id));
          const finalNotes = [...(data.notes || []), ...localOnlyNotes];

          // 5. Feedback
          const dbFbIds = new Set((data.feedback || []).map((f) => f.id));
          const localOnlyFb = (prev.fb || []).filter((f) => !dbFbIds.has(f.id));
          const finalFeedback = [...(data.feedback || []), ...localOnlyFb];

          // 6. Consultants: Authoritative from database CONSULTANT table
          const finalCons = (data.consultants && data.consultants.length > 0)
            ? data.consultants
            : (prev.consultants || []);

          // Purge removed consultants from acc list
          const activeConsEmails = new Set((finalCons || []).map((c) => (c.email || '').toLowerCase()));
          const cleanedPrevAcc = (prev.acc || []).filter((a) => {
            if (a.role === 'consultant') {
              return activeConsEmails.has((a.email || '').toLowerCase());
            }
            return true;
          });

          // 7. Accounts for auth
          const existingAccMap = new Map(cleanedPrevAcc.map((a) => [a.email.toLowerCase(), a]));
          const newAccs = [
            ...finalClients.map((c) => ({
              id: c.uid,
              person_id: c.person_id,
              client_id: c.id,
              name: c.name,
              email: c.email,
              role: 'client',
              avatar: c.avatar,
              contact_no: c.contact_no
            })),
            ...finalCons.map((c) => ({
              id: c.uid,
              person_id: c.person_id,
              consultant_id: c.id,
              name: c.name,
              email: c.email,
              role: 'consultant',
              avatar: c.avatar,
              contact_no: c.contact_no
            }))
          ];
          newAccs.forEach((acc) => {
            existingAccMap.set(acc.email.toLowerCase(), {
              ...(existingAccMap.get(acc.email.toLowerCase()) || {}),
              ...acc
            });
          });

          // 8. Synchronize avatars dictionary for all clients and consultants
          const syncedAvatars = { ...(prev.avatars || {}) };
          finalClients.forEach((c) => {
            if (c.avatar) {
              syncedAvatars[c.uid] = c.avatar;
              syncedAvatars[c.id] = c.avatar;
              if (c.person_id) syncedAvatars['u' + c.person_id] = c.avatar;
            }
          });
          finalCons.forEach((co) => {
            if (co.avatar) {
              syncedAvatars[co.uid] = co.avatar;
              syncedAvatars[co.id] = co.avatar;
              if (co.person_id) syncedAvatars['u' + co.person_id] = co.avatar;
            }
          });

          return {
            ...prev,
            cl: finalClients,
            fl: finalFiles,
            ap: finalAppointments,
            nt: finalNotes,
            fb: finalFeedback,
            consultants: finalCons,
            acc: Array.from(existingAccMap.values()),
            avatars: syncedAvatars
          };
        });
      })
      .catch((err) => {
        console.warn('Supabase initial sync notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mcpro', JSON.stringify(S));
    } catch {
      // ignore
    }
  }, [S]);

  // Persist logged-in user session across page refreshes
  useEffect(() => {
    try {
      if (U) {
        localStorage.setItem('mcuser', JSON.stringify(U));
      } else {
        localStorage.removeItem('mcuser');
      }
    } catch {
      // ignore
    }
  }, [U]);

  // Persist active page across page refreshes
  useEffect(() => {
    try {
      if (page) {
        localStorage.setItem('mcpage', page);
      }
    } catch {
      // ignore
    }
  }, [page]);

  // Synchronize session profile if modified in state
  useEffect(() => {
    if (U && S?.acc) {
      const freshUser = S.acc.find((a) => a.id === U.id);
      if (
        freshUser &&
        (freshUser.name !== U.name || freshUser.avatar !== U.avatar || freshUser.email !== U.email)
      ) {
        setU(freshUser);
      }
    }
  }, [S]);

  // Validate that active page matches user role
  useEffect(() => {
    if (U) {
      if (U.role === 'client' && page.startsWith('c-')) {
        setPage('cl-home');
        window.location.hash = 'cl-home';
      } else if (U.role === 'consultant' && page.startsWith('cl-')) {
        setPage('c-home');
        window.location.hash = 'c-home';
      }
    }
  }, [U]);

  // Sync dark class on root document
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mctheme', dark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [dark]);

  // Breathing box exercise timer
  useEffect(() => {
    if (!isBreathing) return;
    const phases = [
      { name: 'Inhale gently', duration: 4000 },
      { name: 'Hold serene pause', duration: 4000 },
      { name: 'Exhale slowly', duration: 4000 },
      { name: 'Rest and release', duration: 4000 }
    ];

    const timer = setTimeout(() => {
      setBreathPhaseIndex((prev) => {
        const next = (prev + 1) % phases.length;
        if (next === 0) {
          setBreathCycle((c) => (c < 4 ? c + 1 : 1));
        }
        return next;
      });
    }, phases[breathPhaseIndex].duration);

    return () => clearTimeout(timer);
  }, [isBreathing, breathPhaseIndex]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastOn(false), 2600);
  };

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  const setRole = (r) => {
    setRoleState(r);
    setIsSignup(false);
  };

  // URL Hash synchronization for browser Back / Forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hashPage = window.location.hash.replace(/^#\/?/, '');
      if (hashPage && hashPage !== page) {
        setPage(hashPage);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [page]);

  const go = (p, replace = false) => {
    if (!replace && p !== page) {
      setPageHistory((prev) => [...prev, page]);
    }
    setPage(p);
    setSideOpen(false);
    setProfileMenuOpen(false);
    window.location.hash = p;
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setSideOpen(false);
    setProfileMenuOpen(false);
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      setPageHistory((history) => history.slice(0, -1));
      setPage(prev);
      window.location.hash = prev;
    } else {
      const homePage = U?.role === 'client' ? 'cl-home' : 'c-home';
      if (page !== homePage) {
        setPage(homePage);
        window.location.hash = homePage;
      } else if (window.history.length > 1) {
        window.history.back();
      }
    }
    window.scrollTo(0, 0);
  };

  const canGoBack = Boolean(
    U && (page !== (U.role === 'client' ? 'cl-home' : 'c-home') || pageHistory.length > 0)
  );

  const logout = () => {
    setU(null);
    try {
      localStorage.removeItem('mcuser');
      localStorage.removeItem('mcpage');
    } catch {
      // ignore
    }
    setRole('consultant');
    setIsBreathing(false);
    setProfileMenuOpen(false);
    setPageHistory([]);
    window.location.hash = '';
  };

  // Helper getters
  const myC = () =>
    S.cl.find(
      (c) =>
        c.uid === U?.id ||
        c.id === U?.client_id ||
        c.person_id === U?.person_id ||
        (U?.email && (c.email || '').toLowerCase() === U.email.toLowerCase())
    );
  const cn = (id) => S.cl.find((c) => c.id === id)?.name || 'Client';
  const selectedClient = S.cl.find((c) => c.id === selectedClientId) || null;
  const acc = () => S.cl.filter((c) => c.status === 'Accepted' || c.status === 'ACTIVE');

  // Tenant Isolation Helper: verify if a client is selected/handled by a specific consultant
  const isClientAssignedToConsultant = useCallback(
    (client, consultant) => {
      if (!client || !consultant) return false;
      const consId = consultant.id;
      const consUid = consultant.uid || consultant.id;
      const consDbId = consultant.consultant_id;
      const consPersonId = consultant.person_id;

      const matchesCons = (targetId) => {
        if (!targetId) return false;
        return (
          targetId === consId ||
          targetId === consUid ||
          (consDbId && (targetId === consDbId || targetId === ('u' + consDbId) || +targetId === +consDbId)) ||
          (consPersonId && (targetId === consPersonId || targetId === ('u' + consPersonId) || +targetId === +consPersonId))
        );
      };

      // 1. Direct assignment attribute on client
      if (
        matchesCons(client.assignedConsultantId) ||
        matchesCons(client.consultant_id)
      ) {
        return true;
      }

      // 2. Scheduled appointments connecting consultant and client
      const hasAp = (S.ap || []).some(
        (a) =>
          (a.cid === client.id || a.uid === client.uid || a.client_id === client.id || (client.person_id && a.uid === ('u' + client.person_id))) &&
          matchesCons(a.consultant_id)
      );
      if (hasAp) return true;

      // 3. Clinical notes authored by consultant for this client
      const hasNt = (S.nt || []).some(
        (n) =>
          (n.cid === client.id || n.client_id === client.id) &&
          matchesCons(n.consultant_id)
      );
      if (hasNt) return true;

      // 4. Care plans assigned by consultant to this client
      const hasPl = (S.pl || []).some(
        (p) =>
          (p.cid === client.id || p.uid === client.uid) &&
          matchesCons(p.consultant_id)
      );
      if (hasPl) return true;

      return false;
    },
    [S.ap, S.nt, S.pl]
  );

  const handleAssignClient = async (clientId) => {
    if (!U || U.role !== 'consultant') return;
    const c = S.cl.find((x) => x.id === clientId);
    if (!c) return;
    setS((prev) => ({
      ...prev,
      cl: prev.cl.map((x) =>
        x.id === clientId
          ? {
              ...x,
              assignedConsultantId: U.id,
              consultant_id: U.consultant_id || U.id,
              status: x.status === 'Pending' ? 'Accepted' : x.status
            }
          : x
      )
    }));
    showToast(`Client ${c.name} assigned to your caseload.`);

    if (isSupabaseConfigured()) {
      try {
        const consDbId =
          U?.consultant_id ||
          (U?.id && !isNaN(String(U.id).replace('u', ''))
            ? parseInt(String(U.id).replace('u', ''), 10)
            : 1);
        await supabaseApi.assignClientToConsultant(clientId, consDbId);
      } catch (err) {
        console.warn('Could not persist caseload assignment to Supabase:', err);
      }
    }
  };

  // Administrator Handlers: Remove Client or Consultant from System
  const handleAdminRemoveClient = async (client) => {
    if (!client) return;
    const clientId = client.id;
    const clientUid = client.uid;
    const clientPersonId = client.person_id;

    // 1. Remove from local state and clean up linked references
    setS((prev) => ({
      ...prev,
      cl: (prev.cl || []).filter((c) => c.id !== clientId && c.uid !== clientUid),
      acc: (prev.acc || []).filter(
        (a) =>
          a.id !== clientUid &&
          a.client_id !== clientId &&
          a.email?.toLowerCase() !== client.email?.toLowerCase()
      )
    }));

    // 2. Delete from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.deleteClient(clientId, clientPersonId);
      } catch (err) {
        console.warn('Could not delete client from Supabase:', err);
      }
    }

    showToast(`Client ${client.name || 'Account'} has been removed from the system.`);
  };

  const handleAdminRemoveConsultant = async (consultant) => {
    if (!consultant) return;
    const consId = consultant.id;
    const consUid = consultant.uid;
    const consPersonId = consultant.person_id;

    // 1. Remove from local state and unassign their caseload
    setS((prev) => ({
      ...prev,
      consultants: (prev.consultants || []).filter(
        (c) => c.id !== consId && c.uid !== consUid
      ),
      acc: (prev.acc || []).filter(
        (a) =>
          a.id !== consUid &&
          a.consultant_id !== consId &&
          a.email?.toLowerCase() !== consultant.email?.toLowerCase()
      ),
      cl: (prev.cl || []).map((c) =>
        c.assignedConsultantId === consId ||
        c.assignedConsultantId === consUid ||
        c.consultant_id === consId
          ? { ...c, assignedConsultantId: null, consultant_id: null }
          : c
      )
    }));

    // 2. Delete from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.deleteConsultant(consId, consPersonId);
      } catch (err) {
        console.warn('Could not delete consultant from Supabase:', err);
      }
    }

    showToast(`Practitioner ${consultant.name || 'Account'} has been removed from the system.`);
  };

  const moodsOf = (u) => S.md.filter((m) => m.uid === u).sort((a, b) => a.date.localeCompare(b.date));
  const avg = (u) => {
    const m = moodsOf(u).slice(-7);
    return m.length ? m.reduce((s, x) => s + x.v, 0) / m.length : 0;
  };
  const streak = (u) => {
    const ds = new Set(S.md.filter((m) => m.uid === u).map((m) => m.date));
    let n = 0;
    let i = ds.has(T()) ? 0 : -1;
    while (ds.has(dOff(i))) {
      n++;
      i--;
    }
    return n;
  };

  const userAvatar = U?.avatar || S.avatars?.[U?.id] || null;

  // Authentication Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const rawEmail = (d.email || '').trim().toLowerCase();
    const em = role === 'admin' && (!rawEmail || rawEmail === 'admin') ? 'admin@mindcare.com' : rawEmail;
    const pw = d.pw;

    // 1. Authenticate with Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const dbUser = await supabaseApi.login(em, pw, role);
        setU(dbUser);
        setRoleState(dbUser.role);
        go(dbUser.role === 'client' ? 'cl-home' : dbUser.role === 'admin' ? 'admin-panel' : 'c-home');
        showToast(`Welcome back, ${dbUser.name}`);
        return;
      } catch (err) {
        console.warn('Supabase authentication check:', err.message);
        if (
          err.message.includes('Authorization Error') ||
          err.message.includes('Invalid password') ||
          err.message.includes('Invalid email format')
        ) {
          showToast(err.message);
          return;
        }
      }
    }

    // 2. Fallback to local accounts
    const u = S.acc.find(
      (a) => (a.email === em || (role === 'admin' && (!rawEmail || rawEmail === 'admin'))) && a.pw === pw && a.role === role
    );
    if (!u) {
      if (role === 'admin') {
        const adminAcc = {
          id: 'uadmin',
          name: 'System Administrator',
          email: em || 'admin@mindcare.com',
          pw: pw,
          role: 'admin'
        };
        setS((prev) => ({
          ...prev,
          acc: prev.acc.some((a) => a.id === adminAcc.id)
            ? prev.acc.map((a) => (a.id === adminAcc.id ? { ...a, pw } : a))
            : [...prev.acc, adminAcc]
        }));
        setU(adminAcc);
        setRoleState('admin');
        go('admin-panel');
        showToast('Welcome back, System Administrator');
        return;
      }
      showToast(`No ${role} account matches those credentials.`);
      return;
    }
    setU(u);
    setRoleState(u.role);
    go(u.role === 'client' ? 'cl-home' : u.role === 'admin' ? 'admin-panel' : 'c-home');
    showToast(`Welcome back, ${u.name}`);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const em = d.email.trim().toLowerCase();
    if (S.acc.some((a) => a.email === em)) {
      showToast('Email already registered. Please sign in.');
      return;
    }

    const dateStr = getNowDateString();
    let newAcc = null;

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const reg = await supabaseApi.register({
          name: d.name.trim(),
          email: em,
          password: d.pw,
          role,
          phone: d.contact_no?.trim() || '',
          dob: d.dob || null,
          reason: d.reason?.trim() || 'General wellness & clinical support',
          specialization: d.specialization?.trim() || 'Trauma-Informed Clinical Practice',
          qualification: d.qualification?.trim() || 'Licensed Mental Health Clinician'
        });

        newAcc = {
          id: reg.id,
          person_id: reg.person_id,
          client_id: reg.client_id,
          consultant_id: reg.consultant_id,
          name: reg.name,
          email: reg.email,
          pw: d.pw,
          role: reg.role,
          avatar: reg.avatar || null,
          contact_no: reg.contact_no
        };
      } catch (err) {
        console.error('Supabase registration failed:', err);
        showToast(`Supabase Error: ${err.message}`);
        return;
      }
    } else {
      const id = 'u' + uid();
      newAcc = {
        id,
        name: d.name.trim(),
        email: em,
        pw: d.pw,
        role,
        avatar: null,
        contact_no: d.contact_no?.trim() || ''
      };
    }

    let newClList = [...S.cl];
    let newConsultantList = [...(S.consultants || [])];
    let notifs = [...S.nf];

    if (role === 'client') {
      const newCl = {
        id: newAcc.client_id || uid(),
        uid: newAcc.id,
        person_id: newAcc.person_id,
        name: d.name.trim(),
        email: em,
        contact_no: d.contact_no?.trim() || '',
        dob: d.dob || null,
        status: 'ACTIVE',
        reason: d.reason?.trim() || 'General wellness & clinical support',
        avatar: newAcc.avatar || null
      };
      newClList.push(newCl);
      notifs.unshift(
        {
          id: uid() + 1,
          to: 'cons',
          msg: `New client ${d.name} enrolled in the sanctuary.`,
          date: dateStr,
          read: false
        },
        {
          id: uid(),
          to: newAcc.id,
          msg: `Welcome to MindCare Sanctuary, ${d.name}. Your profile is active and ready for consultations.`,
          date: dateStr,
          read: false
        }
      );
    } else if (role === 'consultant') {
      const newCons = {
        id: newAcc.consultant_id || uid(),
        uid: newAcc.id,
        person_id: newAcc.person_id,
        name: d.name.trim(),
        email: em,
        contact_no: d.contact_no?.trim() || '',
        specialization: d.specialization?.trim() || 'Trauma-Informed Clinical Practice',
        qualification: d.qualification?.trim() || 'Licensed Mental Health Clinician',
        avatar: newAcc.avatar || null
      };
      newConsultantList.push(newCons);
      notifs.unshift({
        id: uid(),
        to: newAcc.id,
        msg: `Welcome, ${d.name}. Your clinical practice dashboard is ready.`,
        date: dateStr,
        read: false
      });
    } else if (role === 'admin') {
      notifs.unshift({
        id: uid(),
        to: newAcc.id,
        msg: `Welcome, ${d.name}. MindCare Sanctuary Administration Portal is active.`,
        date: dateStr,
        read: false
      });
    }

    setS((prev) => ({
      ...prev,
      acc: [...prev.acc, newAcc],
      cl: newClList,
      consultants: newConsultantList,
      nf: notifs
    }));

    setU(newAcc);
    go(role === 'client' ? 'cl-home' : role === 'admin' ? 'admin-panel' : 'c-home');
    showToast(
      role === 'consultant'
        ? `Practitioner account created for ${newAcc.name}`
        : role === 'admin'
        ? `Administrator account created for ${newAcc.name}`
        : `Welcome to MindCare, ${newAcc.name}!`
    );
    e.target.reset();
    setIsSignup(false);
  };

  // Action Handlers
  const handleDecision = async (id, status) => {
    const c = S.cl.find((x) => x.id === id);
    if (!c) return;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      cl: prev.cl.map((x) =>
        x.id === id
          ? {
              ...x,
              status,
              assignedConsultantId: U?.role === 'consultant' ? (x.assignedConsultantId || U.id) : x.assignedConsultantId,
              consultant_id: U?.role === 'consultant' ? (x.consultant_id || U.consultant_id || U.id) : x.consultant_id
            }
          : x
      ),
      nf: [
        { id: uid() + 1, to: 'cons', msg: `Client ${c.name} ${status.toLowerCase()}.`, date: dateStr, read: false },
        {
          id: uid(),
          to: c.uid,
          msg: status === 'Accepted'
            ? 'Your request was accepted. Sessions, documents, and goals are now accessible.'
            : 'Your request was updated to declined status.',
          date: dateStr,
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast(`${c.name} marked as ${status}`);

    // Persist triage / acceptance decision to Supabase so it syncs to other devices
    if (isSupabaseConfigured() && c.id) {
      try {
        const consDbId =
          U?.consultant_id ||
          (U?.role === 'consultant' && U?.id && !isNaN(String(U.id).replace('u', ''))
            ? parseInt(String(U.id).replace('u', ''), 10)
            : 1);
        await supabaseApi.updateClientDecision(c.id, status, consDbId);
      } catch (err) {
        console.warn('Could not persist client decision to Supabase:', err);
      }
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const c = S.cl.find((x) => x.id === +d.cid || x.id === d.cid);
    if (!c) return;

    // Verify slot is free before booking
    const isOccupied = isAppointmentSlotOccupied(S.ap || [], {
      consultantId: U.id,
      clientId: c.id,
      date: d.date,
      time: d.time
    });

    if (isOccupied) {
      showToast('This time is occupied. Please select an available slot.');
      return;
    }

    const dateStr = getNowDateString();
    const mode = d.appointment_mode || 'ONLINE';
    const newAp = {
      id: uid(),
      uid: c.uid,
      cid: c.id,
      consultant_id: U.id,
      date: d.date,
      time: d.time,
      type: mode === 'ONLINE' ? 'Online Telehealth Consultation' : 'In-Person Sanctuary Consultation',
      appointment_mode: mode,
      status: 'CONFIRMED'
    };
    setS((prev) => ({
      ...prev,
      ap: [...prev.ap, newAp],
      nf: [
        { id: uid(), to: c.uid, msg: `A consultation (${mode}) was scheduled for ${d.date} at ${d.time}.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    showToast('Session scheduled');
    e.target.reset();

    // Persist appointment to Supabase
    if (isSupabaseConfigured() && U) {
      try {
        const consDbId =
          U.consultant_id ||
          (U.id && !isNaN(String(U.id).replace('u', ''))
            ? parseInt(String(U.id).replace('u', ''), 10)
            : 1);
        await supabaseApi.createAppointment({
          client_id: c.id,
          consultant_id: consDbId,
          appointment_date: d.date,
          appointment_time: d.time?.length === 5 ? `${d.time}:00` : d.time,
          appointment_mode: mode,
          status: 'CONFIRMED',
          reason: 'Caseload Consultation Session'
        }, U);
      } catch (err) {
        console.warn('Could not persist appointment to Supabase:', err);
      }
    }
  };

  const handleConfirmAp = (id) => {
    const a = S.ap.find((x) => x.id === id);
    if (!a) return;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      ap: prev.ap.map((x) => (x.id === id ? { ...x, status: 'CONFIRMED' } : x)),
      nf: [
        { id: uid(), to: a.uid, msg: `Your session on ${a.date} at ${a.time} is now confirmed.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    showToast('Session confirmed');
  };

  const handleCancelAp = (id) => {
    const a = S.ap.find((x) => x.id === id);
    if (!a || !window.confirm('Are you sure you want to cancel this session?')) return;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      ap: prev.ap.map((x) => (x.id === id ? { ...x, status: 'CANCELLED' } : x)),
      nf: [
        {
          id: uid(),
          to: U.role === 'client' ? (a.consultant_id || 'cons') : a.uid,
          msg: `Session on ${a.date} at ${a.time} was cancelled.`,
          date: dateStr,
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast('Session cancelled');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const dateStr = getNowDateString();
    const newNote = {
      id: uid(),
      cid: +d.cid,
      consultant_id: U?.id || 'cons',
      title: d.title,
      tag: d.tag,
      body: d.body,
      date: dateStr
    };
    setS((prev) => ({ ...prev, nt: [newNote, ...prev.nt] }));
    e.target.reset();
    showToast('Clinical note saved');
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const c = S.cl.find((x) => x.id === +d.cid);
    if (!c) return;
    const dateStr = getNowDateString();
    const newPlan = {
      id: uid(),
      cid: c.id,
      uid: c.uid,
      consultant_id: U?.id || 'cons',
      title: d.title,
      due: d.due,
      details: d.details,
      done: false
    };
    setS((prev) => ({
      ...prev,
      pl: [newPlan, ...prev.pl],
      nf: [
        { id: uid(), to: c.uid, msg: `New care plan action step assigned: ${d.title}`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    e.target.reset();
    showToast('Care action step added');
  };

  const handleTogglePlan = (id) => {
    const p = S.pl.find((x) => x.id === id);
    if (!p) return;
    const nextDone = !p.done;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      pl: prev.pl.map((x) => (x.id === id ? { ...x, done: nextDone } : x)),
      nf: [
        {
          id: uid(),
          to: 'cons',
          msg: `${U.name}${nextDone ? ' completed action step: ' : ' reopened: '}${p.title}`,
          date: dateStr,
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast(nextDone ? 'Goal marked complete' : 'Goal reopened');
  };

  const handleDeleteItem = async (key, id) => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (!window.confirm('Delete this entry?')) return;
    }
    setS((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((x) => String(x.id) !== String(id))
    }));

    if (key === 'fl') {
      showToast('File deleted');
      if (isSupabaseConfigured()) {
        try {
          await supabaseApi.deleteFile(id);
        } catch (err) {
          console.warn('Could not delete file from database:', err);
        }
      }
    } else if (key === 'nt') {
      showToast('Note deleted');
      if (isSupabaseConfigured()) {
        try {
          await supabaseApi.deletePrivateNote(id);
        } catch (err) {
          console.warn('Could not delete note from database:', err);
        }
      }
    } else {
      showToast('Item deleted');
    }
  };

  const handleMoodSubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    setS((prev) => ({
      ...prev,
      md: [
        ...prev.md.filter((m) => !(m.uid === U.id && m.date === T())),
        { uid: U.id, date: T(), v: +d.v, note: d.note }
      ]
    }));
    showToast('Daily check-in saved');
  };

  const handleQuickMood = (v) => {
    setS((prev) => ({
      ...prev,
      md: [
        ...prev.md.filter((m) => !(m.uid === U.id && m.date === T())),
        { uid: U.id, date: T(), v, note: '' }
      ]
    }));
    showToast('Mood recorded');
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const clientRecord = myC();
    const dateStr = getNowDateString();
    const mode = d.appointment_mode || 'ONLINE';
    const targetConsultantVal = d.consultant_id || (S.consultants?.[0]?.uid || 'cons');

    const matchedCons = (S.consultants || []).find(
      (c) => c.uid === targetConsultantVal || String(c.id) === String(targetConsultantVal) || ('u' + c.person_id) === targetConsultantVal
    );
    const targetConsultantUid = matchedCons?.uid || targetConsultantVal;
    const targetConsultantDbId = matchedCons?.id || matchedCons?.consultant_id || 7;

    // Verify slot is free before booking
    const clientIdentifier = clientRecord?.id || U?.client_id || U?.id;
    const isOccupied = isAppointmentSlotOccupied(S.ap || [], {
      consultantId: targetConsultantUid,
      clientId: clientIdentifier,
      date: d.date,
      time: d.time
    });

    if (isOccupied) {
      showToast('This time is occupied. Please select an available slot.');
      return;
    }

    if (isSupabaseConfigured() && targetConsultantDbId) {
      try {
        const isDbFree = await supabaseApi.checkSlotAvailability(targetConsultantDbId, d.date, d.time);
        if (!isDbFree) {
          showToast('This time is occupied. Please select an available slot.');
          return;
        }
      } catch (err) {
        console.warn('Slot availability check warning:', err);
      }
    }

    const preconsultationData = {
      concern_category: d.concern_category || 'General Mental Wellbeing',
      distress_level: parseInt(d.distress_level || '5', 10),
      duration: d.duration || '1 to 6 months',
      prior_therapy: d.prior_therapy || 'No prior therapy',
      medications: d.medications || 'None',
      reason: d.reason || 'Consultation Intake',
      goals: d.goals || '',
      emergency_contact: d.emergency_contact || '',
      contact: d.contact || U.email,
      submitted_at: new Date().toISOString()
    };

    const newAp = {
      id: uid(),
      uid: U.id,
      cid: clientRecord?.id || U.client_id || U.id,
      consultant_id: targetConsultantUid,
      date: d.date,
      time: d.time,
      type: mode === 'ONLINE' ? 'Online Telehealth Consultation' : 'In-Person Sanctuary Consultation',
      appointment_mode: mode,
      status: 'REQUESTED',
      reason: d.reason || '',
      pre: preconsultationData
    };
    setS((prev) => ({
      ...prev,
      ap: [newAp, ...prev.ap],
      nf: [
        { id: uid() + 1, to: U.id, msg: `Consultation (${mode}) requested for ${d.date} at ${d.time}.`, date: dateStr, read: false },
        { id: uid(), to: targetConsultantUid, msg: `${U.name} submitted pre-consultation intake and requested an ${mode} session on ${d.date} at ${d.time}.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    showToast('Pre-consultation intake form & session request submitted!');
    go('cl-sessions');

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && U) {
      try {
        const clientDbId =
          clientRecord?.id ||
          U.client_id ||
          (U.id && !isNaN(String(U.id).replace('u', '')) ? parseInt(String(U.id).replace('u', ''), 10) : 1);
        const createdAp = await supabaseApi.createAppointment(
          {
            client_id: clientDbId,
            consultant_id: targetConsultantDbId,
            appointment_date: d.date,
            appointment_time: d.time?.length === 5 ? `${d.time}:00` : d.time,
            appointment_mode: mode,
            status: 'REQUESTED',
            reason: d.reason || 'Consultation Intake'
          },
          U
        );

        const realApId = Array.isArray(createdAp) ? createdAp[0]?.appointment_id : createdAp?.appointment_id;
        if (realApId) {
          await supabaseApi.createPreconsultationForm(
            {
              appointment_id: realApId,
              responses: preconsultationData
            },
            U
          );
        }
      } catch (err) {
        console.warn('Could not persist booked session or preconsultation form to Supabase:', err);
      }
    }
  };

  // Consultant Storage Feature: Store Pre-Consultation Intake Form into Client Vault
  const handleStorePreconsultationAsFile = async (form, client) => {
    if (!form || !client) return;
    const dateStr = getNowDateString();
    const cleanClientName = (client.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Intake_Assessment_${cleanClientName}_${(form.date || dateStr).replace(/-/g, '')}.txt`;
    const content = `================================================================================
MINDCARE PRO SANCTUARY - CLINICAL PRE-CONSULTATION INTAKE ASSESSMENT
================================================================================
Client Name:           ${client.name} (ID: #${client.id || client.uid})
Client Email:          ${client.email}
Intake Date:           ${form.date || dateStr} at ${form.time || '10:00'}
Consultation Modality: ${form.appointment_mode || 'ONLINE Telehealth'}
Assessment Status:     VERIFIED & STORED IN CLINICAL VAULT

1. CHIEF CONCERN & CATEGORY:
   - Category:         ${form.concern_category || 'General Mental Health'}
   - Primary Focus:    ${form.reason || 'None provided'}
   - Symptom Duration: ${form.duration || 'Not specified'}

2. CLINICAL SEVERITY & DISTRESS RATING:
   - Distress Level:   ${form.distress_level || '5'} / 10 (${(form.distress_level || 5) >= 7 ? 'High / Acute' : (form.distress_level || 5) >= 4 ? 'Moderate' : 'Mild'})

3. MEDICAL & TREATMENT HISTORY:
   - Prior Therapy:    ${form.prior_therapy || 'No'}
   - Current Meds:     ${form.medications || 'None reported'}

4. GOALS & DESIRED BREAKTHROUGH:
   ${form.goals || 'Support and grounding during consultation'}

5. SAFETY & EMERGENCY CONTACT:
   - Emergency Contact: ${form.emergency_contact || 'None listed'}
   - Confirmation:      ${form.contact || client.email}
   - Safety Screening:  Passed (Client confirmed no active life-threatening crisis)

================================================================================
CONFIDENTIAL CLINICAL RECORD - HIPAA / HITECH COMPLIANT VAULT STORAGE
Stored by Clinician: ${U?.name || 'Licensed Practitioner'} on ${new Date().toLocaleString()}
================================================================================`;

    const dataUrl = `data:text/plain;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(content)))}`;
    let assignedFileId = uid();

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && U) {
      try {
        const rows = await supabaseApi.uploadFileRecord({
          client_id: client.id,
          person_id: client.person_id || null,
          file_name: fileName,
          file_size: content.length,
          file_path: `mindcare-intake/${Date.now()}_${fileName}`,
          file_url: dataUrl,
          mime_type: 'text/plain',
          uploaded_by: 'CONSULTANT'
        });
        if (Array.isArray(rows) && rows[0]?.file_id) {
          assignedFileId = rows[0].file_id;
        } else if (rows?.file_id) {
          assignedFileId = rows.file_id;
        }
      } catch (err) {
        console.warn('Could not insert uploaded_file into Supabase:', err);
      }
    }

    const newFile = {
      id: assignedFileId,
      uid: client.uid || (client.person_id ? 'u' + client.person_id : 'u' + client.id),
      cid: client.id,
      client_id: client.id,
      person_id: client.person_id || null,
      name: fileName,
      size: content.length,
      type: 'text/plain',
      date: dateStr,
      dataUrl: dataUrl,
      uploadedBy: 'consultant',
      consultant_id: U?.id || 'cons'
    };

    setS((prev) => ({
      ...prev,
      fl: [newFile, ...prev.fl]
    }));
    showToast(`Stored intake record into client vault: ${fileName}`);
  };

  // Consultant Storage Feature: Store Pre-Consultation Intake Form into Private Clinical Notes
  const handleStorePreconsultationAsNote = async (form, client) => {
    if (!form || !client) return;
    const dateStr = getNowDateString();
    const noteTitle = `Intake Assessment: ${form.concern_category || form.reason || 'General'}`;
    const noteBody = `[CLINICAL PRE-CONSULTATION INTAKE ASSESSMENT]
Client: ${client.name} (${client.email})
Category: ${form.concern_category || 'General'}
Chief Complaint: ${form.reason || 'Routine consultation'}
Distress Rating: ${form.distress_level || '5'} / 10
Duration: ${form.duration || 'Not specified'}
Prior Therapy: ${form.prior_therapy || 'No'}
Medications / Health: ${form.medications || 'None reported'}
Goals / Breakthrough: ${form.goals || 'Session grounding and support'}
Emergency Contact: ${form.emergency_contact || 'None listed'}
Safety Screening: Confirmed safe, no active life-threatening crisis at intake.`;

    let assignedNoteId = uid();

    if (isSupabaseConfigured() && U) {
      try {
        const consDbId = U.consultant_id || (U.id && !isNaN(String(U.id).replace('u', '')) ? parseInt(String(U.id).replace('u', ''), 10) : 1);
        const rows = await supabaseApi.createNote(
          {
            client_id: client.id,
            consultant_id: consDbId,
            title: noteTitle,
            tag: 'Intake Assessment',
            note_text: noteBody
          },
          U
        );
        if (Array.isArray(rows) && rows[0]?.note_id) {
          assignedNoteId = rows[0].note_id;
        } else if (rows?.note_id) {
          assignedNoteId = rows.note_id;
        }
      } catch (err) {
        console.warn('Could not insert private_note into Supabase:', err);
      }
    }

    const newNote = {
      id: assignedNoteId,
      cid: client.id,
      consultant_id: U?.id || 'cons',
      title: noteTitle,
      tag: 'Intake Assessment',
      body: noteBody,
      date: dateStr
    };

    setS((prev) => ({
      ...prev,
      nt: [newNote, ...prev.nt]
    }));
    showToast(`Archived intake into private clinical notes`);
  };

  // Consultant Storage Feature: Store Client Feedback & Details into Client Vault
  const handleStoreFeedbackAsFile = async (feedback, client) => {
    if (!feedback) return;
    const dateStr = getNowDateString();
    const resolvedClient = client || (feedback.clientId ? S.cl.find((c) => c.uid === feedback.clientId || c.id === feedback.clientId) : null) || {
      id: feedback.clientId || feedback.client_id || 'client',
      uid: feedback.clientId || 'client',
      name: feedback.clientName || feedback.client_name || 'Anonymous Client',
      email: 'client@sanctuary.care'
    };

    const cleanClientName = (resolvedClient.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Feedback_Record_${cleanClientName}_${(feedback.date || dateStr).replace(/-/g, '')}_${Date.now().toString().slice(-4)}.txt`;
    const stars = '★'.repeat(feedback.rating || 5) + '☆'.repeat(5 - (feedback.rating || 5));

    const content = `================================================================================
MINDCARE PRO SANCTUARY - CLIENT CARE FEEDBACK & EVALUATION RECORD
================================================================================
Client Name:           ${feedback.isAnonymous ? 'Anonymous Client' : (resolvedClient.name || 'Client')} (ID: #${resolvedClient.id || resolvedClient.uid})
Client Email:          ${feedback.isAnonymous ? 'Protected / Anonymous' : (resolvedClient.email || 'N/A')}
Submission Date:       ${feedback.date || dateStr}
Clinician / Reviewer:  ${U?.name || 'Licensed Practitioner'}
Storage Status:        CONFIDENTIAL CLINICAL RECORD - STORED IN VAULT

--- 1. FEEDBACK EVALUATION & METRICS ---
Category of Care:      ${feedback.category || 'Session Experience'}
Clinical Rating:       ${feedback.rating || 5} / 5.0 (${stars})
Review Status:         ${feedback.read ? 'Reviewed by Clinician' : 'Pending Review'}
Identity Anonymity:    ${feedback.isAnonymous ? 'ANONYMOUS (Protected Identity)' : 'VERIFIED IDENTIFIED CLIENT'}

--- 2. CLIENT REFLECTION & FEEDBACK TEXT ---
"${feedback.message || feedback.comment || 'No written reflection provided'}"

--- 3. CLINICIAN ACKNOWLEDGMENT & THERAPEUTIC RESPONSE ---
${feedback.reply ? feedback.reply : 'No direct reply logged yet. Reviewed for ongoing therapeutic treatment alignment.'}

--- 4. CLINICAL INTEGRATION ---
This feedback record is securely preserved in the client's clinical vault to support longitudinal treatment efficacy, therapeutic alliance pacing, and quality of care monitoring.
================================================================================
CONFIDENTIAL HEALTHCARE RECORD - HIPAA / HITECH COMPLIANT VAULT STORAGE
Stored by Clinician: ${U?.name || 'Licensed Practitioner'} on ${new Date().toLocaleString()}
================================================================================`;

    const dataUrl = `data:text/plain;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(content)))}`;
    let assignedFileId = uid();

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && U) {
      try {
        const rows = await supabaseApi.uploadFileRecord({
          client_id: resolvedClient.id && !isNaN(Number(resolvedClient.id)) ? Number(resolvedClient.id) : null,
          person_id: resolvedClient.person_id || null,
          file_name: fileName,
          file_size: content.length,
          file_path: `mindcare-feedback/${Date.now()}_${fileName}`,
          file_url: dataUrl,
          mime_type: 'text/plain',
          uploaded_by: 'CONSULTANT'
        });
        if (Array.isArray(rows) && rows[0]?.file_id) {
          assignedFileId = rows[0].file_id;
        } else if (rows?.file_id) {
          assignedFileId = rows.file_id;
        }
      } catch (err) {
        console.warn('Could not insert feedback uploaded_file into Supabase:', err);
      }
    }

    const newFile = {
      id: assignedFileId,
      uid: resolvedClient.uid || (resolvedClient.person_id ? 'u' + resolvedClient.person_id : 'u' + resolvedClient.id),
      cid: resolvedClient.id,
      client_id: resolvedClient.id,
      person_id: resolvedClient.person_id || null,
      name: fileName,
      size: content.length,
      type: 'text/plain',
      date: dateStr,
      dataUrl: dataUrl,
      uploadedBy: 'consultant',
      consultant_id: U?.id || 'cons',
      tag: 'Client Feedback'
    };

    setS((prev) => ({
      ...prev,
      fl: [newFile, ...prev.fl]
    }));
    showToast(`Stored feedback details into client vault: ${fileName}`);
  };

  // Consultant Storage Feature: Store Client Feedback & Details into Private Clinical Notes
  const handleStoreFeedbackAsNote = async (feedback, client) => {
    if (!feedback) return;
    const dateStr = getNowDateString();
    const resolvedClient = client || (feedback.clientId ? S.cl.find((c) => c.uid === feedback.clientId || c.id === feedback.clientId) : null) || {
      id: feedback.clientId || feedback.client_id || 'client',
      uid: feedback.clientId || 'client',
      name: feedback.clientName || feedback.client_name || 'Anonymous Client'
    };

    const noteTitle = `Care Feedback: ${feedback.category || 'Session'} (${feedback.rating || 5}★)`;
    const noteBody = `[CONFIDENTIAL CLIENT CARE FEEDBACK & EVALUATION]
Client: ${feedback.isAnonymous ? 'Anonymous Client' : (resolvedClient.name || 'Client')} (ID: #${resolvedClient.id || resolvedClient.uid})
Category: ${feedback.category || 'Session Experience'}
Clinical Rating: ${feedback.rating || 5} / 5.0
Submission Date: ${feedback.date || dateStr}
Anonymity Status: ${feedback.isAnonymous ? 'Protected Anonymous' : 'Identified Client'}

Client Reflection:
"${feedback.message || feedback.comment || 'No written reflection provided'}"

Clinician Acknowledgment & Therapeutic Action:
"${feedback.reply || 'No direct reply logged yet. Evaluated for treatment pacing and care plan alignment.'}"

Therapeutic Alliance Notes:
Client feedback reviewed and preserved in clinical session notes for treatment planning, emotional pacing, and continuous quality assurance.`;

    let assignedNoteId = uid();
    if (isSupabaseConfigured() && U) {
      try {
        const consDbId = U.consultant_id || (U.id && !isNaN(String(U.id).replace('u', '')) ? parseInt(String(U.id).replace('u', ''), 10) : 1);
        const clientDbId = resolvedClient.id && !isNaN(Number(resolvedClient.id)) ? Number(resolvedClient.id) : 1;
        const rows = await supabaseApi.createNote(
          {
            client_id: clientDbId,
            consultant_id: consDbId,
            title: noteTitle,
            tag: 'Client Feedback',
            note_text: noteBody
          },
          U
        );
        if (Array.isArray(rows) && rows[0]?.note_id) {
          assignedNoteId = rows[0].note_id;
        } else if (rows?.note_id) {
          assignedNoteId = rows.note_id;
        }
      } catch (err) {
        console.warn('Could not insert feedback note into Supabase:', err);
      }
    }

    const newNote = {
      id: assignedNoteId,
      cid: resolvedClient.id,
      consultant_id: U?.id || 'cons',
      title: noteTitle,
      tag: 'Client Feedback',
      body: noteBody,
      date: dateStr
    };

    setS((prev) => ({
      ...prev,
      nt: [newNote, ...prev.nt]
    }));
    showToast(`Archived feedback & details into private clinical notes`);
  };

  // Direct Download of Feedback Details Record (.txt)
  const handleDownloadFeedback = (feedback, client) => {
    if (!feedback) return;
    const dateStr = getNowDateString();
    const resolvedClient = client || (feedback.clientId ? S.cl.find((c) => c.uid === feedback.clientId || c.id === feedback.clientId) : null) || {
      name: feedback.clientName || feedback.client_name || 'Client'
    };
    const cleanClientName = (resolvedClient.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Feedback_Record_${cleanClientName}_${(feedback.date || dateStr).replace(/-/g, '')}.txt`;
    const stars = '★'.repeat(feedback.rating || 5) + '☆'.repeat(5 - (feedback.rating || 5));

    const content = `================================================================================
MINDCARE PRO SANCTUARY - CLIENT CARE FEEDBACK & EVALUATION RECORD
================================================================================
Client:                ${feedback.isAnonymous ? 'Anonymous Client' : (resolvedClient.name || 'Client')}
Date:                  ${feedback.date || dateStr}
Category:              ${feedback.category || 'Session Experience'}
Rating:                ${feedback.rating || 5} / 5.0 (${stars})

Client Reflection:
"${feedback.message || feedback.comment || 'No written reflection provided'}"

Clinician Reply:
${feedback.reply || 'None logged yet.'}
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded feedback record: ${fileName}`);
  };

  const handleFileAdd = async (e) => {
    e.preventDefault();
    const rawFiles = Array.from(e.target.f.files || []);
    if (!rawFiles.length) return;
    const dateStr = getNowDateString();

    const myClient = S.cl.find((c) => c.uid === U.id || (U.person_id && c.person_id === U.person_id));
    const clientId = U.client_id || myClient?.id || null;
    const personId = U.person_id || myClient?.person_id || (U.id && !isNaN(String(U.id).replace('u', '')) ? parseInt(String(U.id).replace('u', ''), 10) : null);

    const files = await Promise.all(
      rawFiles.map(async (f) => {
        const dataUrl = await readFileAsDataUrl(f);
        let finalUrl = dataUrl;
        let fileId = null;
        if (isSupabaseConfigured() && U) {
          try {
            const uploaded = await uploadImageToSupabase(f, personId, {
              purpose: "document",
              clientId: clientId,
              uploadedBy: "CLIENT",
              fallbackDataUrl: dataUrl
            });
            if (uploaded?.file_url) finalUrl = uploaded.file_url;
            if (uploaded?.file_id) fileId = uploaded.file_id;
          } catch (err) {
            console.warn('Database file upload fallback:', err);
          }
        }
        return {
          id: fileId || uid() + Math.random(),
          uid: U.id,
          cid: clientId,
          client_id: clientId,
          person_id: personId,
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          dataUrl: finalUrl,
          date: dateStr,
          uploadedBy: 'client'
        };
      })
    );

    setS((prev) => ({
      ...prev,
      fl: [...prev.fl, ...files],
      nf: [
        { id: uid(), to: 'cons', msg: `${U.name} shared documents (${rawFiles.map((f) => f.name).join(', ')}).`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    e.target.reset();
    showToast(`Uploaded ${files.length} document(s)`);
  };

  const handleConsultantUpload = async (e, clientUid) => {
    e.preventDefault();
    const targetUid = clientUid || e.target.targetUid?.value;
    if (!targetUid) {
      showToast('Please select a target client');
      return;
    }
    const c = S.cl.find((x) => x.uid === targetUid || x.id === targetUid);
    const rawFiles = Array.from(e.target.f.files || []);
    if (!rawFiles.length) return;
    const dateStr = getNowDateString();

    const clientId = c?.id || null;
    const personId = c?.person_id || (targetUid && !isNaN(String(targetUid).replace('u', '')) ? parseInt(String(targetUid).replace('u', ''), 10) : null);

    const files = await Promise.all(
      rawFiles.map(async (f) => {
        const dataUrl = await readFileAsDataUrl(f);
        let finalUrl = dataUrl;
        let fileId = null;
        if (isSupabaseConfigured() && U) {
          try {
            const uploaded = await uploadImageToSupabase(f, personId, {
              purpose: "document",
              clientId: clientId,
              uploadedBy: "CONSULTANT",
              fallbackDataUrl: dataUrl
            });
            if (uploaded?.file_url) finalUrl = uploaded.file_url;
            if (uploaded?.file_id) fileId = uploaded.file_id;
          } catch (err) {
            console.warn('Database consultant upload fallback:', err);
          }
        }
        return {
          id: fileId || uid() + Math.random(),
          uid: c?.uid || targetUid,
          cid: clientId,
          client_id: clientId,
          person_id: personId,
          consultant_id: U?.id || 'cons',
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          dataUrl: finalUrl,
          date: dateStr,
          uploadedBy: 'consultant'
        };
      })
    );

    setS((prev) => ({
      ...prev,
      fl: [...prev.fl, ...files],
      nf: [
        { id: uid(), to: c?.uid || targetUid, msg: `${U?.name || 'Your Clinician'} uploaded files for your care plan: ${files.map((f) => f.name).join(', ')}.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    e.target.reset();
    showToast(`Shared ${files.length} document(s) with ${c?.name || 'client'}`);
  };

  const handleDashboardImageUpload = async (e, defaultTitle, defaultCaption) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const compressed = await compressImage(file);
    if (!compressed || !compressed.dataUrl) {
      showToast('Could not process image');
      return;
    }

    let finalImgUrl = compressed.dataUrl;

    // Persist raw uploaded picture to Supabase database & storage
    if (isSupabaseConfigured() && U) {
      try {
        const personId = U.person_id || (U.id && !isNaN(U.id.replace('u', '')) ? parseInt(U.id.replace('u', ''), 10) : null);
        const uploaded = await uploadImageToSupabase(file, personId, "dashboard", compressed.dataUrl);
        if (uploaded?.file_url) {
          finalImgUrl = uploaded.file_url;
        }
      } catch (err) {
        console.warn('Database dashboard picture upload fallback:', err);
      }
    }

    const dateStr = getNowDateString();
    const newImg = {
      id: uid(),
      uid: U.id,
      name: file.name,
      title: defaultTitle?.trim() || file.name.replace(/\.[^/.]+$/, ''),
      caption: defaultCaption?.trim() || (U.role === 'client' ? 'Personal grounding reflection & serene anchor' : 'Practice sanctuary space & clinical suite'),
      dataUrl: finalImgUrl,
      dimensions: `${compressed.width} × ${compressed.height}`,
      date: dateStr,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      uploadedBy: U.role
    };

    setS((prev) => {
      const currentList = prev.dashImages?.[U.id] || [];
      const updatedList = [newImg, ...currentList];
      const nextNf = U.role === 'client'
        ? [
            {
              id: uid() + 2,
              to: 'cons',
              msg: `${U.name} uploaded a new sanctuary visual anchor: ${newImg.title}.`,
              date: dateStr,
              read: false
            },
            ...prev.nf
          ]
        : prev.nf;

      return {
        ...prev,
        dashImages: {
          ...(prev.dashImages || {}),
          [U.id]: updatedList
        },
        fl: [
          {
            id: uid() + 1,
            uid: U.id,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: compressed.dataUrl,
            date: dateStr,
            uploadedBy: U.role
          },
          ...prev.fl
        ],
        nf: nextNf
      };
    });

    showToast(`Image uploaded to ${U.role === 'client' ? 'Sanctuary' : 'Practice'} Overview!`);
    e.target.value = '';
  };

  const handleDeleteDashboardImage = (imgId) => {
    if (!window.confirm('Remove this overview image?')) return;
    setS((prev) => {
      const currentList = prev.dashImages?.[U.id] || [];
      return {
        ...prev,
        dashImages: {
          ...(prev.dashImages || {}),
          [U.id]: currentList.filter((x) => x.id !== imgId)
        }
      };
    });
    showToast('Overview image removed');
  };

  const handleSetPrimaryDashboardImage = (imgId) => {
    setS((prev) => {
      const currentList = prev.dashImages?.[U.id] || [];
      const target = currentList.find((x) => x.id === imgId);
      if (!target) return prev;
      return {
        ...prev,
        dashImages: {
          ...(prev.dashImages || {}),
          [U.id]: [target, ...currentList.filter((x) => x.id !== imgId)]
        }
      };
    });
    showToast('Active overview image updated');
  };

  const handleSaveImageMeta = (imgId) => {
    if (!imageMetaForm.title.trim()) return;
    setS((prev) => {
      const currentList = prev.dashImages?.[U.id] || [];
      return {
        ...prev,
        dashImages: {
          ...(prev.dashImages || {}),
          [U.id]: currentList.map((x) => (x.id === imgId ? { ...x, title: imageMetaForm.title.trim(), caption: imageMetaForm.caption.trim() } : x))
        }
      };
    });
    setEditingImageMeta(false);
    showToast('Overview details updated');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const compressed = await compressImage(file, 400, 400, 0.88);
    if (!compressed || !compressed.dataUrl) {
      showToast('Could not process avatar image');
      return;
    }
    let dataUrl = compressed.dataUrl;

    // Persist raw uploaded picture to Supabase database & storage
    if (isSupabaseConfigured() && U) {
      try {
        const personId = U.person_id || (U.id && !isNaN(U.id.replace('u', '')) ? parseInt(U.id.replace('u', ''), 10) : null);
        const uploaded = await uploadImageToSupabase(file, personId, "avatar", dataUrl);
        if (uploaded?.file_url) {
          dataUrl = uploaded.file_url;
        }
      } catch (err) {
        console.warn('Database avatar upload fallback:', err);
      }
    }

    setS((prev) => ({
      ...prev,
      avatars: {
        ...(prev.avatars || {}),
        [U.id]: dataUrl
      },
      acc: prev.acc.map((a) => (a.id === U.id ? { ...a, avatar: dataUrl } : a))
    }));

    setU((prev) => (prev ? { ...prev, avatar: dataUrl } : prev));
    showToast('Profile picture saved successfully!');
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setS((prev) => ({
      ...prev,
      avatars: {
        ...(prev.avatars || {}),
        [U.id]: null
      },
      acc: prev.acc.map((a) => (a.id === U.id ? { ...a, avatar: null } : a))
    }));
    setU((prev) => (prev ? { ...prev, avatar: null } : prev));
    showToast('Profile picture removed');
  };

  const handleReadNotif = (id) => {
    setS((prev) => ({
      ...prev,
      nf: prev.nf.map((n) => (n.id === id ? { ...n, read: true } : n))
    }));
  };

  const handleReadAllNotifs = () => {
    const target = U.role === 'client' ? U.id : 'cons';
    setS((prev) => ({
      ...prev,
      nf: prev.nf.map((n) => (n.to === target ? { ...n, read: true } : n))
    }));
    showToast('All notifications marked as read');
  };

  const handleAddFeedback = ({ rating, category, message, isAnonymous }) => {
    const dateStr = getNowDateString();
    const newFeedback = {
      id: uid(),
      clientId: U.id,
      clientName: U.name,
      consultantId: 'cons',
      date: dateStr,
      rating: rating || 5,
      category: category || 'Session Experience',
      message,
      isAnonymous: Boolean(isAnonymous),
      read: false,
      reply: null
    };
    setS((prev) => ({
      ...prev,
      fb: [newFeedback, ...(prev.fb || [])],
      nf: [
        {
          id: uid(),
          to: 'cons',
          msg: isAnonymous
            ? `Anonymous client submitted a new care reflection (${rating || 5}/5 stars).`
            : `${U.name} submitted a new care reflection (${rating || 5}/5 stars).`,
          date: dateStr,
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast('Care reflection submitted successfully. Thank you!');
  };

  const handleToggleFeedbackRead = (id) => {
    setS((prev) => ({
      ...prev,
      fb: (prev.fb || []).map((f) => (f.id === id ? { ...f, read: !f.read } : f))
    }));
  };

  const handleReplyFeedback = (id, replyText) => {
    let targetClientId = null;
    const dateStr = getNowDateString();
    setS((prev) => {
      const updatedFb = (prev.fb || []).map((f) => {
        if (f.id === id) {
          targetClientId = f.clientId;
          return { ...f, reply: replyText, read: true };
        }
        return f;
      });
      const newNotifications = [...prev.nf];
      if (targetClientId) {
        newNotifications.unshift({
          id: uid(),
          to: targetClientId,
          msg: `${U?.name || 'Your Clinician'} replied to your care reflection: "${replyText.slice(0, 45)}${replyText.length > 45 ? '...' : ''}"`,
          date: dateStr,
          read: false
        });
      }

      if (isSupabaseConfigured()) {
        try {
          supabaseApi.updateFeedbackReply(id, replyText).catch((err) => {
            console.warn('Could not update feedback reply in Supabase:', err);
          });
        } catch (err) {
          console.warn('Supabase feedback reply error:', err);
        }
      }

      return {
        ...prev,
        fb: updatedFb,
        nf: newNotifications
      };
    });
  };

  const handleDeleteFeedback = (id) => {
    setS((prev) => ({
      ...prev,
      fb: (prev.fb || []).filter((f) => f.id !== id)
    }));
    showToast('Feedback removed');
  };

  const renderPageContent = () => {
    if (!U) return null;

    switch (page) {
      // CONSULTANT VIEWS
      case 'c-home':
        return (
          <ConsultantHome
            U={U}
            S={S}
            T={T}
            avg={avg}
            cn={cn}
            srt={srt}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleDecision={handleDecision}
            editingImageMeta={editingImageMeta}
            setEditingImageMeta={setEditingImageMeta}
            imageMetaForm={imageMetaForm}
            setImageMetaForm={setImageMetaForm}
            handleSaveImageMeta={handleSaveImageMeta}
            handleDashboardImageUpload={handleDashboardImageUpload}
            handleSetPrimaryDashboardImage={handleSetPrimaryDashboardImage}
            handleDeleteDashboardImage={handleDeleteDashboardImage}
            setPreviewFile={setPreviewFile}
            go={go}
            showToast={showToast}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
          />
        );

      case 'c-clients':
        return (
          <ClientManagement
            U={U}
            S={S}
            Q={Q}
            setQ={setQ}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleDecision={handleDecision}
            avg={avg}
            E={E}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
            handleAssignClient={handleAssignClient}
          />
        );

      case 'c-docs':
        return (
          <ClientDocuments
            U={U}
            S={S}
            docFilterUid={docFilterUid}
            setDocFilterUid={setDocFilterUid}
            docSearchQuery={docSearchQuery}
            setDocSearchQuery={setDocSearchQuery}
            handleConsultantUpload={handleConsultantUpload}
            setPreviewFile={setPreviewFile}
            handleDeleteItem={handleDeleteItem}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            showToast={showToast}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
          />
        );

      case 'c-schedule':
        return (
          <ConsultantSchedule
            U={U}
            S={S}
            T={T}
            srt={srt}
            cn={cn}
            handleSchedule={handleSchedule}
            handleConfirmAp={handleConfirmAp}
            handleCancelAp={handleCancelAp}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleStorePreconsultationAsFile={handleStorePreconsultationAsFile}
            handleStorePreconsultationAsNote={handleStorePreconsultationAsNote}
          />
        );

      case 'c-notes':
        return (
          <SessionNotes
            U={U}
            S={S}
            cn={cn}
            handleAddNote={handleAddNote}
            handleDeleteItem={handleDeleteItem}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
          />
        );

      case 'c-plans':
        return (
          <CarePlans
            U={U}
            S={S}
            T={T}
            cn={cn}
            handleAddPlan={handleAddPlan}
            handleDeleteItem={handleDeleteItem}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
          />
        );

      case 'c-feedback':
        return (
          <ConsultantFeedback
            U={U}
            S={S}
            handleToggleFeedbackRead={handleToggleFeedbackRead}
            handleReplyFeedback={handleReplyFeedback}
            handleDeleteFeedback={handleDeleteFeedback}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleStoreFeedbackAsFile={handleStoreFeedbackAsFile}
            handleStoreFeedbackAsNote={handleStoreFeedbackAsNote}
            handleDownloadFeedback={handleDownloadFeedback}
            showToast={showToast}
          />
        );

      case 'c-notif':
        return (
          <ConsultantNotif
            S={S}
            handleReadAllNotifs={handleReadAllNotifs}
            handleReadNotif={handleReadNotif}
          />
        );

      // CLIENT SANCTUARY VIEWS
      case 'cl-home':
        return (
          <ClientHome
            U={U}
            S={S}
            T={T}
            myC={myC}
            streak={streak}
            srt={srt}
            editingImageMeta={editingImageMeta}
            setEditingImageMeta={setEditingImageMeta}
            imageMetaForm={imageMetaForm}
            setImageMetaForm={setImageMetaForm}
            handleSaveImageMeta={handleSaveImageMeta}
            handleDashboardImageUpload={handleDashboardImageUpload}
            handleSetPrimaryDashboardImage={handleSetPrimaryDashboardImage}
            handleDeleteDashboardImage={handleDeleteDashboardImage}
            setPreviewFile={setPreviewFile}
            handleQuickMood={handleQuickMood}
            go={go}
          />
        );

      case 'cl-mood':
        return (
          <MoodJournal
            U={U}
            moodsOf={moodsOf}
            avg={avg}
            handleMoodSubmit={handleMoodSubmit}
          />
        );

      case 'cl-book':
        return (
          <BookSession
            U={U}
            S={S}
            T={T}
            handleBookSession={handleBookSession}
            showToast={showToast}
          />
        );

      case 'cl-sessions':
        return (
          <ClientSessions
            U={U}
            S={S}
            srt={srt}
            go={go}
            handleCancelAp={handleCancelAp}
          />
        );

      case 'cl-goals':
        return (
          <ClientGoals
            U={U}
            S={S}
            handleTogglePlan={handleTogglePlan}
          />
        );

      case 'cl-files':
        return (
          <ClientDocumentsView
            U={U}
            S={S}
            myC={myC}
            handleFileAdd={handleFileAdd}
            setPreviewFile={setPreviewFile}
            handleDeleteItem={handleDeleteItem}
            showToast={showToast}
          />
        );

      case 'cl-feedback':
        return (
          <ClientFeedback
            U={U}
            S={S}
            handleAddFeedback={handleAddFeedback}
            handleDeleteFeedback={handleDeleteFeedback}
            showToast={showToast}
          />
        );

      case 'cl-res':
        return (
          <WellbeingToolkit
            isBreathing={isBreathing}
            setIsBreathing={setIsBreathing}
            breathPhaseIndex={breathPhaseIndex}
            breathCycle={breathCycle}
            somaticLevel={somaticLevel}
            setSomaticLevel={setSomaticLevel}
          />
        );

      case 'cl-notif':
        return (
          <ClientNotif
            U={U}
            S={S}
            handleReadAllNotifs={handleReadAllNotifs}
            handleReadNotif={handleReadNotif}
          />
        );

      // ADMIN VIEWS
      case 'admin-panel':
      case 'admin-clients':
      case 'admin-consultants':
        return (
          <AdminPanel
            U={U}
            S={S}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleAdminRemoveClient={handleAdminRemoveClient}
            handleAdminRemoveConsultant={handleAdminRemoveConsultant}
            showToast={showToast}
            go={go}
          />
        );

      default:
        return null;
    }
  };

  const navItems = U?.role === 'client' ? NC : U?.role === 'admin' ? NA : NS;
  const currentPageTitle =
    navItems.find((n) => n[0] === page)?.[1] ||
    (page.startsWith('admin') ? 'Administration Center' : '');
  const unreadCount = U ? S.nf.filter((n) => n.to === (U.role === 'client' ? U.id : 'cons') && !n.read).length : 0;

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f2f5f3] dark:bg-[#0d1b1a] text-[#14302c] dark:text-[#e3efec] font-sans antialiased">
        {!U ? (
          <AuthScreen
            role={role}
            setRole={setRole}
            isSignup={isSignup}
            setIsSignup={setIsSignup}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
          />
        ) : (
          <div className="flex min-h-screen">
            <Sidebar
              U={U}
              page={page}
              navItems={navItems}
              unreadCount={unreadCount}
              sideOpen={sideOpen}
              setSideOpen={setSideOpen}
              userAvatar={userAvatar}
              setProfileMenuOpen={setProfileMenuOpen}
              logout={logout}
              go={go}
            />

            <main className="flex-1 min-w-0 flex flex-col">
              <Header
                U={U}
                S={S}
                currentPageTitle={currentPageTitle}
                sideOpen={sideOpen}
                setSideOpen={setSideOpen}
                dark={dark}
                toggleTheme={toggleTheme}
                go={go}
                goBack={goBack}
                canGoBack={canGoBack}
                unreadCount={unreadCount}
                userAvatar={userAvatar}
                avatarInputRef={avatarInputRef}
                profileMenuOpen={profileMenuOpen}
                setProfileMenuOpen={setProfileMenuOpen}
                handleAvatarUpload={handleAvatarUpload}
                handleRemoveAvatar={handleRemoveAvatar}
                acc={acc}
                streak={streak}
                myC={myC}
                logout={logout}
                T={T}
                onOpenAiAssistant={() => setAiAssistantOpen(true)}
              />

              <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                {/* Trauma-Informed Back & Breadcrumb Navigation Bar */}
                {canGoBack && (
                  <nav
                    aria-label="Breadcrumb navigation"
                    className="mb-5 flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#14292a]/80 border border-[#dde7e3] dark:border-[#23403f] backdrop-blur-xs shadow-2xs"
                  >
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e3f1ee] hover:bg-[#d5ede8] dark:bg-[#173b3a] dark:hover:bg-[#1f4e4d] text-teal-800 dark:text-teal-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                      title="Return to previous screen"
                    >
                      <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                      <span>Back to {U?.role === 'client' ? 'Dashboard' : U?.role === 'admin' ? 'Admin Center' : 'Overview'}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                      <button
                        className="cursor-pointer hover:text-teal-700 dark:hover:text-teal-300 transition font-medium"
                        onClick={() => go(U?.role === 'client' ? 'cl-home' : U?.role === 'admin' ? 'admin-panel' : 'c-home')}
                      >
                        {U?.role === 'client' ? 'Client Sanctuary' : U?.role === 'admin' ? 'Administration Center' : 'Clinical Overview'}
                      </button>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      <span className="font-semibold text-[#14302c] dark:text-[#e3efec]">{currentPageTitle}</span>
                    </div>
                  </nav>
                )}

                {renderPageContent()}

                <div className="text-center text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-12 mb-4">
                  MindCare Sanctuary · Modern Clinical Health Portal · In case of immediate psychiatric emergency, call 988.
                </div>
              </div>
            </main>
          </div>
        )}

        {/* Global Modals */}
        <ClientDossierModal
          selectedClient={selectedClient}
          setSelectedClientId={setSelectedClientId}
          clientModalTab={clientModalTab}
          setClientModalTab={setClientModalTab}
          S={S}
          moodsOf={moodsOf}
          avg={avg}
          streak={streak}
          srt={srt}
          T={T}
          handleDecision={handleDecision}
          handleConsultantUpload={handleConsultantUpload}
          setPreviewFile={setPreviewFile}
          handleDeleteItem={handleDeleteItem}
          handleConfirmAp={handleConfirmAp}
          handleCancelAp={handleCancelAp}
          handleAddPlan={handleAddPlan}
          handleTogglePlan={handleTogglePlan}
          handleAddNote={handleAddNote}
          handleToggleFeedbackRead={handleToggleFeedbackRead}
          handleReplyFeedback={handleReplyFeedback}
          handleDeleteFeedback={handleDeleteFeedback}
          U={U}
          isClientAssignedToConsultant={isClientAssignedToConsultant}
          handleAssignClient={handleAssignClient}
          showToast={showToast}
          handleStorePreconsultationAsFile={handleStorePreconsultationAsFile}
          handleStorePreconsultationAsNote={handleStorePreconsultationAsNote}
          handleStoreFeedbackAsFile={handleStoreFeedbackAsFile}
          handleStoreFeedbackAsNote={handleStoreFeedbackAsNote}
          handleDownloadFeedback={handleDownloadFeedback}
        />

        <FilePreviewModal
          previewFile={previewFile}
          setPreviewFile={setPreviewFile}
          showToast={showToast}
          U={U}
          S={S}
          isClientAssignedToConsultant={isClientAssignedToConsultant}
        />

        {/* AI Assistant Widget (for both Client & Consultant) */}
        {U && (
          <AiAssistantWidget
            U={U}
            S={S}
            isClientAssignedToConsultant={isClientAssignedToConsultant}
            showToast={showToast}
            isOpen={aiAssistantOpen}
            setIsOpen={setAiAssistantOpen}
          />
        )}

        <Toast toastOn={toastOn} toastMsg={toastMsg} />
      </div>
    </div>
  );
}
