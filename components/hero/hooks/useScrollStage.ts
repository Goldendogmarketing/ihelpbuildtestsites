import { useMemo } from 'react';

const STAGE_RANGES: [number, number][] = [
  [0, 0.15],    // Stage 0
  [0.15, 0.35], // Stage 1
  [0.35, 0.55], // Stage 2
  [0.55, 0.75], // Stage 3
  [0.75, 1.0],  // Stage 4
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useScrollStage(globalProgress: number) {
  const stage = useMemo(() => {
    for (let i = STAGE_RANGES.length - 1; i >= 0; i--) {
      if (globalProgress >= STAGE_RANGES[i][0]) return i;
    }
    return 0;
  }, [globalProgress]);

  const stageProgress = useMemo(() => {
    return (stageIndex: number): number => {
      const [start, end] = STAGE_RANGES[stageIndex] ?? [0, 1];
      const range = end - start;
      if (range === 0) return 0;
      return clamp((globalProgress - start) / range, 0, 1);
    };
  }, [globalProgress]);

  return { stage, stageProgress, globalProgress };
}
