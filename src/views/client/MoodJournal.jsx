import React from 'react';
import {
  clsBtnPrimary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsTextarea,
  clsLabel,
  MOODS
} from '../../data/constants.js';
import MoodChart from '../../components/common/MoodChart.jsx';

export default function MoodJournal({
  U,
  moodsOf,
  avg,
  handleMoodSubmit
}) {
  const m = moodsOf(U.id);
  const userAvg = avg(U.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Mood Journal & Emotional Energy
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Observe your patterns over time. Your consultant has access to support your progress.
        </p>
      </div>

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

              <button className={`${clsBtnPrimary} w-full mt-2 cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">check</span>
                Save Daily Check-in
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className={clsCard}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={clsCardTitle}>Emotional Trajectory</h3>
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-200">
                7-Day Avg: {userAvg ? `${userAvg.toFixed(1)} / 5.0` : '—'}
              </span>
            </div>
            <MoodChart values={m.slice(-14).map((x) => x.v)} />
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
    </div>
  );
}
