export const MOODS = [
  { val: 1, icon: 'sentiment_very_dissatisfied', label: 'Depleted', desc: 'Low energy & overwhelmed' },
  { val: 2, icon: 'sentiment_dissatisfied', label: 'Guarded', desc: 'Tense or feeling vulnerable' },
  { val: 3, icon: 'sentiment_neutral', label: 'Steady', desc: 'Neutral, present, functional' },
  { val: 4, icon: 'sentiment_satisfied', label: 'Grounded', desc: 'Calm, focused, connected' },
  { val: 5, icon: 'sentiment_very_satisfied', label: 'Vital', desc: 'Energized, joyful, uplifted' }
];

export const E = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];

export const NS = [
  ['c-home', 'Overview', 'dashboard'],
  ['c-clients', 'Clients', 'groups'],
  ['c-docs', 'Client Files', 'folder_shared'],
  ['c-schedule', 'Schedule', 'calendar_month'],
  ['c-notes', 'Session Notes', 'edit_note'],
  ['c-plans', 'Care Plans', 'fact_check'],
  ['c-notif', 'Notifications', 'notifications']
];

export const NC = [
  ['cl-home', 'Dashboard', 'dashboard'],
  ['cl-mood', 'Mood Journal', 'wb_sunny'],
  ['cl-book', 'Book Session', 'add_circle'],
  ['cl-sessions', 'My Sessions', 'calendar_month'],
  ['cl-goals', 'My Goals', 'check_circle'],
  ['cl-files', 'Documents', 'upload_file'],
  ['cl-res', 'Wellbeing Toolkit', 'local_florist'],
  ['cl-notif', 'Notifications', 'notifications']
];

// Tailwind Reusable Class Presets
export const clsInput =
  'w-full px-3.5 py-2.5 border border-[#dde7e3] dark:border-[#23403f] rounded-[10px] bg-white dark:bg-[#14292a] text-[#14302c] dark:text-[#e3efec] focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400 transition-colors text-sm';
export const clsTextarea = `${clsInput} min-h-[96px] resize-y`;
export const clsLabel = 'block text-[13px] font-semibold mt-3 mb-1.5 text-[#14302c] dark:text-[#e3efec]';
export const clsBtnPrimary =
  'inline-flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition shadow-xs text-sm';
export const clsBtnSecondary =
  'inline-flex items-center justify-center gap-1.5 bg-[#e3f1ee] hover:bg-[#d5ede8] dark:bg-[#173b3a] dark:hover:bg-[#1f4e4d] text-[#0b5a54] dark:text-teal-300 font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition text-sm';
export const clsBtnDanger =
  'inline-flex items-center justify-center gap-1.5 bg-[#fde8e4] hover:bg-[#fbd3cc] dark:bg-[#3b1f1b] dark:hover:bg-[#502923] text-[#b3392a] dark:text-[#f4a496] font-semibold rounded-[10px] px-4 py-2 cursor-pointer transition text-sm';
export const clsCard =
  'bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] rounded-2xl p-5 shadow-sm min-w-0 transition-colors';
export const clsCardTitle = 'font-serif text-lg font-bold mt-0 mb-3 text-[#14302c] dark:text-[#e3efec]';
export const clsRow = 'py-3 border-b border-[#dde7e3] dark:border-[#23403f] last:border-b-0';
export const clsRowHeader = 'flex justify-between items-center gap-2.5 flex-wrap';
export const clsMuted = 'text-[#5f7571] dark:text-[#8fa8a3] text-[13px]';
