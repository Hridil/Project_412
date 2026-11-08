import React from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput
} from '../../data/constants.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function ClientDocuments({
  U,
  S,
  myC,
  handleFileAdd,
  setPreviewFile,
  handleDeleteItem,
  showToast
}) {
  const c = myC();
  const myFiles = S.fl.filter((f) => f.uid === U.id);
  const isPending = c?.status === 'Pending';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Confidential Documents</h1>
        <p className={`${clsMuted} mt-1`}>
          Encrypted, HIPAA-compliant document sharing with Dr. Demo Consultant.
        </p>
      </div>

      {isPending ? (
        <div className={clsCard}>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-[#e9b44c] mb-2">lock_clock</span>
            <h3 className="font-serif text-lg font-bold mb-1">Intake Application Under Review</h3>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] max-w-md mx-auto">
              Your confidential document vault will unlock as soon as your clinician confirms your intake registration.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Upload Document or Reflection</h3>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
              Share journal pages, questionnaires, or wellness records with your clinician.
            </p>
            <form onSubmit={handleFileAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input type="file" name="f" multiple className={`${clsInput} py-1.5 flex-1`} required />
              <button className={`${clsBtnPrimary} whitespace-nowrap cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Upload to Vault
              </button>
            </form>
          </div>

          <div className={clsCard}>
            <h3 className={clsCardTitle}>Your Vault Files ({myFiles.length})</h3>
            {myFiles.length ? (
              <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                {myFiles.map((f) => (
                  <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400 shrink-0">
                        {getFileIcon(f.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#14302c] dark:text-[#e3efec] truncate">{f.name}</div>
                        <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] flex items-center gap-2 mt-0.5">
                          <span>{Math.max(1, Math.round(f.size / 1024))} KB</span>
                          <span>•</span>
                          <span>{f.date || 'Recent'}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                              f.uploadedBy === 'consultant'
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {f.uploadedBy === 'consultant' ? 'From Clinician' : 'Uploaded by You'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                        onClick={() => setPreviewFile(f)}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Preview
                      </button>
                      <button
                        className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                        onClick={() => handleDownloadFile(f, showToast)}
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download
                      </button>
                      <button
                        className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`}
                        onClick={() => handleDeleteItem('fl', f.id)}
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState msg="No documents uploaded in your vault yet." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
