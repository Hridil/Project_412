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

export default function CarePlans({
  S,
  T,
  cn,
  handleAddPlan,
  handleDeleteItem
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">Care Plans</h1>
        <p className={`${clsMuted} mt-1`}>Holistic, supportive action steps tailored to each client.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Assign Action Step</h3>
            <form onSubmit={handleAddPlan} className="space-y-3">
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
                <label className={clsLabel}>Goal Title</label>
                <input name="title" className={clsInput} placeholder="e.g. 10-minute mindfulness breathing" required />
              </div>
              <div>
                <label className={clsLabel}>Target Completion Date</label>
                <input type="date" name="due" min={T()} className={clsInput} />
              </div>
              <div>
                <label className={clsLabel}>Guidance & Steps</label>
                <textarea name="details" className={clsTextarea} placeholder="Supportive guidance for the client..." />
              </div>
              <button className={`${clsBtnPrimary} w-full mt-4 cursor-pointer`}>
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                Add to Care Plan
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className={clsCard}>
            <h3 className={clsCardTitle}>Active & Completed Steps</h3>
            {S.pl.length ? (
              S.pl.map((p) => (
                <div className={clsRow} key={p.id}>
                  <div className={clsRowHeader}>
                    <div>
                      <b className="text-sm">{p.title}</b>
                      <div className={clsMuted}>
                        Client: {cn(p.cid)} {p.due ? `· Target: ${p.due}` : ''}
                      </div>
                    </div>
                    <Chip status={p.done ? 'Completed' : 'In progress'} />
                  </div>
                  {p.details && <p className="text-sm my-2 text-[#5f7571] dark:text-[#8fa8a3]">{p.details}</p>}
                  <button className={`${clsBtnDanger} text-xs py-1 px-2.5 mt-1 cursor-pointer`} onClick={() => handleDeleteItem('pl', p.id)}>
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Remove Step
                  </button>
                </div>
              ))
            ) : (
              <EmptyState msg="No care plan items configured." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
