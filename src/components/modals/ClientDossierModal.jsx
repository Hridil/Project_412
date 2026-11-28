import React, { useState } from 'react';
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
  handleAddNote,
  handleToggleFeedbackRead,
  handleDeleteFeedback,
  U,
  isClientAssignedToConsultant,
  handleAssignClient,
  handleStorePreconsultationAsFile,
  handleStorePreconsultationAsNote,
  handleStoreFeedbackAsFile,
  handleStoreFeedbackAsNote,
  handleDownloadFeedback,
  showToast
}) {
  const [dossierFileSearch, setDossierFileSearch] = useState('');
  const [storedVaultForms, setStoredVaultForms] = useState(new Set());
  const [storedNoteForms, setStoredNoteForms] = useState(new Set());
  const [storedVaultFeedback, setStoredVaultFeedback] = useState(new Set());
  const [storedNoteFeedback, setStoredNoteFeedback] = useState(new Set());

  if (!selectedClient) return null;

  const isAssignedToMe = isClientAssignedToConsultant ? isClientAssignedToConsultant(selectedClient, U) : true;
  const clientMoods = moodsOf(selectedClient.uid);
  const clientAvg = avg(selectedClient.uid);
  const clientStreak = streak(selectedClient.uid);
  const clientFiles = (S.fl || []).filter(
    (f) =>
      f.uid === selectedClient.uid ||
      f.cid === selectedClient.id ||
      f.client_id === selectedClient.id ||
      (selectedClient.person_id && f.person_id === selectedClient.person_id)
  );
  const displayedClientFiles = clientFiles.filter(
    (f) => !dossierFileSearch.trim() || f.name.toLowerCase().includes(dossierFileSearch.trim().toLowerCase())
  );
  const clientSessions = S.ap.filter((a) => a.cid === selectedClient.id || a.uid === selectedClient.uid).sort(srt);
  const clientPreForms = clientSessions
    .filter((a) => a.pre && (a.pre.reason || a.pre.goals || a.pre.concern_category || a.pre.distress_level))
    .map((a) => ({
      ...a.pre,
      appointmentId: a.id,
      date: a.date,
      time: a.time,
      status: a.status,
      appointment_mode: a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE'),
      type: a.type
    }));
  const clientPlans = S.pl.filter(
    (p) =>
      p.cid === selectedClient.id ||
      String(p.cid) === String(selectedClient.id) ||
      p.client_id === selectedClient.id ||
      String(p.client_id) === String(selectedClient.id) ||
      p.uid === selectedClient.uid ||
      (selectedClient.person_id && (p.person_id === selectedClient.person_id || p.uid === 'u' + selectedClient.person_id)) ||
      (selectedClient.email && p.client_email && selectedClient.email.toLowerCase() === p.client_email.toLowerCase())
  );
  const clientNotes = S.nt.filter((n) => n.cid === selectedClient.id);
  const clientFeedbacks = (S.fb || []).filter((f) => f.clientId === selectedClient.uid);
  const completedPlans = clientPlans.filter((p) => p.done).length;

  const clientAvatar =
    selectedClient.avatar ||
    selectedClient.avatar_url ||
    S.avatars?.[selectedClient.uid] ||
    S.avatars?.[selectedClient.id] ||
    (selectedClient.person_id && S.avatars?.['u' + selectedClient.person_id]) ||
    null;

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
              <div className="w-12 h-12 rounded-2xl bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-xl shadow-xs overflow-hidden shrink-0">
                {clientAvatar ? (
                  <img
                    src={clientAvatar}
                    alt={selectedClient.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
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

        {/* Caseload Boundary Banner */}
        {!isAssignedToMe && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>
                <b>Caseload Notice:</b> This client is not currently assigned to you. Private clinical notes and confidential documents are restricted.
              </span>
            </div>
            <button
              className={`${clsBtnPrimary} text-xs py-1 px-3 cursor-pointer shrink-0`}
              onClick={() => handleAssignClient && handleAssignClient(selectedClient.id)}
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              Assign to My Caseload
            </button>
          </div>
        )}

        {/* Modal Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 border-b border-[#dde7e3] dark:border-[#23403f] bg-[#f2f5f3]/40 dark:bg-[#0d1b1a]/40 overflow-x-auto gap-1">
          {[
            ['overview', 'Overview & Mood', 'person', null],
            ['files', 'Documents & Files', 'folder_shared', clientFiles.length],
            ['sessions', 'Appointments', 'calendar_month', clientSessions.length],
            ['intake', 'Pre-Consult Intake', 'assignment', clientPreForms.length],
            ['plans', 'Care Plans', 'fact_check', clientPlans.length],
            ['notes', 'Clinical Notes', 'edit_note', clientNotes.length],
            ['feedback', 'Feedback', 'rate_review', clientFeedbacks.length]
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

              {!isAssignedToMe ? (
                <div className="p-8 text-center bg-[#f2f5f3] dark:bg-[#0d1b1a] rounded-2xl border border-amber-300 dark:border-amber-900/50">
                  <span className="material-symbols-outlined text-4xl text-amber-600 mb-2">lock</span>
                  <h4 className="font-serif font-bold text-base text-[#14302c] dark:text-[#e3efec] mb-1">
                    Confidential Vault Restricted
                  </h4>
                  <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] max-w-sm mx-auto mb-4">
                    This client is assigned to another practitioner. You can only view and manage documents for clients selected in your caseload.
                  </p>
                  <button
                    className={`${clsBtnPrimary} text-xs py-1.5 px-3 cursor-pointer`}
                    onClick={() => handleAssignClient && handleAssignClient(selectedClient.id)}
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Assign Client to My Caseload
                  </button>
                </div>
              ) : (
                <>
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
                    {clientFiles.length > 2 && (
                      <div className="mb-3 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5f7571] dark:text-[#8fa8a3]">
                          search
                        </span>
                        <input
                          className={`${clsInput} py-1.5 pl-9 text-xs`}
                          placeholder="Search this client's documents by name..."
                          value={dossierFileSearch}
                          onChange={(e) => setDossierFileSearch(e.target.value)}
                        />
                      </div>
                    )}
                    {displayedClientFiles.length ? (
                      <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                        {displayedClientFiles.map((f) => (
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
                                onClick={() => handleDownloadFile(f, () => {}, U)}
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
                </>
              )}
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
                          {a.pre && (
                            <button
                              className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                              onClick={() => setClientModalTab('intake')}
                              title="View & Store Pre-Consultation Intake Form"
                            >
                              <span className="material-symbols-outlined text-[15px]">assignment</span>
                              Intake Form
                            </button>
                          )}
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

          {/* PRE-CONSULTATION INTAKE FORMS TAB */}
          {clientModalTab === 'intake' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                    Pre-Consultation Intake Assessments ({clientPreForms.length})
                  </h4>
                  <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-0.5">
                    Forms submitted by {selectedClient.name} prior to session booking. Store assessments into your vault or private notes.
                  </p>
                </div>
              </div>

              {clientPreForms.length > 0 ? (
                <div className="space-y-4">
                  {clientPreForms.map((form, idx) => {
                    const isVaultStored = storedVaultForms.has(form.appointmentId || idx);
                    const isNoteStored = storedNoteForms.has(form.appointmentId || idx);
                    const distress = form.distress_level || 5;

                    return (
                      <div key={idx} className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] shadow-xs space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-sm text-[#14302c] dark:text-[#e3efec]">
                              Intake for Session: {form.date || 'Scheduled'} at {form.time || '10:00'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#eaf2ef] dark:bg-[#173b3a] text-[#14302c] dark:text-[#e3efec] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">
                                {form.appointment_mode === 'ONLINE' ? 'videocam' : 'location_on'}
                              </span>
                              {form.appointment_mode === 'ONLINE' ? 'Online Telehealth' : 'In-Person Sanctuary'}
                            </span>
                            {form.status && <Chip status={form.status} />}
                          </div>

                          {/* Storage Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (handleStorePreconsultationAsFile) {
                                  handleStorePreconsultationAsFile(form, selectedClient);
                                  setStoredVaultForms((prev) => new Set(prev).add(form.appointmentId || idx));
                                }
                              }}
                              className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                isVaultStored
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] shadow-2xs'
                              }`}
                              title="Store intake assessment as a verified document in client's file vault"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isVaultStored ? 'check_circle' : 'drive_folder_upload'}
                              </span>
                              {isVaultStored ? 'Stored in Vault' : 'Store in Vault'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (handleStorePreconsultationAsNote) {
                                  handleStorePreconsultationAsNote(form, selectedClient);
                                  setStoredNoteForms((prev) => new Set(prev).add(form.appointmentId || idx));
                                }
                              }}
                              className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                isNoteStored
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-[#e3f1ee] hover:bg-[#d5ede8] dark:bg-[#173b3a] dark:hover:bg-[#1f4e4d] text-teal-800 dark:text-teal-200 shadow-2xs'
                              }`}
                              title="Archive intake assessment into private clinician clinical notes"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isNoteStored ? 'check_circle' : 'note_add'}
                              </span>
                              {isNoteStored ? 'Archived in Notes' : 'Archive to Notes'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleDownloadFile(
                                  {
                                    name: `Intake_Assessment_${selectedClient.name}_${form.date || 'Record'}.txt`,
                                    date: form.date,
                                    size: 1024,
                                    uploadedBy: 'consultant'
                                  },
                                  showToast || (() => {}),
                                  U
                                );
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f2f5f3] hover:bg-[#e0e7e4] dark:bg-[#1c3839] dark:hover:bg-[#254b4d] text-[#14302c] dark:text-[#e3efec] transition cursor-pointer"
                              title="Download intake document"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                            </button>
                          </div>
                        </div>

                        {/* Intake Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                          {/* Left Column: Concern & Distress */}
                          <div className="space-y-3 p-3.5 rounded-xl bg-[#f9fbfa] dark:bg-[#0f2021] border border-[#dde7e3] dark:border-[#23403f]">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] block mb-1">
                                Category of Concern
                              </span>
                              <span className="font-semibold text-[#14302c] dark:text-[#e3efec] text-sm">
                                {form.concern_category || 'General Mental Wellbeing'}
                              </span>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">
                                  Subjective Distress Severity
                                </span>
                                <span className="font-bold text-xs text-teal-800 dark:text-teal-300">
                                  {distress} / 10 · {distress >= 7 ? 'Acute' : distress >= 4 ? 'Moderate' : 'Mild'}
                                </span>
                              </div>
                              <div className="w-full bg-[#dde7e3] dark:bg-[#23403f] h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    distress >= 7
                                      ? 'bg-rose-500'
                                      : distress >= 4
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${distress * 10}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#dde7e3] dark:border-[#23403f]">
                              <div>
                                <span className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] block">Duration:</span>
                                <b className="text-[#14302c] dark:text-[#e3efec]">{form.duration || '1 to 6 months'}</b>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] block">Prior Therapy:</span>
                                <b className="text-[#14302c] dark:text-[#e3efec]">{form.prior_therapy || 'No'}</b>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Medications, Goals & Safety */}
                          <div className="space-y-3 p-3.5 rounded-xl bg-[#f9fbfa] dark:bg-[#0f2021] border border-[#dde7e3] dark:border-[#23403f]">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] block mb-0.5">
                                Primary Focus / Chief Complaint
                              </span>
                              <p className="text-[#14302c] dark:text-[#e3efec] font-medium m-0">
                                "{form.reason || 'Consultation Intake'}"
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] block mb-0.5">
                                Desired Breakthrough / Session Goals
                              </span>
                              <p className="text-[#5f7571] dark:text-[#8fa8a3] italic m-0">
                                "{form.goals || 'Support, regulation, and guidance'}"
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between flex-wrap gap-2 text-[11px]">
                              <div>
                                <span className="text-[#5f7571] dark:text-[#8fa8a3]">Medications: </span>
                                <b className="text-[#14302c] dark:text-[#e3efec]">{form.medications || 'None'}</b>
                              </div>
                              <div>
                                <span className="text-[#5f7571] dark:text-[#8fa8a3]">Emergency Contact: </span>
                                <b className="text-[#14302c] dark:text-[#e3efec]">{form.emergency_contact || 'None listed'}</b>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Safety Screen Banner */}
                        <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-teal-700 dark:text-teal-300">
                            verified
                          </span>
                          <span>
                            <b>Clinical Safety Screening Verified:</b> Client acknowledged no acute life-threatening emergency at intake submission.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState msg="No pre-consultation intake forms submitted for this client yet." />
              )}
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

              {!isAssignedToMe ? (
                <div className="p-8 text-center bg-[#f2f5f3] dark:bg-[#0d1b1a] rounded-2xl border border-amber-300 dark:border-amber-900/50">
                  <span className="material-symbols-outlined text-4xl text-amber-600 mb-2">lock</span>
                  <h4 className="font-serif font-bold text-base text-[#14302c] dark:text-[#e3efec] mb-1">
                    Clinical Notes Restricted
                  </h4>
                  <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] max-w-sm mx-auto mb-4">
                    Confidential therapeutic observations and private clinical notes are restricted to the assigned clinician.
                  </p>
                  <button
                    className={`${clsBtnPrimary} text-xs py-1.5 px-3 cursor-pointer`}
                    onClick={() => handleAssignClient && handleAssignClient(selectedClient.id)}
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Assign Client to My Caseload
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

          {/* CLIENT FEEDBACK TAB */}
          {clientModalTab === 'feedback' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                  Client Care Feedback ({clientFeedbacks.length})
                </h4>
                {clientFeedbacks.length > 0 && (
                  <div className="text-xs px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-amber-500 fill-amber-500">star</span>
                    <span>
                      Avg {(clientFeedbacks.reduce((s, f) => s + (f.rating || 5), 0) / clientFeedbacks.length).toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {clientFeedbacks.length ? (
                <div className="space-y-3">
                  {clientFeedbacks.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        !f.read
                          ? 'border-teal-600 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                          : 'border-[#dde7e3] dark:border-[#23403f] bg-white dark:bg-[#14292a]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-300">
                              {f.category}
                            </span>
                            {f.isAnonymous && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">visibility_off</span>
                                Anonymous
                              </span>
                            )}
                            {!f.read && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] font-bold">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                            Submitted on {f.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`material-symbols-outlined text-base ${
                                s <= (f.rating || 5)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              style={{ fontVariationSettings: s <= (f.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                          <span className="text-xs font-bold text-[#14302c] dark:text-[#e3efec] ml-1">
                            {f.rating || 5}/5
                          </span>
                        </div>
                      </div>

                      <div className="my-3 text-xs sm:text-sm text-[#14302c] dark:text-[#e3efec] italic bg-[#f8faf9] dark:bg-[#0f1f1e] p-3 rounded-lg border border-[#dde7e3]/60 dark:border-[#23403f]/60">
                        "{f.message}"
                      </div>

                      {f.reply && (
                        <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 mb-2">
                          <div className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-1 mb-0.5">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Clinician Response
                          </div>
                          <p className="text-xs text-[#14302c] dark:text-[#cfe5e1]">
                            {f.reply}
                          </p>
                        </div>
                      )}

                      {/* Feedback Storage Actions for Consultant */}
                      <div className="flex items-center justify-between gap-2 p-2 mt-2 bg-[#f4f8f6] dark:bg-[#0f1f1e] rounded-lg border border-[#dde7e3] dark:border-[#23403f] flex-wrap">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5f7571] dark:text-[#8fa8a3]">
                          <span className="material-symbols-outlined text-[14px] text-teal-600 dark:text-teal-400">archive</span>
                          <span>Store Feedback:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {handleStoreFeedbackAsFile && (
                            <button
                              type="button"
                              onClick={() => {
                                handleStoreFeedbackAsFile(f, selectedClient);
                                setStoredVaultFeedback((prev) => new Set(prev).add(f.id));
                              }}
                              className={`text-[11px] py-1 px-2 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                                storedVaultFeedback.has(f.id)
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-white dark:bg-[#1a3334] text-[#14302c] dark:text-[#e3efec] border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-500'
                              }`}
                              title="Store feedback details into client vault"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {storedVaultFeedback.has(f.id) ? 'check_circle' : 'drive_folder_upload'}
                              </span>
                              <span>{storedVaultFeedback.has(f.id) ? 'Stored in Vault' : 'Store in Vault'}</span>
                            </button>
                          )}

                          {handleStoreFeedbackAsNote && (
                            <button
                              type="button"
                              onClick={() => {
                                handleStoreFeedbackAsNote(f, selectedClient);
                                setStoredNoteFeedback((prev) => new Set(prev).add(f.id));
                              }}
                              className={`text-[11px] py-1 px-2 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                                storedNoteFeedback.has(f.id)
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-white dark:bg-[#1a3334] text-[#14302c] dark:text-[#e3efec] border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-500'
                              }`}
                              title="Archive feedback details into private notes"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {storedNoteFeedback.has(f.id) ? 'check_circle' : 'note_add'}
                              </span>
                              <span>{storedNoteFeedback.has(f.id) ? 'Archived in Notes' : 'Archive to Notes'}</span>
                            </button>
                          )}

                          {handleDownloadFeedback && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFeedback(f, selectedClient)}
                              className="text-[11px] py-1 px-2 rounded-md bg-white dark:bg-[#1a3334] text-[#14302c] dark:text-[#e3efec] border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-500 flex items-center gap-1 cursor-pointer"
                              title="Download feedback details report (.txt)"
                            >
                              <span className="material-symbols-outlined text-[13px]">download</span>
                              <span>Download</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#dde7e3]/60 dark:border-[#23403f]/60 flex-wrap">
                        {handleToggleFeedbackRead && (
                          <button
                            type="button"
                            onClick={() => handleToggleFeedbackRead(f.id)}
                            className="text-xs text-teal-700 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {f.read ? 'mark_chat_unread' : 'check_circle'}
                            </span>
                            <span>{f.read ? 'Mark as Unread' : 'Mark as Reviewed'}</span>
                          </button>
                        )}
                        {handleDeleteFeedback && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(f.id)}
                            className="text-xs text-[#b3392a] dark:text-[#f4a496] hover:opacity-85 cursor-pointer ml-auto flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState msg="This client has not shared any feedback or session reflections yet." />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
