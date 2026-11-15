import React, { useState } from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function ClientDocuments({
  U,
  S,
  docFilterUid,
  setDocFilterUid,
  docSearchQuery,
  setDocSearchQuery,
  handleConsultantUpload,
  setPreviewFile,
  handleDeleteItem,
  setSelectedClientId,
  setClientModalTab,
  showToast,
  isClientAssignedToConsultant
}) {
  const [searchTarget, setSearchTarget] = useState('all'); // 'all' | 'client' | 'file'
  const [fileCategory, setFileCategory] = useState('all'); // 'all' | 'pdf' | 'images' | 'client_only' | 'consultant_only'

  // Tenant Isolation: strictly restrict client file access to assigned caseload
  const myClients = S.cl.filter((c) =>
    isClientAssignedToConsultant ? isClientAssignedToConsultant(c, U) : true
  );
  const myAcceptedClients = myClients.filter(
    (c) => c.status === 'Accepted' || c.status === 'ACTIVE'
  );

  const myCaseloadDocs = S.fl.filter((f) => {
    if (
      f.uploadedBy === 'consultant' &&
      (f.consultant_id === U?.id ||
        f.consultant_id === U?.consultant_id ||
        f.consultant_id === ('u' + U?.consultant_id) ||
        (U?.person_id && f.person_id === U?.person_id))
    ) {
      return true;
    }
    const clientOwner = S.cl.find(
      (c) =>
        c.uid === f.uid ||
        c.id === f.cid ||
        c.id === f.client_id ||
        (f.person_id && c.person_id === f.person_id)
    );
    return isClientAssignedToConsultant ? isClientAssignedToConsultant(clientOwner, U) : false;
  });

  const query = docSearchQuery.trim().toLowerCase();

  const filteredDocs = myCaseloadDocs.filter((f) => {
    const clientOwner = S.cl.find(
      (c) =>
        c.uid === f.uid ||
        c.id === f.cid ||
        c.id === f.client_id ||
        (f.person_id && c.person_id === f.person_id)
    );
    const matchesClientFilter =
      docFilterUid === 'all' ||
      f.uid === docFilterUid ||
      (clientOwner && (clientOwner.uid === docFilterUid || String(clientOwner.id) === String(docFilterUid)));

    let matchesSearch = true;
    if (query) {
      const fileNameMatch = f.name.toLowerCase().includes(query);
      const clientName = (clientOwner?.name || '').toLowerCase();
      const clientEmail = (clientOwner?.email || '').toLowerCase();
      const clientNameMatch = clientName.includes(query) || clientEmail.includes(query);

      if (searchTarget === 'file') {
        matchesSearch = fileNameMatch;
      } else if (searchTarget === 'client') {
        matchesSearch = clientNameMatch;
      } else {
        // 'all': matches across both file name and client name / email
        matchesSearch = fileNameMatch || clientNameMatch;
      }
    }

    let matchesCategory = true;
    if (fileCategory === 'pdf') {
      matchesCategory = f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf';
    } else if (fileCategory === 'images') {
      matchesCategory = f.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
    } else if (fileCategory === 'client_only') {
      matchesCategory = f.uploadedBy === 'client';
    } else if (fileCategory === 'consultant_only') {
      matchesCategory = f.uploadedBy === 'consultant';
    }

    return matchesClientFilter && matchesSearch && matchesCategory;
  });

  const totalBytes = myCaseloadDocs.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
            Practitioner Document Vault
          </h1>
          <p className={`${clsMuted} mt-1`}>
            Manage, search, and review confidential clinical files and worksheets across your assigned caseload.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] px-3.5 py-2 rounded-xl text-xs">
          <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[18px]">cloud_done</span>
          <span>
            <b>{myCaseloadDocs.length}</b> caseload files · <b>{Math.round(totalBytes / 1024)} KB</b> stored
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Upload & Share Document</h3>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
              Securely transmit clinical homework, intake analysis, or therapeutic guidance to an assigned client.
            </p>
            <form onSubmit={handleConsultantUpload} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold mb-1 text-[#14302c] dark:text-[#e3efec]">
                  Recipient Client (Assigned Caseload)
                </label>
                <select name="targetUid" className={clsInput} required>
                  {myAcceptedClients.length ? (
                    <>
                      <option value="">Select assigned client ({myAcceptedClients.length})...</option>
                      {myAcceptedClients.map((c) => (
                        <option key={c.id} value={c.uid}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No assigned clients. Select clients in Client Registry first.
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1 text-[#14302c] dark:text-[#e3efec]">
                  Choose Document (PDF, Image, Doc)
                </label>
                <input type="file" name="f" multiple className={`${clsInput} py-1.5`} required />
              </div>
              <button className={`${clsBtnPrimary} w-full mt-2 cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Upload & Share with Client
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Dual Search & Caseload Filtering Controls */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Bar with Icon and Clear Button */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5f7571] dark:text-[#8fa8a3]">
                  search
                </span>
                <input
                  className={`${clsInput} py-2 pl-9 pr-8 w-full`}
                  placeholder={
                    searchTarget === 'client'
                      ? 'Search by client name or email...'
                      : searchTarget === 'file'
                      ? 'Search by file name or extension (e.g. CBT, .pdf)...'
                      : 'Search by file name or client name (e.g. CBT, Jamie)...'
                  }
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                />
                {docSearchQuery && (
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    onClick={() => setDocSearchQuery('')}
                    title="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                  </button>
                )}
              </div>

              {/* Search Target Mode Selector */}
              <div className="w-full sm:w-44 shrink-0">
                <select
                  className={`${clsInput} py-2 text-xs font-semibold`}
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  title="Search field target"
                >
                  <option value="all">🔍 Files & Clients</option>
                  <option value="client">👤 Client Name Only</option>
                  <option value="file">📄 File Name Only</option>
                </select>
              </div>

              {/* Client Caseload Filter Dropdown */}
              <div className="w-full sm:w-44 shrink-0">
                <select
                  className={`${clsInput} py-2 text-xs font-semibold`}
                  value={docFilterUid}
                  onChange={(e) => setDocFilterUid(e.target.value)}
                >
                  <option value="all">All Caseload ({myCaseloadDocs.length})</option>
                  {myClients.map((c) => (
                    <option key={c.id} value={c.uid}>
                      {c.name} ({myCaseloadDocs.filter((f) => f.uid === c.uid || f.cid === c.id || f.client_id === c.id || (c.person_id && f.person_id === c.person_id)).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Format & Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-[#5f7571] dark:text-[#8fa8a3] uppercase mr-1">Filter:</span>
              {[
                ['all', 'All Files'],
                ['pdf', 'PDF Documents'],
                ['images', 'Images & Photos'],
                ['client_only', 'Client Uploads'],
                ['consultant_only', 'Shared by You']
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition whitespace-nowrap ${
                    fileCategory === key
                      ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] font-semibold shadow-2xs'
                      : 'bg-[#e3f1ee]/80 dark:bg-[#173b3a]/70 text-[#0b5a54] dark:text-teal-300 hover:bg-[#d5ede8] dark:hover:bg-[#1f4e4d]'
                  }`}
                  onClick={() => setFileCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Active search indicators */}
            {query && (
              <div className="flex items-center justify-between text-xs text-[#5f7571] dark:text-[#8fa8a3] bg-teal-50/60 dark:bg-teal-950/20 px-3 py-1.5 rounded-lg border border-teal-200/60 dark:border-teal-900/40">
                <span>
                  Found <b>{filteredDocs.length}</b> file(s) matching "<b>{docSearchQuery}</b>" in{' '}
                  <b>{searchTarget === 'all' ? 'files & clients' : searchTarget === 'client' ? 'client names' : 'file names'}</b>
                </span>
                <button
                  className="text-teal-700 dark:text-teal-300 hover:underline font-semibold cursor-pointer"
                  onClick={() => setDocSearchQuery('')}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <div className={clsCard}>
            {filteredDocs.length ? (
              filteredDocs.map((f) => {
                const clientOwner = S.cl.find((c) => c.uid === f.uid || c.id === f.cid || c.id === f.client_id || (f.person_id && c.person_id === f.person_id));
                const matchedClient = query && (clientOwner?.name || '').toLowerCase().includes(query);
                const matchedFile = query && f.name.toLowerCase().includes(query);

                return (
                  <div className={clsRow} key={f.id}>
                    <div className={clsRowHeader}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400 shrink-0">
                          {getFileIcon(f.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <b className="text-sm block truncate">{f.name}</b>
                            {matchedClient && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200">
                                Matched Client
                              </span>
                            )}
                            {matchedFile && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                                Matched File
                              </span>
                            )}
                          </div>
                          <div className={`${clsMuted} mt-0.5 flex items-center gap-2 flex-wrap`}>
                            <span>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                            <span>•</span>
                            <span>{f.date || 'Recent'}</span>
                            <span>•</span>
                            <span
                              className="font-semibold text-teal-800 dark:text-teal-200 hover:underline cursor-pointer flex items-center gap-1"
                              onClick={() => {
                                if (clientOwner) {
                                  setSelectedClientId(clientOwner.id);
                                  setClientModalTab('files');
                                }
                              }}
                              title="Click to view client dossier"
                            >
                              <span className="material-symbols-outlined text-[13px]">person</span>
                              Client: {clientOwner?.name || f.uid}
                            </span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                f.uploadedBy === 'consultant'
                                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {f.uploadedBy === 'consultant' ? 'Shared by You' : 'Uploaded by Client'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                          onClick={() => setPreviewFile(f)}
                          title="Preview in browser"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Preview
                        </button>
                        <button
                          className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                          onClick={() => handleDownloadFile(f, showToast, U)}
                          title="Download document"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Download
                        </button>
                        <button
                          className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`}
                          onClick={() => handleDeleteItem('fl', f.id)}
                          title="Delete document"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                msg={
                  query
                    ? `No documents found matching "${docSearchQuery}" in your assigned caseload.`
                    : 'No documents found in the clinical vault for this selection.'
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
