import React, { useState } from 'react';
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
  U,
  S,
  Q,
  setQ,
  setSelectedClientId,
  setClientModalTab,
  handleDecision,
  avg,
  E,
  isClientAssignedToConsultant,
  handleAssignClient
}) {
  const [viewScope, setViewScope] = useState('my'); // 'my' = My Selected Clients, 'all' = All Practice Clients
  const q = Q.q.toLowerCase();

  const myClients = S.cl.filter((c) =>
    isClientAssignedToConsultant ? isClientAssignedToConsultant(c, U) : true
  );

  const rows = S.cl.filter((c) => {
    const isAssignedToMe = isClientAssignedToConsultant ? isClientAssignedToConsultant(c, U) : false;
    if (viewScope === 'my' && !isAssignedToMe) return false;

    const matchesSearch = (c.name + c.email).toLowerCase().includes(q);
    const matchesFilter =
      Q.f === 'all' ||
      c.status === Q.f ||
      (Q.f === 'ACTIVE' && c.status === 'Accepted') ||
      (Q.f === 'SUSPENDED' && c.status === 'Rejected');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Client Registry</h1>
          <p className={`${clsMuted} mt-1`}>Manage intake registrations, client files, and caseload assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className={`${clsInput} py-2 w-48 sm:w-64`}
            placeholder="Search by client or email..."
            value={Q.q}
            onChange={(e) => setQ({ ...Q, q: e.target.value })}
          />
          <select
            className={`${clsInput} py-2 w-36`}
            value={Q.f}
            onChange={(e) => setQ({ ...Q, f: e.target.value })}
          >
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="Pending">Pending Triage</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Caseload Scope Selector */}
      <div className="flex items-center gap-2 border-b border-[#dde7e3] dark:border-[#23403f] pb-3">
        <button
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
            viewScope === 'my'
              ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] shadow-xs'
              : 'bg-[#e3f1ee] dark:bg-[#173b3a] text-[#0b5a54] dark:text-teal-300 hover:opacity-90'
          }`}
          onClick={() => setViewScope('my')}
        >
          <span className="material-symbols-outlined text-[16px]">person_pin</span>
          My Selected Clients ({myClients.length})
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
            viewScope === 'all'
              ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] shadow-xs'
              : 'bg-[#e3f1ee] dark:bg-[#173b3a] text-[#0b5a54] dark:text-teal-300 hover:opacity-90'
          }`}
          onClick={() => setViewScope('all')}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          All Practice Registrations ({S.cl.length})
        </button>
      </div>

      <div className={clsCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#dde7e3] dark:border-[#23403f] text-[#5f7571] dark:text-[#8fa8a3] uppercase text-[11px] font-semibold">
                <th className="p-3.5">Client Profile</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Caseload</th>
                <th className="p-3.5">7-Day Mood</th>
                <th className="p-3.5">Consultations</th>
                <th className="p-3.5">Files</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
              {rows.length ? (
                rows.map((c) => {
                  const isAssignedToMe = isClientAssignedToConsultant ? isClientAssignedToConsultant(c, U) : false;
                  const assignedCons = (S.consultants || []).find(
                    (p) =>
                      p.uid === c.assignedConsultantId ||
                      p.id === c.assignedConsultantId ||
                      p.uid === c.consultant_id ||
                      p.id === c.consultant_id
                  );
                  const mAvg = avg(c.uid);
                  const filesCount = (S.fl || []).filter(
                    (f) =>
                      f.uid === c.uid ||
                      f.cid === c.id ||
                      f.client_id === c.id ||
                      (c.person_id && f.person_id === c.person_id)
                  ).length;
                  const sessionsCount = S.ap.filter((a) => a.cid === c.id || a.uid === c.uid).length;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#e3f1ee]/30 dark:hover:bg-[#173b3a]/20 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setClientModalTab('overview');
                      }}
                      title="Click row to open client dossier"
                    >
                      <td className="p-3.5 font-semibold text-[#14302c] dark:text-[#e3efec] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-700/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                            {c.avatar || c.avatar_url || S.avatars?.[c.uid] || S.avatars?.[c.id] || (c.person_id && S.avatars?.['u' + c.person_id]) ? (
                              <img
                                src={c.avatar || c.avatar_url || S.avatars?.[c.uid] || S.avatars?.[c.id] || (c.person_id && S.avatars?.['u' + c.person_id])}
                                alt={c.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
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
                        {isAssignedToMe ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Selected / Handled by You
                          </span>
                        ) : assignedCons ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Dr. {assignedCons.name.split(' ').slice(-1)[0]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                            Unassigned Intake
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {mAvg ? (
                          <span className="font-semibold inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-teal-700 dark:text-teal-400">
                              {E[Math.round(mAvg) - 1]}
                            </span>
                            {mAvg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[#5f7571] dark:text-[#8fa8a3] italic">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{sessionsCount} booked</td>
                      <td className="p-3.5 text-[#5f7571] dark:text-[#8fa8a3] whitespace-nowrap">{filesCount} files</td>
                      <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isAssignedToMe ? (
                            <>
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
                              {c.status !== 'ACTIVE' && c.status !== 'Accepted' && (
                                <button
                                  className={`${clsBtnPrimary} text-xs py-1 px-2 cursor-pointer`}
                                  onClick={() => handleDecision(c.id, 'ACTIVE')}
                                  title="Activate Client"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                </button>
                              )}
                              {c.status !== 'SUSPENDED' && c.status !== 'Rejected' && (
                                <button
                                  className={`${clsBtnDanger} text-xs py-1 px-2 cursor-pointer`}
                                  onClick={() => handleDecision(c.id, 'SUSPENDED')}
                                  title="Suspend Client"
                                >
                                  <span className="material-symbols-outlined text-[16px]">block</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
                              onClick={() => handleAssignClient && handleAssignClient(c.id)}
                              title="Select and assign this client to your caseload"
                            >
                              <span className="material-symbols-outlined text-[16px]">person_add</span>
                              Handle Client
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <EmptyState
                      msg={
                        viewScope === 'my'
                          ? 'No clients currently selected in your caseload. Switch to "All Practice Registrations" to select and handle clients.'
                          : 'No matching client records found.'
                      }
                    />
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
