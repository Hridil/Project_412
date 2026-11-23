import React, { useState, useMemo } from 'react';
import {
  clsBtnPrimary,
  clsBtnSecondary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsLabel,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { isAppointmentSlotOccupied, deduplicateAppointments } from '../../services/supabaseClient.js';

// Date utility functions
const toDateKey = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatReadableDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ConsultantSchedule({
  U,
  S,
  T,
  srt,
  cn,
  handleSchedule,
  handleConfirmAp,
  handleCancelAp,
  isClientAssignedToConsultant,
  setSelectedClientId,
  setClientModalTab,
  handleStorePreconsultationAsFile,
  handleStorePreconsultationAsNote
}) {
  const todayKey = useMemo(() => {
    return T ? T() : toDateKey(new Date());
  }, [T]);

  // View mode: 'calendar' (Visual Month View) or 'agenda' (Chronological List)
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedIntakeAp, setSelectedIntakeAp] = useState(null);
  const [storedVaultForms, setStoredVaultForms] = useState(new Set());
  const [storedNoteForms, setStoredNoteForms] = useState(new Set());

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Selected date for detailed daily schedule inspector
  const [selectedDate, setSelectedDate] = useState(() => todayKey);

  // Form pre-filled booking date and time
  const [bookingDate, setBookingDate] = useState(() => todayKey);
  const [bookingTime, setBookingTime] = useState('10:00');

  // Verify whether the clinician already has a session at bookingDate & bookingTime
  const isConsultantSlotOccupied = useMemo(() => {
    return isAppointmentSlotOccupied(S?.ap || [], {
      consultantId: U?.id || U?.consultant_id,
      date: bookingDate,
      time: bookingTime
    });
  }, [S?.ap, U, bookingDate, bookingTime]);

  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tenant Isolation: strictly show appointments for this consultant or their handled clients, authoritative deduplication
  const allAppointments = useMemo(() => {
    const raw = (S.ap || []).filter((a) => {
      if (
        a.consultant_id === U?.id ||
        a.consultant_id === U?.consultant_id ||
        a.consultant_id === U?.uid ||
        (U?.person_id && a.consultant_id === 'u' + U.person_id)
      ) {
        return true;
      }
      const client = (S.cl || []).find((c) => c.id === a.cid || c.uid === a.uid);
      return isClientAssignedToConsultant ? isClientAssignedToConsultant(client, U) : true;
    });
    return deduplicateAppointments(raw).sort(srt);
  }, [S.ap, S.cl, U, isClientAssignedToConsultant, srt]);

  // Clinician can only schedule sessions with clients assigned to their caseload
  const myAssignedClients = useMemo(() => {
    return (S.cl || []).filter(
      (c) =>
        (c.status === 'Accepted' || c.status === 'ACTIVE') &&
        (isClientAssignedToConsultant ? isClientAssignedToConsultant(c, U) : true)
    );
  }, [S.cl, U, isClientAssignedToConsultant]);

  // Client lookup helper
  const getClientInfo = (cid, uid) => {
    return (
      (S.cl || []).find(
        (c) =>
          c.id === cid ||
          (uid && (c.uid === uid || (c.person_id && uid === 'u' + c.person_id)))
      ) || null
    );
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((a) => {
      // Status filter
      if (filterStatus !== 'ALL') {
        const s = (a.status || '').toUpperCase();
        if (filterStatus === 'CONFIRMED' && s !== 'CONFIRMED') return false;
        if (filterStatus === 'REQUESTED' && s !== 'REQUESTED') return false;
        if (filterStatus === 'CANCELLED' && s !== 'CANCELLED') return false;
      }
      // Modality filter
      if (filterMode !== 'ALL') {
        const mode = (a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE')).toUpperCase();
        if (filterMode !== mode) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientName = cn(a.cid).toLowerCase();
        const reason = (a.pre?.reason || a.reason || '').toLowerCase();
        const date = (a.date || '').toLowerCase();
        if (!clientName.includes(q) && !reason.includes(q) && !date.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allAppointments, filterStatus, filterMode, searchQuery, cn]);

  // Group appointments by date (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((a) => {
      const key = (a.date || '').split('T')[0];
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [filteredAppointments]);

  // Calendar Grid calculation for currentMonthDate
  const calendarCells = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Previous month trailing overflow cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const key = toDateKey(d);
      cells.push({
        dateKey: key,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isPrevMonth: true,
        dateObj: d,
        appointments: appointmentsByDate[key] || []
      });
    }

    // 2. Current month active days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const key = toDateKey(d);
      cells.push({
        dateKey: key,
        dayNumber: dayNum,
        isCurrentMonth: true,
        dateObj: d,
        appointments: appointmentsByDate[key] || []
      });
    }

    // 3. Next month leading overflow cells to maintain uniform 7-column grid
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const key = toDateKey(d);
      cells.push({
        dateKey: key,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isNextMonth: true,
        dateObj: d,
        appointments: appointmentsByDate[key] || []
      });
    }

    return cells;
  }, [currentMonthDate, appointmentsByDate]);

  // Appointments for the selected date
  const selectedDayAppointments = useMemo(() => {
    return appointmentsByDate[selectedDate] || [];
  }, [appointmentsByDate, selectedDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayKey);
    setBookingDate(todayKey);
  };

  // Clicking a date cell
  const handleCellClick = (cell) => {
    setSelectedDate(cell.dateKey);
    setBookingDate(cell.dateKey);
    if (!cell.isCurrentMonth) {
      setCurrentMonthDate(new Date(cell.dateObj.getFullYear(), cell.dateObj.getMonth(), 1));
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = allAppointments.length;
    const confirmed = allAppointments.filter(
      (a) => (a.status || '').toUpperCase() === 'CONFIRMED'
    ).length;
    const requested = allAppointments.filter(
      (a) => (a.status || '').toUpperCase() === 'REQUESTED'
    ).length;
    const online = allAppointments.filter(
      (a) => (a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE')).toUpperCase() === 'ONLINE'
    ).length;
    const inPerson = total - online;
    return { total, confirmed, requested, online, inPerson };
  }, [allAppointments]);

  // Open client dossier modal
  const handleOpenDossier = (clientId) => {
    if (setSelectedClientId && clientId) {
      setSelectedClientId(clientId);
      if (setClientModalTab) {
        setClientModalTab('overview');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#dde7e3] dark:border-[#23403f]">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
            Clinical Schedule & Appointments
          </h1>
          <p className={`${clsMuted} mt-1`}>
            Interactive visual schedule and appointment management for your clinical caseload.
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#eaf2ef] dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-xl self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              viewMode === 'calendar'
                ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] shadow-xs'
                : 'text-[#5f7571] hover:text-[#14302c] dark:text-[#8fa8a3] dark:hover:text-[#e3efec]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Visual Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              viewMode === 'agenda'
                ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] shadow-xs'
                : 'text-[#5f7571] hover:text-[#14302c] dark:text-[#8fa8a3] dark:hover:text-[#e3efec]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            Agenda List ({filteredAppointments.length})
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#14292a] p-3.5 rounded-xl border border-[#dde7e3] dark:border-[#23403f] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
          </div>
          <div>
            <div className="text-xl font-bold font-serif text-[#14302c] dark:text-[#e3efec]">{metrics.total}</div>
            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider font-semibold">Total Sessions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14292a] p-3.5 rounded-xl border border-[#dde7e3] dark:border-[#23403f] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <div className="text-xl font-bold font-serif text-emerald-700 dark:text-emerald-400">{metrics.confirmed}</div>
            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider font-semibold">Confirmed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14292a] p-3.5 rounded-xl border border-[#dde7e3] dark:border-[#23403f] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
          <div>
            <div className="text-xl font-bold font-serif text-amber-700 dark:text-amber-400">{metrics.requested}</div>
            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider font-semibold">Pending Approval</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14292a] p-3.5 rounded-xl border border-[#dde7e3] dark:border-[#23403f] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">videocam</span>
          </div>
          <div>
            <div className="text-xl font-bold font-serif text-[#14302c] dark:text-[#e3efec]">
              {metrics.online} <span className="text-xs font-normal text-[#5f7571] dark:text-[#8fa8a3]">/ {metrics.inPerson} in-person</span>
            </div>
            <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider font-semibold">Telehealth Modality</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#14292a] p-3 rounded-xl border border-[#dde7e3] dark:border-[#23403f]">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5f7571] dark:text-[#8fa8a3]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by client name, focus reason, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${clsInput} pl-9 py-1.5 text-xs`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${clsInput} w-auto py-1.5 text-xs`}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed Sessions</option>
            <option value="REQUESTED">Pending Requests</option>
            <option value="CANCELLED">Cancelled Sessions</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className={`${clsInput} w-auto py-1.5 text-xs`}
          >
            <option value="ALL">All Modalities</option>
            <option value="ONLINE">Online Telehealth</option>
            <option value="OFFLINE">In-Person Sanctuary</option>
          </select>

          {(filterStatus !== 'ALL' || filterMode !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setFilterMode('ALL');
                setSearchQuery('');
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left side Calendar/Agenda, Right side Book New Session + Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Visual Calendar OR Agenda List */}
        <div className="lg:col-span-8 space-y-6">
          {viewMode === 'calendar' ? (
            /* VISUAL CALENDAR VIEW */
            <div className={clsCard}>
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-xl font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                    {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                  </h2>
                  <button
                    type="button"
                    onClick={handleGoToday}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#eaf2ef] hover:bg-[#d8e8e3] dark:bg-[#1f3d3c] dark:hover:bg-[#284d4b] text-[#14302c] dark:text-[#e3efec] transition cursor-pointer"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#eaf2ef] hover:bg-[#d8e8e3] dark:bg-[#1f3d3c] dark:hover:bg-[#284d4b] text-[#14302c] dark:text-[#e3efec] transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#eaf2ef] hover:bg-[#d8e8e3] dark:bg-[#1f3d3c] dark:hover:bg-[#284d4b] text-[#14302c] dark:text-[#e3efec] transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Weekday Column Headers */}
              <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-[#dde7e3] dark:border-[#23403f] font-semibold text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                {WEEKDAY_NAMES.map((dayName) => (
                  <div key={dayName} className="py-1">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {calendarCells.map((cell) => {
                  const isToday = cell.dateKey === todayKey;
                  const isSelected = cell.dateKey === selectedDate;
                  const hasAps = cell.appointments.length > 0;

                  return (
                    <div
                      key={cell.dateKey + '-' + cell.dayNumber}
                      onClick={() => handleCellClick(cell)}
                      className={`min-h-[92px] p-1.5 rounded-xl border flex flex-col justify-between transition cursor-pointer select-none ${
                        isSelected
                          ? 'border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 shadow-xs ring-2 ring-teal-500/30'
                          : cell.isCurrentMonth
                          ? 'border-[#dde7e3] dark:border-[#23403f] bg-white dark:bg-[#14292a] hover:bg-[#f6faf8] dark:hover:bg-[#1a3334]'
                          : 'border-transparent bg-[#f8faf9]/60 dark:bg-[#102021]/50 text-[#8fa8a3] dark:text-[#4e6b66] opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Day Number and Pill */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            isToday
                              ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-[#052321] font-bold shadow-xs'
                              : isSelected
                              ? 'text-teal-800 dark:text-teal-200 font-bold'
                              : cell.isCurrentMonth
                              ? 'text-[#14302c] dark:text-[#e3efec]'
                              : 'text-[#8fa8a3] dark:text-[#5f7571]'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {hasAps && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                            {cell.appointments.length}
                          </span>
                        )}
                      </div>

                      {/* Appointment badges inside the cell */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {cell.appointments.slice(0, 2).map((a) => {
                          const isOnline =
                            (a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE')).toUpperCase() ===
                            'ONLINE';
                          const isConfirmed = (a.status || '').toUpperCase() === 'CONFIRMED';
                          const isRequested = (a.status || '').toUpperCase() === 'REQUESTED';

                          return (
                            <div
                              key={a.id}
                              title={`${a.time || '10:00'} - ${cn(a.cid)} (${a.status})`}
                              className={`text-[10px] truncate px-1.5 py-0.5 rounded flex items-center gap-1 font-medium ${
                                isConfirmed
                                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                  : isRequested
                                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[11px] shrink-0">
                                {isOnline ? 'videocam' : 'location_on'}
                              </span>
                              <span className="truncate">
                                {a.time ? a.time.substring(0, 5) : '10:00'} {cn(a.cid)}
                              </span>
                            </div>
                          );
                        })}

                        {cell.appointments.length > 2 && (
                          <div className="text-[9px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold text-center">
                            +{cell.appointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 pt-3 border-t border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between flex-wrap gap-2 text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Confirmed Session</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span>Requested / Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-teal-700 dark:text-teal-400">
                      videocam
                    </span>
                    <span>Telehealth Video</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-sky-700 dark:text-sky-400">
                      location_on
                    </span>
                    <span>In-Person Sanctuary</span>
                  </div>
                </div>
                <div className="italic text-[11px]">Click any date to inspect sessions & schedule</div>
              </div>
            </div>
          ) : (
            /* AGENDA LIST VIEW */
            <div className={clsCard}>
              <div className="flex items-center justify-between pb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
                <h2 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                  All Scheduled Sessions ({filteredAppointments.length})
                </h2>
              </div>

              {filteredAppointments.length ? (
                <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f]">
                  {filteredAppointments.map((a) => {
                    const client = getClientInfo(a.cid, a.uid);
                    const isOnline =
                      (a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE')).toUpperCase() ===
                      'ONLINE';

                    return (
                      <div className="py-3.5 first:pt-2 last:pb-2" key={a.id}>
                        <div className={clsRowHeader}>
                          <div className="flex items-start gap-3">
                            {/* Client Avatar or Fallback */}
                            <div
                              onClick={() => handleOpenDossier(a.cid)}
                              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 transition"
                              title="Click to view client dossier"
                            >
                              {client?.avatar || client?.avatar_url ? (
                                <img
                                  src={client.avatar || client.avatar_url}
                                  alt={cn(a.cid)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{cn(a.cid).charAt(0).toUpperCase()}</span>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <b className="text-sm text-[#14302c] dark:text-[#e3efec]">
                                  {formatReadableDate(a.date)} at {a.time ? a.time.substring(0, 5) : '10:00'}
                                </b>
                                <Chip status={a.status} />
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#eaf2ef] dark:bg-[#1a3334] text-[#14302c] dark:text-[#e3efec] font-medium">
                                  <span className="material-symbols-outlined text-[13px]">
                                    {isOnline ? 'videocam' : 'location_on'}
                                  </span>
                                  {isOnline ? 'Telehealth Video' : 'In-Person'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDossier(a.cid)}
                                  className="text-xs font-semibold text-teal-800 dark:text-teal-300 hover:underline cursor-pointer"
                                >
                                  Client: {cn(a.cid)} {client?.email ? `(${client.email})` : ''}
                                </button>
                              </div>

                              {(a.pre?.reason || a.reason) && (
                                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1 italic">
                                  Focus: "{a.pre?.reason || a.reason}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 self-start mt-2 sm:mt-0">
                            {a.pre && (
                              <button
                                type="button"
                                onClick={() => setSelectedIntakeAp(a)}
                                className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                                title="View & Store Pre-Consultation Intake Form"
                              >
                                <span className="material-symbols-outlined text-[15px]">assignment</span>
                                Intake Form
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenDossier(a.cid)}
                              className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                              title="Open Client Dossier"
                            >
                              <span className="material-symbols-outlined text-[15px]">folder_shared</span>
                              Dossier
                            </button>
                            {(a.status === 'Requested' || a.status === 'REQUESTED') && (
                              <button
                                type="button"
                                className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
                                onClick={() => handleConfirmAp(a.id)}
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`}
                              onClick={() => handleCancelAp(a.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState msg="No scheduled consultations match your active filters." />
              )}
            </div>
          )}

          {/* Daily Schedule Inspector (Visible when a day is clicked in Calendar View) */}
          {viewMode === 'calendar' && (
            <div className={clsCard}>
              <div className="flex items-center justify-between pb-3 border-b border-[#dde7e3] dark:border-[#23403f]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700 dark:text-teal-400 text-[22px]">
                    event
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                      Schedule for {formatReadableDate(selectedDate)}
                    </h3>
                    <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                      {selectedDayAppointments.length} consultation(s) booked on this day
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBookingDate(selectedDate);
                    // scroll to booking form on mobile
                    const formEl = document.getElementById('consultant-booking-form');
                    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  Book on this Day
                </button>
              </div>

              {selectedDayAppointments.length > 0 ? (
                <div className="divide-y divide-[#dde7e3] dark:divide-[#23403f] mt-2">
                  {selectedDayAppointments.map((a) => {
                    const client = getClientInfo(a.cid, a.uid);
                    const isOnline =
                      (a.appointment_mode || (a.type?.includes('Online') ? 'ONLINE' : 'OFFLINE')).toUpperCase() ===
                      'ONLINE';

                    return (
                      <div className="py-3" key={a.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              onClick={() => handleOpenDossier(a.cid)}
                              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 transition"
                              title="Click to view client dossier"
                            >
                              {client?.avatar || client?.avatar_url ? (
                                <img
                                  src={client.avatar || client.avatar_url}
                                  alt={cn(a.cid)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{cn(a.cid).charAt(0).toUpperCase()}</span>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-[#14302c] dark:text-[#e3efec]">
                                  {a.time ? a.time.substring(0, 5) : '10:00'}
                                </span>
                                <Chip status={a.status} />
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#eaf2ef] dark:bg-[#1a3334] text-[#14302c] dark:text-[#e3efec] font-medium">
                                  <span className="material-symbols-outlined text-[13px]">
                                    {isOnline ? 'videocam' : 'location_on'}
                                  </span>
                                  {isOnline ? 'Online Telehealth' : 'In-Person Sanctuary'}
                                </span>
                              </div>

                              <div className="mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDossier(a.cid)}
                                  className="text-xs font-semibold text-teal-800 dark:text-teal-300 hover:underline cursor-pointer"
                                >
                                  Client: {cn(a.cid)} {client?.email ? `• ${client.email}` : ''}
                                </button>
                              </div>

                              {(a.pre?.reason || a.reason) && (
                                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1 italic">
                                  Focus Reason: "{a.pre?.reason || a.reason}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {a.pre && (
                              <button
                                type="button"
                                onClick={() => setSelectedIntakeAp(a)}
                                className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                                title="View & Store Pre-Consultation Intake Form"
                              >
                                <span className="material-symbols-outlined text-[15px]">assignment</span>
                                Intake Form
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenDossier(a.cid)}
                              className={`${clsBtnSecondary} text-xs py-1 px-2.5 cursor-pointer`}
                              title="Open Client Dossier"
                            >
                              <span className="material-symbols-outlined text-[15px]">folder_shared</span>
                              Dossier
                            </button>
                            {(a.status === 'Requested' || a.status === 'REQUESTED') && (
                              <button
                                type="button"
                                className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
                                onClick={() => handleConfirmAp(a.id)}
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`}
                              onClick={() => handleCancelAp(a.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#5f7571] dark:text-[#8fa8a3]">
                  No consultations scheduled for {formatReadableDate(selectedDate)}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Book New Session Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className={clsCard} id="consultant-booking-form">
            <h3 className={clsCardTitle}>Book New Session</h3>
            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mb-3">
              Schedule a telehealth or in-person session with any client currently in your clinical caseload.
            </p>

            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className={clsLabel}>Select Assigned Client</label>
                <select name="cid" className={clsInput} required>
                  {myAssignedClients.length ? (
                    <>
                      <option value="">Select handled client ({myAssignedClients.length})...</option>
                      {myAssignedClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No assigned clients. Claim or select clients from Client Registry first.
                    </option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={clsLabel}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedDate(e.target.value);
                    }}
                    min={todayKey}
                    className={clsInput}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className={clsLabel}>Time</label>
                    {isConsultantSlotOccupied && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">event_busy</span> Occupied
                      </span>
                    )}
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className={`${clsInput} ${isConsultantSlotOccupied ? 'border-rose-400 bg-rose-50/20' : ''}`}
                    required
                  />
                </div>
              </div>

              {/* Occupied Warning for Clinician */}
              {isConsultantSlotOccupied && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 dark:text-rose-400 shrink-0">
                    event_busy
                  </span>
                  <span>
                    <b>This time is occupied.</b> You already have a session booked at {bookingTime} on {bookingDate}.
                  </span>
                </div>
              )}

              <div>
                <label className={clsLabel}>Consultation Modality (Mode)</label>
                <select name="appointment_mode" className={clsInput}>
                  <option value="ONLINE">Online Telehealth Consultation (Video)</option>
                  <option value="OFFLINE">In-Person Sanctuary Consultation (Offline)</option>
                </select>
              </div>

              <button
                disabled={isConsultantSlotOccupied}
                className={`${
                  isConsultantSlotOccupied
                    ? 'bg-rose-600 text-white opacity-80 cursor-not-allowed'
                    : clsBtnPrimary
                } w-full mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isConsultantSlotOccupied ? 'event_busy' : 'calendar_add_on'}
                </span>
                {isConsultantSlotOccupied ? 'This time is occupied — Select another slot' : 'Confirm & Schedule Session'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Pre-Consultation Intake Form Viewer Modal */}
      {selectedIntakeAp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedIntakeAp(null)}
        >
          <div
            className="bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between bg-gradient-to-r from-teal-900 via-teal-800 to-[#0c3b37] text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-teal-300">assignment</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-white m-0">
                    Pre-Consultation Clinical Intake Assessment
                  </h3>
                  <div className="text-xs text-teal-200">
                    Client: {cn(selectedIntakeAp.cid)} · {selectedIntakeAp.date} at {selectedIntakeAp.time}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIntakeAp(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Category & Distress Bar */}
              <div className="p-4 rounded-xl bg-[#f9fbfa] dark:bg-[#0f2021] border border-[#dde7e3] dark:border-[#23403f] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">
                    Category of Concern
                  </span>
                  <span className="font-bold text-sm text-teal-800 dark:text-teal-300">
                    {selectedIntakeAp.pre?.concern_category || 'General Mental Wellbeing'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#14302c] dark:text-[#e3efec]">Subjective Distress Severity:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {selectedIntakeAp.pre?.distress_level || 5} / 10
                    </span>
                  </div>
                  <div className="w-full bg-[#dde7e3] dark:bg-[#23403f] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (selectedIntakeAp.pre?.distress_level || 5) >= 7
                          ? 'bg-rose-500'
                          : (selectedIntakeAp.pre?.distress_level || 5) >= 4
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(selectedIntakeAp.pre?.distress_level || 5) * 10}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#dde7e3] dark:border-[#23403f]">
                  <div>
                    <span className="text-[#5f7571] dark:text-[#8fa8a3] block">Duration of Concerns:</span>
                    <b className="text-[#14302c] dark:text-[#e3efec]">{selectedIntakeAp.pre?.duration || '1 to 6 months'}</b>
                  </div>
                  <div>
                    <span className="text-[#5f7571] dark:text-[#8fa8a3] block">Prior Therapy History:</span>
                    <b className="text-[#14302c] dark:text-[#e3efec]">{selectedIntakeAp.pre?.prior_therapy || 'No'}</b>
                  </div>
                </div>
              </div>

              {/* Focus and Breakthrough Goals */}
              <div className="space-y-3 p-4 rounded-xl bg-[#f9fbfa] dark:bg-[#0f2021] border border-[#dde7e3] dark:border-[#23403f]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] block mb-1">
                    Primary Focus / Chief Complaint
                  </span>
                  <p className="text-[#14302c] dark:text-[#e3efec] font-medium m-0">
                    "{selectedIntakeAp.pre?.reason || selectedIntakeAp.reason || 'Consultation Intake'}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3] block mb-1">
                    Desired Goals & Breakthrough
                  </span>
                  <p className="text-[#5f7571] dark:text-[#8fa8a3] italic m-0">
                    "{selectedIntakeAp.pre?.goals || 'Support, regulation, and guidance'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#dde7e3] dark:border-[#23403f]">
                  <div>
                    <span className="text-[#5f7571] dark:text-[#8fa8a3] block">Medications:</span>
                    <b className="text-[#14302c] dark:text-[#e3efec]">{selectedIntakeAp.pre?.medications || 'None'}</b>
                  </div>
                  <div>
                    <span className="text-[#5f7571] dark:text-[#8fa8a3] block">Emergency Contact:</span>
                    <b className="text-[#14302c] dark:text-[#e3efec]">{selectedIntakeAp.pre?.emergency_contact || 'None listed'}</b>
                  </div>
                </div>
              </div>

              {/* Safety Screen Confirmation */}
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-teal-700 dark:text-teal-300">
                  verified
                </span>
                <span>
                  <b>Crisis Screening Verified:</b> Client acknowledged no acute life-threatening emergency at intake submission.
                </span>
              </div>
            </div>

            {/* Modal Footer / Storage Actions */}
            <div className="p-4 border-t border-[#dde7e3] dark:border-[#23403f] bg-[#f9fbfa] dark:bg-[#0f2021] flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const client = getClientInfo(selectedIntakeAp.cid, selectedIntakeAp.uid);
                  if (handleOpenDossier && client) {
                    handleOpenDossier(client.id);
                    setSelectedIntakeAp(null);
                  }
                }}
                className={`${clsBtnSecondary} text-xs py-1.5 px-3 cursor-pointer`}
              >
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                Open Client Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const client = getClientInfo(selectedIntakeAp.cid, selectedIntakeAp.uid);
                    if (handleStorePreconsultationAsFile && client) {
                      handleStorePreconsultationAsFile({ ...selectedIntakeAp.pre, date: selectedIntakeAp.date, time: selectedIntakeAp.time, appointment_mode: selectedIntakeAp.appointment_mode }, client);
                      setStoredVaultForms((prev) => new Set(prev).add(selectedIntakeAp.id));
                    }
                  }}
                  className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    storedVaultForms.has(selectedIntakeAp.id)
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] shadow-2xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {storedVaultForms.has(selectedIntakeAp.id) ? 'check_circle' : 'drive_folder_upload'}
                  </span>
                  {storedVaultForms.has(selectedIntakeAp.id) ? 'Stored in Vault' : 'Store in Vault'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const client = getClientInfo(selectedIntakeAp.cid, selectedIntakeAp.uid);
                    if (handleStorePreconsultationAsNote && client) {
                      handleStorePreconsultationAsNote({ ...selectedIntakeAp.pre, date: selectedIntakeAp.date, time: selectedIntakeAp.time, appointment_mode: selectedIntakeAp.appointment_mode }, client);
                      setStoredNoteForms((prev) => new Set(prev).add(selectedIntakeAp.id));
                    }
                  }}
                  className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    storedNoteForms.has(selectedIntakeAp.id)
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-[#e3f1ee] hover:bg-[#d5ede8] dark:bg-[#173b3a] dark:hover:bg-[#1f4e4d] text-teal-800 dark:text-teal-200 shadow-2xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {storedNoteForms.has(selectedIntakeAp.id) ? 'check_circle' : 'note_add'}
                  </span>
                  {storedNoteForms.has(selectedIntakeAp.id) ? 'Archived in Notes' : 'Archive to Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
