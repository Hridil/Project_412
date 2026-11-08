import React, { useState, useEffect } from 'react';

const T = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.floor(Date.now() * 1000 + Math.random() * 1000);
const srt = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
const dOff = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const seed = () => ({
  acc: [
    { id: 'cons', name: 'Dr. Demo Consultant', email: 'demo@mindcare.com', pw: 'MindCare123', role: 'consultant' },
    { id: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', pw: 'Client123', role: 'client' },
    { id: 'jamie', name: 'Jamie Lee', email: 'jamie@example.com', pw: 'Jamie1234', role: 'client' }
  ],
  cl: [
    { id: 1, uid: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', status: 'Pending' },
    { id: 2, uid: 'jamie', email: 'jamie@example.com', name: 'Jamie Lee', status: 'Accepted' }
  ],
  ap: [
    { id: 5, uid: 'jamie', cid: 2, date: dOff(1), time: '10:00', type: 'Online Consultation', status: 'Confirmed' }
  ],
  nt: [],
  pl: [],
  nf: [],
  fl: [],
  md: [3, 2, 3, 4, 3, 4, 4].map((v, i) => ({ uid: 'jamie', date: dOff(i - 6), v, note: '' }))
});

const E = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];

const NS = [
  ['c-home', 'Overview', '⌂'],
  ['c-clients', 'Clients', '☺'],
  ['c-schedule', 'Schedule', '▦'],
  ['c-notes', 'Session Notes', '✎'],
  ['c-plans', 'Care Plans', '✓'],
  ['c-notif', 'Notifications', '🔔']
];

const NC = [
  ['cl-home', 'Dashboard', '⌂'],
  ['cl-mood', 'Mood Journal', '☼'],
  ['cl-book', 'Book Session', '＋'],
  ['cl-sessions', 'My Sessions', '▦'],
  ['cl-goals', 'My Goals', '✓'],
  ['cl-files', 'Documents', '⇧'],
  ['cl-res', 'Wellbeing Toolkit', '❀'],
  ['cl-notif', 'Notifications', '🔔']
];

// Reusable Tailwind Class Presets
const clsInput = "w-full px-3 py-2.5 border border-[#dde7e3] dark:border-[#23403f] rounded-[10px] bg-white dark:bg-[#14292a] text-[#14302c] dark:text-[#e3efec] focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400";
const clsTextarea = `${clsInput} min-h-[90px] resize-y`;
const clsLabel = "block text-[13px] font-semibold mt-3 mb-1.5 text-[#14302c] dark:text-[#e3efec]";
const clsBtnPrimary = "bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] font-semibold rounded-[10px] px-[15px] py-[9px] cursor-pointer transition duration-150";
const clsBtnSecondary = "bg-[#e3f1ee] dark:bg-[#173b3a] text-[#0b5a54] dark:text-teal-300 rounded-[10px] px-[15px] py-[9px] cursor-pointer transition duration-150";
const clsBtnDanger = "bg-[#fde8e4] dark:bg-[#3b1f1b] text-[#b3392a] dark:text-[#f4a496] rounded-[10px] px-[15px] py-[9px] cursor-pointer transition duration-150";
const clsCard = "bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl p-5 shadow-sm min-w-0";
const clsCardTitle = "font-serif text-lg font-bold mt-0 mb-3 text-[#14302c] dark:text-[#e3efec]";
const clsRow = "py-3 border-b border-[#dde7e3] dark:border-[#23403f] last:border-b-0";
const clsRowHeader = "flex justify-between items-center gap-2.5 flex-wrap";
const clsMuted = "text-[#5f7571] dark:text-[#8fa8a3] text-[13px]";

export default function MindCarePro() {
  const [S, setS] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mcpro'));
      if (saved) return saved;
    } catch (e) {}
    return seed();
  });

  const [U, setU] = useState(null);
  const [role, setRoleState] = useState('consultant');
  const [isSignup, setIsSignup] = useState(false);
  const [page, setPage] = useState('c-home');
  const [sideOpen, setSideOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [Q, setQ] = useState({ q: '', f: 'all' });
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mcpro', JSON.stringify(S));
    } catch (e) {}
  }, [S]);

  useEffect(() => {
    try {
      const t = localStorage.getItem('mctheme');
      if (t === 'dark') setDark(true);
    } catch (e) {}
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(window.__mcToastTimer);
    window.__mcToastTimer = setTimeout(() => setToastOn(false), 2600);
  };

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mctheme', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  const exportData = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = 'mindcare-data.json';
    a.click();
    showToast('Data exported');
  };

  const setRole = (r) => {
    setRoleState(r);
    setIsSignup(false);
  };

  const go = (p) => {
    setPage(p);
    setSideOpen(false);
    window.scrollTo(0, 0);
  };

  const logout = () => {
    setU(null);
    setRole('consultant');
  };

  // Helper getters
  const myC = () => S.cl.find((c) => c.uid === U?.id);
  const cn = (id) => S.cl.find((c) => c.id === id)?.name || 'Client';
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

  // Actions
  const handleLogin = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const u = S.acc.find(
      (a) => a.email === d.email.trim().toLowerCase() && a.pw === d.pw && a.role === role
    );
    if (!u) {
      showToast(`No ${role} account matches those details.`);
      return;
    }
    setU(u);
    go(u.role === 'client' ? 'cl-home' : 'c-home');
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
    const now = new Date().toLocaleString();

    setS((prev) => ({
      ...prev,
      acc: [...prev.acc, newAcc],
      cl: [...prev.cl, newCl],
      nf: [
        { id: uid() + 1, to: 'cons', msg: `${d.name} requested access.`, date: now, read: false },
        { id: uid(), to: id, msg: 'Welcome to MindCare Pro. Your access request is pending review.', date: now, read: false },
        ...prev.nf
      ]
    }));

    showToast('Account created. Please sign in.');
    e.target.reset();
    setIsSignup(false);
  };

  const handleDecision = (id, status) => {
    const c = S.cl.find((x) => x.id === id);
    if (!c) return;
    const now = new Date().toLocaleString();
    setS((prev) => ({
      ...prev,
      cl: prev.cl.map((x) => (x.id === id ? { ...x, status } : x)),
      nf: [
        { id: uid() + 1, to: 'cons', msg: `Client ${c.name} ${status.toLowerCase()}.`, date: now, read: false },
        {
          id: uid(),
          to: c.uid,
          msg:
            status === 'Accepted'
              ? 'Your request was accepted. Documents and goals are now available.'
              : 'Your request was declined. Please contact the team with questions.',
          date: now,
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast(`${c.name} ${status.toLowerCase()}`);
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const c = S.cl.find((x) => x.id === +d.cid);
    if (!c) return;
    const newAp = { id: uid(), uid: c.uid, cid: c.id, date: d.date, time: d.time, type: d.type, status: 'Confirmed' };
    setS((prev) => ({
      ...prev,
      ap: [...prev.ap, newAp],
      nf: [
        { id: uid(), to: c.uid, msg: `A session was scheduled for ${d.date} at ${d.time}.`, date: new Date().toLocaleString(), read: false },
        ...prev.nf
      ]
    }));
    showToast('Session scheduled');
    e.target.reset();
  };

  const handleConfirmAp = (id) => {
    const a = S.ap.find((x) => x.id === id);
    if (!a) return;
    setS((prev) => ({
      ...prev,
      ap: prev.ap.map((x) => (x.id === id ? { ...x, status: 'Confirmed' } : x)),
      nf: [
        { id: uid(), to: a.uid, msg: `Your session on ${a.date} at ${a.time} is confirmed.`, date: new Date().toLocaleString(), read: false },
        ...prev.nf
      ]
    }));
    showToast('Confirmed');
  };

  const handleCancelAp = (id) => {
    const a = S.ap.find((x) => x.id === id);
    if (!a || !window.confirm('Cancel this session?')) return;
    setS((prev) => ({
      ...prev,
      ap: prev.ap.filter((x) => x.id !== id),
      nf: [
        {
          id: uid(),
          to: U.role === 'client' ? 'cons' : a.uid,
          msg: `Session on ${a.date} at ${a.time} was cancelled.`,
          date: new Date().toLocaleString(),
          read: false
        },
        ...prev.nf
      ]
    }));
    showToast('Cancelled');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const newNote = { id: uid(), cid: +d.cid, title: d.title, tag: d.tag, body: d.body, date: new Date().toLocaleString() };
    setS((prev) => ({ ...prev, nt: [newNote, ...prev.nt] }));
    e.target.reset();
    showToast('Note saved');
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const c = S.cl.find((x) => x.id === +d.cid);
    if (!c) return;
    const newPlan = { id: uid(), cid: c.id, uid: c.uid, title: d.title, due: d.due, details: d.details, done: false };
    setS((prev) => ({
      ...prev,
      pl: [newPlan, ...prev.pl],
      nf: [
        { id: uid(), to: c.uid, msg: `New action step: ${d.title}`, date: new Date().toLocaleString(), read: false },
        ...prev.nf
      ]
    }));
    e.target.reset();
    showToast('Action step added');
  };

  const handleTogglePlan = (id) => {
    const p = S.pl.find((x) => x.id === id);
    if (!p) return;
    const nextDone = !p.done;
    setS((prev) => ({
      ...prev,
      pl: prev.pl.map((x) => (x.id === id ? { ...x, done: nextDone } : x)),
      nf: [
        {
          id: uid(),
          to: 'cons',
          msg: `${U.name}${nextDone ? ' completed: ' : ' reopened: '}${p.title}`,
          date: new Date().toLocaleString(),
          read: false
        },
        ...prev.nf
      ]
    }));
  };

  const handleDeleteItem = (key, id) => {
    if (!window.confirm('Delete this item?')) return;
    setS((prev) => ({ ...prev, [key]: prev[key].filter((x) => x.id !== id) }));
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
    showToast('Check-in saved');
  };

  const handleQuickMood = (v) => {
    setS((prev) => ({
      ...prev,
      md: [
        ...prev.md.filter((m) => !(m.uid === U.id && m.date === T())),
        { uid: U.id, date: T(), v, note: '' }
      ]
    }));
    showToast('Check-in saved');
  };

  const handleBookSession = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const clientRecord = myC();
    const now = new Date().toLocaleString();
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
        { id: uid() + 1, to: U.id, msg: `Request submitted for ${d.date}.`, date: now, read: false },
        { id: uid(), to: 'cons', msg: `${U.name} requested ${d.date} at ${d.time}.`, date: now, read: false },
        ...prev.nf
      ]
    }));
    showToast('Request submitted');
    go('cl-sessions');
  };

  const handleFileAdd = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.f.files || []).map((f) => ({
      id: uid() + Math.random(),
      uid: U.id,
      name: f.name,
      size: f.size
    }));
    setS((prev) => ({
      ...prev,
      fl: [...prev.fl, ...files],
      nf: [
        { id: uid(), to: 'cons', msg: `${U.name} added documents.`, date: new Date().toLocaleString(), read: false },
        ...prev.nf
      ]
    }));
    e.target.reset();
    showToast('Files added');
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
  };

  // UI Sub-renderers with Tailwind
  const renderChip = (status) => {
    const colorMap = {
      Pending: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
      Requested: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
      Rejected: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]'
    };
    const defaultColor = 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]';
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${colorMap[status] || defaultColor}`}>
        {status}
      </span>
    );
  };

  const renderStat = (label, value, sub, borderColorClass) => (
    <div className={`${clsCard} border-t-4 ${borderColorClass}`}>
      <span className={clsMuted}>{label}</span>
      <b className="block font-serif text-[30px] font-bold my-1 text-[#14302c] dark:text-[#e3efec]">{value}</b>
      <span className={clsMuted}>{sub}</span>
    </div>
  );

  const renderEmpty = (msg) => <div className="text-center text-[#5f7571] dark:text-[#8fa8a3] p-5">{msg}</div>;

  const renderHeader = (title, sub) => (
    <div className="mb-5">
      <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">{title}</h1>
      <div className={clsMuted}>{sub}</div>
    </div>
  );

  const renderChart = (values) => {
    if (values.length < 2) return renderEmpty('Log at least two check-ins to see your trend.');
    const w = 520;
    const h = 150;
    const p = 18;
    const pt = values.map((y, i) => [
      p + (i * (w - 2 * p)) / (values.length - 1),
      h - p - ((y - 1) * (h - 2 * p)) / 4
    ]);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto text-teal-700 dark:text-teal-400" role="img" aria-label="Mood trend">
        <path
          d={`M${pt.map((q) => q.join(',')).join('L')}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pt.map((q, idx) => (
          <circle key={idx} cx={q[0]} cy={q[1]} r="4.5" fill="currentColor" />
        ))}
      </svg>
    );
  };

  const renderNotifications = (to) => {
    const list = S.nf.filter((n) => n.to === to);
    return (
      <>
        <div className="mb-3">
          <button className={clsBtnSecondary} onClick={handleReadAllNotifs}>
            Mark all as read
          </button>
        </div>
        <div className={clsCard}>
          {list.length ? (
            list.map((n) => (
              <div className={clsRow} key={n.id}>
                <div className={clsRowHeader}>
                  <b>{n.msg}</b>
                  {!n.read && (
                    <button className={clsBtnSecondary} onClick={() => handleReadNotif(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
                <span className={clsMuted}>
                  {n.date}
                  {n.read ? '' : ' · new'}
                </span>
              </div>
            ))
          ) : (
            renderEmpty('No notifications.')
          )}
        </div>
      </>
    );
  };

  const renderClientOptions = () => (
    <>
      <option value="">Select accepted client</option>
      {acc().map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </>
  );

  const renderPageContent = () => {
    if (!U) return null;

    switch (page) {
      case 'c-home': {
        const up = S.ap.filter((a) => a.date >= T()).sort(srt);
        const pn = S.cl.filter((c) => c.status === 'Pending');
        const n = S.cl.length || 1;
        const cnt = (s) => S.cl.filter((c) => c.status === s).length;
        const activeClients = acc();

        return (
          <>
            {renderHeader(`Good day, ${U.name.split(' ').slice(-1)}`, 'Your practice at a glance.')}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {renderStat('Total clients', S.cl.length, 'All requests', 'border-t-teal-700 dark:border-t-teal-400')}
              {renderStat('Active clients', activeClients.length, 'Approved', 'border-t-[#e07a5f]')}
              {renderStat('Pending review', pn.length, 'Need a decision', 'border-t-[#e9b44c]')}
              {renderStat('Upcoming sessions', up.length, 'Booked', 'border-t-[#6c8ebf]')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Client wellbeing (7-day mood)</h3>
                {activeClients.length ? (
                  activeClients.map((c) => {
                    const a = avg(c.uid);
                    return (
                      <div className={clsRow} key={c.id}>
                        <div className={clsRowHeader}>
                          <b>{c.name}</b>
                          <span>
                            {a ? (
                              `${E[Math.round(a) - 1]} ${a.toFixed(1)}/5`
                            ) : (
                              <span className={clsMuted}>No check-ins</span>
                            )}
                          </span>
                        </div>
                        <div className="h-2 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-md overflow-hidden min-w-[90px] mt-1.5">
                          <i className="block h-full bg-teal-700 dark:bg-teal-400" style={{ width: `${a * 20}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  renderEmpty('No active clients.')
                )}
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Request pipeline</h3>
                {['Pending', 'Accepted', 'Rejected'].map((s) => (
                  <div className={clsRow} key={s}>
                    <div className={clsRowHeader}>
                      <span>{s}</span>
                      <b>{cnt(s)}</b>
                    </div>
                    <div className="h-2 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-md overflow-hidden min-w-[90px] mt-1.5">
                      <i className="block h-full bg-teal-700 dark:bg-teal-400" style={{ width: `${(cnt(s) / n) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Pending requests</h3>
                {pn.length ? (
                  pn.map((c) => (
                    <div className={clsRow} key={c.id}>
                      <div className={clsRowHeader}>
                        <b>{c.name}</b>
                        <span className="flex gap-1.5">
                          <button className={clsBtnPrimary} onClick={() => handleDecision(c.id, 'Accepted')}>
                            Accept
                          </button>
                          <button className={clsBtnDanger} onClick={() => handleDecision(c.id, 'Rejected')}>
                            Reject
                          </button>
                        </span>
                      </div>
                      <span className={clsMuted}>{c.email}</span>
                    </div>
                  ))
                ) : (
                  renderEmpty('All caught up.')
                )}
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Upcoming sessions</h3>
                {up.length ? (
                  up.slice(0, 5).map((a) => (
                    <div className={clsRow} key={a.id}>
                      <div className={clsRowHeader}>
                        <b>{cn(a.cid)}</b>
                        {renderChip(a.status)}
                      </div>
                      <div className={clsMuted}>
                        {a.date} at {a.time} · {a.type}
                      </div>
                    </div>
                  ))
                ) : (
                  renderEmpty('No upcoming sessions.')
                )}
              </div>
            </div>
          </>
        );
      }

      case 'c-clients': {
        const q = Q.q.toLowerCase();
        const rows = S.cl.filter(
          (c) => (c.name + c.email).toLowerCase().includes(q) && (Q.f === 'all' || c.status === Q.f)
        );
        return (
          <>
            {renderHeader('Client Management', 'Review requests and monitor engagement.')}
            <div className="flex flex-wrap gap-2.5 mb-3.5">
              <input
                className={`${clsInput} max-w-[320px]`}
                placeholder="Search name or email"
                value={Q.q}
                onChange={(e) => setQ((prev) => ({ ...prev, q: e.target.value }))}
              />
              <select
                className={`${clsInput} max-w-[180px]`}
                value={Q.f}
                onChange={(e) => setQ((prev) => ({ ...prev, f: e.target.value }))}
              >
                {['all', 'Pending', 'Accepted', 'Rejected'].map((x) => (
                  <option key={x} value={x}>
                    {x === 'all' ? 'All statuses' : x}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${clsCard} overflow-x-auto`}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {['Client', 'Email', 'Status', 'Mood (7d)', 'Sessions', 'Actions'].map((th) => (
                      <th
                        key={th}
                        className="text-left p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap text-[11px] uppercase text-[#5f7571] dark:text-[#8fa8a3] tracking-wider"
                      >
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((c) => {
                      const a = avg(c.uid);
                      return (
                        <tr key={c.id}>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            <b>{c.name}</b>
                          </td>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            {c.email}
                          </td>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            {renderChip(c.status)}
                          </td>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            {a ? `${E[Math.round(a) - 1]} ${a.toFixed(1)}` : '—'}
                          </td>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            {S.ap.filter((x) => x.cid === c.id).length}
                          </td>
                          <td className="p-[11px] border-b border-[#dde7e3] dark:border-[#23403f] whitespace-nowrap">
                            <div className="flex gap-1.5 flex-wrap">
                              {c.status !== 'Accepted' && (
                                <button
                                  className={`${clsBtnPrimary} text-xs px-2.5 py-1.5`}
                                  onClick={() => handleDecision(c.id, 'Accepted')}
                                >
                                  Accept
                                </button>
                              )}
                              {c.status !== 'Rejected' && (
                                <button
                                  className={`${clsBtnDanger} text-xs px-2.5 py-1.5`}
                                  onClick={() => handleDecision(c.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>{renderEmpty('No clients found.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }

      case 'c-schedule': {
        const all = [...S.ap].sort(srt);
        return (
          <>
            {renderHeader('Schedule', 'Create and manage sessions.')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>New session</h3>
                <form onSubmit={handleSchedule}>
                  <label className={clsLabel}>Client</label>
                  <select name="cid" className={clsInput} required>
                    {renderClientOptions()}
                  </select>
                  <label className={clsLabel}>Date</label>
                  <input type="date" name="date" min={T()} className={clsInput} required />
                  <label className={clsLabel}>Time</label>
                  <input type="time" name="time" className={clsInput} required />
                  <label className={clsLabel}>Type</label>
                  <select name="type" className={clsInput}>
                    <option>Online Consultation</option>
                    <option>In-person Consultation</option>
                    <option>Follow-up Session</option>
                  </select>
                  <button className={`${clsBtnPrimary} mt-3.5`}>Schedule</button>
                </form>
              </div>
              <div className={clsCard}>
                <h3 className={clsCardTitle}>All sessions</h3>
                {all.length ? (
                  all.map((a) => (
                    <div className={clsRow} key={a.id}>
                      <div className={clsRowHeader}>
                        <b>{cn(a.cid)}</b>
                        {renderChip(a.status)}
                      </div>
                      <div className={clsMuted}>
                        {a.date} at {a.time} · {a.type}
                      </div>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {a.status === 'Requested' && (
                          <button
                            className={`${clsBtnPrimary} text-xs px-2.5 py-1.5`}
                            onClick={() => handleConfirmAp(a.id)}
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          className={`${clsBtnDanger} text-xs px-2.5 py-1.5`}
                          onClick={() => handleCancelAp(a.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  renderEmpty('No sessions yet.')
                )}
              </div>
            </div>
          </>
        );
      }

      case 'c-notes':
        return (
          <>
            {renderHeader('Session Notes', 'Fictional demo notes only.')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>New note</h3>
                <form onSubmit={handleAddNote}>
                  <label className={clsLabel}>Client</label>
                  <select name="cid" className={clsInput} required>
                    {renderClientOptions()}
                  </select>
                  <label className={clsLabel}>Title</label>
                  <input name="title" className={clsInput} required />
                  <label className={clsLabel}>Category</label>
                  <select name="tag" className={clsInput}>
                    <option>Session summary</option>
                    <option>Observation</option>
                    <option>Follow-up</option>
                  </select>
                  <label className={clsLabel}>Note</label>
                  <textarea name="body" className={clsTextarea} required />
                  <button className={`${clsBtnPrimary} mt-3.5`}>Save note</button>
                </form>
              </div>
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Saved notes</h3>
                {S.nt.length ? (
                  S.nt.map((n) => (
                    <div className={clsRow} key={n.id}>
                      <div className={clsRowHeader}>
                        <b>{n.title}</b>
                        {renderChip(n.tag)}
                      </div>
                      <div className={clsMuted}>
                        {cn(n.cid)} · {n.date}
                      </div>
                      <p className="my-2">{n.body}</p>
                      <button className={clsBtnDanger} onClick={() => handleDeleteItem('nt', n.id)}>
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  renderEmpty('No notes yet.')
                )}
              </div>
            </div>
          </>
        );

      case 'c-plans':
        return (
          <>
            {renderHeader('Care Plans', 'Supportive, non-clinical action steps.')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Add action step</h3>
                <form onSubmit={handleAddPlan}>
                  <label className={clsLabel}>Client</label>
                  <select name="cid" className={clsInput} required>
                    {renderClientOptions()}
                  </select>
                  <label className={clsLabel}>Goal</label>
                  <input name="title" className={clsInput} required maxLength={120} />
                  <label className={clsLabel}>Target date</label>
                  <input type="date" name="due" className={clsInput} />
                  <label className={clsLabel}>Details</label>
                  <textarea name="details" className={clsTextarea} />
                  <button className={`${clsBtnPrimary} mt-3.5`}>Add to workspace</button>
                </form>
              </div>
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Progress</h3>
                {S.pl.length ? (
                  S.pl.map((p) => (
                    <div className={clsRow} key={p.id}>
                      <div className={clsRowHeader}>
                        <b>{p.title}</b>
                        {p.done ? renderChip('Completed') : renderChip('In progress')}
                      </div>
                      <div className={`${clsMuted} mb-2`}>
                        {cn(p.cid)}
                        {p.due ? ` · ${p.due}` : ''}
                      </div>
                      <button className={clsBtnDanger} onClick={() => handleDeleteItem('pl', p.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  renderEmpty('No action steps yet.')
                )}
              </div>
            </div>
          </>
        );

      case 'c-notif':
        return (
          <>
            {renderHeader('Notifications', 'Requests and client activity.')}
            {renderNotifications('cons')}
          </>
        );

      case 'cl-home': {
        const c = myC();
        const as = S.ap.filter((a) => a.uid === U.id && a.date >= T()).sort(srt);
        const pl = S.pl.filter((p) => p.uid === U.id);
        const dn = pl.filter((p) => p.done).length;
        const td = S.md.find((m) => m.uid === U.id && m.date === T());

        return (
          <>
            {renderHeader(`Hello, ${U.name.split(' ')[0]}`, 'Your personal wellbeing space.')}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {renderStat('Request status', c?.status || 'Pending', 'Consultant decision', 'border-t-teal-700 dark:border-t-teal-400')}
              {renderStat('Next session', as[0] ? as[0].date.slice(5) : '—', as[0] ? as[0].time : 'None booked', 'border-t-[#e07a5f]')}
              {renderStat('Check-in streak', `${streak(U.id)} d`, 'Keep it going', 'border-t-[#e9b44c]')}
              {renderStat('Goals done', pl.length ? `${Math.round((dn / pl.length) * 100)}%` : '—', `${dn} of ${pl.length}`, 'border-t-[#6c8ebf]')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>How are you feeling today?</h3>
                {td && (
                  <p className="mb-3">
                    Today's check-in: <span className="text-[28px]">{E[td.v - 1]}</span> logged.
                  </p>
                )}
                <div className="flex gap-2">
                  {E.map((e, i) => (
                    <div key={i} className="flex-1">
                      <button
                        type="button"
                        className={`${clsBtnSecondary} w-full text-[26px] py-2.5`}
                        onClick={() => handleQuickMood(i + 1)}
                      >
                        {e}
                      </button>
                    </div>
                  ))}
                </div>
                <div className={`${clsMuted} mt-3`}>Add a note in the Mood Journal.</div>
              </div>

              <div className={clsCard}>
                <h3 className={clsCardTitle}>Your care journey</h3>
                <div className={clsRow}>{renderChip(c?.status || 'Pending')} Access request</div>
                <div className={clsRow}>{renderChip(as.length ? 'Booked' : 'Requested')} Session booking</div>
                <div className={clsRow}>{renderChip(pl.length ? 'Active' : 'Pending')} Goals shared by consultant</div>
              </div>
            </div>
          </>
        );
      }

      case 'cl-mood': {
        const m = moodsOf(U.id);
        const userAvg = avg(U.id);
        return (
          <>
            {renderHeader('Mood Journal', 'Track patterns over time. Your consultant can see your mood scores.')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Daily check-in</h3>
                <form onSubmit={handleMoodSubmit}>
                  <div className="flex gap-2">
                    {E.map((e, i) => (
                      <label key={i} className="m-0 flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="v"
                          value={i + 1}
                          defaultChecked={i === 2}
                          className="peer hidden"
                        />
                        <span className="block text-center text-[28px] py-2.5 border-2 border-[#dde7e3] dark:border-[#23403f] rounded-xl peer-checked:border-teal-700 dark:peer-checked:border-teal-400 peer-checked:bg-[#e3f1ee] dark:peer-checked:bg-[#173b3a]">
                          {e}
                        </span>
                      </label>
                    ))}
                  </div>
                  <label className={clsLabel}>Notes (optional)</label>
                  <textarea
                    name="note"
                    className={clsTextarea}
                    placeholder="What influenced your mood today?"
                  />
                  <button className={`${clsBtnPrimary} mt-3.5`}>Save check-in</button>
                </form>
              </div>
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Trend (last {Math.min(14, m.length)} check-ins)</h3>
                {renderChart(m.slice(-14).map((x) => x.v))}
                <div className={`${clsMuted} mt-2`}>
                  7-day average: {userAvg ? `${userAvg.toFixed(1)}/5` : '—'}
                </div>
              </div>
            </div>
            <div className={clsCard}>
              <h3 className={clsCardTitle}>History</h3>
              {m.length ? (
                [...m]
                  .reverse()
                  .slice(0, 10)
                  .map((x, idx) => (
                    <div className={clsRow} key={idx}>
                      <span className="text-[22px]">{E[x.v - 1]}</span> <b>{x.date}</b>{' '}
                      <span className={clsMuted}>{x.note}</span>
                    </div>
                  ))
              ) : (
                renderEmpty('No check-ins yet.')
              )}
            </div>
          </>
        );
      }

      case 'cl-book':
        return (
          <>
            {renderHeader('Book a Session', 'Request a time and complete the short pre-session form.')}
            <div className={`${clsCard} max-w-[640px]`}>
              <form onSubmit={handleBookSession}>
                <label className={clsLabel}>Date</label>
                <input type="date" name="date" min={T()} className={clsInput} required />
                <label className={clsLabel}>Time</label>
                <input type="time" name="time" className={clsInput} required />
                <label className={clsLabel}>Session type</label>
                <select name="type" className={clsInput}>
                  <option>Online Consultation</option>
                  <option>In-person Consultation</option>
                  <option>Follow-up Session</option>
                </select>
                <label className={clsLabel}>What would you like to discuss?</label>
                <textarea name="reason" className={clsTextarea} required />
                <label className={clsLabel}>Goals for the session (optional)</label>
                <textarea name="goals" className={clsTextarea} />
                <label className={clsLabel}>Preferred contact</label>
                <select name="contact" className={clsInput}>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Video call</option>
                </select>
                <button className={`${clsBtnPrimary} mt-3.5`}>Submit request</button>
              </form>
            </div>
          </>
        );

      case 'cl-sessions': {
        const as = S.ap.filter((a) => a.uid === U.id).sort(srt);
        return (
          <>
            {renderHeader('My Sessions', 'Upcoming and requested appointments.')}
            <div className={clsCard}>
              {as.length ? (
                as.map((a) => (
                  <div className={clsRow} key={a.id}>
                    <div className={clsRowHeader}>
                      <b>{a.date}</b>
                      {renderChip(a.status)}
                    </div>
                    <div className={clsMuted}>
                      {a.date} at {a.time} · {a.type}
                    </div>
                    {a.pre && <div className={clsMuted}>Topic: {a.pre.reason}</div>}
                    {a.status === 'Requested' && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        <button
                          className={`${clsBtnDanger} text-xs px-2.5 py-1.5`}
                          onClick={() => handleCancelAp(a.id)}
                        >
                          Cancel request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                renderEmpty('No sessions yet.')
              )}
            </div>
          </>
        );
      }

      case 'cl-goals': {
        const pl = S.pl.filter((p) => p.uid === U.id);
        const dn = pl.filter((p) => p.done).length;
        const pct = pl.length ? Math.round((dn / pl.length) * 100) : 0;
        return (
          <>
            {renderHeader('My Goals', 'Go at a comfortable pace.')}
            <div className={`${clsCard} mb-4`}>
              <div className={clsRowHeader}>
                <b>Overall progress</b>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-md overflow-hidden min-w-[90px] mt-2">
                <i className="block h-full bg-teal-700 dark:bg-teal-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className={clsCard}>
              {pl.length ? (
                pl.map((p) => (
                  <div className={clsRow} key={p.id}>
                    <div className={clsRowHeader}>
                      <b>{p.title}</b>
                      {p.done ? renderChip('Completed') : renderChip('In progress')}
                    </div>
                    {p.due && <div className={clsMuted}>Target: {p.due}</div>}
                    <p className="my-2">{p.details}</p>
                    <button
                      className={p.done ? clsBtnSecondary : clsBtnPrimary}
                      onClick={() => handleTogglePlan(p.id)}
                    >
                      {p.done ? 'Reopen' : 'Mark complete'}
                    </button>
                  </div>
                ))
              ) : (
                renderEmpty('No goals shared yet.')
              )}
            </div>
          </>
        );
      }

      case 'cl-files': {
        const c = myC();
        const ok = c?.status === 'Accepted';
        const fl = S.fl.filter((f) => f.uid === U.id);
        return (
          <>
            {renderHeader('Documents', 'Share file names with your consultant (demo: no data is uploaded).')}
            {ok ? (
              <div className={clsCard}>
                <form onSubmit={handleFileAdd} className="mb-3">
                  <input type="file" name="f" multiple className={clsInput} required />
                  <label className={clsLabel}>Description</label>
                  <input name="desc" className={clsInput} />
                  <button className={`${clsBtnPrimary} mt-3.5`}>Add files</button>
                </form>
                {fl.map((f) => (
                  <div className={`${clsRow} ${clsRowHeader}`} key={f.id}>
                    <span>
                      {f.name} <span className={clsMuted}>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                    </span>
                    <button className={clsBtnDanger} onClick={() => handleDeleteItem('fl', f.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879] p-3 rounded-[10px] text-[13px] my-3.5">
                Documents unlock after your request is accepted (currently {c?.status || 'Pending'}).
              </div>
            )}
          </>
        );
      }

      case 'cl-res':
        return (
          <>
            {renderHeader('Wellbeing Toolkit', 'Simple tools you can use any time.')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-5">
              <div className={`${clsCard} text-center`}>
                <h3 className={clsCardTitle}>Guided breathing</h3>
                <div className="w-[150px] h-[150px] rounded-full mx-auto my-5 bg-gradient-to-br from-[#e3f1ee] to-teal-700 dark:from-[#173b3a] dark:to-teal-400 grid place-items-center text-white dark:text-[#052321] font-bold animate-pulse">
                  Breathe
                </div>
                <div className={clsMuted}>
                  Slowly in as the circle grows, out as it shrinks. Repeat for 2 minutes.
                </div>
              </div>
              <div className={clsCard}>
                <h3 className={clsCardTitle}>Grounding: 5-4-3-2-1</h3>
                <p>
                  Notice <b>5</b> things you see, <b>4</b> you feel, <b>3</b> you hear, <b>2</b> you
                  smell and <b>1</b> you taste.
                </p>
                <h3 className={`${clsCardTitle} mt-5`}>Need urgent help?</h3>
                <div className="bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496] p-3 rounded-[10px] text-[13px] my-3.5">
                  If you may be in danger or thinking of harming yourself, contact your local
                  emergency number or a trusted person right now.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={clsCard}>
                <b>Sleep</b>
                <p className={`${clsMuted} mt-1`}>
                  Keep a steady wake time and dim screens an hour before bed.
                </p>
              </div>
              <div className={clsCard}>
                <b>Movement</b>
                <p className={`${clsMuted} mt-1`}>
                  A 10-minute walk can lift mood and ease tension.
                </p>
              </div>
              <div className={clsCard}>
                <b>Connection</b>
                <p className={`${clsMuted} mt-1`}>Message one person you trust today.</p>
              </div>
            </div>
          </>
        );

      case 'cl-notif':
        return (
          <>
            {renderHeader('Notifications', 'Updates on your request and sessions.')}
            {renderNotifications(U.id)}
          </>
        );

      default:
        return null;
    }
  };

  const navItems = U?.role === 'client' ? NC : NS;
  const currentPageTitle = navItems.find((n) => n[0] === page)?.[1] || '';
  const unreadCount = U
    ? S.nf.filter((n) => n.to === (U.role === 'client' ? U.id : 'cons') && !n.read).length
    : 0;

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f2f5f3] dark:bg-[#0d1b1a] text-[#14302c] dark:text-[#e3efec] font-sans text-[15px] leading-relaxed">
        {!U ? (
          <section id="auth" className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
            <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#0c3b37] to-teal-700 text-white p-14">
              <div className="font-serif text-[26px] font-bold">◐ MindCare Pro</div>
              <h1 className="font-serif text-[42px] leading-[1.1] my-[18px] font-bold">
                Calm, organised care for every client.
              </h1>
              <ul className="pl-5 list-disc space-y-3 opacity-90">
                <li>Secure-style client intake and approvals</li>
                <li>Scheduling, session notes and care plans</li>
                <li>Daily mood check-ins with progress insights</li>
                <li>Guided breathing and support resources</li>
              </ul>
              <svg
                viewBox="0 0 400 260"
                role="img"
                aria-label="A person meditating on a hill at sunrise"
                className="w-full max-w-[460px] mt-5 rounded-[22px] shadow-2xl"
              >
                <defs>
                  <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6d6a8" />
                    <stop offset="1" stopColor="#7fd1c4" />
                  </linearGradient>
                </defs>
                <rect width="400" height="260" fill="url(#sk)" />
                <circle cx="285" cy="108" r="66" fill="#fff6e0" opacity=".25" />
                <circle cx="285" cy="108" r="44" fill="#fff6e0" opacity=".9" />
                <path
                  d="M60 60q8-8 16 0M100 40q7-7 14 0M330 50q7-7 14 0"
                  stroke="#0c3b37"
                  strokeWidth="2"
                  fill="none"
                  opacity=".5"
                  strokeLinecap="round"
                />
                <path d="M0 170Q80 120 160 160T320 150T400 165V260H0Z" fill="#3aa89b" />
                <path d="M0 200Q100 160 200 195T400 185V260H0Z" fill="#0f766e" />
                <path d="M0 232Q120 205 220 228T400 220V260H0Z" fill="#0c3b37" />
                <g fill="#fff6e0">
                  <circle cx="130" cy="164" r="9" />
                  <path d="M116 201Q130 170 144 201Z" />
                  <ellipse cx="130" cy="203" rx="25" ry="7" />
                </g>
                <g fill="#7fd1c4" opacity=".9">
                  <ellipse cx="330" cy="222" rx="5" ry="16" transform="rotate(-25 330 222)" />
                  <ellipse cx="342" cy="220" rx="5" ry="18" />
                  <ellipse cx="354" cy="223" rx="5" ry="15" transform="rotate(25 354 223)" />
                </g>
              </svg>
            </div>

            <div className="grid place-items-center p-6">
              <div className="w-full max-w-[420px]">
                <div className="font-serif text-[26px] font-bold text-teal-700 dark:text-teal-400">
                  MindCare Pro
                </div>
                <h2 className="font-serif text-2xl font-bold mt-2 mb-0.5">
                  {isSignup ? 'Create client account' : 'Welcome back'}
                </h2>
                <div className={clsMuted}>
                  {isSignup ? 'Request access to your consultant.' : 'Sign in to continue.'}
                </div>

                <div className="flex gap-1.5 bg-[#e3f1ee] dark:bg-[#173b3a] p-1.5 rounded-xl my-4">
                  <button
                    type="button"
                    className={`flex-1 rounded-[10px] py-2 px-3.5 transition ${
                      role === 'consultant'
                        ? 'bg-white dark:bg-[#14292a] shadow-sm font-bold'
                        : 'bg-transparent'
                    }`}
                    onClick={() => setRole('consultant')}
                  >
                    Consultant
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-[10px] py-2 px-3.5 transition ${
                      role === 'client'
                        ? 'bg-white dark:bg-[#14292a] shadow-sm font-bold'
                        : 'bg-transparent'
                    }`}
                    onClick={() => setRole('client')}
                  >
                    Client
                  </button>
                </div>

                {!isSignup ? (
                  <form onSubmit={handleLogin}>
                    <label className={clsLabel}>Email</label>
                    <input name="email" type="email" className={clsInput} required />
                    <label className={clsLabel}>Password</label>
                    <input name="pw" type="password" className={clsInput} required />
                    <button className={`${clsBtnPrimary} w-full mt-4`}>Sign in</button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup}>
                    <label className={clsLabel}>Full name</label>
                    <input name="name" className={clsInput} required />
                    <label className={clsLabel}>Email</label>
                    <input name="email" type="email" className={clsInput} required />
                    <label className={clsLabel}>Password (min 8)</label>
                    <input name="pw" type="password" minLength={8} className={clsInput} required />
                    <label className={clsLabel}>What would you like help with? (optional)</label>
                    <textarea name="reason" className={clsTextarea} />
                    <button className={`${clsBtnPrimary} w-full mt-4`}>Create account</button>
                  </form>
                )}

                <p className={`${clsMuted} text-center my-3`}>
                  {role === 'client' &&
                    (isSignup ? (
                      <>
                        Have an account?{' '}
                        <button
                          type="button"
                          className="bg-transparent text-teal-700 dark:text-teal-400 p-0 font-bold"
                          onClick={() => setIsSignup(false)}
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        New client?{' '}
                        <button
                          type="button"
                          className="bg-transparent text-teal-700 dark:text-teal-400 p-0 font-bold"
                          onClick={() => setIsSignup(true)}
                        >
                          Sign up
                        </button>
                      </>
                    ))}
                </p>

                <div className="bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879] p-3 rounded-[10px] text-[13px] my-3.5">
                  <b>Demo consultant:</b> demo@mindcare.com / MindCare123
                  <br />
                  <b>Demo client:</b> client@mindcare.com / Client123
                  <br />
                  Prototype only: data stays in this browser. Do not enter real health information.
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section id="app" className="flex min-h-screen">
            <aside
              className={`w-[250px] bg-[#0c3b37] dark:bg-[#081f1e] text-[#cfe5e1] px-3.5 py-[22px] fixed lg:sticky top-0 h-screen flex flex-col shrink-0 z-20 transition-all duration-200 ${
                sideOpen ? 'left-0' : '-left-[260px] lg:left-0'
              }`}
            >
              <div className="font-serif text-[26px] font-bold text-white px-2.5 pb-[18px]">
                ◐ MindCare Pro
              </div>
              <nav className="flex-1 overflow-auto space-y-0.5">
                {navItems.map(([k, l, i]) => (
                  <button
                    key={k}
                    className={`flex gap-2.5 items-center w-full text-left rounded-[10px] px-[15px] py-[9px] transition ${
                      k === page
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#b7d3ce] hover:bg-white/10'
                    }`}
                    onClick={() => go(k)}
                  >
                    <i className="not-italic w-5 text-center">{i}</i>
                    {l}
                  </button>
                ))}
              </nav>
              <button
                className="flex gap-2.5 items-center w-full text-left rounded-[10px] px-[15px] py-[9px] text-[#b7d3ce] hover:bg-white/10"
                onClick={exportData}
              >
                <i className="not-italic w-5 text-center">⇩</i>Export data
              </button>
              <button
                className="flex gap-2.5 items-center w-full text-left rounded-[10px] px-[15px] py-[9px] text-[#b7d3ce] hover:bg-white/10"
                onClick={logout}
              >
                <i className="not-italic w-5 text-center">⇥</i>Sign out
              </button>
            </aside>

            <main className="flex-1 min-w-0">
              <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 lg:px-7 lg:py-3.5 bg-white dark:bg-[#14292a] border-b border-[#dde7e3] dark:border-[#23403f]">
                <button
                  className="lg:hidden bg-[#e3f1ee] dark:bg-[#173b3a] w-[38px] h-[38px] p-0 rounded-full grid place-items-center"
                  onClick={() => setSideOpen((o) => !o)}
                  aria-label="Menu"
                >
                  ☰
                </button>
                <h2 className="font-serif m-0 text-xl font-bold flex-1">{currentPageTitle}</h2>
                <button
                  className="bg-[#e3f1ee] dark:bg-[#173b3a] w-[38px] h-[38px] p-0 rounded-full grid place-items-center"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  ◑
                </button>
                <button
                  className="bg-[#e3f1ee] dark:bg-[#173b3a] w-[38px] h-[38px] p-0 rounded-full relative grid place-items-center"
                  onClick={() => go(U.role === 'client' ? 'cl-notif' : 'c-notif')}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#e07a5f] text-white text-[10px] min-w-[17px] h-[17px] rounded-full grid place-items-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="w-[38px] h-[38px] rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] grid place-items-center font-bold">
                  {U.name.replace('Dr. ', '')[0]}
                </div>
                <div className="leading-tight">
                  <b>{U.name}</b>
                  <div className={clsMuted}>{U.role === 'client' ? 'Client' : 'Consultant'}</div>
                </div>
              </header>

              <div className="p-4 lg:p-7 max-w-[1300px] mx-auto">
                <div>{renderPageContent()}</div>
                <p className={`${clsMuted} text-center mt-8`}>
                  MindCare Pro demo · Not for real clinical records · If you are in danger, contact
                  local emergency services.
                </p>
              </div>
            </main>
          </section>
        )}

        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#14302c] dark:bg-[#e3efec] text-[#f2f5f3] dark:text-[#0d1b1a] px-5 py-2.5 rounded-xl transition-all duration-200 z-30 pointer-events-none ${
            toastOn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
          }`}
        >
          {toastMsg}
        </div>
      </div>
    </div>
  );
}
