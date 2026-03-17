'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScrollPromptProps {
  visible: boolean;
}

function MouseIcon() {
  return (
    <svg
      width="24"
      height="38"
      viewBox="0 0 24 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-slate-500"
    >
      {/* Mouse body */}
      <rect
        x="1"
        y="1"
        width="22"
        height="36"
        rx="11"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Scroll wheel dot - animated */}
      <motion.circle
        cx="12"
        r="2"
        fill="currentColor"
        animate={{ cy: [10, 18, 10] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  );
}

export default function ScrollPrompt({ visible }: ScrollPromptProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Bouncing mouse icon */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <MouseIcon />
            </motion.div>

            {/* Label */}
            <span className="font-mono text-xs uppercase tracking-[3px] text-slate-500">
              Scroll to assemble
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
