import React, { useState, useMemo } from 'react';
import {
  clsCard,
  clsCardTitle,
  clsInput,
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsMuted
} from '../../data/constants.js';
import StatCard from '../../components/common/StatCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function AdminPanel({
  U,
  S,
  setSelectedClientId,
  setClientModalTab,
  handleAdminRemoveClient,
  handleAdminRemoveConsultant,
  showToast,
  go
}) {
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'consultants' | 'overview'
  const [clientSearch, setClientSearch] = useState('');
  const [consultantSearch, setConsultantSearch] = useState('');

  // Target item selected for removal confirmation modal
  const [confirmRemovalTarget, setConfirmRemovalTarget] = useState(null); // { type: 'client'|'consultant', item: object }
  const [isRemoving, setIsRemoving] = useState(false);

  // Exclusively show active clients & active consultants
  const activeClients = useMemo(() => {
    return (S.cl || []).filter((c) => {
      const status = String(c.status || c.account_status || 'ACTIVE').toUpperCase();
      return status === 'ACTIVE' || status === 'ACCEPTED';
    });
  }, [S.cl]);

  const activeConsultants = useMemo(() => {
    return (S.consultants || []).filter((co) => {
      const status = String(co.status || co.account_status || 'ACTIVE').toUpperCase();
      return status !== 'INACTIVE' && status !== 'SUSPENDED' && status !== 'DEACTIVATED';
    });
  }, [S.consultants]);

  const allFiles = S.fl || [];
  const allAppointments = S.ap || [];
  const allNotes = S.nt || [];

  // Filtered Clients (Active only)
  const filteredClients = useMemo(() => {
    return activeClients.filter((c) => {
      const q = clientSearch.trim().toLowerCase();
      return (
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.contact_no || '').toLowerCase().includes(q) ||
        String(c.id).includes(q)
      );
    });
  }, [activeClients, clientSearch]);

  // Filtered Consultants (Active only)
  const filteredConsultants = useMemo(() => {
    return activeConsultants.filter((co) => {
      const q = consultantSearch.trim().toLowerCase();
      return (
        !q ||
        (co.name || '').toLowerCase().includes(q) ||
        (co.email || '').toLowerCase().includes(q) ||
        (co.specialization || '').toLowerCase().includes(q) ||
        (co.qualification || '').toLowerCase().includes(q) ||
        String(co.id).includes(q)
      );
    });
  }, [activeConsultants, consultantSearch]);

  const openClientDossier = (clientId) => {
    if (setSelectedClientId && setClientModalTab) {
      setSelectedClientId(clientId);
      setClientModalTab('overview');
    }
  };

  const executeRemoval = async () => {
    if (!confirmRemovalTarget) return;
    setIsRemoving(true);
    try {
      if (confirmRemovalTarget.type === 'client') {
        if (handleAdminRemoveClient) {
          await handleAdminRemoveClient(confirmRemovalTarget.item);
        }
      } else if (confirmRemovalTarget.type === 'consultant') {
        if (handleAdminRemoveConsultant) {
          await handleAdminRemoveConsultant(confirmRemovalTarget.item);
        }
      }
    } catch (err) {
      if (showToast) showToast(`Removal error: ${err.message}`);
    } finally {
      setIsRemoving(false);
      setConfirmRemovalTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-3xl">
              admin_panel_settings
            </span>
            <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
              Administrative Control Center
            </h1>
          </div>
          <p className={`${clsMuted} mt-1`}>
            Comprehensive system governance: oversee all enrolled clients, clinical practitioners, caseload allocations, and user management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Master Admin Mode Active</span>
          </span>
        </div>
      </div>

      {/* System Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="groups"
          label="Active Clients"
          val={activeClients.length}
          sub="Enrolled & active sanctuary clients"
        />
        <StatCard
          icon="medical_services"
          label="Active Practitioners"
          val={activeConsultants.length}
          sub="Licensed active clinical staff"
        />
        <StatCard
          icon="folder_special"
          label="Documents in Vault"
          val={allFiles.length}
          sub="HIPAA-preserved records"
        />
        <StatCard
          icon="calendar_month"
          label="Consultation Sessions"
          val={allAppointments.length}
          sub="Clinical appointments logged"
        />
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#dde7e3] dark:border-[#23403f] pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
            activeTab === 'clients'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">groups</span>
          <span>Active Clients ({activeClients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('consultants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
            activeTab === 'consultants'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">medical_services</span>
          <span>Active Practitioners ({activeConsultants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
            activeTab === 'overview'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#5f7571] dark:text-[#8fa8a3] hover:text-[#14302c] dark:hover:text-[#e3efec]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">monitoring</span>
          <span>System Health & Governance</span>
        </button>
      </div>

      {/* TAB 1: ALL CLIENTS */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className={clsCard}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80 relative">
                <span className="material-symbols-outlined text-[18px] text-[#5f7571] dark:text-[#8fa8a3] absolute left-3 top-3">
                  search
                </span>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search active clients by name, email, phone, ID..."
                  className={`${clsInput} pl-9 py-2 text-xs`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                  <span>Active Clients Only ({activeClients.length})</span>
                </span>

                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => setClientSearch('')}
                    className="text-xs text-rose-600 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Client Table */}
          <div className={clsCard}>
            {filteredClients.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#dde7e3] dark:border-[#23403f] text-[#5f7571] dark:text-[#8fa8a3] uppercase text-[11px] font-semibold">
                      <th className="p-3.5">Client Profile</th>
                      <th className="p-3.5">Contact Email & Phone</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Assigned Clinician</th>
                      <th className="p-3.5">Records / Activity</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                    {filteredClients.map((client) => {
                      const assignedConsultant = allConsultants.find(
                        (co) =>
                          co.id === client.assignedConsultantId ||
                          co.uid === client.assignedConsultantId ||
                          co.id === client.consultant_id
                      );
                      const clientFileCount = allFiles.filter(
                        (f) => f.cid === client.id || f.uid === client.uid
                      ).length;
                      const clientApCount = allAppointments.filter(
                        (a) => a.cid === client.id || a.uid === client.uid
                      ).length;

                      const avatarImg =
                        client.avatar ||
                        S.avatars?.[client.uid] ||
                        S.avatars?.[client.id] ||
                        (client.person_id && S.avatars?.['u' + client.person_id]);

                      return (
                        <tr
                          key={client.id || client.uid}
                          className="hover:bg-[#f7faf9] dark:hover:bg-[#112322] transition-colors"
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                {avatarImg ? (
                                  <img
                                    src={avatarImg}
                                    alt={client.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span>{(client.name || 'C')[0]}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#14302c] dark:text-[#e3efec] text-sm">
                                  {client.name || 'Anonymous Client'}
                                </div>
                                <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                                  ID: #{client.id || client.uid}
                                  {client.dob && <span> · DOB: {client.dob}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="text-[#14302c] dark:text-[#e3efec] font-medium">
                              {client.email || 'N/A'}
                            </div>
                            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                              {client.contact_no || 'No phone recorded'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                client.status === 'ACTIVE' || client.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : client.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {client.status || 'ACTIVE'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {assignedConsultant ? (
                              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-medium">
                                <span className="material-symbols-outlined text-[15px]">
                                  verified_user
                                </span>
                                <span>{assignedConsultant.name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8fa8a3] italic">
                                Unassigned / Triage Pool
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-3 text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">folder</span>
                                {clientFileCount} files
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">event</span>
                                {clientApCount} sessions
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openClientDossier(client.id)}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Open full client clinical dossier"
                              >
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                <span>Dossier</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmRemovalTarget({ type: 'client', item: client })}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Remove client from system"
                              >
                                <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState msg="No clients match your search criteria." />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL CONSULTANTS / PRACTITIONERS */}
      {activeTab === 'consultants' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className={clsCard}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80 relative">
                <span className="material-symbols-outlined text-[18px] text-[#5f7571] dark:text-[#8fa8a3] absolute left-3 top-3">
                  search
                </span>
                <input
                  type="text"
                  value={consultantSearch}
                  onChange={(e) => setConsultantSearch(e.target.value)}
                  placeholder="Search active practitioners by name, email, specialty..."
                  className={`${clsInput} pl-9 py-2 text-xs`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                  <span>Active Practitioners Only ({activeConsultants.length})</span>
                </span>

                {consultantSearch && (
                  <button
                    type="button"
                    onClick={() => setConsultantSearch('')}
                    className="text-xs text-rose-600 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Consultant Table */}
          <div className={clsCard}>
            {filteredConsultants.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#dde7e3] dark:border-[#23403f] text-[#5f7571] dark:text-[#8fa8a3] uppercase text-[11px] font-semibold">
                      <th className="p-3.5">Practitioner Profile</th>
                      <th className="p-3.5">Contact Email & Phone</th>
                      <th className="p-3.5">Specialization & Credentials</th>
                      <th className="p-3.5">Assigned Caseload</th>
                      <th className="p-3.5">Scheduled Sessions</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                    {filteredConsultants.map((consultant) => {
                      const caseloadCount = allClients.filter(
                        (c) =>
                          c.assignedConsultantId === consultant.id ||
                          c.assignedConsultantId === consultant.uid ||
                          c.consultant_id === consultant.id
                      ).length;

                      const sessionCount = allAppointments.filter(
                        (a) =>
                          a.consultant_id === consultant.id ||
                          a.consultant_id === consultant.uid ||
                          (consultant.consultant_id && a.consultant_id === consultant.consultant_id)
                      ).length;

                      const avatarImg =
                        consultant.avatar ||
                        S.avatars?.[consultant.uid] ||
                        S.avatars?.[consultant.id] ||
                        (consultant.person_id && S.avatars?.['u' + consultant.person_id]);

                      return (
                        <tr
                          key={consultant.id || consultant.uid}
                          className="hover:bg-[#f7faf9] dark:hover:bg-[#112322] transition-colors"
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                {avatarImg ? (
                                  <img
                                    src={avatarImg}
                                    alt={consultant.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span>{(consultant.name || 'D')[0]}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#14302c] dark:text-[#e3efec] text-sm">
                                  {consultant.name}
                                </div>
                                <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                                  Practitioner ID: #{consultant.id || consultant.uid}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="text-[#14302c] dark:text-[#e3efec] font-medium">
                              {consultant.email || 'N/A'}
                            </div>
                            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">
                              {consultant.contact_no || 'No direct phone recorded'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-teal-800 dark:text-teal-300">
                              {consultant.specialization || 'Clinical Mental Health'}
                            </div>
                            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] truncate max-w-xs">
                              {consultant.qualification || 'Licensed Practitioner'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                              {caseloadCount} active client(s)
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="text-xs font-semibold text-[#14302c] dark:text-[#e3efec]">
                              {sessionCount} total appointments
                            </div>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setConfirmRemovalTarget({ type: 'consultant', item: consultant })}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                              title="Remove practitioner from system"
                            >
                              <span className="material-symbols-outlined text-[14px]">person_remove</span>
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState msg="No clinical practitioners match your search criteria." />
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH & GOVERNANCE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={clsCard}>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400">security</span>
              <h3 className="font-serif text-base font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                Security & Tenant Isolation Governance
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-[#2c4743] dark:text-[#d3e4e0]">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <b>Row-Level Security (RLS) Active:</b> Client vault documents and private notes are cryptographically restricted to authorized owners.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <b>Tenant Isolation Guards:</b> Practitioners can only view clinical files and notes of their explicitly selected caseload clients.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <b>Salted Hash Authentication:</b> PBKDF2 SHA-256 salting enforces tamper-proof authentication across all user tiers.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <b>Strict Slot Occupancy Verification:</b> Double-booking prevention algorithm validates practitioner availability across cross-device instances.
                </div>
              </li>
            </ul>
          </div>

          <div className={clsCard}>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
              <span className="material-symbols-outlined text-teal-700 dark:text-teal-400">tune</span>
              <h3 className="font-serif text-base font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                Quick Administrative Actions
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('clients')}
                className="w-full text-left p-3 rounded-xl border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-600 dark:hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#14302c] dark:text-[#e3efec]">Manage Client Caseloads</div>
                  <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">Audit client statuses and assign practitioners</div>
                </div>
                <span className="material-symbols-outlined text-teal-700">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('consultants')}
                className="w-full text-left p-3 rounded-xl border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-600 dark:hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#14302c] dark:text-[#e3efec]">Review Practitioner Roster</div>
                  <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">Examine credentials, specialties, and active assignments</div>
                </div>
                <span className="material-symbols-outlined text-teal-700">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => go('c-docs')}
                className="w-full text-left p-3 rounded-xl border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-600 dark:hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#14302c] dark:text-[#e3efec]">Inspect Clinical Document Vault</div>
                  <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3]">View all client uploads, stored intakes, and clinical evaluations</div>
                </div>
                <span className="material-symbols-outlined text-teal-700">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION REMOVAL MODAL */}
      {confirmRemovalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                  Confirm Permanent Removal
                </h3>
                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] m-0">
                  {confirmRemovalTarget.type === 'client' ? 'Client' : 'Practitioner'} Account Deprovisioning
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fdf2f0] dark:bg-[#2a1310] border border-rose-200 dark:border-rose-900/50 text-xs text-[#8c2518] dark:text-[#f4a496] leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <b>{confirmRemovalTarget.item.name || 'this user'}</b> ({confirmRemovalTarget.item.email || 'No email'}) from MindCare Sanctuary?
              <br /><br />
              {confirmRemovalTarget.type === 'client'
                ? 'This will delete the client profile, unassign them from active practitioner caseloads, and remove their portal access.'
                : 'This will remove the practitioner from the clinical registry and automatically unassign their active caseload to the triage pool.'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dde7e3] dark:border-[#23403f]">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setConfirmRemovalTarget(null)}
                className={`${clsBtnSecondary} text-xs py-2 px-3.5 cursor-pointer`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={executeRemoval}
                className={`${clsBtnDanger} text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRemoving ? 'hourglass_top' : 'delete_forever'}
                </span>
                <span>{isRemoving ? 'Removing...' : 'Confirm & Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
