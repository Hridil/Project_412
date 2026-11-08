import React from 'react';
import {
  clsBtnPrimary,
  clsCard,
  clsCardTitle,
  clsMuted
} from '../../data/constants.js';

export default function WellbeingToolkit({
  isBreathing,
  setIsBreathing,
  breathPhaseIndex,
  breathCycle,
  somaticLevel,
  setSomaticLevel
}) {
  const breathPhases = [
    { name: 'Inhale gently', prompt: 'Fill your chest with calm air (4s)', ring: 'scale-110 border-teal-500' },
    { name: 'Hold serene pause', prompt: 'Retain stillness with relaxed shoulders (4s)', ring: 'scale-110 border-teal-300' },
    { name: 'Exhale slowly', prompt: 'Release all tension out through your mouth (4s)', ring: 'scale-90 border-teal-700' },
    { name: 'Rest and release', prompt: 'Rest at empty lungs with quiet mind (4s)', ring: 'scale-90 border-teal-800' }
  ];

  const somaticFeedback = {
    1: 'Serene · Grounded in total autonomic safety',
    2: 'Gentle · Mild calm with open awareness',
    3: 'Steady · Functioning with equilibrium',
    4: 'Guarded · Mild bodily tightness or flutter',
    5: 'Restless · Racing thoughts or shallow breathing',
    6: 'Elevated · Sympathetic nervous system arousal',
    7: 'Distressed · High muscle tension and vigilance',
    8: 'Acute · Overwhelmed, intense stress activation',
    9: 'Severe · Near panic, tunnel vision present',
    10: 'Crisis · Extreme distress, immediate crisis care needed'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-bold m-0 text-[#14302c] dark:text-[#e3efec]">
            Wellbeing Sanctuary Toolkit
          </h1>
          <p className={`${clsMuted} mt-1`}>
            Evidence-based nervous system regulation, somatic pacing, and autonomic grounding tools.
          </p>
        </div>
        <a
          href="tel:988"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496] font-bold text-xs hover:opacity-90 transition shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          <span>Immediate Crisis Support: 988</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guided Box Breathing */}
        <div className={clsCard}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={clsCardTitle}>Guided Box Breathing (4-4-4-4)</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200 font-semibold">
              Vagus Nerve Pacing
            </span>
          </div>
          <p className={`${clsMuted} mb-6`}>
            Square breathing balances heart rate variability (HRV) and soothes acute sensory stress.
          </p>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <div
                className={`w-40 h-40 rounded-full border-4 border-dashed transition-all duration-1000 flex flex-col items-center justify-center p-4 text-center ${
                  isBreathing
                    ? `${breathPhases[breathPhaseIndex].ring} bg-teal-50 dark:bg-teal-950/40 shadow-lg`
                    : 'border-[#dde7e3] dark:border-[#23403f] bg-transparent'
                }`}
              >
                {isBreathing ? (
                  <>
                    <span className="material-symbols-outlined text-3xl text-teal-700 dark:text-teal-400 mb-1">
                      air
                    </span>
                    <b className="text-sm text-[#14302c] dark:text-[#e3efec]">
                      {breathPhases[breathPhaseIndex].name}
                    </b>
                    <span className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] mt-0.5">
                      Cycle {breathCycle} of 4
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-teal-700/60 dark:text-teal-400/60 mb-1">
                      spa
                    </span>
                    <span className="text-xs font-semibold text-[#5f7571] dark:text-[#8fa8a3]">Ready to begin</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] text-center max-w-sm mb-4 h-6">
              {isBreathing ? breathPhases[breathPhaseIndex].prompt : 'Take a comfortable posture and press start.'}
            </p>

            <button
              className={`${clsBtnPrimary} px-6 py-2.5 text-sm cursor-pointer`}
              onClick={() => setIsBreathing(!isBreathing)}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBreathing ? 'pause' : 'play_arrow'}
              </span>
              <span>{isBreathing ? 'Pause Session' : 'Start Box Breathing'}</span>
            </button>
          </div>
        </div>

        {/* 5-4-3-2-1 Sensory Grounding */}
        <div className={clsCard}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={clsCardTitle}>5-4-3-2-1 Sensory Grounding</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200 font-semibold">
              Cognitive Anchoring
            </span>
          </div>
          <p className={`${clsMuted} mb-4`}>
            Direct attention outward to immediately disrupt anxiety spirals and somatic overwhelm.
          </p>

          <div className="space-y-3">
            {[
              ['5', 'Things you can SEE', 'A soft shadow, sunlight on the floor, texture on a book cover.'],
              ['4', 'Things you can TOUCH', 'The cool desk surface, the fabric of your sleeve, your breath in your palms.'],
              ['3', 'Sounds you can HEAR', 'Distant traffic hum, birds outside the glass, quiet room fan.'],
              ['2', 'Scents you can SMELL', 'Fresh morning coffee, cedar breeze, clean textile linen.'],
              ['1', 'Truth you can TASTE or AFFIRM', 'I am safe in this room. My nervous system is returning to balance.']
            ].map(([num, title, hint]) => (
              <div key={num} className="p-3 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-xs shrink-0">
                  {num}
                </div>
                <div>
                  <b className="text-xs text-[#14302c] dark:text-[#e3efec]">{title}</b>
                  <p className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] mt-0.5 m-0 leading-relaxed">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Somatic SUDS Distress Gauge */}
      <div className={clsCard}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={clsCardTitle}>Somatic Distress SUDS Gauge (1–10)</h3>
          <span className="text-xs font-semibold text-teal-800 dark:text-teal-200">
            Subjective Units of Disturbance
          </span>
        </div>
        <p className={`${clsMuted} mb-6`}>
          A clinical scale used in trauma CBT to calibrate current nervous system activation.
        </p>

        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#5f7571] dark:text-[#8fa8a3]">
            <span>1 (Total Serenity)</span>
            <span>5 (Moderate Tension)</span>
            <span>10 (Peak Overwhelm)</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={somaticLevel}
            onChange={(e) => setSomaticLevel(+e.target.value)}
            className="w-full accent-teal-700 dark:accent-teal-400 cursor-pointer"
          />

          <div className="p-4 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#5f7571] dark:text-[#8fa8a3] uppercase tracking-wider">
                Current Level {somaticLevel} / 10
              </span>
              <div className="font-serif font-bold text-base text-teal-900 dark:text-teal-200 mt-0.5">
                {somaticFeedback[somaticLevel]}
              </div>
            </div>
            {somaticLevel >= 7 && (
              <a
                href="tel:988"
                className="px-3 py-1.5 rounded-lg bg-[#b3392a] text-white text-xs font-bold hover:opacity-90 transition shrink-0"
              >
                Call 988 Support
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 24/7 Hotlines & Sanctuary Grounding Practices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={clsCard}>
          <div className="flex items-center gap-2 mb-2 text-[#b3392a] dark:text-[#f4a496]">
            <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
            <b className="text-sm">988 Suicide & Crisis Lifeline</b>
          </div>
          <p className={`${clsMuted} leading-relaxed`}>
            Free, confidential support available 24/7 across the US via call or text to 988.
          </p>
        </div>

        <div className={clsCard}>
          <div className="flex items-center gap-2 mb-2 text-teal-700 dark:text-teal-400">
            <span className="material-symbols-outlined text-[20px]">directions_walk</span>
            <b className="text-sm">Gentle Movement</b>
          </div>
          <p className={`${clsMuted} leading-relaxed`}>
            A brief 10 to 15 minute walk in daylight activates endorphins and reduces cortisol accumulation.
          </p>
        </div>

        <div className={clsCard}>
          <div className="flex items-center gap-2 mb-2 text-[#6c8ebf]">
            <span className="material-symbols-outlined text-[20px]">people</span>
            <b className="text-sm">Safe Connection</b>
          </div>
          <p className={`${clsMuted} leading-relaxed`}>
            Reach out to one supportive person or peer today. Even a short exchange reinforces relational security.
          </p>
        </div>
      </div>
    </div>
  );
}
