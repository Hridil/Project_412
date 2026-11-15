import React from 'react';
import { clsBtnPrimary, clsBtnSecondary } from '../../data/constants.js';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function FilePreviewModal({
  previewFile,
  setPreviewFile,
  showToast,
  U = null,
  S = null,
  isClientAssignedToConsultant = null
}) {
  if (!previewFile) return null;

  // Tenant Isolation Security Check:
  // 1. Clients can strictly access ONLY their own files.
  // 2. Consultants can strictly access ONLY files for clients in their caseload or uploaded by them.
  let isAccessDenied = false;
  let denialReason = '';

  if (U && U.role === 'client') {
    const isOwner =
      previewFile.uid === U.id ||
      (U.client_id && previewFile.client_id === U.client_id) ||
      (U.person_id && previewFile.person_id === U.person_id) ||
      (U.email && previewFile.email === U.email);

    if (!isOwner) {
      isAccessDenied = true;
      denialReason = 'Confidential Vault Isolation: You are only authorized to access your own personal files.';
    }
  } else if (U && U.role === 'consultant' && isClientAssignedToConsultant && S?.cl) {
    const clientOwner = S.cl.find((c) => c.uid === previewFile.uid);
    const isAssigned = clientOwner ? isClientAssignedToConsultant(clientOwner, U) : false;
    const isUploader = previewFile.uploadedBy === 'consultant' && (previewFile.uid === U.id || previewFile.consultant_id === U.id);

    if (!isAssigned && !isUploader) {
      isAccessDenied = true;
      denialReason = 'Caseload Isolation: This document belongs to a client outside your assigned care registry.';
    }
  }

  if (isAccessDenied) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs"
        onClick={() => setPreviewFile(null)}
      >
        <div
          className="bg-white dark:bg-[#14292a] border border-red-300 dark:border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] mb-2">
            Access Denied
          </h3>
          <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-6 leading-relaxed">
            {denialReason}
          </p>
          <button
            className={`${clsBtnSecondary} text-xs w-full py-2.5 cursor-pointer font-semibold`}
            onClick={() => setPreviewFile(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isImage = previewFile.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(previewFile.name);
  const isPdf = previewFile.type === 'application/pdf' || previewFile.name.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
      onClick={() => setPreviewFile(null)}
    >
      <div
        className="bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-2xl text-teal-700 dark:text-teal-400">
              {getFileIcon(previewFile.name)}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] truncate">
                {previewFile.name}
              </h3>
              <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                {Math.max(1, Math.round(previewFile.size / 1024))} KB · {previewFile.date || 'Recent'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`${clsBtnPrimary} text-xs py-1.5 px-3`}
              onClick={() => handleDownloadFile(previewFile, showToast, U)}
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download
            </button>
            <button
              className="w-8 h-8 rounded-lg bg-[#e3f1ee] dark:bg-[#173b3a] text-[#14302c] dark:text-[#e3efec] flex items-center justify-center hover:opacity-80 transition cursor-pointer"
              onClick={() => setPreviewFile(null)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-[#f2f5f3]/40 dark:bg-[#0d1b1a]/40">
          {previewFile.dataUrl ? (
            isImage ? (
              <img
                src={previewFile.dataUrl}
                alt={previewFile.name}
                className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm"
              />
            ) : isPdf ? (
              <iframe
                src={previewFile.dataUrl}
                title={previewFile.name}
                className="w-full h-[65vh] rounded-xl border border-[#dde7e3] dark:border-[#23403f]"
              />
            ) : (
              <div className="w-full p-4 rounded-xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] text-xs font-mono whitespace-pre-wrap max-h-[65vh] overflow-auto">
                {atob(previewFile.dataUrl.split(',')[1] || '')}
              </div>
            )
          ) : (
            <div className="text-center p-8 max-w-md">
              <span className="material-symbols-outlined text-4xl text-teal-700 dark:text-teal-400 mb-2">
                verified_user
              </span>
              <h4 className="font-serif font-bold text-base text-[#14302c] dark:text-[#e3efec] mb-1">
                Clinical Vault Document
              </h4>
              <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-4">
                This demo clinical document is stored in the practice vault. Click "Download" to generate and retrieve the validated document.
              </p>
              <button
                className={`${clsBtnSecondary} text-xs`}
                onClick={() => handleDownloadFile(previewFile, showToast, U)}
              >
                Download Valid Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
