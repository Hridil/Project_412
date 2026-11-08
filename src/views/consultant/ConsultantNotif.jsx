import React from 'react';
import {
  clsBtnSecondary,
  clsCard,
  clsMuted,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ConsultantNotif({
  S,
  handleReadAllNotifs,
  handleReadNotif
}) {
  const list = S.nf.filter((n) => n.to === 'cons');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Clinical Notifications</h1>
        <p className={`${clsMuted} mt-1`}>Practice alerts, client intake requests, and milestone completions.</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-[#5f7571] dark:text-[#8fa8a3]">
            {list.filter((n) => !n.read).length} unread updates
          </div>
          {list.length > 0 && (
            <button className={`${clsBtnSecondary} cursor-pointer`} onClick={handleReadAllNotifs}>
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Mark all as read
            </button>
          )}
        </div>
        <div className={clsCard}>
          {list.length ? (
            list.map((n) => (
              <div className={clsRow} key={n.id}>
                <div className={clsRowHeader}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-teal-700 dark:bg-teal-400'}`} />
                    <b className="text-sm">{n.msg}</b>
                  </div>
                  {!n.read && (
                    <button className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`} onClick={() => handleReadNotif(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
                <div className={`${clsMuted} pl-4.5 mt-1`}>
                  {n.date} {!n.read && '· New'}
                </div>
              </div>
            ))
          ) : (
            <EmptyState msg="No notifications at this time." />
          )}
        </div>
      </div>
    </div>
  );
}
