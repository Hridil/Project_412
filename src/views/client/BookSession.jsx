import React, { useState } from 'react';
import {
  clsBtnPrimary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsLabel
} from '../../data/constants.js';

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
  handleBookSession
}) {
  // Exclusively display active practitioners synchronized from database table CONSULTANT
  const activeConsultants = (S?.consultants && S.consultants.length > 0)
    ? S.consultants
    : (S?.acc || []).filter((a) => a.role === 'consultant');

  const [distressLevel, setDistressLevel] = useState(5);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

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
        <form onSubmit={handleBookSession} className="space-y-6">
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
                  <select name="consultant_id" className={clsInput}>
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
                  <input type="date" name="date" min={T()} className={clsInput} required />
                </div>
                <div>
                  <label className={clsLabel}>Preferred Time Slot</label>
                  <input type="time" name="time" className={clsInput} defaultValue="10:00" required />
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
                disabled={!safetyConfirmed}
                className={`${clsBtnPrimary} w-full mt-4 py-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined text-[19px]">verified_user</span>
                Submit Pre-Consultation Intake & Book Session
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
