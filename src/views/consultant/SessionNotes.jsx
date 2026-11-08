import React from 'react';
import {
  clsBtnPrimary,
  clsBtnDanger,
  clsCard,
  clsCardTitle,
  clsMuted,
  clsInput,
  clsTextarea,
  clsLabel,
  clsRow,
  clsRowHeader
} from '../../data/constants.js';
import Chip from '../../components/common/Chip.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function SessionNotes({
  S,
  cn,
  handleAddNote,
  handleDeleteItem
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Clinical Session Notes</h1>
        <p className={`${clsMuted} mt-1`}>Private clinical documentation, observations, and therapeutic progression notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Compose Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className={clsLabel}>Client</label>
                <select name="cid" className={clsInput} required>
                  <option value="">Select accepted client...</option>
                  {S.cl.filter((c) => c.status === 'Accepted').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={clsLabel}>Subject / Title</label>
                <input name="title" className={clsInput} placeholder="e.g. Cognitive restructuring review" required />
              </div>
              <div>
                <label className={clsLabel}>Classification</label>
                <select name="tag" className={clsInput}>
                  <option>Session summary</option>
                  <option>Observation</option>
                  <option>Follow-up</option>
                  <option>Therapeutic Plan</option>
                </select>
              </div>
              <div>
                <label className={clsLabel}>Clinical Observations</label>
                <textarea name="body" className={clsTextarea} placeholder="Record observations, responses to CBT interventions, and next goals..." required />
              </div>
              <button className={`${clsBtnPrimary} w-full mt-4 cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Note
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Saved Documentation</h3>
            {S.nt.length ? (
              S.nt.map((n) => (
                <div className={clsRow} key={n.id}>
                  <div className={clsRowHeader}>
                    <div>
                      <b className="text-sm">{n.title}</b>
                      <div className={clsMuted}>{cn(n.cid)} · {n.date}</div>
                    </div>
                    <Chip status={n.tag} />
                  </div>
                  <p className="text-sm my-2.5 text-[#14302c] dark:text-[#e3efec] whitespace-pre-wrap">{n.body}</p>
                  <button className={`${clsBtnDanger} text-xs py-1 px-2.5 cursor-pointer`} onClick={() => handleDeleteItem('nt', n.id)}>
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete Note
                  </button>
                </div>
              ))
            ) : (
              <EmptyState msg="No clinical notes recorded yet." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
