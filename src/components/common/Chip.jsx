import React from 'react';

export default function Chip({ status }) {
  const colorMap = {
    Pending: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
    Requested: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
    Rejected: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
    Accepted: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    Confirmed: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    Completed: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    'In progress': 'bg-[#e3f1ee] text-teal-700 dark:bg-[#173b3a] dark:text-teal-300'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        colorMap[status] || colorMap['In progress']
      }`}
    >
      {status}
    </span>
  );
}
