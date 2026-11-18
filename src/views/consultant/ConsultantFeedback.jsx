import React, { useState, useMemo } from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea
} from '../../data/constants.js';
import StatCard from '../../components/common/StatCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ConsultantFeedback({
  U,
  S,
  handleToggleFeedbackRead,
  handleReplyFeedback,
  handleDeleteFeedback,
  setSelectedClientId,
  setClientModalTab,
  handleStoreFeedbackAsFile,
  handleStoreFeedbackAsNote,
  handleDownloadFeedback,
  showToast
}) {
  const [viewMode, setViewMode] = useState('reviews'); // 'reviews' or 'stored'
  const [storedVaultIds, setStoredVaultIds] = useState(() => new Set());
  const [storedNoteIds, setStoredNoteIds] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Replying state: feedbackId => replyText
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const allFeedbacks = S.fb || [];

  // Stored Feedback Records in Client Vault & Clinical Private Notes
  const storedVaultFiles = useMemo(() => {
    return (S.fl || []).filter(
      (f) => f.tag === 'Client Feedback' || (f.name && f.name.startsWith('Feedback_Record_'))
    );
  }, [S.fl]);

  const storedNotes = useMemo(() => {
    return (S.nt || []).filter(
      (n) => n.tag === 'Client Feedback' || (n.title && n.title.startsWith('Care Feedback:'))
    );
  }, [S.nt]);

  // Metrics
  const totalCount = allFeedbacks.length;
  const unreadCount = allFeedbacks.filter((f) => !f.read).length;
  const avgRating = totalCount
    ? (allFeedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) / totalCount).toFixed(1)
    : '0.0';
  const positiveRatio = totalCount
    ? Math.round(
        (allFeedbacks.filter((f) => (f.rating || 5) >= 4).length / totalCount) * 100
      )
    : 100;

  // Filtered list
  const filteredFeedbacks = useMemo(() => {
    return allFeedbacks.filter((f) => {
      if (showUnreadOnly && f.read) return false;
      if (filterCategory !== 'all' && f.category !== filterCategory) return false;
      if (filterRating !== 'all') {
        const r = f.rating || 5;
        if (filterRating === '5' && r !== 5) return false;
        if (filterRating === '4' && r !== 4) return false;
        if (filterRating === '3below' && r > 3) return false;
      }
      if (filterClient !== 'all') {
        if (filterClient === 'anonymous' && !f.isAnonymous) return false;
        if (filterClient !== 'anonymous' && (f.isAnonymous || f.clientId !== filterClient)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const msgMatch = (f.message || '').toLowerCase().includes(q);
        const nameMatch = !f.isAnonymous && (f.clientName || '').toLowerCase().includes(q);
        const catMatch = (f.category || '').toLowerCase().includes(q);
        if (!msgMatch && !nameMatch && !catMatch) return false;
      }
      return true;
    });
  }, [allFeedbacks, showUnreadOnly, filterCategory, filterRating, filterClient, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set(allFeedbacks.map((f) => f.category).filter(Boolean));
    return Array.from(set);
  }, [allFeedbacks]);

  const handleStartReply = (item) => {
    setActiveReplyId(item.id);
    setReplyInput(item.reply || '');
  };

  const handleSaveReply = (id) => {
    if (!replyInput.trim()) return;
    handleReplyFeedback(id, replyInput.trim());
    setActiveReplyId(null);
    setReplyInput('');
    if (showToast) showToast('Clinician acknowledgment saved and shared with client');
  };

  const openClientDossier = (clientId) => {
    const clientRecord = S.cl.find((c) => c.uid === clientId);
    if (clientRecord) {
      setSelectedClientId(clientRecord.id);
      setClientModalTab('feedback');
    } else {
      if (showToast) showToast('Client record not found');
    }
  };

  const handleStoreVault = (item, clientRecord) => {
    if (handleStoreFeedbackAsFile) {
      handleStoreFeedbackAsFile(item, clientRecord);
      setStoredVaultIds((prev) => new Set(prev).add(item.id));
    }
  };

  const handleStoreNote = (item, clientRecord) => {
    if (handleStoreFeedbackAsNote) {
      handleStoreFeedbackAsNote(item, clientRecord);
      setStoredNoteIds((prev) => new Set(prev).add(item.id));
    }
  };

  const handleDownload = (item, clientRecord) => {
    if (handleDownloadFeedback) {
      handleDownloadFeedback(item, clientRecord);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Client Feedback & Care Reviews
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Direct insights, session evaluations, and therapeutic reflections submitted by your clients.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Satisfaction"
          value={`${avgRating} / 5.0`}
          sub="Average rating across all reviews"
          borderColorClass="bg-amber-500"
          iconName="star"
        />
        <StatCard
          label="Total Feedbacks"
          value={totalCount}
          sub="Reflections recorded in practice"
          borderColorClass="bg-teal-600"
          iconName="rate_review"
        />
        <StatCard
          label="Unread Reviews"
          value={unreadCount}
          sub={unreadCount > 0 ? 'Awaiting your review' : 'All reviews acknowledged'}
          borderColorClass={unreadCount > 0 ? 'bg-[#e07a5f]' : 'bg-emerald-600'}
          iconName="mark_chat_unread"
        />
        <StatCard
          label="Stored Records"
          value={storedVaultFiles.length + storedNotes.length}
          sub={`${storedVaultFiles.length} in Vault · ${storedNotes.length} in Notes`}
          borderColorClass="bg-indigo-600"
          iconName="inventory_2"
        />
      </div>

      {/* View Switcher: Active Reviews vs Stored Archives */}
      <div className="flex items-center gap-2 p-1.5 bg-[#eaf2ef] dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-xl self-start shadow-xs">
        <button
          type="button"
          onClick={() => setViewMode('reviews')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            viewMode === 'reviews'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">rate_review</span>
          <span>Active Client Reviews ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('stored')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            viewMode === 'stored'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">archive</span>
          <span>Stored Feedback & Details Archive ({storedVaultFiles.length + storedNotes.length})</span>
        </button>
      </div>

      {viewMode === 'stored' ? (
        /* STORED FEEDBACK & DETAILS ARCHIVE VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#dde7e3] dark:border-[#23403f] flex-wrap gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                Stored Feedback & Evaluation Records
              </h3>
              <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] m-0">
                Confidential clinical feedback files preserved in client vaults and private clinical notes.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
              {storedVaultFiles.length} Vault Files · {storedNotes.length} Archived Notes
            </span>
          </div>

          {/* Section 1: Vault Documents */}
          <div className={clsCard}>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[20px]">folder_special</span>
              <h4 className="font-serif text-base font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                Client Vault Feedback Records ({storedVaultFiles.length})
              </h4>
            </div>

            {storedVaultFiles.length ? (
              <div className="space-y-2.5">
                {storedVaultFiles.map((file) => {
                  const client = S.cl.find((c) => c.id === file.cid || c.uid === file.uid);
                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-[#dde7e3] dark:border-[#23403f] bg-[#f9fbfa] dark:bg-[#0f2021] flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[19px]">description</span>
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#14302c] dark:text-[#e3efec]">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] flex items-center gap-2">
                            <span>Client: <b>{client?.name || 'Assigned Client'}</b></span>
                            <span>·</span>
                            <span>Stored on {file.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.dataUrl && (
                          <a
                            href={file.dataUrl}
                            download={file.name}
                            className={`${clsBtnSecondary} text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer`}
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>Download</span>
                          </a>
                        )}
                        {client && (
                          <button
                            type="button"
                            onClick={() => openClientDossier(client.uid)}
                            className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-medium cursor-pointer"
                          >
                            View Client Dossier
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState msg="No feedback records have been stored in the client vault yet. Click 'Store in Vault' on any active review." />
            )}
          </div>

          {/* Section 2: Clinical Private Notes */}
          <div className={clsCard}>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[20px]">sticky_note_2</span>
              <h4 className="font-serif text-base font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                Archived Private Clinical Notes ({storedNotes.length})
              </h4>
            </div>

            {storedNotes.length ? (
              <div className="space-y-3">
                {storedNotes.map((note) => {
                  const client = S.cl.find((c) => c.id === note.cid);
                  return (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-[#dde7e3] dark:border-[#23403f] bg-white dark:bg-[#14292a] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                            {note.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold">
                            {note.tag || 'Client Feedback'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                          Archived on {note.date} · Client: <b>{client?.name || 'Client'}</b>
                        </span>
                      </div>
                      <p className="text-xs text-[#2c4743] dark:text-[#d3e4e0] whitespace-pre-line bg-[#f9fbfa] dark:bg-[#0f1f1e] p-2.5 rounded-lg border border-[#dde7e3]/60 dark:border-[#23403f]/60 font-mono text-[11px]">
                        {note.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState msg="No feedback records archived into clinical private notes yet. Click 'Archive to Notes' on any active review." />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className={clsCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <span className="material-symbols-outlined text-[18px] text-[#5f7571] dark:text-[#8fa8a3] absolute left-3 top-3">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback, client, or topic..."
              className={`${clsInput} pl-9 py-2 text-xs`}
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${clsInput} py-2 text-xs`}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className={`${clsInput} py-2 text-xs`}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3below">3 Stars or less</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className={`${clsInput} py-2 text-xs`}
            >
              <option value="all">All Clients</option>
              {S.cl.map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.name}
                </option>
              ))}
              <option value="anonymous">Anonymous Submissions Only</option>
            </select>
          </div>
        </div>

        {/* Quick filter pills */}
        <div className="mt-3 pt-3 border-t border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showUnreadOnly
                  ? 'bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321]'
                  : 'bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200 hover:opacity-80'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {showUnreadOnly ? 'check_box' : 'check_box_outline_blank'}
              </span>
              Unread Reviews Only ({unreadCount})
            </button>
            {(searchQuery || filterCategory !== 'all' || filterRating !== 'all' || filterClient !== 'all' || showUnreadOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterRating('all');
                  setFilterClient('all');
                  setShowUnreadOnly(false);
                }}
                className="text-xs text-[#b3392a] dark:text-[#f4a496] hover:underline cursor-pointer flex items-center gap-1 ml-2"
              >
                <span className="material-symbols-outlined text-[14px]">clear_all</span>
                Reset Filters
              </button>
            )}
          </div>
          <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">
            Showing {filteredFeedbacks.length} of {totalCount} reviews
          </div>
        </div>
      </div>

      {/* Feedback Items List */}
      <div className="space-y-4">
        {filteredFeedbacks.length ? (
          filteredFeedbacks.map((item) => {
            const isUnread = !item.read;
            const clientRecord = S.cl.find((c) => c.uid === item.clientId);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'border-teal-600 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-950/20 shadow-xs'
                    : 'border-[#dde7e3] dark:border-[#23403f] bg-white dark:bg-[#14292a]'
                }`}
              >
                {/* Item Top Row */}
                <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {item.isAnonymous ? (
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">visibility_off</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                        {(() => {
                          const clientObj = (S.cl || []).find((c) => c.uid === item.clientId || c.id === item.clientId || c.id === item.cid);
                          const fAvatar = clientObj?.avatar || clientObj?.avatar_url || S.avatars?.[item.clientId] || (clientObj?.person_id && S.avatars?.['u' + clientObj.person_id]);
                          return fAvatar ? (
                            <img
                              src={fAvatar}
                              alt={item.clientName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{(item.clientName || 'C')[0]}</span>
                          );
                        })()}
                      </div>
                    )}

                    {/* Client & Topic info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isAnonymous ? (
                          <span className="font-serif font-bold text-[#14302c] dark:text-[#e3efec] text-base">
                            Anonymous Client
                          </span>
                        ) : (
                          <button
                            onClick={() => openClientDossier(item.clientId)}
                            className="font-serif font-bold text-[#14302c] dark:text-[#e3efec] text-base hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer text-left flex items-center gap-1 group"
                          >
                            <span>{item.clientName || 'Client'}</span>
                            <span className="material-symbols-outlined text-[16px] text-teal-700 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              open_in_new
                            </span>
                          </button>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-300 font-medium">
                          {item.category}
                        </span>
                        {isUnread && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] font-bold">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-0.5 flex items-center gap-2">
                        <span>{item.date}</span>
                        <span>·</span>
                        <span>{item.isAnonymous ? 'Confidential Submission' : clientRecord?.email || 'Registered Client'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`material-symbols-outlined text-lg ${
                          s <= (item.rating || 5)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        style={{ fontVariationSettings: s <= (item.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-xs font-bold text-[#14302c] dark:text-[#e3efec] ml-1.5">
                      {item.rating || 5}/5
                    </span>
                  </div>
                </div>

                {/* Message Quote */}
                <div className="my-4 p-4 rounded-xl bg-[#f8faf9] dark:bg-[#0f1f1e] border border-[#dde7e3]/60 dark:border-[#23403f]/60 text-sm text-[#14302c] dark:text-[#e3efec] leading-relaxed italic">
                  "{item.message}"
                </div>

                {/* Clinician Acknowledgment / Response */}
                {item.reply && activeReplyId !== item.id && (
                  <div className="mb-4 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Clinician Response</span>
                      </div>
                      <p className="text-xs text-[#14302c] dark:text-[#cfe5e1] leading-relaxed">
                        {item.reply}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartReply(item)}
                      className="text-xs text-teal-700 dark:text-teal-400 hover:underline cursor-pointer shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {/* Active Reply Editor */}
                {activeReplyId === item.id && (
                  <div className="mb-4 p-4 rounded-xl bg-[#f2f5f3] dark:bg-[#112322] border border-teal-600/40 space-y-3">
                    <label className="block text-xs font-semibold text-[#14302c] dark:text-[#e3efec]">
                      Write Clinician Acknowledgment / Therapeutic Note
                    </label>
                    <textarea
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="e.g. Thank you for this reflection. We will incorporate this into our next session pacing..."
                      className={`${clsTextarea} min-h-[80px] text-xs`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className={`${clsBtnSecondary} text-xs py-1.5 px-3 cursor-pointer`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveReply(item.id)}
                        className={`${clsBtnPrimary} text-xs py-1.5 px-3 cursor-pointer`}
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Save Response
                      </button>
                    </div>
                  </div>
                )}

                {/* Storage & Archive Action Bar */}
                <div className="my-3 p-2.5 rounded-xl bg-[#f0f5f3] dark:bg-[#122424] border border-[#d2e2de] dark:border-[#1d3d3a] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-[#385550] dark:text-[#9fc1bb] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-teal-700 dark:text-teal-400">inventory_2</span>
                    <span>Store Feedback & Details:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStoreVault(item, clientRecord)}
                      disabled={storedVaultIds.has(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition ${
                        storedVaultIds.has(item.id)
                          ? 'bg-teal-200 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 cursor-default'
                          : 'bg-white dark:bg-[#1a3536] border border-[#c4dbd6] dark:border-[#284f4c] text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-[#1f4240]'
                      }`}
                      title="Store feedback details as confidential record in Client Vault"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {storedVaultIds.has(item.id) ? 'check' : 'folder_special'}
                      </span>
                      <span>{storedVaultIds.has(item.id) ? 'Stored in Vault' : 'Store in Vault'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStoreNote(item, clientRecord)}
                      disabled={storedNoteIds.has(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition ${
                        storedNoteIds.has(item.id)
                          ? 'bg-teal-200 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 cursor-default'
                          : 'bg-white dark:bg-[#1a3536] border border-[#c4dbd6] dark:border-[#284f4c] text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-[#1f4240]'
                      }`}
                      title="Archive feedback details into Private Clinical Notes"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {storedNoteIds.has(item.id) ? 'check' : 'sticky_note_2'}
                      </span>
                      <span>{storedNoteIds.has(item.id) ? 'Archived to Notes' : 'Archive to Notes'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(item, clientRecord)}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium bg-white dark:bg-[#1a3536] border border-[#c4dbd6] dark:border-[#284f4c] text-[#2c4743] dark:text-[#d3e4e0] hover:bg-teal-50 dark:hover:bg-[#1f4240] flex items-center gap-1 cursor-pointer transition"
                      title="Download feedback and full details as a formatted text document"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#dde7e3] dark:border-[#23403f] flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeedbackRead(item.id)}
                      className={`${clsBtnSecondary} text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {item.read ? 'mark_chat_unread' : 'check_circle'}
                      </span>
                      <span>{item.read ? 'Mark as Unread' : 'Mark as Reviewed'}</span>
                    </button>

                    {activeReplyId !== item.id && (
                      <button
                        onClick={() => handleStartReply(item)}
                        className={`${clsBtnSecondary} text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5`}
                      >
                        <span className="material-symbols-outlined text-[16px]">reply</span>
                        <span>{item.reply ? 'Update Response' : 'Reply to Client'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.isAnonymous && (
                      <button
                        onClick={() => openClientDossier(item.clientId)}
                        className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-[15px]">person</span>
                        <span>Open Dossier</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="text-[#b3392a] dark:text-[#f4a496] hover:opacity-80 p-1.5 rounded-lg cursor-pointer"
                      title="Delete review"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState msg="No client feedback records match your active search or filters." />
        )}
      </div>
        </>
      )}
    </div>
  );
}
