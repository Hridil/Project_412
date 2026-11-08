import React from 'react';

export default function Toast({ toastOn, toastMsg }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#14302c] dark:bg-[#e3efec] text-[#f2f5f3] dark:text-[#0d1b1a] px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 z-50 pointer-events-none ${
        toastOn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {toastMsg}
    </div>
  );
}
