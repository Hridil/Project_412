import React from 'react';
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
  showToast
}) {
  const filteredDocs = S.fl.filter((f) => {
    const matchesClient = docFilterUid === 'all' || f.uid === docFilterUid;
    const matchesSearch = !docSearchQuery.trim() || f.name.toLowerCase().includes(docSearchQuery.toLowerCase());
    return matchesClient && matchesSearch;
  });

  const totalBytes = S.fl.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
            Practitioner Document Vault
          </h1>
          <p className={`${clsMuted} mt-1`}>
            Manage, review, and exchange secure clinical documentation, intake assessments, and therapeutic worksheets.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] px-3.5 py-2 rounded-xl text-xs">
          <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[18px]">cloud_done</span>
          <span>
            <b>{S.fl.length}</b> total files · <b>{Math.round(totalBytes / 1024)} KB</b> stored
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Upload & Share Document</h3>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
              Securely transmit clinical homework, intake analysis, or therapeutic guidance to a client.
            </p>
            <form onSubmit={handleConsultantUpload} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold mb-1 text-[#14302c] dark:text-[#e3efec]">
                  Recipient Client
                </label>
                <select name="targetUid" className={clsInput} required>
                  <option value="">Select client...</option>
                  {S.cl.filter((c) => c.status === 'Accepted').map((c) => (
                    <option key={c.id} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <input
                className={`${clsInput} py-2`}
                placeholder="Search documents by name..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className={`${clsInput} py-2`}
                value={docFilterUid}
                onChange={(e) => setDocFilterUid(e.target.value)}
              >
                <option value="all">All Clients ({S.fl.length})</option>
                {S.cl.map((c) => (
                  <option key={c.id} value={c.uid}>
                    {c.name} ({S.fl.filter((f) => f.uid === c.uid).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={clsCard}>
            {filteredDocs.length ? (
              filteredDocs.map((f) => {
                const clientOwner = S.cl.find((c) => c.uid === f.uid);
                return (
                  <div className={clsRow} key={f.id}>
                    <div className={clsRowHeader}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400 shrink-0">
                          {getFileIcon(f.name)}
                        </span>
                        <div className="min-w-0">
                          <b className="text-sm block truncate">{f.name}</b>
                          <div className={`${clsMuted} mt-0.5 flex items-center gap-2 flex-wrap`}>
                            <span>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                            <span>•</span>
                            <span>{f.date || 'Recent'}</span>
                            <span>•</span>
                            <span
                              className="font-semibold text-teal-800 dark:text-teal-200 hover:underline cursor-pointer"
                              onClick={() => {
                                if (clientOwner) {
                                  setSelectedClientId(clientOwner.id);
                                  setClientModalTab('files');
                                }
                              }}
                            >
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
                          onClick={() => handleDownloadFile(f, showToast)}
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
              <EmptyState msg="No matching documents found in the clinical vault." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
