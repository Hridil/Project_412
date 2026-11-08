import React, { useState, useEffect, useRef } from 'react';

const T = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.floor(Date.now() * 1000 + Math.random() * 1000);
const srt = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
const dOff = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const getNowDateString = () => new Date().toLocaleDateString();

const seed = () => ({
  acc: [
    { id: 'cons', name: 'Dr. Demo Consultant', email: 'demo@mindcare.com', pw: 'MindCare123', role: 'consultant' },
    { id: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', pw: 'Client123', role: 'client' },
    { id: 'jamie', name: 'Jamie Lee', email: 'jamie@example.com', pw: 'Jamie1234', role: 'client' }
  ],
  cl: [
    { id: 1, uid: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', status: 'Pending', reason: 'General wellness & stress management' },
    { id: 2, uid: 'jamie', email: 'jamie@example.com', name: 'Jamie Lee', status: 'Accepted', reason: 'Anxiety pacing & mindfulness CBT' }
  ],
  ap: [
    { id: 5, uid: 'jamie', cid: 2, date: dOff(1), time: '10:00', type: 'Online Telehealth Consultation', status: 'Confirmed' }
  ],
  nt: [
    { id: 101, cid: 2, title: 'Intake Reflection', tag: 'Observation', body: 'Client responded well to grounding techniques. Demonstrates high commitment to consistent daily check-ins.', date: new Date().toLocaleDateString() }
  ],
  pl: [
    { id: 201, cid: 2, uid: 'jamie', title: '5-Minute Morning Box Breathing', due: dOff(3), details: 'Perform 4 breath cycles before checking digital notifications.', done: false },
    { id: 202, cid: 2, uid: 'jamie', title: 'Nature walk & sensory grounding', due: dOff(5), details: 'Practice 5-4-3-2-1 technique outdoors during afternoon recess.', done: true }
  ],
  nf: [
    { id: 301, to: 'cons', msg: 'Jamie Lee scheduled a session for tomorrow at 10:00 AM.', date: new Date().toLocaleDateString(), read: false },
    { id: 302, to: 'jamie', msg: 'Your session with Dr. Demo Consultant is confirmed.', date: new Date().toLocaleDateString(), read: false }
  ],
  fl: [
    { id: 401, uid: 'jamie', name: 'Intake_Wellness_Questionnaire.pdf', size: 142000, date: dOff(-2), uploadedBy: 'client' },
    { id: 402, uid: 'jamie', name: 'Mindfulness_Grounding_Worksheet.pdf', size: 98000, date: dOff(-1), uploadedBy: 'consultant' },
    { id: 403, uid: 'cdemo', name: 'Initial_Assessment_Packet.pdf', size: 215000, date: dOff(0), uploadedBy: 'client' }
  ],
  md: [3, 2, 3, 4, 3, 4, 4].map((v, i) => ({ uid: 'jamie', date: dOff(i - 6), v, note: i === 6 ? 'Feeling calm and centered after mindfulness practice.' : '' })),
  dashImages: {
    cons: [
      {
        id: 'img-seed-cons',
        name: 'Sanctuary_Practice_Atrium.jpg',
        title: 'MindCare Clinical Sanctuary Center',
        caption: 'Trauma-informed physical suites and digital telehealth consultation rooms.',
        dataUrl: '',
        dimensions: '1920 × 1080',
        date: getNowDateString(),
        size: '185 KB',
        uploadedBy: 'consultant'
      }
    ],
    jamie: [
      {
        id: 'img-seed-jamie',
        name: 'Coastal_Serenity_Anchor.jpg',
        title: 'Coastal Morning Serenity',
        caption: 'Visual anchor for 5-4-3-2-1 nervous system grounding and box breathing.',
        dataUrl: '',
        dimensions: '1600 × 900',
        date: getNowDateString(),
        size: '142 KB',
        uploadedBy: 'client'
      }
    ]
  }
});

const MOODS = [
  { val: 1, emoji: '😞', label: 'Depleted', desc: 'Low energy & overwhelmed' },
  { val: 2, emoji: '🙁', label: 'Guarded', desc: 'Tense or feeling vulnerable' },
  { val: 3, emoji: '😐', label: 'Steady', desc: 'Neutral, present, functional' },
  { val: 4, emoji: '🙂', label: 'Grounded', desc: 'Calm, focused, connected' },
  { val: 5, emoji: '😄', label: 'Vital', desc: 'Energized, joyful, uplifted' }
];

const E = ['😞', '🙁', '😐', '🙂', '😄'];

const NS = [
  ['c-home', 'Overview', 'dashboard'],
  ['c-clients', 'Clients', 'groups'],
  ['c-docs', 'Client Files', 'folder_shared'],
  ['c-schedule', 'Schedule', 'calendar_month'],
  ['c-notes', 'Session Notes', 'edit_note'],
  ['c-plans', 'Care Plans', 'fact_check'],
  ['c-notif', 'Notifications', 'notifications']
];

const NC = [
  ['cl-home', 'Dashboard', 'dashboard'],
  ['cl-mood', 'Mood Journal', 'wb_sunny'],
  ['cl-book', 'Book Session', 'add_circle'],
  ['cl-sessions', 'My Sessions', 'calendar_month'],
  ['cl-goals', 'My Goals', 'check_circle'],
  ['cl-files', 'Documents', 'upload_file'],
  ['cl-res', 'Wellbeing Toolkit', 'local_florist'],
  ['cl-notif', 'Notifications', 'notifications']
];

// Tailwind Reusable Class Presets
const clsInput = "w-full px-3.5 py-2.5 border border-[#dde7e3] dark:border-[#23403f] rounded-[10px] bg-white dark:bg-[#14292a] text-[#14302c] dark:text-[#e3efec] focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400 transition-colors text-sm";
const clsTextarea = `${clsInput} min-h-[96px] resize-y`;
const clsLabel = "block text-[13px] font-semibold mt-3 mb-1.5 text-[#14302c] dark:text-[#e3efec]";
const clsBtnPrimary = "inline-flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition shadow-xs text-sm";
const clsBtnSecondary = "inline-flex items-center justify-center gap-1.5 bg-[#e3f1ee] hover:bg-[#d5ede8] dark:bg-[#173b3a] dark:hover:bg-[#1f4e4d] text-[#0b5a54] dark:text-teal-300 font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition text-sm";
const clsBtnDanger = "inline-flex items-center justify-center gap-1.5 bg-[#fde8e4] hover:bg-[#fbd3cc] dark:bg-[#3b1f1b] dark:hover:bg-[#502923] text-[#b3392a] dark:text-[#f4a496] font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition text-sm";
const clsCard = "bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl p-5 shadow-sm min-w-0 transition-colors";
const clsCardTitle = "font-serif text-lg font-bold mt-0 mb-3 text-[#14302c] dark:text-[#e3efec]";
const clsRow = "py-3 border-b border-[#dde7e3] dark:border-[#23403f] last:border-b-0";
const clsRowHeader = "flex justify-between items-center gap-2.5 flex-wrap";
const clsMuted = "text-[#5f7571] dark:text-[#8fa8a3] text-[13px]";

export default function App() {
  const [S, setS] = useState(() => {
    try {
      const saved = localStorage.getItem('mcpro');
      if (saved) return JSON.parse(saved);
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
    const newAcc = { id, name: d.name.trim(), email: em, pw: d.pw, role: 'client' };
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
    showToast(`Mood recorded: ${E[v - 1]}`);
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

  const getFileIcon = (name = '') => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return 'description';
    if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'audio_file';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
    return 'draft';
  };

  const compressImage = (file, maxWidth = 1280, maxHeight = 800, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ dataUrl, width, height });
        };
        img.onerror = () => resolve({ dataUrl: e.target.result, width: 0, height: 0 });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
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

  const userAvatar = U?.avatar || S.avatars?.[U?.id] || null;

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

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      // Avoid localStorage crashes if user uploads a huge file (> 3MB)
      if (file.size > 3 * 1024 * 1024) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadFile = (f) => {
    // If original uploaded data exists, download the real intact binary file!
    if (f.dataUrl) {
      const a = document.createElement('a');
      a.href = f.dataUrl;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded original file: ${f.name}`);
      return;
    }

    // Fallback for seed mock files: generate a valid PDF or text file
    let blob;
    let downloadName = f.name;
    if (f.name.toLowerCase().endsWith('.pdf')) {
      const cleanTitle = f.name.replace(/[^a-zA-Z0-9._-]/g, ' ');
      const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT\n/F1 16 Tf\n50 720 Td\n(MindCare Sanctuary - Clinical Document) Tj\n/F1 12 Tf\n50 690 Td\n(${cleanTitle}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000257 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n427\n%%EOF`;
      blob = new Blob([pdf], { type: 'application/pdf' });
    } else {
      const content = `MindCare Sanctuary - Confidential Clinical Vault Record\n\nFilename: ${f.name}\nSize: ${f.size} bytes\nDate: ${f.date || 'Recent'}\nSource: ${f.uploadedBy === 'consultant' ? 'Dr. Demo Consultant' : 'Client Upload'}\nAccess Level: HIPAA/HITECH Certified Secure File\n\nThis is a verified document record within MindCare Pro Sanctuary.`;
      blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      if (!downloadName.toLowerCase().endsWith('.txt')) {
        downloadName = `${downloadName}.txt`;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded: ${downloadName}`);
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

  // UI Components
  const renderChip = (status) => {
    const colorMap = {
      Pending: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
      Requested: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
      Rejected: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
      Accepted: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
      Confirmed: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
      Completed: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
      'In progress': 'bg-[#e3f1ee] text-teal-700 dark:bg-[#173b3a] dark:text-teal-300'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[status] || colorMap['In progress']}`}>
        {status}
      </span>
    );
  };

  const renderStat = (label, value, sub, borderColorClass, iconName) => (
    <div className={`${clsCard} relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${borderColorClass}`} />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3] tracking-wider">{label}</span>
        {iconName && (
          <span className="w-8 h-8 rounded-lg bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">{iconName}</span>
          </span>
        )}
      </div>
      <div className="my-2">
        <span className="block font-serif text-[30px] font-bold text-[#14302c] dark:text-[#e3efec] leading-none">{value}</span>
      </div>
      <span className={clsMuted}>{sub}</span>
    </div>
  );

  const renderEmpty = (msg) => (
    <div className="text-center text-[#5f7571] dark:text-[#8fa8a3] py-8">
      <span className="material-symbols-outlined text-3xl opacity-40 mb-1">spa</span>
      <p className="text-sm">{msg}</p>
    </div>
  );

  const renderHeader = (title, sub) => (
    <div className="mb-6">
      <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec] tracking-tight">{title}</h1>
      <div className={`${clsMuted} mt-1`}>{sub}</div>
    </div>
  );

  const renderChart = (values) => {
    if (values.length < 2) return renderEmpty('Log at least two check-ins to view the trend trajectory.');
    const w = 520;
    const h = 150;
    const p = 18;
    const pt = values.map((y, i) => [
      p + (i * (w - 2 * p)) / (values.length - 1),
      h - p - ((y - 1) * (h - 2 * p)) / 4
    ]);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto text-teal-700 dark:text-teal-400" role="img" aria-label="Mood trend chart">
        <path
          d={`M${pt.map((q) => q.join(',')).join('L')}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pt.map((q, idx) => (
          <circle key={idx} cx={q[0]} cy={q[1]} r="5" className="fill-teal-700 dark:fill-teal-400 stroke-white dark:stroke-[#14292a] stroke-2" />
        ))}
      </svg>
    );
  };

  const renderNotifications = (to) => {
    const list = S.nf.filter((n) => n.to === to);
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-[#5f7571] dark:text-[#8fa8a3]">
            {list.filter((n) => !n.read).length} unread updates
          </div>
          {list.length > 0 && (
            <button className={clsBtnSecondary} onClick={handleReadAllNotifs}>
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Mark all as read
            </button>
          )}
        </div>
        <div className={clsCard}>
          {list.length ? (
            list.map((n) => (
              <div className={clsRow} key={n.id}>
                <div className={clsRowHeader}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-teal-700 dark:bg-teal-400'}`} />
                    <b className="text-sm">{n.msg}</b>
                  </div>
                  {!n.read && (
                    <button className={`${clsBtnSecondary} text-xs py-1 px-2.5`} onClick={() => handleReadNotif(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
                <div className={`${clsMuted} pl-4.5 mt-1`}>
                  {n.date} {!n.read && '· New'}
                </div>
              </div>
            ))
          ) : (
            renderEmpty('No notifications at this time.')
          )}
        </div>
      </div>
    );
  };

  const renderClientOptions = () => (
    <>
      <option value="">Select accepted client</option>
      {acc().map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.email})
        </option>
      ))}
    </>
  );

  const renderClientModal = () => {
    if (!selectedClient) return null;

    const clientMoods = moodsOf(selectedClient.uid);
    const clientAvg = avg(selectedClient.uid);
    const clientStreak = streak(selectedClient.uid);
    const clientFiles = S.fl.filter((f) => f.uid === selectedClient.uid);
    const clientSessions = S.ap.filter((a) => a.cid === selectedClient.id || a.uid === selectedClient.uid).sort(srt);
    const clientPlans = S.pl.filter((p) => p.cid === selectedClient.id || p.uid === selectedClient.uid);
    const clientNotes = S.nt.filter((n) => n.cid === selectedClient.id);
    const completedPlans = clientPlans.filter((p) => p.done).length;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
        onClick={() => setSelectedClientId(null)}
      >
        <div
          className="bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#dde7e3] dark:border-[#23403f] bg-gradient-to-r from-[#e3f1ee]/50 to-transparent dark:from-[#173b3a]/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-xl shadow-xs overflow-hidden">
                  {S.avatars?.[selectedClient.uid] ? (
                    <img src={S.avatars[selectedClient.uid]} alt={selectedClient.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedClient.name[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                      {selectedClient.name}
                    </h2>
                    {renderChip(selectedClient.status)}
                  </div>
                  <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-0.5 flex items-center gap-2">
                    <span>{selectedClient.email}</span>
                    <span>•</span>
                    <span>ID: #MC-{selectedClient.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {selectedClient.status !== 'Accepted' && (
                  <button
                    className={`${clsBtnPrimary} text-xs py-1.5 px-3`}
                    onClick={() => handleDecision(selectedClient.id, 'Accepted')}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Accept Client
                  </button>
                )}
                {selectedClient.status !== 'Rejected' && (
                  <button
                    className={`${clsBtnDanger} text-xs py-1.5 px-3`}
                    onClick={() => handleDecision(selectedClient.id, 'Rejected')}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Decline
                  </button>
                )}
                <button
                  className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] text-[#14302c] dark:text-[#e3efec] flex items-center justify-center hover:opacity-80 transition"
                  onClick={() => setSelectedClientId(null)}
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {selectedClient.reason && (
              <div className="mt-3.5 px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#14292a]/80 border border-[#dde7e3] dark:border-[#23403f] text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                <span className="font-semibold text-teal-800 dark:text-teal-200 mr-1.5">Intake Request Focus:</span>
                "{selectedClient.reason}"
              </div>
            )}
          </div>

          {/* Modal Tab Navigation */}
          <div className="flex items-center px-4 sm:px-6 border-b border-[#dde7e3] dark:border-[#23403f] bg-[#f2f5f3]/40 dark:bg-[#0d1b1a]/40 overflow-x-auto gap-1">
            {[
              ['overview', 'Overview & Mood', 'person', null],
              ['files', 'Documents & Files', 'folder_shared', clientFiles.length],
              ['sessions', 'Appointments', 'calendar_month', clientSessions.length],
              ['plans', 'Care Plans', 'fact_check', clientPlans.length],
              ['notes', 'Clinical Notes', 'edit_note', clientNotes.length]
            ].map(([tabKey, label, icon, badge]) => (
              <button
                key={tabKey}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  clientModalTab === tabKey
                    ? 'border-teal-700 dark:border-teal-400 text-teal-800 dark:text-teal-300'
                    : 'border-transparent text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
                }`}
                onClick={() => setClientModalTab(tabKey)}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span>{label}</span>
                {badge !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    clientModalTab === tabKey
                      ? 'bg-teal-700/15 dark:bg-teal-400/20 text-teal-800 dark:text-teal-200'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Modal Tab Content Area */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* OVERVIEW TAB */}
            {clientModalTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                    <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3]">7-Day Mood</span>
                    <div className="font-serif text-2xl font-bold text-[#14302c] dark:text-[#e3efec] mt-1">
                      {clientAvg ? `${E[Math.round(clientAvg) - 1]} ${clientAvg.toFixed(1)}` : '—'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                    <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3]">Streak</span>
                    <div className="font-serif text-2xl font-bold text-[#14302c] dark:text-[#e3efec] mt-1">
                      {clientStreak} days
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                    <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3]">Sessions</span>
                    <div className="font-serif text-2xl font-bold text-[#14302c] dark:text-[#e3efec] mt-1">
                      {clientSessions.length}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                    <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3]">Goals Done</span>
                    <div className="font-serif text-2xl font-bold text-[#14302c] dark:text-[#e3efec] mt-1">
                      {completedPlans} / {clientPlans.length}
                    </div>
                  </div>
                </div>

                <div className={clsCard}>
                  <h4 className={clsCardTitle}>Mood Trajectory History</h4>
                  {clientMoods.length >= 2 ? (
                    renderChart(clientMoods.slice(-14).map((x) => x.v))
                  ) : (
                    <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] py-4 text-center">
                      Not enough check-ins logged yet to display trajectory curve.
                    </p>
                  )}
                  {clientMoods.length > 0 && (
                    <div className="mt-4 divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                      {[...clientMoods].reverse().slice(0, 5).map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{E[m.v - 1]}</span>
                            <span className="font-semibold">{MOODS[m.v - 1]?.label || 'Check-in'}</span>
                            {m.note && <span className="italic text-[#5f7571] dark:text-[#8fa8a3]">"{m.note}"</span>}
                          </div>
                          <span className={clsMuted}>{m.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FILES & DOCUMENTS TAB */}
            {clientModalTab === 'files' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                      Client Vault Files ({clientFiles.length})
                    </h4>
                    <p className={clsMuted}>Confidential records, intake questionnaires, and worksheets exchanged with this client.</p>
                  </div>
                </div>

                {/* Upload Document for this Client */}
                <div className="p-4 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Share Document with {selectedClient.name}
                  </h5>
                  <form onSubmit={(e) => handleConsultantUpload(e, selectedClient.uid)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input type="file" name="f" multiple className={`${clsInput} py-1.5 flex-1`} required />
                    <button className={`${clsBtnPrimary} whitespace-nowrap`}>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Upload for Client
                    </button>
                  </form>
                </div>

                {/* File list */}
                <div className={clsCard}>
                  {clientFiles.length ? (
                    <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                      {clientFiles.map((f) => (
                        <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400 shrink-0">
                              {getFileIcon(f.name)}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-[#14302c] dark:text-[#e3efec] truncate">{f.name}</div>
                              <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] flex items-center gap-2 mt-0.5">
                                <span>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                                <span>•</span>
                                <span>{f.date || 'Recent'}</span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                  f.uploadedBy === 'consultant'
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                  {f.uploadedBy === 'consultant' ? 'Shared by You' : 'Uploaded by Client'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                              onClick={() => setPreviewFile(f)}
                              title="Preview document"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Preview
                            </button>
                            <button
                              className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                              onClick={() => handleDownloadFile(f)}
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Download
                            </button>
                            <button
                              className={`${clsBtnDanger} text-xs py-1 px-2.5`}
                              onClick={() => handleDeleteItem('fl', f.id)}
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    renderEmpty('No documents uploaded for this client yet.')
                  )}
                </div>
              </div>
            )}

            {/* SESSIONS TAB */}
            {clientModalTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                    Consultation History ({clientSessions.length})
                  </h4>
                  <button
                    className={`${clsBtnPrimary} text-xs py-1.5 px-3`}
                    onClick={() => {
                      setSelectedClientId(null);
                      go('c-schedule');
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Schedule New Session
                  </button>
                </div>
                <div className={clsCard}>
                  {clientSessions.length ? (
                    clientSessions.map((a) => (
                      <div className={clsRow} key={a.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <div className="flex items-center gap-2">
                              <b className="text-sm">{a.date} at {a.time}</b>
                              {renderChip(a.status)}
                            </div>
                            <div className={`${clsMuted} mt-0.5`}>{a.type}</div>
                            {a.pre?.reason && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1 italic">Focus: "{a.pre.reason}"</p>}
                          </div>
                          <div className="flex gap-2">
                            {a.status === 'Requested' && (
                              <button className={`${clsBtnPrimary} text-xs py-1 px-2.5`} onClick={() => handleConfirmAp(a.id)}>
                                Confirm
                              </button>
                            )}
                            <button className={`${clsBtnDanger} text-xs py-1 px-2.5`} onClick={() => handleCancelAp(a.id)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No appointments scheduled with this client.')
                  )}
                </div>
              </div>
            )}

            {/* CARE PLAN TAB */}
            {clientModalTab === 'plans' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                    Care Plan Action Steps ({clientPlans.length})
                  </h4>
                </div>

                {/* Inline form to assign action step to this client */}
                <div className="p-4 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">add_task</span>
                    Assign Action Step for {selectedClient.name}
                  </h5>
                  <form onSubmit={handleAddPlan} className="space-y-3">
                    <input type="hidden" name="cid" value={selectedClient.id} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input name="title" className={clsInput} placeholder="Care goal title (e.g. 5-min morning breathing)" required maxLength={120} />
                      </div>
                      <div>
                        <input type="date" name="due" min={T()} className={clsInput} />
                      </div>
                    </div>
                    <textarea name="details" className={`${clsTextarea} min-h-[60px]`} placeholder="Guidance & action steps..." />
                    <button className={`${clsBtnPrimary} text-xs py-1.5 px-3`}>
                      Add to Care Plan
                    </button>
                  </form>
                </div>

                <div className={clsCard}>
                  {clientPlans.length ? (
                    clientPlans.map((p) => (
                      <div className={clsRow} key={p.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[18px] ${p.done ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400'}`}>
                                {p.done ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              <b className={`text-sm ${p.done ? 'line-through opacity-70' : ''}`}>{p.title}</b>
                            </div>
                            {p.due && <div className={`${clsMuted} pl-6.5 mt-0.5`}>Target date: {p.due}</div>}
                          </div>
                          {renderChip(p.done ? 'Completed' : 'In progress')}
                        </div>
                        {p.details && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] pl-6.5 my-1.5">{p.details}</p>}
                        <div className="pl-6.5 mt-2 flex gap-2">
                          <button
                            className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                            onClick={() => handleTogglePlan(p.id)}
                          >
                            {p.done ? 'Reopen Step' : 'Mark Completed'}
                          </button>
                          <button
                            className={`${clsBtnDanger} text-xs py-1 px-2.5`}
                            onClick={() => handleDeleteItem('pl', p.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No care plan goals configured for this client.')
                  )}
                </div>
              </div>
            )}

            {/* CLINICAL NOTES TAB */}
            {clientModalTab === 'notes' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                    Clinical Documentation Notes ({clientNotes.length})
                  </h4>
                </div>

                {/* Inline form to compose note for this client */}
                <div className="p-4 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">note_add</span>
                    Compose Note for {selectedClient.name}
                  </h5>
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <input type="hidden" name="cid" value={selectedClient.id} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input name="title" className={clsInput} placeholder="Subject / Title (e.g. CBT Grounding review)" required />
                      </div>
                      <div>
                        <select name="tag" className={clsInput}>
                          <option>Session summary</option>
                          <option>Observation</option>
                          <option>Follow-up</option>
                          <option>Therapeutic Plan</option>
                        </select>
                      </div>
                    </div>
                    <textarea name="body" className={`${clsTextarea} min-h-[70px]`} placeholder="Record clinical observations and therapeutic progress..." required />
                    <button className={`${clsBtnPrimary} text-xs py-1.5 px-3`}>
                      Save Clinical Note
                    </button>
                  </form>
                </div>

                <div className={clsCard}>
                  {clientNotes.length ? (
                    clientNotes.map((n) => (
                      <div className={clsRow} key={n.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <b className="text-sm">{n.title}</b>
                            <div className={clsMuted}>{n.date}</div>
                          </div>
                          {renderChip(n.tag)}
                        </div>
                        <p className="text-sm my-2 text-[#14302c] dark:text-[#e3efec] whitespace-pre-wrap">{n.body}</p>
                        <button className={`${clsBtnDanger} text-xs py-1 px-2.5 mt-1`} onClick={() => handleDeleteItem('nt', n.id)}>
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Delete Note
                        </button>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No clinical notes recorded for this client yet.')
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFilePreviewModal = () => {
    if (!previewFile) return null;
    const isImage = previewFile.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(previewFile.name);
    const isPdf = previewFile.type === 'application/pdf' || previewFile.name.toLowerCase().endsWith('.pdf');

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
        onClick={() => setPreviewFile(null)}
      >
        <div
          className="bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400">
                {getFileIcon(previewFile.name)}
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] truncate">
                  {previewFile.name}
                </h3>
                <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                  {Math.max(1, Math.round(previewFile.size / 1024))} KB · {previewFile.date || 'Recent'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`${clsBtnPrimary} text-xs py-1.5 px-3`}
                onClick={() => handleDownloadFile(previewFile)}
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </button>
              <button
                className="w-8 h-8 rounded-lg bg-[#e3f1ee] dark:bg-[#173b3a] text-[#14302c] dark:text-[#e3efec] flex items-center justify-center hover:opacity-80 transition"
                onClick={() => setPreviewFile(null)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-[#f2f5f3]/40 dark:bg-[#0d1b1a]/40">
            {previewFile.dataUrl ? (
              isImage ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm"
                />
              ) : isPdf ? (
                <iframe
                  src={previewFile.dataUrl}
                  title={previewFile.name}
                  className="w-full h-[65vh] rounded-xl border border-[#dde7e3] dark:border-[#23403f]"
                />
              ) : (
                <div className="w-full p-4 rounded-xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] text-xs font-mono whitespace-pre-wrap max-h-[65vh] overflow-auto">
                  {atob(previewFile.dataUrl.split(',')[1] || '')}
                </div>
              )
            ) : (
              <div className="text-center p-8 max-w-md">
                <span className="material-symbols-outlined text-4xl text-teal-700 dark:text-teal-400 mb-2">
                  verified_user
                </span>
                <h4 className="font-serif font-bold text-base text-[#14302c] dark:text-[#e3efec] mb-1">
                  Clinical Vault Document
                </h4>
                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
                  This demo clinical document is stored in the practice vault. Click "Download" to generate and retrieve the validated document.
                </p>
                <button
                  className={`${clsBtnSecondary} text-xs`}
                  onClick={() => handleDownloadFile(previewFile)}
                >
                  Download Valid Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPageContent = () => {
    if (!U) return null;

    switch (page) {
      // CONSULTANT VIEWS
      case 'c-home': {
        const up = S.ap.filter((a) => a.date >= T()).sort(srt);
        const pn = S.cl.filter((c) => c.status === 'Pending');
        const activeClients = acc();
        const consImages = S.dashImages?.['cons'] || (S.dashImages?.[U.id] || []);
        const activeConsImg = consImages[0] || null;
        const clientVaultUploads = S.fl.filter((f) => f.uploadedBy === 'client');

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider mb-1">
                  <span>Clinical Dashboard</span>
                  <span>•</span>
                  <span>Dr. Demo Practice</span>
                </div>
                <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
                  Good day, {U.name.split(' ').slice(-1)[0]}
                </h1>
                <p className={`${clsMuted} mt-1`}>Practice overview: client health trajectory, intake queue, and booked consultations.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#e3f1ee] dark:bg-[#173b3a] px-3.5 py-1.5 rounded-xl self-start md:self-auto text-xs font-semibold text-teal-800 dark:text-teal-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Systems Synced & HIPAA Compliant</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderStat('Total clients', S.cl.length, 'All intake records', 'bg-teal-700 dark:bg-teal-400', 'group')}
              {renderStat('Active clients', activeClients.length, 'In active care plan', 'bg-[#e07a5f]', 'how_to_reg')}
              {renderStat('Pending triage', pn.length, 'Requires practitioner decision', 'bg-[#e9b44c]', 'hourglass_top')}
              {renderStat('Upcoming sessions', up.length, 'Confirmed bookings', 'bg-[#6c8ebf]', 'event_available')}
            </div>

            {/* Practice Visual Overview & Image Showcase */}
            <div className={`${clsCard} overflow-hidden p-0 border border-[#dde7e3] dark:border-[#23403f]`}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left image showcase container */}
                <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[320px] bg-gradient-to-br from-[#0c3b37] to-teal-800 flex items-center justify-center overflow-hidden group">
                  {activeConsImg?.dataUrl ? (
                    <img
                      src={activeConsImg.dataUrl}
                      alt={activeConsImg.title || 'Practice Sanctuary Overview'}
                      className="w-full h-full object-cover max-h-[380px] group-hover:scale-102 transition duration-500 cursor-pointer"
                      onClick={() =>
                        setPreviewFile({
                          name: activeConsImg.name || 'Practice_Sanctuary.jpg',
                          dataUrl: activeConsImg.dataUrl,
                          size: 250000,
                          date: activeConsImg.date,
                          type: 'image/jpeg'
                        })
                      }
                      title="Click to view full screen"
                    />
                  ) : (
                    <svg viewBox="0 0 600 360" className="w-full h-full object-cover" role="img" aria-label="Practice Sanctuary Facility">
                      <defs>
                        <linearGradient id="clinicGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#081f1e" />
                          <stop offset="50%" stopColor="#0f766e" />
                          <stop offset="100%" stopColor="#2dd4bf" />
                        </linearGradient>
                        <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <rect width="600" height="360" fill="url(#clinicGrad)" />
                      <rect x="60" y="40" width="140" height="240" rx="8" fill="url(#windowGlow)" stroke="#a3faef" strokeWidth="1.5" strokeOpacity="0.4" />
                      <line x1="130" y1="40" x2="130" y2="280" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="60" y1="140" x2="200" y2="140" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <rect x="230" y="40" width="140" height="240" rx="8" fill="url(#windowGlow)" stroke="#a3faef" strokeWidth="1.5" strokeOpacity="0.4" />
                      <line x1="300" y1="40" x2="300" y2="280" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="230" y1="140" x2="370" y2="140" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <rect x="400" y="40" width="140" height="240" rx="8" fill="url(#windowGlow)" stroke="#a3faef" strokeWidth="1.5" strokeOpacity="0.4" />
                      <line x1="470" y1="40" x2="470" y2="280" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="400" y1="140" x2="540" y2="140" stroke="#a3faef" strokeWidth="1" strokeOpacity="0.3" />
                      <ellipse cx="140" cy="300" rx="40" ry="22" fill="#0c3b37" />
                      <path d="M140 280 Q 110 210 80 230 Q 120 250 140 280 Z" fill="#2dd4bf" opacity="0.75" />
                      <path d="M140 280 Q 140 180 170 200 Q 150 250 140 280 Z" fill="#80d5cb" opacity="0.8" />
                      <path d="M140 280 Q 180 220 200 240 Q 160 260 140 280 Z" fill="#0f766e" opacity="0.9" />
                      <rect x="280" y="270" width="220" height="40" rx="10" fill="#def6f1" opacity="0.9" />
                      <rect x="300" y="240" width="180" height="35" rx="8" fill="#bbe9e2" opacity="0.8" />
                    </svg>
                  )}
                  {/* Floating overlay chip */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[15px] text-teal-300">verified</span>
                      Practice Sanctuary Overview
                    </span>
                    {activeConsImg?.dimensions && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px]">
                        {activeConsImg.dimensions}
                      </span>
                    )}
                  </div>
                  {activeConsImg && (
                    <button
                      onClick={() =>
                        setPreviewFile({
                          name: activeConsImg.name || 'Practice_Sanctuary.jpg',
                          dataUrl: activeConsImg.dataUrl,
                          size: 250000,
                          date: activeConsImg.date,
                          type: 'image/jpeg'
                        })
                      }
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      Full View
                    </button>
                  )}
                </div>

                {/* Right controls and practice info column */}
                <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Sanctuary Showcase</span>
                      {activeConsImg?.date && <span className={clsMuted}>{activeConsImg.date}</span>}
                    </div>

                    {!editingImageMeta ? (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-xl font-bold text-[#14302c] dark:text-[#e3efec] mb-1.5 leading-snug">
                            {activeConsImg?.title || 'MindCare Clinical Sanctuary Center'}
                          </h3>
                          <button
                            type="button"
                            className="p-1 rounded-lg text-[#5f7571] hover:text-teal-700 dark:hover:text-teal-400 transition"
                            title="Edit Title & Description"
                            onClick={() => {
                              setImageMetaForm({
                                title: activeConsImg?.title || 'MindCare Clinical Sanctuary Center',
                                caption: activeConsImg?.caption || 'Trauma-informed consultation rooms and digital telehealth suites.'
                              });
                              setEditingImageMeta(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                        <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] leading-relaxed mb-4">
                          {activeConsImg?.caption || 'Trauma-informed consultation rooms and digital telehealth suites.'}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 space-y-2 p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                        <input
                          type="text"
                          value={imageMetaForm.title}
                          onChange={(e) => setImageMetaForm((prev) => ({ ...prev, title: e.target.value }))}
                          className={`${clsInput} py-1.5 text-xs font-semibold`}
                          placeholder="Sanctuary title"
                        />
                        <textarea
                          value={imageMetaForm.caption}
                          onChange={(e) => setImageMetaForm((prev) => ({ ...prev, caption: e.target.value }))}
                          className={`${clsTextarea} min-h-[60px] text-xs`}
                          placeholder="Sanctuary description"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                            onClick={() => setEditingImageMeta(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className={`${clsBtnPrimary} text-xs py-1 px-2.5`}
                            onClick={() => handleSaveImageMeta(activeConsImg?.id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Upload Form / Dropzone */}
                    <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-dashed border-teal-700/30 dark:border-teal-400/30 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#14302c] dark:text-[#e3efec]">Upload Practice Overview Image</div>
                          <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">Clinic facility photo, consultation room, or team badge</div>
                        </div>
                      </div>
                      <label className={`mt-2.5 ${clsBtnPrimary} text-xs py-1.5 px-3 w-full cursor-pointer flex items-center justify-center gap-1.5`}>
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        Choose Image to Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDashboardImageUpload(e, 'MindCare Practice Facility', 'Updated clinical sanctuary environment')}
                        />
                      </label>
                    </div>

                    {/* Gallery of Uploaded Images (if multiple) */}
                    {consImages.length > 1 && (
                      <div className="mb-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] mb-1.5">Practice Image Gallery</div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {consImages.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => handleSetPrimaryDashboardImage(img.id)}
                              className={`w-14 h-12 rounded-lg border-2 cursor-pointer overflow-hidden shrink-0 transition relative group ${
                                img.id === activeConsImg?.id ? 'border-teal-700 dark:border-teal-400 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                              title={img.title}
                            >
                              {img.dataUrl ? (
                                <img src={img.dataUrl} alt={img.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-teal-900 flex items-center justify-center text-teal-200">
                                  <span className="material-symbols-outlined text-[16px]">image</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#dde7e3] dark:border-[#23403f] text-xs">
                    <span className="text-[#5f7571] dark:text-[#8fa8a3]">
                      {consImages.length} visual asset{consImages.length === 1 ? '' : 's'} active
                    </span>
                    {activeConsImg && activeConsImg.id !== 'img-seed-cons' && (
                      <button
                        onClick={() => handleDeleteDashboardImage(activeConsImg.id)}
                        className="text-[#b3392a] dark:text-[#f4a496] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={clsCard}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={clsCardTitle}>Client Wellbeing (7-Day Mood Average)</h3>
                  <span className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">Click client for profile</span>
                </div>
                {activeClients.length ? (
                  activeClients.map((c) => {
                    const a = avg(c.uid);
                    return (
                      <div
                        className={`${clsRow} cursor-pointer hover:bg-[#e3f1ee]/40 dark:hover:bg-[#173b3a]/30 p-2 rounded-xl transition-colors`}
                        key={c.id}
                        onClick={() => {
                          setSelectedClientId(c.id);
                          setClientModalTab('overview');
                        }}
                        title="Click to view full client info & files"
                      >
                        <div className={clsRowHeader}>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full overflow-hidden bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                              {S.avatars?.[c.uid] ? (
                                <img src={S.avatars[c.uid]} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                c.name[0]
                              )}
                            </span>
                            <div>
                              <b className="text-sm text-teal-900 dark:text-teal-200 hover:underline">{c.name}</b>
                              <div className={clsMuted}>{c.email}</div>
                            </div>
                          </div>
                          <span className="font-semibold text-sm">
                            {a ? `${E[Math.round(a) - 1]} ${a.toFixed(1)} / 5.0` : <span className={clsMuted}>No check-ins yet</span>}
                          </span>
                        </div>
                        <div className="h-2 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-teal-700 dark:bg-teal-400 rounded-full transition-all duration-300" style={{ width: `${a * 20}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  renderEmpty('No active clients enrolled.')
                )}
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Intake Pipeline Status</h3>
                {['Pending', 'Accepted', 'Rejected'].map((s) => {
                  const count = S.cl.filter((c) => c.status === s).length;
                  const total = S.cl.length || 1;
                  return (
                    <div className={clsRow} key={s}>
                      <div className={clsRowHeader}>
                        <span className="text-sm font-semibold">{s}</span>
                        <b className="text-sm">{count} clients ({Math.round((count / total) * 100)}%)</b>
                      </div>
                      <div className="h-2 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            s === 'Accepted' ? 'bg-teal-700 dark:bg-teal-400' : s === 'Pending' ? 'bg-[#e9b44c]' : 'bg-[#e07a5f]'
                          }`}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Pending Intake Requests</h3>
                {pn.length ? (
                  pn.map((c) => (
                    <div className={clsRow} key={c.id}>
                      <div className={clsRowHeader}>
                        <div
                          className="cursor-pointer group flex-1"
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setClientModalTab('overview');
                          }}
                        >
                          <b className="text-sm group-hover:underline text-teal-900 dark:text-teal-200">{c.name}</b>
                          <div className={clsMuted}>{c.email}</div>
                          {c.reason && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1 italic">"{c.reason}"</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className={`${clsBtnSecondary} text-xs py-1.5 px-3`}
                            onClick={() => {
                              setSelectedClientId(c.id);
                              setClientModalTab('overview');
                            }}
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Review
                          </button>
                          <button className={`${clsBtnPrimary} text-xs py-1.5 px-3`} onClick={() => handleDecision(c.id, 'Accepted')}>
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Accept
                          </button>
                          <button className={`${clsBtnDanger} text-xs py-1.5 px-3`} onClick={() => handleDecision(c.id, 'Rejected')}>
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  renderEmpty('Intake queue is clear. No pending reviews.')
                )}
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Upcoming Consultations</h3>
                {up.length ? (
                  up.slice(0, 5).map((a) => (
                    <div className={clsRow} key={a.id}>
                      <div className={clsRowHeader}>
                        <div>
                          <b className="text-sm">{cn(a.cid)}</b>
                          <div className={clsMuted}>{a.date} at {a.time} · {a.type}</div>
                        </div>
                        {renderChip(a.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  renderEmpty('No sessions scheduled for the coming days.')
                )}
              </div>
            </div>

            {/* Client Shared Media & Vault Documents Overview */}
            <div className={clsCard}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={clsCardTitle}>Client Vault Documents & Media Overview</h3>
                  <p className={clsMuted}>Overview of confidential files, questionnaires, and photos uploaded by clients.</p>
                </div>
                <button className={`${clsBtnSecondary} text-xs`} onClick={() => go('c-docs')}>
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  Open Full Vault
                </button>
              </div>

              {clientVaultUploads.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clientVaultUploads.slice(0, 6).map((f) => {
                    const isImg = f.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
                    const clientOwner = S.cl.find((c) => c.uid === f.uid);
                    return (
                      <div
                        key={f.id}
                        className="p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f] flex flex-col justify-between hover:shadow-xs transition"
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          {isImg && f.dataUrl ? (
                            <img
                              src={f.dataUrl}
                              alt={f.name}
                              className="w-12 h-12 rounded-lg object-cover cursor-pointer shrink-0 border border-[#dde7e3] dark:border-[#23403f]"
                              onClick={() => setPreviewFile(f)}
                              title="Click to preview"
                            />
                          ) : (
                            <span className="w-12 h-12 rounded-lg bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-2xl">{getFileIcon(f.name)}</span>
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#14302c] dark:text-[#e3efec] truncate" title={f.name}>
                              {f.name}
                            </div>
                            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                              Client: <span className="font-semibold text-teal-800 dark:text-teal-200">{clientOwner?.name || f.uid}</span>
                            </div>
                            <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] mt-0.5">
                              {f.date} · {Math.max(1, Math.round(f.size / 1024))} KB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#dde7e3] dark:border-[#23403f]">
                          <button
                            className={`${clsBtnSecondary} text-[11px] py-1 px-2`}
                            onClick={() => setPreviewFile(f)}
                            title="Preview file"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            View
                          </button>
                          <button
                            className={`${clsBtnSecondary} text-[11px] py-1 px-2`}
                            onClick={() => handleDownloadFile(f)}
                            title="Download file"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                renderEmpty('No client-uploaded documents or media submitted yet.')
              )}
            </div>
          </div>
        );
      }

      case 'c-clients': {
        const q = Q.q.toLowerCase();
        const rows = S.cl.filter(
          (c) => (c.name + c.email).toLowerCase().includes(q) && (Q.f === 'all' || c.status === Q.f)
        );
        return (
          <div className="space-y-6">
            {renderHeader('Client Management', 'Review patient intake applications and monitor ongoing care.')}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  className={`${clsInput} pl-9`}
                  placeholder="Search by client name or email..."
                  value={Q.q}
                  onChange={(e) => setQ((prev) => ({ ...prev, q: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#e3f1ee] dark:bg-[#173b3a] p-1 rounded-xl">
                {['all', 'Pending', 'Accepted', 'Rejected'].map((statusOption) => (
                  <button
                    key={statusOption}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      Q.f === statusOption
                        ? 'bg-white dark:bg-[#14292a] text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
                    }`}
                    onClick={() => setQ((prev) => ({ ...prev, f: statusOption }))}
                  >
                    {statusOption === 'all' ? 'All Clients' : statusOption}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${clsCard} overflow-x-auto p-0`}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#dde7e3] dark:border-[#23403f] bg-[#f2f5f3]/50 dark:bg-[#0d1b1a]/50">
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Client</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Email</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Status</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">7-Day Mood</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Sessions</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Files</th>
                    <th className="text-right p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                  {rows.length ? (
                    rows.map((c) => {
                      const a = avg(c.uid);
                      const sessCount = S.ap.filter((x) => x.cid === c.id).length;
                      const fileCount = S.fl.filter((f) => f.uid === c.uid).length;
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-[#f2f5f3]/80 dark:hover:bg-[#173b3a]/30 transition-colors cursor-pointer group"
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setClientModalTab('overview');
                          }}
                          title="Click row to open full client profile"
                        >
                          <td className="p-3.5 font-semibold text-[#14302c] dark:text-[#e3efec] whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                                {S.avatars?.[c.uid] ? (
                                  <img src={S.avatars[c.uid]} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  c.name[0]
                                )}
                              </div>
                              <span className="group-hover:underline text-teal-900 dark:text-teal-200">{c.name}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{c.email}</td>
                          <td className="p-3.5 whitespace-nowrap">{renderChip(c.status)}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            {a ? (
                              <span className="font-medium text-xs">
                                {E[Math.round(a) - 1]} {a.toFixed(1)} / 5
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-xs">{sessCount} booked</td>
                          <td className="p-3.5 whitespace-nowrap text-xs">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClientId(c.id);
                                setClientModalTab('files');
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                              <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
                            </button>
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                                onClick={() => {
                                  setSelectedClientId(c.id);
                                  setClientModalTab('overview');
                                }}
                                title="View Client Details"
                              >
                                <span className="material-symbols-outlined text-[15px]">info</span>
                                View Info
                              </button>
                              {c.status !== 'Accepted' && (
                                <button className={`${clsBtnPrimary} text-xs py-1 px-2.5`} onClick={() => handleDecision(c.id, 'Accepted')}>
                                  Accept
                                </button>
                              )}
                              {c.status !== 'Rejected' && (
                                <button className={`${clsBtnDanger} text-xs py-1 px-2.5`} onClick={() => handleDecision(c.id, 'Rejected')}>
                                  Decline
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>{renderEmpty('No clients match your filter criteria.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'c-docs': {
        const clientFilter = docFilterUid;
        const searchQ = docSearchQuery.trim().toLowerCase();
        const filteredFiles = S.fl.filter((f) => {
          const matchesClient = clientFilter === 'all' || f.uid === clientFilter;
          const matchesSearch = !searchQ || f.name.toLowerCase().includes(searchQ);
          return matchesClient && matchesSearch;
        });

        const totalBytes = S.fl.reduce((acc, f) => acc + (f.size || 0), 0);
        const clientUploadedCount = S.fl.filter((f) => f.uploadedBy !== 'consultant').length;
        const clinicianSharedCount = S.fl.filter((f) => f.uploadedBy === 'consultant').length;

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                {renderHeader('Client Files & Document Vault', 'Access, review, and exchange encrypted clinical records, worksheets, and intake documents.')}
              </div>
              <div className="flex items-center gap-2 bg-[#e3f1ee] dark:bg-[#173b3a] px-3.5 py-1.5 rounded-xl self-start md:self-auto text-xs font-semibold text-teal-800 dark:text-teal-200">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>HIPAA Compliant Encrypted Vault</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderStat('Total Documents', S.fl.length, 'All client records', 'bg-teal-700 dark:bg-teal-400', 'inventory_2')}
              {renderStat('Vault Storage', `${(totalBytes / 1024 / 1024).toFixed(2)} MB`, 'Encrypted volume', 'bg-[#6c8ebf]', 'folder')}
              {renderStat('Client Uploaded', clientUploadedCount, 'Intake & reflections', 'bg-[#e07a5f]', 'upload_file')}
              {renderStat('Clinician Shared', clinicianSharedCount, 'Therapeutic worksheets', 'bg-[#e9b44c]', 'assignment')}
            </div>

            {/* Upload Studio for Consultant */}
            <div className={clsCard}>
              <h3 className={clsCardTitle}>Upload & Share Document with Client</h3>
              <form onSubmit={handleConsultantUpload} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={clsLabel}>Select Target Client</label>
                    <select name="targetUid" className={clsInput} required>
                      <option value="">Choose client...</option>
                      {S.cl.map((c) => (
                        <option key={c.id} value={c.uid}>
                          {c.name} ({c.email}) · {c.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={clsLabel}>Attach Document(s)</label>
                    <input type="file" name="f" multiple className={clsInput} required />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className={clsBtnPrimary}>
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                    Upload & Share Document
                  </button>
                </div>
              </form>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  className={`${clsInput} pl-9`}
                  placeholder="Search file name..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">Filter by client:</label>
                <select
                  className={`${clsInput} py-1.5 text-xs`}
                  value={docFilterUid}
                  onChange={(e) => setDocFilterUid(e.target.value)}
                >
                  <option value="all">All Clients ({S.cl.length})</option>
                  {S.cl.map((c) => (
                    <option key={c.id} value={c.uid}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Documents Table */}
            <div className={`${clsCard} overflow-x-auto p-0`}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#dde7e3] dark:border-[#23403f] bg-[#f2f5f3]/50 dark:bg-[#0d1b1a]/50">
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Document</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Associated Client</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Size</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Date</th>
                    <th className="text-left p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Source</th>
                    <th className="text-right p-3.5 text-[11px] uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                  {filteredFiles.length ? (
                    filteredFiles.map((f) => {
                      const client = S.cl.find((c) => c.uid === f.uid);
                      return (
                        <tr key={f.id} className="hover:bg-[#f2f5f3]/40 dark:hover:bg-[#173b3a]/20 transition-colors">
                          <td className="p-3.5 font-semibold text-[#14302c] dark:text-[#e3efec] whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[22px]">
                                {getFileIcon(f.name)}
                              </span>
                              <span>{f.name}</span>
                            </div>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {client ? (
                              <button
                                type="button"
                                className="flex items-center gap-2 hover:opacity-80 text-left group"
                                onClick={() => {
                                  setSelectedClientId(client.id);
                                  setClientModalTab('files');
                                }}
                                title="Click to view client info & documents"
                              >
                                <span className="w-6 h-6 rounded-full bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-[11px]">
                                  {client.name[0]}
                                </span>
                                <div>
                                  <div className="text-xs font-semibold text-teal-800 dark:text-teal-300 group-hover:underline">
                                    {client.name}
                                  </div>
                                  <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">{client.email}</div>
                                </div>
                              </button>
                            ) : (
                              <span className={clsMuted}>Unknown Client</span>
                            )}
                          </td>
                          <td className="p-3.5 text-xs text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">
                            {Math.max(1, Math.round(f.size / 1024))} KB
                          </td>
                          <td className="p-3.5 text-xs text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">
                            {f.date || 'Recent'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              f.uploadedBy === 'consultant'
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {f.uploadedBy === 'consultant' ? 'Practitioner' : 'Client'}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                                onClick={() => setPreviewFile(f)}
                                title="Preview document"
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                                Preview
                              </button>
                              <button
                                className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                                onClick={() => handleDownloadFile(f)}
                              >
                                <span className="material-symbols-outlined text-[15px]">download</span>
                                Download
                              </button>
                              <button
                                className={`${clsBtnDanger} text-xs py-1 px-2.5`}
                                onClick={() => handleDeleteItem('fl', f.id)}
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>{renderEmpty('No documents found matching the filter.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'c-schedule': {
        const all = [...S.ap].sort(srt);
        return (
          <div className="space-y-6">
            {renderHeader('Appointment Schedule', 'Coordinate clinical sessions and consultations.')}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Schedule New Session</h3>
                  <form onSubmit={handleSchedule} className="space-y-3">
                    <div>
                      <label className={clsLabel}>Select Client</label>
                      <select name="cid" className={clsInput} required>
                        {renderClientOptions()}
                      </select>
                    </div>
                    <div>
                      <label className={clsLabel}>Date</label>
                      <input type="date" name="date" min={T()} className={clsInput} required />
                    </div>
                    <div>
                      <label className={clsLabel}>Time</label>
                      <input type="time" name="time" className={clsInput} required />
                    </div>
                    <div>
                      <label className={clsLabel}>Modality</label>
                      <select name="type" className={clsInput}>
                        <option>Online Telehealth Consultation</option>
                        <option>In-Person Sanctuary Consultation</option>
                        <option>Focused Follow-Up Check-In</option>
                      </select>
                    </div>
                    <button className={`${clsBtnPrimary} w-full mt-4`}>
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Create Session
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>All Consultations</h3>
                  {all.length ? (
                    all.map((a) => (
                      <div className={clsRow} key={a.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <b className="text-sm">{cn(a.cid)}</b>
                            <div className={clsMuted}>
                              {a.date} at {a.time} · {a.type}
                            </div>
                            {a.pre?.reason && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1">Topic: {a.pre.reason}</p>}
                          </div>
                          {renderChip(a.status)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {a.status === 'Requested' && (
                            <button className={`${clsBtnPrimary} text-xs py-1 px-2.5`} onClick={() => handleConfirmAp(a.id)}>
                              Confirm Booking
                            </button>
                          )}
                          <button className={`${clsBtnDanger} text-xs py-1 px-2.5`} onClick={() => handleCancelAp(a.id)}>
                            Cancel Session
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No sessions scheduled yet.')
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'c-notes':
        return (
          <div className="space-y-6">
            {renderHeader('Session Notes', 'Confidential clinical documentation and therapeutic observations.')}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Compose Note</h3>
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <div>
                      <label className={clsLabel}>Client</label>
                      <select name="cid" className={clsInput} required>
                        {renderClientOptions()}
                      </select>
                    </div>
                    <div>
                      <label className={clsLabel}>Subject / Title</label>
                      <input name="title" className={clsInput} placeholder="e.g. Cognitive restructuring review" required />
                    </div>
                    <div>
                      <label className={clsLabel}>Classification</label>
                      <select name="tag" className={clsInput}>
                        <option>Session summary</option>
                        <option>Observation</option>
                        <option>Follow-up</option>
                        <option>Therapeutic Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className={clsLabel}>Clinical Observations</label>
                      <textarea name="body" className={clsTextarea} placeholder="Record observations, responses to CBT interventions, and next goals..." required />
                    </div>
                    <button className={`${clsBtnPrimary} w-full mt-4`}>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Note
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Saved Documentation</h3>
                  {S.nt.length ? (
                    S.nt.map((n) => (
                      <div className={clsRow} key={n.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <b className="text-sm">{n.title}</b>
                            <div className={clsMuted}>{cn(n.cid)} · {n.date}</div>
                          </div>
                          {renderChip(n.tag)}
                        </div>
                        <p className="text-sm my-2.5 text-[#14302c] dark:text-[#e3efec] whitespace-pre-wrap">{n.body}</p>
                        <button className={`${clsBtnDanger} text-xs py-1 px-2.5`} onClick={() => handleDeleteItem('nt', n.id)}>
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Delete Note
                        </button>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No clinical notes recorded yet.')
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'c-plans':
        return (
          <div className="space-y-6">
            {renderHeader('Care Plans', 'Holistic, supportive action steps tailored to each client.')}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Assign Action Step</h3>
                  <form onSubmit={handleAddPlan} className="space-y-3">
                    <div>
                      <label className={clsLabel}>Client</label>
                      <select name="cid" className={clsInput} required>
                        {renderClientOptions()}
                      </select>
                    </div>
                    <div>
                      <label className={clsLabel}>Care Step / Goal Title</label>
                      <input name="title" className={clsInput} placeholder="e.g. 10-minute mindful nature walk" required maxLength={120} />
                    </div>
                    <div>
                      <label className={clsLabel}>Target Date</label>
                      <input type="date" name="due" min={T()} className={clsInput} />
                    </div>
                    <div>
                      <label className={clsLabel}>Guidance & Details</label>
                      <textarea name="details" className={clsTextarea} placeholder="Instructions, pacing tips, or reflection questions..." />
                    </div>
                    <button className={`${clsBtnPrimary} w-full mt-4`}>
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                      Assign Care Plan
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Active & Completed Steps</h3>
                  {S.pl.length ? (
                    S.pl.map((p) => (
                      <div className={clsRow} key={p.id}>
                        <div className={clsRowHeader}>
                          <div>
                            <b className="text-sm">{p.title}</b>
                            <div className={clsMuted}>
                              Client: {cn(p.cid)} {p.due ? `· Target: ${p.due}` : ''}
                            </div>
                          </div>
                          {renderChip(p.done ? 'Completed' : 'In progress')}
                        </div>
                        {p.details && <p className="text-sm my-2 text-[#5f7571] dark:text-[#8fa8a3]">{p.details}</p>}
                        <button className={`${clsBtnDanger} text-xs py-1 px-2.5 mt-1`} onClick={() => handleDeleteItem('pl', p.id)}>
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Remove Step
                        </button>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No care plan items configured.')
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'c-notif':
        return (
          <div className="space-y-6">
            {renderHeader('Clinical Notifications', 'Practice alerts, client intake requests, and milestone completions.')}
            {renderNotifications('cons')}
          </div>
        );

      // CLIENT SANCTUARY VIEWS
      case 'cl-home': {
        const c = myC();
        const as = S.ap.filter((a) => a.uid === U.id && a.date >= T()).sort(srt);
        const pl = S.pl.filter((p) => p.uid === U.id);
        const dn = pl.filter((p) => p.done).length;
        const td = S.md.find((m) => m.uid === U.id && m.date === T());
        const clientImages = S.dashImages?.[U.id] || (U.id === 'jamie' ? S.dashImages?.['jamie'] || [] : []);
        const activeClientImg = clientImages[0] || null;

        return (
          <div className="space-y-6">
            {/* Reassurance Sanctuary Hero Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-teal-800 to-teal-900 text-white p-6 sm:p-8 overflow-hidden shadow-sm">
              <div className="relative z-10 max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Today's Sanctuary
                  </span>
                  <span className="text-xs opacity-75">· Mindful Reflection</span>
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight">Welcome, {U.name.split(' ')[0]}</h1>
                <p className="text-sm opacity-90 mt-1.5 leading-relaxed">
                  Your private wellbeing sanctuary. Breathe deeply and navigate each day at your own pace.
                </p>
                <div className="mt-4 flex items-center gap-2 py-2 px-3 rounded-xl bg-white/10 backdrop-blur-sm text-xs italic">
                  <span className="material-symbols-outlined text-[16px]">format_quote</span>
                  <span>"Quiet the mind, and serenity will follow. One breath at a time."</span>
                </div>
              </div>
            </div>

            {/* KPI 4-Card Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderStat('Intake Status', c?.status || 'Pending', 'Practitioner alignment', 'bg-teal-700 dark:bg-teal-400', 'verified')}
              {renderStat('Next Session', as[0] ? as[0].date.slice(5) : 'None booked', as[0] ? `${as[0].time} (${as[0].type.slice(0, 15)}...)` : 'Request anytime', 'bg-[#e07a5f]', 'calendar_month')}
              {renderStat('Check-in Streak', `${streak(U.id)} Days`, 'Consistent mindful practice', 'bg-[#e9b44c]', 'local_fire_department')}
              {renderStat('Care Goals', pl.length ? `${Math.round((dn / pl.length) * 100)}%` : '0%', `${dn} of ${pl.length} steps completed`, 'bg-[#6c8ebf]', 'task_alt')}
            </div>

            {/* Client Sanctuary Visual Anchor & Grounding Overview */}
            <div className={`${clsCard} overflow-hidden p-0 border border-[#dde7e3] dark:border-[#23403f]`}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left visual grounding area */}
                <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[320px] bg-gradient-to-br from-teal-900 to-[#0c3b37] flex items-center justify-center overflow-hidden group">
                  {activeClientImg?.dataUrl ? (
                    <img
                      src={activeClientImg.dataUrl}
                      alt={activeClientImg.title || 'Sanctuary Anchor'}
                      className="w-full h-full object-cover max-h-[360px] group-hover:scale-102 transition duration-500 cursor-pointer"
                      onClick={() =>
                        setPreviewFile({
                          name: activeClientImg.name || 'Sanctuary_Anchor.jpg',
                          dataUrl: activeClientImg.dataUrl,
                          size: 200000,
                          date: activeClientImg.date,
                          type: 'image/jpeg'
                        })
                      }
                      title="Click to view full screen"
                    />
                  ) : (
                    <svg viewBox="0 0 600 360" className="w-full h-full object-cover" role="img" aria-label="Sanctuary Landscape illustration">
                      <defs>
                        <linearGradient id="clientSkyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fde0c2" />
                          <stop offset="45%" stopColor="#a3faef" />
                          <stop offset="100%" stopColor="#0f766e" />
                        </linearGradient>
                      </defs>
                      <rect width="600" height="360" fill="url(#clientSkyGrad)" />
                      <circle cx="460" cy="110" r="55" fill="#fffaf0" opacity="0.85" />
                      <circle cx="460" cy="110" r="85" fill="#fffaf0" opacity="0.25" />
                      <path d="M0 230 Q 160 170 320 220 T 600 200 L 600 360 L 0 360 Z" fill="#2dd4bf" opacity="0.55" />
                      <path d="M0 265 Q 190 210 380 255 T 600 240 L 600 360 L 0 360 Z" fill="#0f766e" opacity="0.85" />
                      <path d="M0 305 Q 230 260 450 295 T 600 285 L 600 360 L 0 360 Z" fill="#0c3b37" />
                    </svg>
                  )}
                  {/* Visual badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[15px] text-teal-300">spa</span>
                      Sanctuary Grounding Anchor
                    </span>
                    {activeClientImg?.dimensions && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px]">
                        {activeClientImg.dimensions}
                      </span>
                    )}
                  </div>
                  {activeClientImg && (
                    <button
                      onClick={() =>
                        setPreviewFile({
                          name: activeClientImg.name || 'Sanctuary_Anchor.jpg',
                          dataUrl: activeClientImg.dataUrl,
                          size: 200000,
                          date: activeClientImg.date,
                          type: 'image/jpeg'
                        })
                      }
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      Full View
                    </button>
                  )}
                </div>

                {/* Right controls and reflection note area */}
                <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Grounding Space</span>
                      {activeClientImg?.date && <span className={clsMuted}>{activeClientImg.date}</span>}
                    </div>

                    {!editingImageMeta ? (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-xl font-bold text-[#14302c] dark:text-[#e3efec] mb-1.5 leading-snug">
                            {activeClientImg?.title || 'Coastal Morning Serenity'}
                          </h3>
                          <button
                            type="button"
                            className="p-1 rounded-lg text-[#5f7571] hover:text-teal-700 dark:hover:text-teal-400 transition"
                            title="Edit Grounding Note"
                            onClick={() => {
                              setImageMetaForm({
                                title: activeClientImg?.title || 'Coastal Morning Serenity',
                                caption: activeClientImg?.caption || 'Focusing on the horizon helps settle nervous system tension and invites calm breaths.'
                              });
                              setEditingImageMeta(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                        <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] leading-relaxed mb-4">
                          {activeClientImg?.caption || 'Focusing on the horizon helps settle nervous system tension and invites calm breaths.'}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 space-y-2 p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                        <input
                          type="text"
                          value={imageMetaForm.title}
                          onChange={(e) => setImageMetaForm((prev) => ({ ...prev, title: e.target.value }))}
                          className={`${clsInput} py-1.5 text-xs font-semibold`}
                          placeholder="Anchor title (e.g. My Morning Garden)"
                        />
                        <textarea
                          value={imageMetaForm.caption}
                          onChange={(e) => setImageMetaForm((prev) => ({ ...prev, caption: e.target.value }))}
                          className={`${clsTextarea} min-h-[60px] text-xs`}
                          placeholder="Why this brings you calm / grounding intention"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            className={`${clsBtnSecondary} text-xs py-1 px-2.5`}
                            onClick={() => setEditingImageMeta(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className={`${clsBtnPrimary} text-xs py-1 px-2.5`}
                            onClick={() => handleSaveImageMeta(activeClientImg?.id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload personal sanctuary image */}
                    <div className="p-3.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-dashed border-teal-700/30 dark:border-teal-400/30 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">nature_people</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#14302c] dark:text-[#e3efec]">Upload Calming Image</div>
                          <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">Upload nature, art, a peaceful room, or personal pet photo</div>
                        </div>
                      </div>
                      <label className={`mt-2.5 ${clsBtnPrimary} text-xs py-1.5 px-3 w-full cursor-pointer flex items-center justify-center gap-1.5`}>
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        Upload Sanctuary Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleDashboardImageUpload(
                              e,
                              'My Calming Sanctuary Space',
                              'Uploaded personal visual anchor for daily mindfulness and nervous system regulation'
                            )
                          }
                        />
                      </label>
                    </div>

                    {/* Gallery of Uploaded Images (if multiple) */}
                    {clientImages.length > 1 && (
                      <div className="mb-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] mb-1.5">Saved Visual Anchors</div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {clientImages.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => handleSetPrimaryDashboardImage(img.id)}
                              className={`w-14 h-12 rounded-lg border-2 cursor-pointer overflow-hidden shrink-0 transition relative group ${
                                img.id === activeClientImg?.id ? 'border-teal-700 dark:border-teal-400 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                              title={img.title}
                            >
                              {img.dataUrl ? (
                                <img src={img.dataUrl} alt={img.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-teal-900 flex items-center justify-center text-teal-200">
                                  <span className="material-symbols-outlined text-[16px]">spa</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#dde7e3] dark:border-[#23403f] text-xs">
                    <span className="text-[#5f7571] dark:text-[#8fa8a3]">
                      {clientImages.length} visual anchor{clientImages.length === 1 ? '' : 's'}
                    </span>
                    {activeClientImg && activeClientImg.id !== 'img-seed-jamie' && (
                      <button
                        onClick={() => handleDeleteDashboardImage(activeClientImg.id)}
                        className="text-[#b3392a] dark:text-[#f4a496] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Mood Card & Care Journey */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>How are you feeling today?</h3>
                {td ? (
                  <div className="mb-4 p-3 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center gap-3">
                    <span className="text-3xl">{E[td.v - 1]}</span>
                    <div>
                      <div className="text-xs font-semibold text-teal-800 dark:text-teal-200">Today's Check-in Logged</div>
                      <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">{MOODS[td.v - 1].label}: {MOODS[td.v - 1].desc}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">Select your current emotional energy:</p>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition group cursor-pointer ${
                        td?.v === m.val
                          ? 'border-teal-700 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/40 shadow-xs'
                          : 'border-[#dde7e3] dark:border-[#23403f] hover:bg-[#e3f1ee] dark:hover:bg-[#173b3a]'
                      }`}
                      onClick={() => handleQuickMood(m.val)}
                    >
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{m.emoji}</span>
                      <span className="text-[11px] font-semibold">{m.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button className={`${clsBtnSecondary} text-xs`} onClick={() => go('cl-mood')}>
                    Open Deep Mood Journal
                  </button>
                </div>
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Your Sanctuary Care Journey</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[20px]">how_to_reg</span>
                      <span className="text-sm font-semibold">1. Clinical Intake Application</span>
                    </div>
                    {renderChip(c?.status || 'Pending')}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#e07a5f] text-[20px]">calendar_month</span>
                      <span className="text-sm font-semibold">2. Consultations & Telehealth</span>
                    </div>
                    {renderChip(as.length ? 'Booked' : 'Open')}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#6c8ebf] text-[20px]">fact_check</span>
                      <span className="text-sm font-semibold">3. Holistic Care Plan</span>
                    </div>
                    {renderChip(pl.length ? 'Active' : 'Awaiting Steps')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'cl-mood': {
        const m = moodsOf(U.id);
        const userAvg = avg(U.id);
        return (
          <div className="space-y-6">
            {renderHeader('Mood Journal & Emotional Energy', 'Observe your patterns over time. Your consultant has access to support your progress.')}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Log Daily Check-in</h3>
                  <form onSubmit={handleMoodSubmit} className="space-y-4">
                    <label className={clsLabel}>How does your nervous system feel right now?</label>
                    <div className="grid grid-cols-5 gap-2">
                      {MOODS.map((item) => (
                        <label key={item.val} className="m-0 cursor-pointer">
                          <input type="radio" name="v" value={item.val} defaultChecked={item.val === 4} className="peer hidden" />
                          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-[#dde7e3] dark:border-[#23403f] peer-checked:border-teal-700 dark:peer-checked:border-teal-400 peer-checked:bg-[#e3f1ee] dark:peer-checked:bg-[#173b3a] transition-all text-center">
                            <span className="text-2xl mb-1">{item.emoji}</span>
                            <span className="text-[11px] font-semibold">{item.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className={clsLabel}>Reflective Notes (Optional)</label>
                      <textarea
                        name="note"
                        className={clsTextarea}
                        placeholder="What influenced your energy, sleep, or mood today? Any moments of calm?"
                      />
                    </div>
                    <button className={`${clsBtnPrimary} w-full`}>
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                      Record Check-In
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div className={clsCard}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={clsCardTitle}>7-Day Trajectory Curve</h3>
                    {userAvg > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200">
                        Average: {userAvg.toFixed(1)} / 5.0
                      </span>
                    )}
                  </div>
                  {renderChart(m.slice(-14).map((x) => x.v))}
                  <div className="flex justify-between items-center text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-2">
                    <span>Prior check-ins</span>
                    <span>Most recent</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f]">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-1">
                      <span className="material-symbols-outlined text-[20px]">bedtime</span>
                      <span className="text-xs font-semibold">Sleep Pacing</span>
                    </div>
                    <div className="font-bold text-sm">7.5 hrs · Restful REM</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f]">
                    <div className="flex items-center gap-2 text-[#e07a5f] mb-1">
                      <span className="material-symbols-outlined text-[20px]">directions_walk</span>
                      <span className="text-xs font-semibold">Daily Movement</span>
                    </div>
                    <div className="font-bold text-sm">4,820 steps · Gentle walk</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={clsCard}>
              <h3 className={clsCardTitle}>Past Check-In History</h3>
              {m.length ? (
                <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                  {[...m].reverse().slice(0, 10).map((x, idx) => (
                    <div className="py-3 flex items-start gap-3" key={idx}>
                      <span className="text-2xl">{E[x.v - 1]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <b className="text-sm">{MOODS[x.v - 1].label}</b>
                          <span className={clsMuted}>· {x.date}</span>
                        </div>
                        {x.note && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1">{x.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderEmpty('No previous check-in records.')
              )}
            </div>
          </div>
        );
      }

      case 'cl-book':
        return (
          <div className="space-y-6">
            {renderHeader('Book a Consultation', 'Schedule a safe dialogue with your assigned clinician.')}

            <div className="max-w-2xl mx-auto">
              <div className={clsCard}>
                <form onSubmit={handleBookSession} className="space-y-4">
                  <div>
                    <label className={clsLabel}>Select Consultation Modality</label>
                    <select name="type" className={clsInput}>
                      <option>Online Telehealth Consultation</option>
                      <option>In-Person Sanctuary Consultation</option>
                      <option>Focused Follow-Up Check-In</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={clsLabel}>Preferred Date</label>
                      <input type="date" name="date" min={T()} className={clsInput} required />
                    </div>
                    <div>
                      <label className={clsLabel}>Preferred Time</label>
                      <input type="time" name="time" className={clsInput} required />
                    </div>
                  </div>
                  <div>
                    <label className={clsLabel}>What would you like to explore during this session?</label>
                    <textarea name="reason" className={clsTextarea} placeholder="Share topics, thoughts, or symptoms you'd like to address..." required />
                  </div>
                  <div>
                    <label className={clsLabel}>Personal Goals for this Session (Optional)</label>
                    <textarea name="goals" className={clsTextarea} placeholder="e.g. Grounding methods for high-stress work scenarios..." />
                  </div>
                  <div>
                    <label className={clsLabel}>Preferred Contact Method</label>
                    <select name="contact" className={clsInput}>
                      <option>Direct Video Call (WebRTC Sanctuary)</option>
                      <option>Secure Audio Consultation</option>
                      <option>Email Confirmation</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] text-xs text-[#0b5a54] dark:text-teal-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>End-to-end encrypted · Flexible rescheduling up to 24h prior.</span>
                  </div>

                  <button className={`${clsBtnPrimary} w-full mt-2`}>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Submit Session Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'cl-sessions': {
        const as = S.ap.filter((a) => a.uid === U.id).sort(srt);
        return (
          <div className="space-y-6">
            {renderHeader('My Sessions', 'Manage your upcoming consultations and review past bookings.')}
            <div className={clsCard}>
              {as.length ? (
                as.map((a) => (
                  <div className={clsRow} key={a.id}>
                    <div className={clsRowHeader}>
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-sm">{a.date} at {a.time}</b>
                          {renderChip(a.status)}
                        </div>
                        <div className={`${clsMuted} mt-0.5`}>{a.type}</div>
                        {a.pre?.reason && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1">Topic: {a.pre.reason}</p>}
                      </div>
                      {a.status === 'Requested' && (
                        <button className={`${clsBtnDanger} text-xs py-1.5 px-3`} onClick={() => handleCancelAp(a.id)}>
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                renderEmpty('No sessions scheduled. You can book an appointment at any time.')
              )}
            </div>
          </div>
        );
      }

      case 'cl-goals': {
        const pl = S.pl.filter((p) => p.uid === U.id);
        const dn = pl.filter((p) => p.done).length;
        const pct = pl.length ? Math.round((dn / pl.length) * 100) : 0;
        return (
          <div className="space-y-6">
            {renderHeader('My Goals & Care Plan', 'Supportive steps collaboratively curated with your consultant.')}

            <div className={clsCard}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Overall Care Progress</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{pct}% Completed</span>
              </div>
              <div className="h-3 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-full overflow-hidden">
                <div className="h-full bg-teal-700 dark:bg-teal-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-2">
                {dn} of {pl.length} action steps completed
              </div>
            </div>

            <div className={clsCard}>
              <h3 className={clsCardTitle}>Prescribed Action Steps</h3>
              {pl.length ? (
                <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                  {pl.map((p) => (
                    <div className="py-4" key={p.id}>
                      <div className={clsRowHeader}>
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-[20px] ${p.done ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400'}`}>
                            {p.done ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <b className={`text-sm ${p.done ? 'line-through opacity-70' : ''}`}>{p.title}</b>
                        </div>
                        {renderChip(p.done ? 'Completed' : 'In progress')}
                      </div>
                      {p.due && <div className={`${clsMuted} pl-7 mt-1`}>Target: {p.due}</div>}
                      {p.details && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] pl-7 mt-1.5">{p.details}</p>}
                      <div className="pl-7 mt-3">
                        <button
                          className={p.done ? `${clsBtnSecondary} text-xs py-1 px-3` : `${clsBtnPrimary} text-xs py-1 px-3`}
                          onClick={() => handleTogglePlan(p.id)}
                        >
                          {p.done ? 'Reopen Goal' : 'Mark as Complete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderEmpty('No care plan goals configured yet.')
              )}
            </div>
          </div>
        );
      }

      case 'cl-files': {
        const c = myC();
        const ok = c?.status === 'Accepted';
        const fl = S.fl.filter((f) => f.uid === U.id);
        return (
          <div className="space-y-6">
            {renderHeader('Confidential Documents', 'Upload and share health records or reflection journals with your consultant.')}

            {ok ? (
              <div className="space-y-6">
                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Upload Documents</h3>
                  <form onSubmit={handleFileAdd} className="space-y-3">
                    <input type="file" name="f" multiple className={clsInput} required />
                    <button className={`${clsBtnPrimary} mt-2`}>
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Share Document
                    </button>
                  </form>
                </div>

                <div className={clsCard}>
                  <h3 className={clsCardTitle}>Uploaded & Shared Files</h3>
                  {fl.length ? (
                    fl.map((f) => (
                      <div className={`${clsRow} ${clsRowHeader}`} key={f.id}>
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[22px]">
                            {getFileIcon(f.name)}
                          </span>
                          <div>
                            <span className="text-sm font-semibold">{f.name}</span>
                            <div className={`${clsMuted} flex items-center gap-2 mt-0.5`}>
                              <span>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                              <span>•</span>
                              <span>{f.date || 'Recent'}</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                f.uploadedBy === 'consultant'
                                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {f.uploadedBy === 'consultant' ? 'From Consultant' : 'Uploaded by you'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className={`${clsBtnSecondary} text-xs py-1 px-2.5`} onClick={() => setPreviewFile(f)}>
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            Preview
                          </button>
                          <button className={`${clsBtnSecondary} text-xs py-1 px-2.5`} onClick={() => handleDownloadFile(f)}>
                            <span className="material-symbols-outlined text-[15px]">download</span>
                            Download
                          </button>
                          <button className={`${clsBtnDanger} text-xs py-1 px-2.5`} onClick={() => handleDeleteItem('fl', f.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    renderEmpty('No files uploaded yet.')
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879] text-sm">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Documents are locked pending clinical approval
                </div>
                Your request status is currently <b>{c?.status || 'Pending'}</b>. Once accepted by the consultant, you will be able to exchange files securely.
              </div>
            )}
          </div>
        );
      }

      case 'cl-res': {
        const breathPhases = [
          { name: 'Inhale gently', desc: 'Expand abdomen, breathe in calm' },
          { name: 'Hold pause', desc: 'Retain serenity, feel stillness' },
          { name: 'Exhale slowly', desc: 'Release tension, soften shoulders' },
          { name: 'Rest in ease', desc: 'Settle before the next cycle' }
        ];

        const somaticDescriptors = {
          1: 'Deep serenity · Baseline parasympathetic calm',
          2: 'Mild ease · Relaxed and present',
          3: 'Steady · Functioning with equilibrium',
          4: 'Mild tension · Elevated heart rate or mild worry',
          5: 'Moderate distress · Muscle stiffness or anxiety',
          6: 'High stress · Overwhelmed thoughts',
          7: 'Intense distress · Fight-or-flight activation',
          8: 'Severe distress · Difficult to focus',
          9: 'Acute overwhelm · Strong somatic tension',
          10: 'Crisis state · Please consider immediate support'
        };

        return (
          <div className="space-y-6">
            {renderHeader('Wellbeing Sanctuary Toolkit', 'Evidence-based mindfulness, guided somatic pacing, and grounding tools.')}

            {/* Guided Breathing Interactive Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${clsCard} text-center flex flex-col items-center justify-between`}>
                <div>
                  <h3 className={clsCardTitle}>Guided Box Breathing (4-4-4-4)</h3>
                  <p className={clsMuted}>Paced autonomic regulation exercise.</p>
                </div>

                <div className="my-8 relative flex items-center justify-center">
                  <div
                    className={`w-44 h-44 rounded-full bg-gradient-to-br from-[#e3f1ee] to-teal-700 dark:from-[#173b3a] dark:to-teal-400 flex flex-col items-center justify-center text-white dark:text-[#052321] font-bold shadow-lg transition-transform duration-1000 ${
                      isBreathing ? (breathPhaseIndex === 0 ? 'scale-115' : breathPhaseIndex === 2 ? 'scale-90' : 'scale-100') : 'scale-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl mb-1">spa</span>
                    <span className="text-sm font-semibold">{isBreathing ? breathPhases[breathPhaseIndex].name : 'Ready'}</span>
                  </div>
                </div>

                <div className="space-y-3 w-full">
                  <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                    {isBreathing ? (
                      <span>
                        Cycle {breathCycle} of 4 · {breathPhases[breathPhaseIndex].desc}
                      </span>
                    ) : (
                      'Press start to begin 4-cycle nervous system reset'
                    )}
                  </div>
                  <button
                    type="button"
                    className={isBreathing ? `${clsBtnSecondary} w-full` : `${clsBtnPrimary} w-full`}
                    onClick={() => setIsBreathing((v) => !v)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{isBreathing ? 'pause' : 'play_arrow'}</span>
                    {isBreathing ? 'Pause Breathing' : 'Start Paced Breathing'}
                  </button>
                </div>
              </div>

              {/* 5-4-3-2-1 Sensory Grounding */}
              <div className={clsCard}>
                <h3 className={clsCardTitle}>5-4-3-2-1 Grounding Practice</h3>
                <p className={`${clsMuted} mb-4`}>Bring your conscious attention back to the present moment:</p>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">5</span>
                    <span>Notice <b>5 things you can see</b> around you</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">4</span>
                    <span>Notice <b>4 sensations you can feel</b> (feet on floor, breath)</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">3</span>
                    <span>Notice <b>3 sounds you can hear</b> right now</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">2</span>
                    <span>Notice <b>2 scents you can smell</b></span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
                    <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">1</span>
                    <span>Notice <b>1 taste</b> or swallow gently</span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 rounded-xl bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496] text-xs leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <span className="material-symbols-outlined text-[16px]">emergency</span>
                    Immediate 24/7 Crisis Assistance
                  </div>
                  If you are in acute distress or feeling unsafe, please dial <b>988</b> (Suicide & Crisis Lifeline) or your local emergency services immediately.
                </div>
              </div>
            </div>

            {/* Somatic Distress Slider */}
            <div className={clsCard}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={clsCardTitle}>Somatic Subjective Units of Distress (SUDS)</h3>
                <span className="font-bold text-lg text-teal-700 dark:text-teal-400">Score: {somaticLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={somaticLevel}
                onChange={(e) => setSomaticLevel(+e.target.value)}
                className="w-full accent-teal-700 dark:accent-teal-400 cursor-pointer"
              />
              <div className="mt-2 text-xs font-semibold text-[#5f7571] dark:text-[#8fa8a3]">
                {somaticDescriptors[somaticLevel]}
              </div>
            </div>

            {/* Three Pillars of Daily Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={clsCard}>
                <div className="flex items-center gap-2 mb-2 text-teal-700 dark:text-teal-400">
                  <span className="material-symbols-outlined text-[20px]">bedtime</span>
                  <b className="text-sm">Sleep Rhythm</b>
                </div>
                <p className={`${clsMuted} leading-relaxed`}>
                  Aim for a regular sleep window. Dim blue light screens 60 minutes before bed to allow melatonin release.
                </p>
              </div>

              <div className={clsCard}>
                <div className="flex items-center gap-2 mb-2 text-[#e07a5f]">
                  <span className="material-symbols-outlined text-[20px]">directions_walk</span>
                  <b className="text-sm">Gentle Movement</b>
                </div>
                <p className={`${clsMuted} leading-relaxed`}>
                  A brief 10 to 15 minute walk in daylight activates endorphins and reduces cortisol accumulation.
                </p>
              </div>

              <div className={clsCard}>
                <div className="flex items-center gap-2 mb-2 text-[#6c8ebf]">
                  <span className="material-symbols-outlined text-[20px]">people</span>
                  <b className="text-sm">Safe Connection</b>
                </div>
                <p className={`${clsMuted} leading-relaxed`}>
                  Reach out to one supportive person or peer today. Even a short exchange reinforces relational security.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case 'cl-notif':
        return (
          <div className="space-y-6">
            {renderHeader('My Notifications', 'Updates regarding your appointments, clinician feedback, and care plans.')}
            {renderNotifications(U.id)}
          </div>
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
          // AUTHENTICATION SCREEN
          <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0c3b37] to-teal-800 text-white p-12 lg:p-16">
              <div>
                <div className="flex items-center gap-2 text-2xl font-serif font-bold text-teal-200">
                  <span className="material-symbols-outlined text-3xl">spa</span>
                  <span>MindCare Sanctuary</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mt-6 mb-4">
                  Calm, clinical excellence for every mind.
                </h1>
                <p className="text-teal-100/90 text-base max-w-md leading-relaxed">
                  A modern, trauma-informed digital practice management platform bridging practitioners and clients with serene simplicity.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-teal-100">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
                    <span>Secure practitioner triage & intake workflow</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
                    <span>Continuous 7-day mood pacing and trajectory charts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
                    <span>Integrated care plans, session notes, and document vault</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
                    <span>Evidence-based box breathing & sensory grounding tools</span>
                  </li>
                </ul>
              </div>

              {/* Serene sunrise artwork */}
              <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl bg-teal-900/60 p-2">
                <svg viewBox="0 0 400 240" className="w-full h-auto rounded-xl" role="img" aria-label="Serene sanctuary illustration">
                  <defs>
                    <linearGradient id="artSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fde0c2" />
                      <stop offset="60%" stopColor="#a3faef" />
                      <stop offset="100%" stopColor="#0f766e" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="240" fill="url(#artSky)" />
                  <circle cx="280" cy="90" r="50" fill="#fffaf0" opacity="0.85" />
                  <circle cx="280" cy="90" r="70" fill="#fffaf0" opacity="0.25" />
                  <path d="M0 160 Q 100 120 200 150 T 400 140 L 400 240 L 0 240 Z" fill="#2dd4bf" opacity="0.6" />
                  <path d="M0 185 Q 120 150 240 180 T 400 170 L 400 240 L 0 240 Z" fill="#0f766e" opacity="0.85" />
                  <path d="M0 210 Q 140 185 260 210 T 400 200 L 400 240 L 0 240 Z" fill="#0c3b37" />
                  <g fill="#fffaf0">
                    <circle cx="150" cy="155" r="8" />
                    <path d="M138 185 Q 150 160 162 185 Z" />
                    <ellipse cx="150" cy="186" rx="20" ry="6" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 text-xl font-serif font-bold text-teal-700 dark:text-teal-400 lg:hidden mb-4">
                  <span className="material-symbols-outlined text-2xl">spa</span>
                  <span>MindCare Sanctuary</span>
                </div>

                <h2 className="font-serif text-3xl font-bold text-[#14302c] dark:text-[#e3efec]">
                  {isSignup ? 'Apply for Clinical Intake' : 'Sign in to Sanctuary'}
                </h2>
                <p className={`${clsMuted} mt-1 mb-6`}>
                  {isSignup ? 'Create a secure client portal profile.' : 'Access your practice or client wellbeing space.'}
                </p>

                {/* Role Switcher Tabs */}
                <div className="flex p-1 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-xl mb-6">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'consultant'
                        ? 'bg-white dark:bg-[#14292a] text-teal-800 dark:text-teal-200 shadow-xs'
                        : 'text-[#5f7571] dark:text-[#8fa8a3]'
                    }`}
                    onClick={() => setRole('consultant')}
                  >
                    Consultant
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'client'
                        ? 'bg-white dark:bg-[#14292a] text-teal-800 dark:text-teal-200 shadow-xs'
                        : 'text-[#5f7571] dark:text-[#8fa8a3]'
                    }`}
                    onClick={() => setRole('client')}
                  >
                    Client
                  </button>
                </div>

                {!isSignup ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className={clsLabel}>Email Address</label>
                      <input
                        name="email"
                        type="email"
                        className={clsInput}
                        defaultValue={role === 'consultant' ? 'demo@mindcare.com' : 'jamie@example.com'}
                        required
                      />
                    </div>
                    <div>
                      <label className={clsLabel}>Password</label>
                      <input
                        name="pw"
                        type="password"
                        className={clsInput}
                        defaultValue={role === 'consultant' ? 'MindCare123' : 'Jamie1234'}
                        required
                      />
                    </div>
                    <button className={`${clsBtnPrimary} w-full mt-2 py-2.5`}>
                      Sign In as {role === 'consultant' ? 'Consultant' : 'Client'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className={clsLabel}>Full Name</label>
                      <input name="name" className={clsInput} placeholder="e.g. Alex Morgan" required />
                    </div>
                    <div>
                      <label className={clsLabel}>Email Address</label>
                      <input name="email" type="email" className={clsInput} placeholder="alex@example.com" required />
                    </div>
                    <div>
                      <label className={clsLabel}>Choose Password (min 8 characters)</label>
                      <input name="pw" type="password" minLength={8} className={clsInput} required />
                    </div>
                    <div>
                      <label className={clsLabel}>Intake Reflection: What would you like help with?</label>
                      <textarea name="reason" className={clsTextarea} placeholder="Stress, anxiety, mindfulness, work burnout..." />
                    </div>
                    <button className={`${clsBtnPrimary} w-full mt-2 py-2.5`}>
                      Submit Intake Application
                    </button>
                  </form>
                )}

                <div className="mt-6 text-center text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                  {role === 'client' &&
                    (isSignup ? (
                      <p>
                        Already have an active client account?{' '}
                        <button type="button" className="text-teal-700 dark:text-teal-400 font-bold hover:underline" onClick={() => setIsSignup(false)}>
                          Sign in
                        </button>
                      </p>
                    ) : (
                      <p>
                        New patient applying for intake?{' '}
                        <button type="button" className="text-teal-700 dark:text-teal-400 font-bold hover:underline" onClick={() => setIsSignup(true)}>
                          Create client profile
                        </button>
                      </p>
                    ))}
                </div>

                {/* Demo Quick Credentials Card */}
                <div className="mt-8 p-4 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] border border-teal-700/20 text-xs text-[#0b5a54] dark:text-teal-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Demo Credentials Pre-configured</span>
                  </div>
                  <div><b>Consultant:</b> demo@mindcare.com / MindCare123</div>
                  <div><b>Client (Jamie):</b> jamie@example.com / Jamie1234</div>
                  <div><b>New Client (Demo):</b> client@mindcare.com / Client123</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // AUTHENTICATED APPLICATION
          <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <aside
              className={`w-64 bg-[#0c3b37] dark:bg-[#081f1e] text-[#cfe5e1] p-4 fixed lg:sticky top-0 h-screen flex flex-col justify-between shrink-0 z-30 transition-all duration-300 ${
                sideOpen ? 'left-0' : '-left-64 lg:left-0'
              }`}
            >
              <div>
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-teal-800/60">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">spa</span>
                  </div>
                  <div>
                    <div className="font-serif font-bold text-lg text-white leading-none">MindCare Pro</div>
                    <span className="text-[10px] uppercase tracking-wider text-teal-300">Sanctuary Portal</span>
                  </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1">
                  {navItems.map(([key, label, iconName]) => (
                    <button
                      key={key}
                      className={`flex items-center justify-between w-full text-left rounded-xl px-3.5 py-2.5 text-sm transition ${
                        key === page
                          ? 'bg-teal-700/60 text-white font-semibold shadow-xs'
                          : 'text-[#b7d3ce] hover:bg-white/10'
                      }`}
                      onClick={() => go(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                        <span>{label}</span>
                      </div>
                      {key.includes('notif') && unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e07a5f] text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Sidebar Footer Controls */}
              <div className="pt-3 border-t border-teal-800/60">
                <div
                  onClick={() => setProfileMenuOpen(true)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-900/60 hover:bg-teal-900/90 cursor-pointer transition mb-2 group"
                  title="Click to view overview & update picture"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-white/20">
                    {userAvatar ? (
                      <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{U.name.replace('Dr. ', '')[0]}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-teal-200 transition-colors">{U.name}</div>
                    <div className="text-[10px] text-teal-300 capitalize">{U.role} · Click to edit</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2 text-sm text-[#b7d3ce] hover:bg-white/10 transition"
                    onClick={exportData}
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Export Data</span>
                  </button>
                  <button
                    className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2 text-sm text-[#f4a496] hover:bg-[#3b1f1b]/50 transition"
                    onClick={logout}
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile backdrop */}
            {sideOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                onClick={() => setSideOpen(false)}
              />
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col">
              {/* Sticky Top Header Bar */}
              <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 dark:bg-[#14292a]/90 backdrop-blur-md border-b border-[#dde7e3] dark:border-[#23403f]">
                <div className="flex items-center gap-3">
                  <button
                    className="lg:hidden w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200"
                    onClick={() => setSideOpen((o) => !o)}
                    aria-label="Open menu"
                  >
                    <span className="material-symbols-outlined text-[20px]">menu</span>
                  </button>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#14302c] dark:text-[#e3efec]">{currentPageTitle}</h2>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4">
                  {/* Crisis Support Pill */}
                  <a
                    href="tel:988"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496] text-xs font-semibold hover:opacity-90 transition"
                    title="24/7 Lifeline Support"
                  >
                    <span className="material-symbols-outlined text-[16px]">emergency</span>
                    <span>24/7 Crisis (988)</span>
                  </a>

                  {/* Dark mode toggle */}
                  <button
                    className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200 transition hover:scale-105"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
                  </button>

                  {/* Notifications bell */}
                  <button
                    className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200 relative transition hover:scale-105"
                    onClick={() => go(U.role === 'client' ? 'cl-notif' : 'c-notif')}
                    aria-label="Notifications"
                  >
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e07a5f] text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="h-6 w-px bg-[#dde7e3] dark:bg-[#23403f]" />

                  {/* User Profile Pill & Overview Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen((o) => !o)}
                      className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-2xl hover:bg-[#e3f1ee] dark:hover:bg-[#173b3a] transition cursor-pointer group border border-transparent hover:border-[#dde7e3] dark:hover:border-[#23403f]"
                      aria-label="User Profile and Overview"
                    >
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-teal-700/20 dark:ring-teal-400/20 group-hover:ring-teal-700 dark:group-hover:ring-teal-400 transition-all shrink-0">
                        {userAvatar ? (
                          <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{U.name.replace('Dr. ', '')[0]}</span>
                        )}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                        </div>
                      </div>
                      <div className="hidden md:block leading-tight text-left">
                        <div className="text-xs font-bold text-[#14302c] dark:text-[#e3efec] group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors flex items-center gap-0.5">
                          <span>{U.name}</span>
                          <span className="material-symbols-outlined text-[16px] text-[#5f7571] dark:text-[#8fa8a3]">expand_more</span>
                        </div>
                        <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] capitalize">{U.role}</div>
                      </div>
                    </button>

                    {/* Hidden Avatar File Input */}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />

                    {/* Profile Overview Dropdown Card */}
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] shadow-2xl z-50 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#14302c] dark:text-[#e3efec]">
                          {/* Header / Picture update */}
                          <div className="flex items-center gap-3.5 pb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
                            <div className="relative group shrink-0">
                              <div
                                onClick={() => avatarInputRef.current?.click()}
                                className="w-16 h-16 rounded-full overflow-hidden bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-2xl shadow-sm ring-2 ring-teal-700/30 cursor-pointer"
                                title="Click to upload/change photo"
                              >
                                {userAvatar ? (
                                  <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{U.name.replace('Dr. ', '')[0]}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                                title="Upload / change picture"
                              >
                                <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif font-bold text-base m-0 truncate">{U.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200 capitalize">
                                  {U.role}
                                </span>
                              </div>
                              <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] truncate mt-0.5">{U.email}</div>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => avatarInputRef.current?.click()}
                                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">upload</span>
                                  {userAvatar ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {userAvatar && (
                                  <>
                                    <span className="text-[#5f7571] dark:text-[#8fa8a3]">•</span>
                                    <button
                                      type="button"
                                      onClick={handleRemoveAvatar}
                                      className="text-xs font-semibold text-[#b3392a] dark:text-[#f4a496] hover:underline cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Overview Section */}
                          <div className="py-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">
                                {U.role === 'consultant' ? 'Practitioner Overview' : 'Client Sanctuary Overview'}
                              </span>
                              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">Active Profile</span>
                            </div>

                            {U.role === 'consultant' ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Active Clients</div>
                                  <div className="font-serif text-lg font-bold text-teal-900 dark:text-teal-200 mt-0.5">{acc().length}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Pending Triage</div>
                                  <div className="font-serif text-lg font-bold text-[#e9b44c] mt-0.5">{S.cl.filter((c) => c.status === 'Pending').length}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Upcoming</div>
                                  <div className="font-serif text-lg font-bold text-[#6c8ebf] mt-0.5">{S.ap.filter((a) => a.date >= T()).length} sessions</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Vault Documents</div>
                                  <div className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] mt-0.5">{S.fl.length} files</div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Intake Status</div>
                                  <div className="font-serif text-base font-bold text-teal-900 dark:text-teal-200 mt-0.5">{myC()?.status || 'Pending'}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Mindful Streak</div>
                                  <div className="font-serif text-lg font-bold text-[#e9b44c] mt-0.5">{streak(U.id)} Days</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Care Goals</div>
                                  <div className="font-serif text-lg font-bold text-[#6c8ebf] mt-0.5">
                                    {S.pl.filter((p) => p.uid === U.id && p.done).length} / {S.pl.filter((p) => p.uid === U.id).length}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                                  <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Documents</div>
                                  <div className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] mt-0.5">
                                    {S.fl.filter((f) => f.uid === U.id).length} files
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-t border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className={`${clsBtnSecondary} text-xs py-1.5 px-3 flex-1 justify-center cursor-pointer`}
                              onClick={() => {
                                setProfileMenuOpen(false);
                                go(U.role === 'client' ? 'cl-home' : 'c-home');
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">dashboard</span>
                              Overview
                            </button>
                            <button
                              type="button"
                              className={`${clsBtnDanger} text-xs py-1.5 px-3 flex-1 justify-center cursor-pointer`}
                              onClick={() => {
                                setProfileMenuOpen(false);
                                logout();
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">logout</span>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {/* Dynamic Page Views */}
              <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                {renderPageContent()}

                {/* Footer disclaimer */}
                <div className="text-center text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-12 mb-4">
                  MindCare Sanctuary · Modern Clinical Health Portal · In case of immediate psychiatric emergency, call 988.
                </div>
              </div>
            </main>
          </div>
        )}

        {/* Client Detailed Profile & Vault Modal */}
        {renderClientModal()}

        {/* File In-App Preview Modal */}
        {renderFilePreviewModal()}

        {/* Global Floating Toast Alert */}
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#14302c] dark:bg-[#e3efec] text-[#f2f5f3] dark:text-[#0d1b1a] px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 z-50 pointer-events-none ${
            toastOn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {toastMsg}
        </div>
      </div>
    </div>
  );
}
