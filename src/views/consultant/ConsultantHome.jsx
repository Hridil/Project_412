import React from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsRow,
  clsRowHeader,
  E
} from '../../data/constants.js';
import StatCard from '../../components/common/StatCard.jsx';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function ConsultantHome({
  U,
  S,
  T,
  acc,
  avg,
  cn,
  srt,
  setSelectedClientId,
  setClientModalTab,
  handleDecision,
  editingImageMeta,
  setEditingImageMeta,
  imageMetaForm,
  setImageMetaForm,
  handleSaveImageMeta,
  handleDashboardImageUpload,
  handleSetPrimaryDashboardImage,
  handleDeleteDashboardImage,
  setPreviewFile,
  go,
  showToast
}) {
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
        <StatCard label="Total clients" value={S.cl.length} sub="All intake records" borderColorClass="bg-teal-700 dark:bg-teal-400" iconName="group" />
        <StatCard label="Active clients" value={activeClients.length} sub="In active care plan" borderColorClass="bg-[#e07a5f]" iconName="how_to_reg" />
        <StatCard label="Pending triage" value={pn.length} sub="Requires practitioner decision" borderColorClass="bg-[#e9b44c]" iconName="hourglass_top" />
        <StatCard label="Upcoming sessions" value={up.length} sub="Confirmed bookings" borderColorClass="bg-[#6c8ebf]" iconName="event_available" />
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
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
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
                      className="p-1 rounded-lg text-[#5f7571] hover:text-teal-700 dark:hover:text-teal-400 transition cursor-pointer"
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
                      className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                      onClick={() => setEditingImageMeta(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
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
                  className="text-[#b3392a] dark:text-[#f4a496] hover:underline flex items-center gap-1 font-medium cursor-pointer"
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
            <EmptyState msg="No active clients enrolled." />
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
                      className={`${clsBtnSecondary} text-xs py-1.5 px-3 cursor-pointer`}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setClientModalTab('overview');
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Review
                    </button>
                    <button className={`${clsBtnPrimary} text-xs py-1.5 px-3 cursor-pointer`} onClick={() => handleDecision(c.id, 'Accepted')}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      Accept
                    </button>
                    <button className={`${clsBtnDanger} text-xs py-1.5 px-3 cursor-pointer`} onClick={() => handleDecision(c.id, 'Rejected')}>
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState msg="Intake queue is clear. No pending reviews." />
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
                  <Chip status={a.status} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState msg="No sessions scheduled for the coming days." />
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
          <button className={`${clsBtnSecondary} text-xs cursor-pointer`} onClick={() => go('c-docs')}>
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
                      className={`${clsBtnSecondary} text-[11px] py-1 px-2 cursor-pointer`}
                      onClick={() => setPreviewFile(f)}
                      title="Preview file"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      View
                    </button>
                    <button
                      className={`${clsBtnSecondary} text-[11px] py-1 px-2 cursor-pointer`}
                      onClick={() => handleDownloadFile(f, showToast)}
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
          <EmptyState msg="No client-uploaded documents or media submitted yet." />
        )}
      </div>
    </div>
  );
}
