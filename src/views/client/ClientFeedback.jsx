import React, { useState } from 'react';
import {
  clsBtnPrimary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsLabel
} from '../../data/constants.js';
import EmptyState from '../../components/common/EmptyState.jsx';

const RATING_DESCRIPTIONS = {
  1: 'Needs Adjustment',
  2: 'Somewhat Helpful',
  3: 'Steady & Supportive',
  4: 'Very Helpful',
  5: 'Deeply Transformative'
};

const CATEGORIES = [
  'Session Experience',
  'Therapeutic Pacing & Goals',
  'Communication & Alliance',
  'Care Plan & Exercises',
  'General Sanctuary Feedback'
];

export default function ClientFeedback({
  U,
  S,
  handleAddFeedback,
  handleDeleteFeedback
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const myFeedbacks = (S.fb || []).filter((f) => f.clientId === U.id);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    handleAddFeedback({
      rating,
      category,
      message: message.trim(),
      isAnonymous
    });

    setMessage('');
    setRating(5);
    setIsAnonymous(false);
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Client Feedback & Reflections
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Your voice shapes your healing journey. Share confidential reflections on your sessions, care pacing, or practice environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submit Feedback Card */}
        <div className="lg:col-span-5">
          <div className={clsCard}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-2xl">
                rate_review
              </span>
              <h3 className={`${clsCardTitle} mb-0`}>Share Your Reflection</h3>
            </div>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
              Your feedback is shared directly with your clinician to continually refine your care plan and therapeutic safety.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className={clsLabel}>Feedback Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={clsInput}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div>
                <label className={clsLabel}>Session / Care Experience Rating</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeRating;
                    return (
                      <button
                        type="button"
                        key={starVal}
                        className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <span
                          className={`material-symbols-outlined text-2xl transition-colors ${
                            isFilled
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    );
                  })}
                  <span className="text-xs font-semibold ml-2 text-teal-800 dark:text-teal-300">
                    {RATING_DESCRIPTIONS[activeRating]} ({activeRating}/5)
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={clsLabel}>Your Thoughts & Reflections</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What felt supportive or grounding? What would you like to pace differently in upcoming sessions?..."
                  className={`${clsTextarea} min-h-[120px]`}
                  required
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#112322] border border-[#dde7e3] dark:border-[#23403f]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#14302c] dark:text-[#e3efec] block">
                      Submit Anonymously
                    </span>
                    <span className="text-[#5f7571] dark:text-[#8fa8a3] block mt-0.5">
                      Your identity will be protected; the clinician will review the feedback without viewing your name.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className={`${clsBtnPrimary} w-full py-2.5 cursor-pointer shadow-xs`}
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit Care Feedback
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Feedback History */}
        <div className="lg:col-span-7">
          <div className={clsCard}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className={`${clsCardTitle} mb-0`}>
                My Shared Reflections ({myFeedbacks.length})
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-300 font-medium">
                Confidential Archive
              </span>
            </div>

            {myFeedbacks.length ? (
              <div className="space-y-4">
                {myFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#dde7e3] dark:border-[#23403f] bg-white dark:bg-[#14292a] hover:border-teal-600/40 transition-colors shadow-2xs space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                            {item.category}
                          </span>
                          {item.isAnonymous && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">visibility_off</span>
                              Anonymous Submission
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                          Submitted on {item.date}
                        </div>
                      </div>

                      {/* Star Display & Delete */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`material-symbols-outlined text-base ${
                                s <= item.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              style={{ fontVariationSettings: s <= item.rating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="text-[#b3392a] dark:text-[#f4a496] hover:opacity-75 cursor-pointer p-1 rounded-lg"
                          title="Delete reflection"
                          onClick={() => handleDeleteFeedback(item.id)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Message content */}
                    <div className="text-xs sm:text-sm text-[#14302c] dark:text-[#e3efec] leading-relaxed bg-[#f8faf9] dark:bg-[#0f1f1e] p-3 rounded-lg border border-[#dde7e3]/60 dark:border-[#23403f]/60 italic">
                      "{item.message}"
                    </div>

                    {/* Status & Clinician Reply */}
                    {item.reply ? (
                      <div className="p-3 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Clinician Acknowledgment</span>
                        </div>
                        <p className="text-xs text-[#14302c] dark:text-[#cfe5e1]">
                          {item.reply}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                        <span className="material-symbols-outlined text-[14px]">
                          {item.read ? 'mark_chat_read' : 'schedule'}
                        </span>
                        <span>
                          {item.read ? 'Reviewed by Clinician' : 'Delivered to clinician queue'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState msg="You haven't shared any care reflections yet. Your thoughts help refine your sessions and therapeutic pacing." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
