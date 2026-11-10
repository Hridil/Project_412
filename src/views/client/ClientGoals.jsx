import React from 'react';
import {
  clsBtnSecondary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ClientGoals({
  U,
  S,
  handleTogglePlan
}) {
  const pl = S.pl.filter((p) => p.uid === U.id);
  const dn = pl.filter((p) => p.done).length;
  const pct = pl.length ? Math.round((dn / pl.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">My Care Plan & Goals</h1>
        <p className={`${clsMuted} mt-1`}>Collaborative micro-steps assigned by your clinical care team.</p>
      </div>

      <div className={clsCard}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[#5f7571] dark:text-[#8fa8a3]">Holistic Progress</span>
          <b className="text-sm text-teal-800 dark:text-teal-200">{dn} of {pl.length} completed ({pct}%)</b>
        </div>
        <div className="h-3 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-full overflow-hidden">
          <div className="h-full bg-teal-700 dark:bg-teal-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={clsCard}>
        <h3 className={clsCardTitle}>Assigned Therapeutic Micro-Steps</h3>
        {pl.length ? (
          pl.map((p) => (
            <div className={clsRow} key={p.id}>
              <div className={clsRowHeader}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${p.done ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400'}`}>
                      {p.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <b className={`text-sm ${p.done ? 'line-through opacity-70' : ''}`}>{p.title}</b>
                  </div>
                  {p.due && <div className={`${clsMuted} pl-7 mt-0.5`}>Target completion: {p.due}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Chip status={p.done ? 'Completed' : 'In progress'} />
                  <button
                    className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                    onClick={() => handleTogglePlan(p.id)}
                  >
                    {p.done ? 'Reopen' : 'Mark Done'}
                  </button>
                </div>
              </div>
              {p.details && <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] pl-7 my-1.5">{p.details}</p>}
            </div>
          ))
        ) : (
          <EmptyState msg="No care plan goals currently active." />
        )}
      </div>
    </div>
  );
}
