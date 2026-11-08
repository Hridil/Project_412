import React from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  MOODS,
  E
} from '../../data/constants.js';
import StatCard from '../../components/common/StatCard.jsx';
import Chip from '../../components/common/Chip.jsx';

export default function ClientHome({
  U,
  S,
  T,
  myC,
  streak,
  srt,
  editingImageMeta,
  setEditingImageMeta,
  imageMetaForm,
  setImageMetaForm,
  handleSaveImageMeta,
  handleDashboardImageUpload,
  handleSetPrimaryDashboardImage,
  handleDeleteDashboardImage,
  setPreviewFile,
  handleQuickMood,
  go
}) {
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
        <StatCard label="Intake Status" value={c?.status || 'Pending'} sub="Practitioner alignment" borderColorClass="bg-teal-700 dark:bg-teal-400" iconName="verified" />
        <StatCard label="Next Session" value={as[0] ? as[0].date.slice(5) : 'None booked'} sub={as[0] ? `${as[0].time} (${as[0].type.slice(0, 15)}...)` : 'Request anytime'} borderColorClass="bg-[#e07a5f]" iconName="calendar_month" />
        <StatCard label="Check-in Streak" value={`${streak(U.id)} Days`} sub="Consistent mindful practice" borderColorClass="bg-[#e9b44c]" iconName="local_fire_department" />
        <StatCard label="Care Goals" value={pl.length ? `${Math.round((dn / pl.length) * 100)}%` : '0%'} sub={`${dn} of ${pl.length} steps completed`} borderColorClass="bg-[#6c8ebf]" iconName="task_alt" />
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
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
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
                      className="p-1 rounded-lg text-[#5f7571] hover:text-teal-700 dark:hover:text-teal-400 transition cursor-pointer"
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
                      className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                      onClick={() => setEditingImageMeta(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
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

      {/* Interactive Mood Card & Care Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={clsCard}>
          <h3 className={clsCardTitle}>How are you feeling today?</h3>
          {td ? (
            <div className="mb-4 p-3 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-teal-700 dark:text-teal-400">{E[td.v - 1]}</span>
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
                <span className="material-symbols-outlined text-2xl mb-1 group-hover:scale-110 transition-transform text-teal-800 dark:text-teal-200">{m.icon}</span>
                <span className="text-[11px] font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className={`${clsBtnSecondary} text-xs cursor-pointer`} onClick={() => go('cl-mood')}>
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
              <Chip status={c?.status || 'Pending'} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#e07a5f] text-[20px]">calendar_month</span>
                <span className="text-sm font-semibold">2. Consultations & Telehealth</span>
              </div>
              <Chip status={as.length ? 'Booked' : 'Open'} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#6c8ebf] text-[20px]">fact_check</span>
                <span className="text-sm font-semibold">3. Holistic Care Plan</span>
              </div>
              <Chip status={pl.length ? 'Active' : 'Awaiting Steps'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
