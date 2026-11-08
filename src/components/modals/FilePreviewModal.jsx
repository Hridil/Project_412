import React from 'react';
import { clsBtnPrimary, clsBtnSecondary } from '../../data/constants.js';
import { getFileIcon, handleDownloadFile } from '../../utils/mediaUtils.js';

export default function FilePreviewModal({ previewFile, setPreviewFile, showToast }) {
  if (!previewFile) return null;
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
              onClick={() => handleDownloadFile(previewFile, showToast)}
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
                onClick={() => handleDownloadFile(previewFile, showToast)}
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
