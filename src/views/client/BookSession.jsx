import React from 'react';
import {
  clsBtnPrimary,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsLabel
} from '../../data/constants.js';

export default function BookSession({
  U,
  S,
  T,
  handleBookSession
}) {
  const consultants = (S?.acc || []).filter((a) => a.role === 'consultant');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Book a Clinical Consultation
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Schedule a 1-on-1 confidential consultation with your licensed practitioner.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className={clsCard}>
          <h3 className={clsCardTitle}>Consultation Intake & Modality</h3>
          <form onSubmit={handleBookSession} className="space-y-4">
            {/* Consultant Selection */}
            {consultants.length > 0 && (
              <div>
                <label className={clsLabel}>Select Practitioner</label>
                <select name="consultant_id" className={clsInput}>
                  {consultants.map((c) => {
                    const profile = (S?.consultants || []).find((p) => p.uid === c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} {profile?.specialization ? `· ${profile.specialization}` : ''}
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
                <label className={clsLabel}>Preferred Time</label>
                <input type="time" name="time" className={clsInput} defaultValue="10:00" required />
              </div>
            </div>

            <div>
              <label className={clsLabel}>Consultation Modality (Appointment Mode)</label>
              <select name="appointment_mode" className={clsInput}>
                <option value="ONLINE">Online Telehealth Consultation (Video / Audio)</option>
                <option value="OFFLINE">In-Person Sanctuary Consultation (On-Site Clinic)</option>
              </select>
            </div>

            <div>
              <label className={clsLabel}>Primary Focus or Topic</label>
              <input
                name="reason"
                className={clsInput}
                placeholder="e.g. Anxiety regulation, mindfulness pacing, trauma processing"
                required
              />
            </div>

            <div>
              <label className={clsLabel}>Specific Goal for This Session</label>
              <textarea
                name="goals"
                className={clsTextarea}
                placeholder="What clinical outcome or grounding support would be most helpful?"
              />
            </div>

            <div>
              <label className={clsLabel}>Contact Phone / Confirmation Email</label>
              <input
                name="contact"
                className={clsInput}
                defaultValue={U?.email || ''}
                placeholder="Phone number or preferred contact"
              />
            </div>

            <button className={`${clsBtnPrimary} w-full mt-4 py-2.5 cursor-pointer`}>
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              Submit Consultation Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
