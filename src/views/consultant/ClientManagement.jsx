import React from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsMuted,
  clsInput
} from '../../data/constants.js';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ClientManagement({
  S,
  Q,
  setQ,
  setSelectedClientId,
  setClientModalTab,
  handleDecision,
  avg,
  E
}) {
  const q = Q.q.toLowerCase();
  const rows = S.cl.filter(
    (c) => (c.name + c.email).toLowerCase().includes(q) && (Q.f === 'all' || c.status === Q.f)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Client Registry</h1>
          <p className={`${clsMuted} mt-1`}>Manage all intake registrations, client files, and therapeutic statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className={`${clsInput} py-2 w-48 sm:w-64`}
            placeholder="Search by client or email..."
            value={Q.q}
            onChange={(e) => setQ({ ...Q, q: e.target.value })}
          />
          <select
            className={`${clsInput} py-2 w-32`}
            value={Q.f}
            onChange={(e) => setQ({ ...Q, f: e.target.value })}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={clsCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#dde7e3] dark:border-[#23403f] text-[#5f7571] dark:text-[#8fa8a3] uppercase text-[11px] font-semibold">
                <th className="p-3.5">Client Profile</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">7-Day Mood</th>
                <th className="p-3.5">Consultations</th>
                <th className="p-3.5">Files</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
              {rows.length ? (
                rows.map((c) => {
                  const mAvg = avg(c.uid);
                  const filesCount = S.fl.filter((f) => f.uid === c.uid).length;
                  const sessionsCount = S.ap.filter((a) => a.cid === c.id || a.uid === c.uid).length;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#e3f1ee]/30 dark:hover:bg-[#173b3a]/20 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setClientModalTab('overview');
                      }}
                      title="Click row to open full client profile"
                    >
                      <td className="p-3.5 font-semibold text-[#14302c] dark:text-[#e3efec] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                            {S.avatars?.[c.uid] ? (
                              <img src={S.avatars[c.uid]} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              c.name[0]
                            )}
                          </div>
                          <span className="group-hover:underline text-teal-900 dark:text-teal-200">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{c.email}</td>
                      <td className="p-3.5 whitespace-nowrap"><Chip status={c.status} /></td>
                      <td className="p-3.5 whitespace-nowrap">
                        {mAvg ? (
                          <span className="font-semibold">{E[Math.round(mAvg) - 1]} {mAvg.toFixed(1)}</span>
                        ) : (
                          <span className="text-[#5f7571] dark:text-[#8fa8a3] italic">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{sessionsCount} booked</td>
                      <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{filesCount} files</td>
                      <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                            onClick={() => {
                              setSelectedClientId(c.id);
                              setClientModalTab('overview');
                            }}
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Profile
                          </button>
                          {c.status !== 'Accepted' && (
                            <button
                              className={`${clsBtnPrimary} text-xs py-1 px-2 cursor-pointer`}
                              onClick={() => handleDecision(c.id, 'Accepted')}
                              title="Accept Client"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          )}
                          {c.status !== 'Rejected' && (
                            <button
                              className={`${clsBtnDanger} text-xs py-1 px-2 cursor-pointer`}
                              onClick={() => handleDecision(c.id, 'Rejected')}
                              title="Decline Client"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <EmptyState msg="No matching client records found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
