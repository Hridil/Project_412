import React from 'react';
import {
  clsBtnPrimary,
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

export default function ConsultantSchedule({
  S,
  T,
  srt,
  cn,
  handleSchedule,
  handleConfirmAp,
  handleCancelAp
}) {
  const appointments = [...S.ap].sort(srt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
          Appointment Scheduling
        </h1>
        <p className={`${clsMuted} mt-1`}>
          Schedule and manage telehealth and in-person consultations with enrolled clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Book New Session</h3>
            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className={clsLabel}>Select Client</label>
                <select name="cid" className={clsInput} required>
                  <option value="">Select active client...</option>
                  {S.cl.filter((c) => c.status === 'Accepted' || c.status === 'ACTIVE').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={clsLabel}>Date</label>
                  <input type="date" name="date" min={T()} className={clsInput} required />
                </div>
                <div>
                  <label className={clsLabel}>Time</label>
                  <input type="time" name="time" className={clsInput} defaultValue="10:00" required />
                </div>
              </div>
              <div>
                <label className={clsLabel}>Consultation Modality (Mode)</label>
                <select name="appointment_mode" className={clsInput}>
                  <option value="ONLINE">Online Telehealth Consultation (Video)</option>
                  <option value="OFFLINE">In-Person Sanctuary Consultation (Offline)</option>
                </select>
              </div>
              <button className={`${clsBtnPrimary} w-full mt-4 cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Confirm & Schedule Session
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Scheduled Consultations ({appointments.length})</h3>
            {appointments.length ? (
              appointments.map((a) => (
                <div className={clsRow} key={a.id}>
                  <div className={clsRowHeader}>
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-sm">{a.date} at {a.time}</b>
                        <Chip status={a.status} />
                      </div>
                      <div className="text-xs font-semibold text-teal-800 dark:text-teal-200 mt-0.5">
                        Client: {cn(a.cid)}
                      </div>
                      <div className={`${clsMuted} mt-0.5`}>{a.type}</div>
                      {a.pre?.reason && (
                        <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] mt-1 italic">
                          Client Focus: "{a.pre.reason}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(a.status === 'Requested' || a.status === 'REQUESTED') && (
                        <button
                          className={`${clsBtnPrimary} text-xs py-1 px-2.5 cursor-pointer`}
                          onClick={() => handleConfirmAp(a.id)}
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`}
                        onClick={() => handleCancelAp(a.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState msg="No sessions scheduled at this time." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
