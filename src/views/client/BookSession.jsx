import React, { useState, useMemo } from 'react';
import {
  clsBtnPrimary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsLabel
} from '../../data/constants.js';
import { isAppointmentSlotOccupied, normalizeTime } from '../../services/supabaseClient.js';

const CONCERN_CATEGORIES = [
  'Anxiety & Panic Regulation',
  'Depression & Low Mood',
  'Trauma & PTSD Processing',
  'Stress & Burnout Management',
  'Relationship & Family Stress',
  'Grief, Loss & Transitions',
  'Somatic & Nervous System Health',
  'General Mental Wellbeing'
];

export default function BookSession({
  U,
  S,
  T,
  handleBookSession,
  showToast
}) {
  // Exclusively display active practitioners synchronized from database table CONSULTANT
  const activeConsultants = (S?.consultants && S.consultants.length > 0)
    ? S.consultants
    : (S?.acc || []).filter((a) => a.role === 'consultant');

  const defaultConsVal = activeConsultants[0]?.uid || (activeConsultants[0]?.id ? `u${activeConsultants[0].id}` : 'cons');
  const [selectedConsVal, setSelectedConsVal] = useState(defaultConsVal);
  const [selectedDate, setSelectedDate] = useState(T ? T() : new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const [distressLevel, setDistressLevel] = useState(5);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  // Authoritative Slot Occupancy Check against active appointments
  const isOccupied = useMemo(() => {
    return isAppointmentSlotOccupied(S?.ap || [], {
      consultantId: selectedConsVal,
      clientId: U?.id || U?.client_id,
      date: selectedDate,
      time: selectedTime
    });
  }, [S?.ap, selectedConsVal, selectedDate, selectedTime, U]);

  const COMMON_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const slotStatusMap = useMemo(() => {
    const map = {};
    COMMON_SLOTS.forEach((slot) => {
      map[slot] = isAppointmentSlotOccupied(S?.ap || [], {
        consultantId: selectedConsVal,
        clientId: U?.id || U?.client_id,
        date: selectedDate,
        time: slot
      });
    });
    return map;
  }, [S?.ap, selectedConsVal, selectedDate, U]);

  const onSubmitForm = (e) => {
    if (isOccupied) {
      e.preventDefault();
      if (showToast) {
        showToast('This time is occupied. Please select an available slot.');
      } else {
        alert('This time is occupied. Please select an available slot.');
      }
      return;
    }
    handleBookSession(e);
  };

  const getDistressLabel = (val) => {
    if (val <= 3) return { label: 'Mild / Functional', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' };
    if (val <= 6) return { label: 'Moderate / Strained', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
    if (val <= 8) return { label: 'High / Significant Distress', color: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60' };
    return { label: 'Acute / Urgent Support Needed', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' };
  };

  const distressInfo = getDistressLabel(distressLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Book a Clinical Consultation
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Complete your confidential pre-consultation clinical intake form and schedule your 1-on-1 session.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={onSubmitForm} className="space-y-6">
          {/* SECTION 1: PRE-CONSULTATION CLINICAL INTAKE FORM */}
          <div className={clsCard}>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">assignment</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                  Pre-Consultation Clinical Intake Assessment
                </h3>
                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] m-0">
                  This required clinical assessment helps your practitioner prepare personalized support ahead of your session.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category of Concern */}
              <div>
                <label className={clsLabel}>Primary Category of Concern</label>
                <select name="concern_category" className={clsInput} required>
                  {CONCERN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distress Severity Rating Slider */}
              <div className="p-3.5 rounded-xl bg-[#f9fbfa] dark:bg-[#0f2021] border border-[#dde7e3] dark:border-[#23403f] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#14302c] dark:text-[#e3efec]">
                    Current Distress / Severity Rating (1 to 10)
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${distressInfo.color}`}>
                    {distressLevel} / 10 · {distressInfo.label}
                  </span>
                </div>
                <input
                  type="range"
                  name="distress_level"
                  min="1"
                  max="10"
                  value={distressLevel}
                  onChange={(e) => setDistressLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-700 dark:accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#5f7571] dark:text-[#8fa8a3]">
                  <span>1 - Calm & Grounded</span>
                  <span>5 - Moderate Tension</span>
                  <span>10 - Severe Overwhelm</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <label className={clsLabel}>Duration of Current Symptoms</label>
                  <select name="duration" className={clsInput}>
                    <option value="Less than 1 month">Less than 1 month (Recent onset)</option>
                    <option value="1 to 6 months">1 to 6 months</option>
                    <option value="6 to 12 months">6 to 12 months</option>
                    <option value="Over 1 year">Over 1 year (Chronic / Longstanding)</option>
                  </select>
                </div>

                {/* Prior Therapy */}
                <div>
                  <label className={clsLabel}>Prior Therapy or Counseling History</label>
                  <select name="prior_therapy" className={clsInput}>
                    <option value="No prior therapy">No (First time in counseling)</option>
                    <option value="Yes - Previous counseling">Yes (Previously received therapy)</option>
                    <option value="Currently in complementary treatment">Currently seeing another provider</option>
                  </select>
                </div>
              </div>

              {/* Current Medications / Health Notes */}
              <div>
                <label className={clsLabel}>Current Medications or Relevant Health Factors</label>
                <input
                  name="medications"
                  className={clsInput}
                  defaultValue="None"
                  placeholder="e.g. None, or SSRI prescriptions, sleep aids, thyroid conditions..."
                />
              </div>

              {/* Specific Focus */}
              <div>
                <label className={clsLabel}>Chief Complaint / Primary Focus</label>
                <input
                  name="reason"
                  className={clsInput}
                  placeholder="Describe what specific challenge or life event you would like to address..."
                  required
                />
              </div>

              {/* Specific Goals */}
              <div>
                <label className={clsLabel}>Desired Goals & Breakthrough</label>
                <textarea
                  name="goals"
                  className={clsTextarea}
                  placeholder="What breakthrough, insight, or emotional shift would make this consultation most meaningful?"
                  required
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className={clsLabel}>Confidential Emergency Contact (Name & Relationship)</label>
                <input
                  name="emergency_contact"
                  className={clsInput}
                  placeholder="e.g. Alex Morgan (Partner - 555-0199)"
                  required
                />
              </div>

              {/* Crisis Safety Screen */}
              <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#14302c] dark:text-[#e3efec]">
                  <input
                    type="checkbox"
                    checked={safetyConfirmed}
                    onChange={(e) => setSafetyConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-teal-700 dark:text-teal-400 focus:ring-teal-500"
                    required
                  />
                  <span>
                    I confirm that I am not in immediate life-threatening physical danger or crisis. (If you or someone you know is in acute danger, please call or text <b>988</b> or <b>911</b> immediately).
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRACTITIONER & SCHEDULING LOGISTICS */}
          <div className={clsCard}>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">calendar_month</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] m-0">
                  Practitioner & Appointment Logistics
                </h3>
                <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] m-0">
                  Select your practitioner, date, time, and consultation modality.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Consultant Selection */}
              {activeConsultants.length > 0 && (
                <div>
                  <label className={clsLabel}>Select Licensed Practitioner</label>
                  <select
                    name="consultant_id"
                    value={selectedConsVal}
                    onChange={(e) => setSelectedConsVal(e.target.value)}
                    className={clsInput}
                  >
                    {activeConsultants.map((c) => {
                      const consVal = c.uid || (c.id ? `u${c.id}` : 'cons');
                      const spec = c.specialization ? ` · ${c.specialization}` : '';
                      return (
                        <option key={consVal} value={consVal}>
                          {c.name}{spec}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={clsLabel}>Preferred Date</label>
                  <input
                    type="date"
                    name="date"
                    min={T ? T() : new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={clsInput}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className={clsLabel}>Preferred Time Slot</label>
                    {isOccupied && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">event_busy</span> Occupied
                      </span>
                    )}
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={`${clsInput} ${isOccupied ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/20' : ''}`}
                    required
                  />
                </div>
              </div>

              {/* Slot Availability Live Alert */}
              {isOccupied ? (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[22px] text-rose-600 dark:text-rose-400 shrink-0">
                    event_busy
                  </span>
                  <div>
                    <b className="font-semibold block text-[13px]">This time is occupied.</b>
                    <span>The selected time slot ({selectedTime}) on {selectedDate} is already booked. Please choose another time or date.</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400 shrink-0">
                    check_circle
                  </span>
                  <span>
                    <b>Slot Available:</b> {selectedDate} at {selectedTime} is open for booking.
                  </span>
                </div>
              )}

              {/* Quick Select Slots */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5f7571] dark:text-[#8fa8a3]">
                  Quick Consultation Slots for {selectedDate}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SLOTS.map((slot) => {
                    const occupied = slotStatusMap[slot];
                    const isSelected = normalizeTime(selectedTime) === normalizeTime(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          if (occupied) {
                            if (showToast) {
                              showToast(`The ${slot} slot is already occupied.`);
                            } else {
                              alert(`The ${slot} slot is already occupied.`);
                            }
                          } else {
                            setSelectedTime(slot);
                          }
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          occupied
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 line-through opacity-75'
                            : isSelected
                            ? 'bg-teal-700 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-[#14292a] text-[#14302c] dark:text-[#e3efec] border border-[#dde7e3] dark:border-[#23403f] hover:border-teal-500'
                        }`}
                        title={occupied ? `Slot ${slot} is occupied` : `Select ${slot}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {occupied ? 'event_busy' : isSelected ? 'check_circle' : 'schedule'}
                        </span>
                        <span>{slot}</span>
                        <span className="text-[10px] uppercase font-bold opacity-80">
                          {occupied ? 'Occupied' : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={clsLabel}>Consultation Modality (Appointment Mode)</label>
                <select name="appointment_mode" className={clsInput}>
                  <option value="ONLINE">Online Telehealth Consultation (Video / Audio)</option>
                  <option value="OFFLINE">In-Person Sanctuary Consultation (On-Site Sanctuary Clinic)</option>
                </select>
              </div>

              <div>
                <label className={clsLabel}>Confirmation Email or Phone</label>
                <input
                  name="contact"
                  className={clsInput}
                  defaultValue={U?.email || ''}
                  placeholder="Phone number or preferred contact email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!safetyConfirmed || isOccupied}
                className={`${
                  isOccupied
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-not-allowed opacity-90'
                    : clsBtnPrimary
                } w-full mt-4 py-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {isOccupied ? 'event_busy' : 'verified_user'}
                </span>
                {isOccupied ? 'This time is occupied — Select another slot' : 'Submit Pre-Consultation Intake & Book Session'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
