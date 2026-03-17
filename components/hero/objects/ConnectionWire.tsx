'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';

interface ConnectionWireProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  progress?: number;
  flowSpeed?: number;
  active?: boolean;
}

export default function ConnectionWire({
  start,
  end,
  color = '#00D4FF',
  progress = 1,
  flowSpeed = 1,
  active = true,
}: ConnectionWireProps) {
  const lineRef = useRef<THREE.Line & { material: THREE.LineDashedMaterial }>(null);

  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.3,
    (start[2] + end[2]) / 2,
  ];

  useFrame((_, delta) => {
    if (!lineRef.current || !active) return;

    const material = lineRef.current.material as THREE.LineDashedMaterial;
    if (material && 'dashOffset' in material) {
      (material as unknown as { dashOffset: number }).dashOffset -= flowSpeed * delta;
    }
  });

  // Total visible length controlled by progress
  const dashArray = 0.15;
  const gapSize = dashArray * (1 - progress);

  return (
    <QuadraticBezierLine
      ref={lineRef as React.RefObject<never>}
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={2}
      dashed
      dashScale={10}
      dashSize={dashArray}
      gapSize={active ? 0.08 : gapSize}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
}
