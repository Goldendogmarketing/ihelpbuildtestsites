'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface StageIndicatorProps {
  currentStage: number;
  stageProgress: number;
}

const STAGE_LABELS = ['Workspace', 'Foundation', 'Systems', 'AI Core', 'Engine'];

const MODULE_COLORS = [
  '#00D4FF', // CRM
  '#FF6B35', // Marketing
  '#A855F7', // Automations
  '#10B981', // Analytics
];

function getStageColor(stage: number, stageProgress: number): string {
  switch (stage) {
    case 0:
      return '#64748b';
    case 1:
      return '#334155';
    case 2: {
      const moduleIndex = Math.min(
        Math.floor(stageProgress * MODULE_COLORS.length),
        MODULE_COLORS.length - 1
      );
      return MODULE_COLORS[moduleIndex];
    }
    case 3:
      return '#FACC15';
    case 4:
      return '#FACC15';
    default:
      return '#64748b';
  }
}

function getStageGradient(stage: number): string | null {
  if (stage === 4) {
    return 'linear-gradient(135deg, #00D4FF, #FF6B35, #A855F7, #10B981, #FACC15)';
  }
  return null;
}

export default function StageIndicator({
  currentStage,
  stageProgress,
}: StageIndicatorProps) {
  const activeColor = useMemo(
    () => getStageColor(currentStage, stageProgress),
    [currentStage, stageProgress]
  );

  const activeGradient = useMemo(
    () => getStageGradient(currentStage),
    [currentStage]
  );

  return (
    <div className="pointer-events-none absolute left-8 top-1/2 z-30 flex -translate-y-1/2 flex-col items-start gap-6">
      {STAGE_LABELS.map((label, index) => {
        const isActive = index === currentStage;

        return (
          <div key={label} className="flex items-center gap-3">
            {/* Dot */}
            <motion.div
              className="relative flex-shrink-0"
              style={{ width: 10, height: 10 }}
              animate={{
                boxShadow: isActive
                  ? `0 0 10px ${activeColor}, 0 0 20px ${activeColor}40`
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-full w-full rounded-full"
                animate={{
                  backgroundColor: isActive
                    ? activeGradient
                      ? undefined
                      : activeColor
                    : 'transparent',
                  borderColor: isActive ? activeColor : '#334155',
                  borderWidth: isActive ? 0 : 1,
                }}
                style={
                  isActive && activeGradient
                    ? { background: activeGradient, border: 'none' }
                    : { borderStyle: 'solid' }
                }
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Label */}
            <motion.span
              className="font-mono text-[9px] uppercase tracking-widest text-slate-400"
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
