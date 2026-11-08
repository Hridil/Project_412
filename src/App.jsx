import React, { useState, useEffect, useRef } from 'react';

// Formatters & Media Utilities
import { T, uid, srt, dOff, getNowDateString } from './utils/formatters.js';
import { compressImage, readFileAsDataUrl } from './utils/mediaUtils.js';

// Constants & Data Seed
import { NS, NC, E } from './data/constants.js';
import { seed } from './data/seedData.js';

// Layout & Common Components
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Toast from './components/common/Toast.jsx';

// Modals
import ClientDossierModal from './components/modals/ClientDossierModal.jsx';
import FilePreviewModal from './components/modals/FilePreviewModal.jsx';

// Views
import AuthScreen from './views/auth/AuthScreen.jsx';
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
        if (!parsed.fb) {
          parsed.fb = seed().fb;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return seed();
  });

  const [U, setU] = useState(null);
  const [role, setRoleState] = useState('consultant');
  const [isSignup, setIsSignup] = useState(false);
  const [page, setPage] = useState('c-home');
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

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mcpro', JSON.stringify(S));
    } catch {
      // ignore
    }
  }, [S]);

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

  const exportData = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mindcare-data-${T()}.json`;
    a.click();
    showToast('Data exported successfully');
  };

  const setRole = (r) => {
    setRoleState(r);
    setIsSignup(false);
  };

  const go = (p) => {
    setPage(p);
    setSideOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const logout = () => {
    setU(null);
    setRole('consultant');
    setIsBreathing(false);
    setProfileMenuOpen(false);
  };

  // Helper getters
  const myC = () => S.cl.find((c) => c.uid === U?.id);
  const cn = (id) => S.cl.find((c) => c.id === id)?.name || 'Client';
  const selectedClient = S.cl.find((c) => c.id === selectedClientId) || null;
  const acc = () => S.cl.filter((c) => c.status === 'Accepted');
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
  const handleLogin = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const u = S.acc.find(
      (a) => a.email === d.email.trim().toLowerCase() && a.pw === d.pw && a.role === role
    );
    if (!u) {
      showToast(`No ${role} account matches those credentials.`);
      return;
    }
    setU(u);
    go(u.role === 'client' ? 'cl-home' : 'c-home');
    showToast(`Welcome back, ${u.name}`);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const em = d.email.trim().toLowerCase();
    if (S.acc.some((a) => a.email === em)) {
      showToast('Email already registered. Please sign in.');
      return;
    }
    const id = 'u' + uid();
    const newAcc = { id, name: d.name.trim(), email: em, pw: d.pw, role: 'client', avatar: null };
    const newCl = { id: uid(), uid: id, name: d.name.trim(), email: em, status: 'Pending', reason: d.reason };
    const dateStr = getNowDateString();

    setS((prev) => ({
      ...prev,
      acc: [...prev.acc, newAcc],
      cl: [...prev.cl, newCl],
      nf: [
        { id: uid() + 1, to: 'cons', msg: `${d.name} requested clinical access.`, date: dateStr, read: false },
        { id: uid(), to: id, msg: 'Welcome to MindCare Sanctuary. Your access request is currently pending clinical review.', date: dateStr, read: false },
        ...prev.nf
      ]
    }));

    showToast('Account created. Please sign in.');
    e.target.reset();
    setIsSignup(false);
  };

  // Action Handlers
  const handleDecision = (id, status) => {
    const c = S.cl.find((x) => x.id === id);
    if (!c) return;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      cl: prev.cl.map((x) => (x.id === id ? { ...x, status } : x)),
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
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const c = S.cl.find((x) => x.id === +d.cid);
    if (!c) return;
    const dateStr = getNowDateString();
    const newAp = { id: uid(), uid: c.uid, cid: c.id, date: d.date, time: d.time, type: d.type, status: 'Confirmed' };
    setS((prev) => ({
      ...prev,
      ap: [...prev.ap, newAp],
      nf: [
        { id: uid(), to: c.uid, msg: `A consultation was scheduled for ${d.date} at ${d.time}.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    showToast('Session scheduled');
    e.target.reset();
  };

  const handleConfirmAp = (id) => {
    const a = S.ap.find((x) => x.id === id);
    if (!a) return;
    const dateStr = getNowDateString();
    setS((prev) => ({
      ...prev,
      ap: prev.ap.map((x) => (x.id === id ? { ...x, status: 'Confirmed' } : x)),
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
      ap: prev.ap.filter((x) => x.id !== id),
      nf: [
        {
          id: uid(),
          to: U.role === 'client' ? 'cons' : a.uid,
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
    const newNote = { id: uid(), cid: +d.cid, title: d.title, tag: d.tag, body: d.body, date: dateStr };
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
    const newPlan = { id: uid(), cid: c.id, uid: c.uid, title: d.title, due: d.due, details: d.details, done: false };
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

  const handleDeleteItem = (key, id) => {
    if (!window.confirm('Delete this entry?')) return;
    setS((prev) => ({ ...prev, [key]: prev[key].filter((x) => x.id !== id) }));
    showToast('Item deleted');
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

  const handleBookSession = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const clientRecord = myC();
    const dateStr = getNowDateString();
    const newAp = {
      id: uid(),
      uid: U.id,
      cid: clientRecord?.id,
      date: d.date,
      time: d.time,
      type: d.type,
      status: 'Requested',
      pre: { reason: d.reason, goals: d.goals, contact: d.contact }
    };
    setS((prev) => ({
      ...prev,
      ap: [...prev.ap, newAp],
      nf: [
        { id: uid() + 1, to: U.id, msg: `Consultation requested for ${d.date} at ${d.time}.`, date: dateStr, read: false },
        { id: uid(), to: 'cons', msg: `${U.name} requested session on ${d.date} at ${d.time}.`, date: dateStr, read: false },
        ...prev.nf
      ]
    }));
    showToast('Session request submitted');
    go('cl-sessions');
  };

  const handleFileAdd = async (e) => {
    e.preventDefault();
    const rawFiles = Array.from(e.target.f.files || []);
    if (!rawFiles.length) return;
    const dateStr = getNowDateString();

    const files = await Promise.all(
      rawFiles.map(async (f) => {
        const dataUrl = await readFileAsDataUrl(f);
        return {
          id: uid() + Math.random(),
          uid: U.id,
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          dataUrl,
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
    const c = S.cl.find((x) => x.uid === targetUid);
    const rawFiles = Array.from(e.target.f.files || []);
    if (!rawFiles.length) return;
    const dateStr = getNowDateString();

    const files = await Promise.all(
      rawFiles.map(async (f) => {
        const dataUrl = await readFileAsDataUrl(f);
        return {
          id: uid() + Math.random(),
          uid: targetUid,
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          dataUrl,
          date: dateStr,
          uploadedBy: 'consultant'
        };
      })
    );

    setS((prev) => ({
      ...prev,
      fl: [...prev.fl, ...files],
      nf: [
        { id: uid(), to: targetUid, msg: `Dr. Demo Consultant uploaded files for your care plan: ${files.map((f) => f.name).join(', ')}.`, date: dateStr, read: false },
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

    const dateStr = getNowDateString();
    const newImg = {
      id: uid(),
      uid: U.id,
      name: file.name,
      title: defaultTitle?.trim() || file.name.replace(/\.[^/.]+$/, ''),
      caption: defaultCaption?.trim() || (U.role === 'client' ? 'Personal grounding reflection & serene anchor' : 'Practice sanctuary space & clinical suite'),
      dataUrl: compressed.dataUrl,
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
    const dataUrl = compressed.dataUrl;

    setS((prev) => ({
      ...prev,
      avatars: {
        ...(prev.avatars || {}),
        [U.id]: dataUrl
      },
      acc: prev.acc.map((a) => (a.id === U.id ? { ...a, avatar: dataUrl } : a))
    }));

    setU((prev) => (prev ? { ...prev, avatar: dataUrl } : prev));
    showToast('Profile picture updated successfully!');
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
          msg: `Dr. Demo Consultant replied to your care reflection: "${replyText.slice(0, 45)}${replyText.length > 45 ? '...' : ''}"`,
          date: dateStr,
          read: false
        });
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
            acc={acc}
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
          />
        );

      case 'c-clients':
        return (
          <ClientManagement
            S={S}
            Q={Q}
            setQ={setQ}
            setSelectedClientId={setSelectedClientId}
            setClientModalTab={setClientModalTab}
            handleDecision={handleDecision}
            avg={avg}
            E={E}
          />
        );

      case 'c-docs':
        return (
          <ClientDocuments
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
          />
        );

      case 'c-schedule':
        return (
          <ConsultantSchedule
            S={S}
            T={T}
            srt={srt}
            cn={cn}
            handleSchedule={handleSchedule}
            handleConfirmAp={handleConfirmAp}
            handleCancelAp={handleCancelAp}
          />
        );

      case 'c-notes':
        return (
          <SessionNotes
            S={S}
            cn={cn}
            handleAddNote={handleAddNote}
            handleDeleteItem={handleDeleteItem}
          />
        );

      case 'c-plans':
        return (
          <CarePlans
            S={S}
            T={T}
            cn={cn}
            handleAddPlan={handleAddPlan}
            handleDeleteItem={handleDeleteItem}
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
            T={T}
            handleBookSession={handleBookSession}
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

      default:
        return null;
    }
  };

  const navItems = U?.role === 'client' ? NC : NS;
  const currentPageTitle = navItems.find((n) => n[0] === page)?.[1] || '';
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
              exportData={exportData}
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
              />

              <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
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
        />

        <FilePreviewModal
          previewFile={previewFile}
          setPreviewFile={setPreviewFile}
          showToast={showToast}
        />

        <Toast toastOn={toastOn} toastMsg={toastMsg} />
      </div>
    </div>
  );
}
