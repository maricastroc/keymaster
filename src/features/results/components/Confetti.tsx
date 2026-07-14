'use client';

import { useMemo } from 'react';

const COLORS = ['#dbb942', '#f5d47a', '#4DD67B', '#4CA6FF', '#ca4754', '#fdf3c8'];
const PIECE_COUNT = 44;

export const Confetti = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => {
        const left = Math.random() * 100;
        const drift = `${(Math.random() - 0.5) * 40}vw`;
        const spin = `${540 + Math.random() * 540}deg`;
        const duration = `${2 + Math.random() * 1.6}s`;
        const delay = `${Math.random() * 0.4}s`;
        const size = 6 + Math.random() * 6;
        const color = COLORS[i % COLORS.length];
        const rounded = i % 3 === 0;
        return { left, drift, spin, duration, delay, size, color, rounded, id: i };
      }),
    []
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              backgroundColor: p.color,
              borderRadius: p.rounded ? '9999px' : '2px',
              '--drift': p.drift,
              '--spin': p.spin,
              '--duration': p.duration,
              '--delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
