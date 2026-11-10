import React from 'react';
import {
  clsBtnPrimary,
  clsBtnDanger,
  clsCard,
  clsMuted,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ClientSessions({
  U,
  S,
  srt,
  go,
  handleCancelAp
}) {
  const sessions = S.ap.filter((a) => a.uid === U.id).sort(srt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">My Sessions</h1>
          <p className={`${clsMuted} mt-1`}>Your scheduled consultations with your clinical care team.</p>
        </div>
        <button className={`${clsBtnPrimary} cursor-pointer`} onClick={() => go('cl-book')}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Request New Session
        </button>
      </div>

      <div className={clsCard}>
        {sessions.length ? (
          sessions.map((a) => (
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
                  <button className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`} onClick={() => handleCancelAp(a.id)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState msg="No sessions booked yet." />
        )}
      </div>
    </div>
  );
}
