'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface HeadlineRevealProps {
  active: boolean;
}

const HEADLINE = 'Build Smarter Business';
const SUBTEXT = 'Systems \u00B7 Software \u00B7 AI \u00B7 Growth';

export default function HeadlineReveal({ active }: HeadlineRevealProps) {
  const characters = useMemo(() => HEADLINE.split(''), []);
  const totalCharDuration = characters.length * 0.03 + 0.8;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[20vh] z-30 flex flex-col items-center justify-center">
      <AnimatePresence>
        {active && (
          <>
            <h1
              className="font-grotesk text-5xl font-bold text-[#f1f5f9] md:text-7xl"
              style={{
                textShadow: '0 0 40px rgba(250,204,21,0.3)',
              }}
              aria-label={HEADLINE}
            >
              {characters.map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.03,
                    ease: 'easeOut',
                  }}
                  className="inline-block"
                  style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: totalCharDuration + 0.5,
                ease: 'easeOut',
              }}
              className="mt-4 font-mono text-sm uppercase tracking-[4px] text-slate-500"
            >
              {SUBTEXT}
            </motion.p>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
