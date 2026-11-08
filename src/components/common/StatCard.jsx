import React from 'react';
import { clsCard, clsMuted } from '../../data/constants.js';

export default function StatCard({ label, value, sub, borderColorClass, iconName }) {
  return (
    <div className={`${clsCard} relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${borderColorClass}`} />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase text-[#5f7571] dark:text-[#8fa8a3] tracking-wider">
          {label}
        </span>
        {iconName && (
          <span className="w-8 h-8 rounded-lg bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">{iconName}</span>
          </span>
        )}
      </div>
      <div className="my-2">
        <span className="block font-serif text-[30px] font-bold text-[#14302c] dark:text-[#e3efec] leading-none">
          {value}
        </span>
      </div>
      <span className={clsMuted}>{sub}</span>
    </div>
  );
}
