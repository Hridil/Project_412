import React from 'react';

export default function Chip({ status }) {
  const colorMap = {
    // Client account statuses (MySQL CLIENT.ACCOUNT_STATUS)
    ACTIVE: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    Active: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    Accepted: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    INACTIVE: 'bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]',
    Inactive: 'bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]',
    SUSPENDED: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
    Suspended: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
    Pending: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
    Rejected: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',

    // Appointment statuses (MySQL APPOINTMENT.STATUS)
    REQUESTED: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
    Requested: 'bg-[#fff3df] text-[#8a5a12] dark:bg-[#3a2f17] dark:text-[#f2c879]',
    CONFIRMED: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    Confirmed: 'bg-[#dff3e6] text-[#1f6b3d] dark:bg-[#173a27] dark:text-[#8fdcae]',
    CANCELLED: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
    Cancelled: 'bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496]',
    COMPLETED: 'bg-[#e3f1ee] text-teal-800 dark:bg-[#173b3a] dark:text-teal-200',
    Completed: 'bg-[#e3f1ee] text-teal-800 dark:bg-[#173b3a] dark:text-teal-200',

    // Session statuses (MySQL CONSULTATION_SESSION.SESSION_STATUS)
    SCHEDULED: 'bg-[#e0e7ff] text-[#3730a3] dark:bg-[#1e1b4b] dark:text-[#a5b4fc]',
    IN_PROGRESS: 'bg-[#e3f1ee] text-teal-700 dark:bg-[#173b3a] dark:text-teal-300',
    'In progress': 'bg-[#e3f1ee] text-teal-700 dark:bg-[#173b3a] dark:text-teal-300',

    // Appointment modes (MySQL APPOINTMENT.APPOINTMENT_MODE)
    ONLINE: 'bg-[#e3f1ee] text-teal-700 dark:bg-[#173b3a] dark:text-teal-300',
    OFFLINE: 'bg-[#e0f2fe] text-[#0369a1] dark:bg-[#082f49] dark:text-[#7dd3fc]'
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
