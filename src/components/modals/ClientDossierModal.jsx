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
  MOODS,
  E
} from '../../data/constants.js';
import Chip from '../common/Chip.jsx';
import EmptyState from '../common/EmptyState.jsx';
import MoodChart from '../common/MoodChart.jsx';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function ClientDossierModal({
  selectedClient,
  setSelectedClientId,
  clientModalTab,
  setClientModalTab,
  S,
  moodsOf,
  avg,
  streak,
  srt,
  T,
  handleDecision,
  handleConsultantUpload,
  setPreviewFile,
  handleDeleteItem,
  handleConfirmAp,
  handleCancelAp,
  handleAddPlan,
  handleTogglePlan,
  handleAddNote
}) {
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
                  <Chip status={selectedClient.status} />
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
                className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] text-[#14302c] dark:text-[#e3efec] flex items-center justify-center hover:opacity-80 transition cursor-pointer"
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
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                clientModalTab === tabKey
                  ? 'border-teal-700 dark:border-teal-400 text-teal-800 dark:text-teal-300'
                  : 'border-transparent text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
              }`}
              onClick={() => setClientModalTab(tabKey)}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              <span>{label}</span>
              {badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    clientModalTab === tabKey
                      ? 'bg-teal-700/15 dark:bg-teal-400/20 text-teal-800 dark:text-teal-200'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
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
                    {clientAvg ? (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400">
                          {E[Math.round(clientAvg) - 1]}
                        </span>
                        {clientAvg.toFixed(1)}
                      </span>
                    ) : '—'}
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
                  <MoodChart values={clientMoods.slice(-14).map((x) => x.v)} />
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
                          <span className="material-symbols-outlined text-xl text-teal-700 dark:text-teal-400">{E[m.v - 1]}</span>
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
              <div>
                <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                  Client Vault Files ({clientFiles.length})
                </h4>
                <p className={clsMuted}>Confidential records, intake questionnaires, and worksheets exchanged with this client.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Share Document with {selectedClient.name}
                </h5>
                <form
                  onSubmit={(e) => handleConsultantUpload(e, selectedClient.uid)}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <input type="file" name="f" multiple className={`${clsInput} py-1.5 flex-1`} required />
                  <button className={`${clsBtnPrimary} whitespace-nowrap`}>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Upload for Client
                  </button>
                </form>
              </div>

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
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                  f.uploadedBy === 'consultant'
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
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
                  <EmptyState msg="No documents uploaded for this client yet." />
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {clientModalTab === 'sessions' && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                Consultation History ({clientSessions.length})
              </h4>
              <div className={clsCard}>
                {clientSessions.length ? (
                  clientSessions.map((a) => (
                    <div className={clsRow} key={a.id}>
                      <div className={clsRowHeader}>
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="text-sm">{a.date} at {a.time}</b>
                            <Chip status={a.status} />
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
                  <EmptyState msg="No appointments scheduled with this client." />
                )}
              </div>
            </div>
          )}

          {/* CARE PLAN TAB */}
          {clientModalTab === 'plans' && (
            <div className="space-y-5">
              <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                Care Plan Action Steps ({clientPlans.length})
              </h4>

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
                        <Chip status={p.done ? 'Completed' : 'In progress'} />
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
                  <EmptyState msg="No care plan goals configured for this client." />
                )}
              </div>
            </div>
          )}

          {/* CLINICAL NOTES TAB */}
          {clientModalTab === 'notes' && (
            <div className="space-y-5">
              <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec]">
                Clinical Documentation Notes ({clientNotes.length})
              </h4>

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
                        <Chip status={n.tag} />
                      </div>
                      <p className="text-sm my-2 text-[#14302c] dark:text-[#e3efec] whitespace-pre-wrap">{n.body}</p>
                      <button className={`${clsBtnDanger} text-xs py-1 px-2.5 mt-1`} onClick={() => handleDeleteItem('nt', n.id)}>
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Delete Note
                      </button>
                    </div>
                  ))
                ) : (
                  <EmptyState msg="No clinical notes recorded for this client yet." />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
