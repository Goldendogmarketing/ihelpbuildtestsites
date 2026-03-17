'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ProgressBarProps {
  progress: number;
}

const TRACK_HEIGHT = 200;

const GRADIENT_STOPS = [
  { offset: '0%', color: '#00D4FF' },   // CRM (bottom)
  { offset: '25%', color: '#FF6B35' },   // Marketing
  { offset: '50%', color: '#A855F7' },   // Automations
  { offset: '75%', color: '#10B981' },   // Analytics
  { offset: '100%', color: '#FACC15' },  // AI Core (top)
];

function getColorAtProgress(t: number): string {
  const colors = [
    [0, 212, 255],   // #00D4FF
    [255, 107, 53],   // #FF6B35
    [168, 85, 247],   // #A855F7
    [16, 185, 129],   // #10B981
    [250, 204, 21],   // #FACC15
  ];

  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (colors.length - 1);
  const index = Math.floor(segment);
  const frac = segment - index;

  if (index >= colors.length - 1) {
    const c = colors[colors.length - 1];
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const a = colors[index];
  const b = colors[index + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * frac);
  const g = Math.round(a[1] + (b[1] - a[1]) * frac);
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac);

  return `rgb(${r}, ${g}, ${bl})`;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const fillHeight = clampedProgress * TRACK_HEIGHT;

  const dotColor = useMemo(
    () => getColorAtProgress(clampedProgress),
    [clampedProgress]
  );

  const gradientId = 'progress-gradient';

  return (
    <div
      className="pointer-events-none absolute right-8 top-1/2 z-30 -translate-y-1/2"
      style={{ height: TRACK_HEIGHT }}
    >
      {/* SVG for gradient definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
            {GRADIENT_STOPS.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
      </svg>

      {/* Track */}
      <div
        className="relative rounded-full"
        style={{
          width: 2,
          height: TRACK_HEIGHT,
          backgroundColor: '#1e293b',
        }}
      >
        {/* Fill - grows from bottom */}
        <motion.div
          className="absolute bottom-0 left-0 w-full rounded-full"
          style={{
            background: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>")`,
          }}
          animate={{ height: fillHeight }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `linear-gradient(to top, #00D4FF, #FF6B35, #A855F7, #10B981, #FACC15)`,
            }}
          />
        </motion.div>

        {/* Glowing dot at top of fill */}
        {clampedProgress > 0 && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            animate={{
              bottom: fillHeight - 2,
              boxShadow: `0 0 8px ${dotColor}, 0 0 16px ${dotColor}60`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: dotColor,
            }}
          />
        )}
      </div>
    </div>
  );
}
