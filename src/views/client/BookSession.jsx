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
  T,
  handleBookSession
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Book a Consultation</h1>
        <p className={`${clsMuted} mt-1`}>Request a 1-on-1 session with Dr. Demo Consultant.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className={clsCard}>
          <h3 className={clsCardTitle}>Consultation Intake & Modality</h3>
          <form onSubmit={handleBookSession} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={clsLabel}>Preferred Date</label>
                <input type="date" name="date" min={T()} className={clsInput} required />
              </div>
              <div>
                <label className={clsLabel}>Preferred Time</label>
                <input type="time" name="time" className={clsInput} defaultValue="14:00" required />
              </div>
            </div>

            <div>
              <label className={clsLabel}>Consultation Modality</label>
              <select name="type" className={clsInput}>
                <option>Online Telehealth Consultation (Video)</option>
                <option>In-Person Sanctuary Consultation</option>
                <option>Focused Follow-up (30m)</option>
              </select>
            </div>

            <div>
              <label className={clsLabel}>Primary Focus or Topic</label>
              <input name="reason" className={clsInput} placeholder="e.g. Anxiety regulation, mindfulness guidance, sleep pacing" required />
            </div>

            <div>
              <label className={clsLabel}>Specific Goal for This Session</label>
              <textarea name="goals" className={clsTextarea} placeholder="What outcome would bring you the greatest calm or clarity?" />
            </div>

            <div>
              <label className={clsLabel}>Emergency or Follow-up Contact</label>
              <input name="contact" className={clsInput} defaultValue={U.email} placeholder="Phone or preferred email" />
            </div>

            <button className={`${clsBtnPrimary} w-full mt-4 py-2.5 cursor-pointer`}>
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              Submit Session Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
