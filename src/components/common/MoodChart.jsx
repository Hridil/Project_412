import React from 'react';
import EmptyState from './EmptyState.jsx';

export default function MoodChart({ values }) {
  if (!values || values.length < 2) {
    return <EmptyState msg="Log at least two check-ins to view the trend trajectory." />;
  }

  const w = 520;
  const h = 150;
  const p = 18;
  const pt = values.map((y, i) => [
    p + (i * (w - 2 * p)) / (values.length - 1),
    h - p - ((y - 1) * (h - 2 * p)) / 4
  ]);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto text-teal-700 dark:text-teal-400"
      role="img"
      aria-label="Mood trend chart"
    >
      <path
        d={`M${pt.map((q) => q.join(',')).join('L')}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pt.map((q, idx) => (
        <circle
          key={idx}
          cx={q[0]}
          cy={q[1]}
          r="5"
          className="fill-teal-700 dark:fill-teal-400 stroke-white dark:stroke-[#14292a] stroke-2"
        />
      ))}
    </svg>
  );
}
