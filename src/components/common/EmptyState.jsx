import React from 'react';

export default function EmptyState({ msg }) {
  return (
    <div className="text-center text-[#5f7571] dark:text-[#8fa8a3] py-8">
      <span className="material-symbols-outlined text-3xl opacity-40 mb-1">spa</span>
      <p className="text-sm">{msg}</p>
    </div>
  );
}
