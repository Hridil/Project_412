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
  S,
  handleToggleFeedbackRead,
  handleReplyFeedback,
  handleDeleteFeedback,
  setSelectedClientId,
  setClientModalTab,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Replying state: feedbackId => replyText
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const allFeedbacks = S.fb || [];

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
          label="Therapeutic Alliance"
          value={`${positiveRatio}%`}
          sub="4-star & 5-star positive ratings"
          borderColorClass="bg-emerald-500"
          iconName="sentiment_very_satisfied"
        />
      </div>

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
                        {S.avatars?.[item.clientId] ? (
                          <img
                            src={S.avatars[item.clientId]}
                            alt={item.clientName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(item.clientName || 'C')[0]}</span>
                        )}
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
                      placeholder="e.g. Thank you for this reflection, Jamie. We will incorporate this into our next session pacing..."
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
    </div>
  );
}
