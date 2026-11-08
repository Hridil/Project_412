import React from 'react';
import {
  clsInput,
  clsTextarea,
  clsLabel,
  clsBtnPrimary,
  clsMuted
} from '../../data/constants.js';

export default function AuthScreen({
  role,
  setRole,
  isSignup,
  setIsSignup,
  handleLogin,
  handleSignup
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0c3b37] to-teal-800 text-white p-12 lg:p-16">
        <div>
          <div className="flex items-center gap-2 text-2xl font-serif font-bold text-teal-200">
            <span className="material-symbols-outlined text-3xl">spa</span>
            <span>MindCare Sanctuary</span>
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mt-6 mb-4">
            Calm, clinical excellence for every mind.
          </h1>
          <p className="text-teal-100/90 text-base max-w-md leading-relaxed">
            A modern, trauma-informed digital practice management platform bridging practitioners and clients with serene simplicity.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-teal-100">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
              <span>Secure practitioner triage & intake workflow</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
              <span>Continuous 7-day mood pacing and trajectory charts</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
              <span>Integrated care plans, session notes, and document vault</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-teal-300 text-[20px]">check_circle</span>
              <span>Evidence-based box breathing & sensory grounding tools</span>
            </li>
          </ul>
        </div>

        {/* Serene sunrise artwork */}
        <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl bg-teal-900/60 p-2">
          <svg viewBox="0 0 400 240" className="w-full h-auto rounded-xl" role="img" aria-label="Serene sanctuary illustration">
            <defs>
              <linearGradient id="artSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde0c2" />
                <stop offset="60%" stopColor="#a3faef" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#artSky)" />
            <circle cx="280" cy="90" r="50" fill="#fffaf0" opacity="0.85" />
            <circle cx="280" cy="90" r="70" fill="#fffaf0" opacity="0.25" />
            <path d="M0 160 Q 100 120 200 150 T 400 140 L 400 240 L 0 240 Z" fill="#2dd4bf" opacity="0.6" />
            <path d="M0 185 Q 120 150 240 180 T 400 170 L 400 240 L 0 240 Z" fill="#0f766e" opacity="0.85" />
            <path d="M0 210 Q 140 185 260 210 T 400 200 L 400 240 L 0 240 Z" fill="#0c3b37" />
            <g fill="#fffaf0">
              <circle cx="150" cy="155" r="8" />
              <path d="M138 185 Q 150 160 162 185 Z" />
              <ellipse cx="150" cy="186" rx="20" ry="6" />
            </g>
          </svg>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-xl font-serif font-bold text-teal-700 dark:text-teal-400 lg:hidden mb-4">
            <span className="material-symbols-outlined text-2xl">spa</span>
            <span>MindCare Sanctuary</span>
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#14302c] dark:text-[#e3efec]">
            {isSignup ? 'Apply for Clinical Intake' : 'Sign in to Sanctuary'}
          </h2>
          <p className={`${clsMuted} mt-1 mb-6`}>
            {isSignup ? 'Create a secure client portal profile.' : 'Access your practice or client wellbeing space.'}
          </p>

          {/* Role Switcher Tabs */}
          <div className="flex p-1 bg-[#e3f1ee] dark:bg-[#173b3a] rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                role === 'consultant'
                  ? 'bg-white dark:bg-[#14292a] text-teal-800 dark:text-teal-200 shadow-xs'
                  : 'text-[#5f7571] dark:text-[#8fa8a3]'
              }`}
              onClick={() => setRole('consultant')}
            >
              Consultant
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                role === 'client'
                  ? 'bg-white dark:bg-[#14292a] text-teal-800 dark:text-teal-200 shadow-xs'
                  : 'text-[#5f7571] dark:text-[#8fa8a3]'
              }`}
              onClick={() => setRole('client')}
            >
              Client
            </button>
          </div>

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={clsLabel}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  className={clsInput}
                  defaultValue={role === 'consultant' ? 'demo@mindcare.com' : 'jamie@example.com'}
                  required
                />
              </div>
              <div>
                <label className={clsLabel}>Password</label>
                <input
                  name="pw"
                  type="password"
                  className={clsInput}
                  defaultValue={role === 'consultant' ? 'MindCare123' : 'Jamie1234'}
                  required
                />
              </div>
              <button className={`${clsBtnPrimary} w-full mt-2 py-2.5`}>
                Sign In as {role === 'consultant' ? 'Consultant' : 'Client'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className={clsLabel}>Full Name</label>
                <input name="name" className={clsInput} placeholder="e.g. Alex Morgan" required />
              </div>
              <div>
                <label className={clsLabel}>Email Address</label>
                <input name="email" type="email" className={clsInput} placeholder="alex@example.com" required />
              </div>
              <div>
                <label className={clsLabel}>Choose Password (min 8 characters)</label>
                <input name="pw" type="password" minLength={8} className={clsInput} required />
              </div>
              <div>
                <label className={clsLabel}>Intake Reflection: What would you like help with?</label>
                <textarea name="reason" className={clsTextarea} placeholder="Stress, anxiety, mindfulness, work burnout..." />
              </div>
              <button className={`${clsBtnPrimary} w-full mt-2 py-2.5`}>
                Submit Intake Application
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-[#5f7571] dark:text-[#8fa8a3]">
            {role === 'client' &&
              (isSignup ? (
                <p>
                  Already have an active client account?{' '}
                  <button type="button" className="text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer" onClick={() => setIsSignup(false)}>
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  New patient applying for intake?{' '}
                  <button type="button" className="text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer" onClick={() => setIsSignup(true)}>
                    Create client profile
                  </button>
                </p>
              ))}
          </div>

          {/* Demo Quick Credentials Card */}
          <div className="mt-8 p-4 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] border border-teal-700/20 text-xs text-[#0b5a54] dark:text-teal-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Demo Credentials Pre-configured</span>
            </div>
            <div><b>Consultant:</b> demo@mindcare.com / MindCare123</div>
            <div><b>Client (Jamie):</b> jamie@example.com / Jamie1234</div>
            <div><b>New Client (Demo):</b> client@mindcare.com / Client123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
