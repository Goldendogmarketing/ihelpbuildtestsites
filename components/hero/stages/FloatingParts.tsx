'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Gear from '@/components/hero/objects/Gear';
import ServerNode from '@/components/hero/objects/ServerNode';
import ParticleField from '@/components/hero/objects/ParticleField';
import { MODULE_COLORS } from '@/components/hero/lib/colors';

interface StageProps {
  progress: number;
  globalProgress: number;
  mouseX: number;
  mouseY: number;
}

interface PartConfig {
  type: 'gear' | 'server';
  teeth?: number;
  color: string;
  startPos: [number, number, number];
  freqX: number;
  freqY: number;
  freqZ: number;
  ampX: number;
  ampY: number;
  ampZ: number;
  phase: number;
  rotationSpeed?: number;
}

const PARTS: PartConfig[] = [
  // 4 Gears
  {
    type: 'gear',
    teeth: 12,
    color: MODULE_COLORS.crm.primary,
    startPos: [-1.8, 1.2, -0.5],
    freqX: 0.4, freqY: 0.6, freqZ: 0.3,
    ampX: 0.15, ampY: 0.2, ampZ: 0.1,
    phase: 0,
    rotationSpeed: 0.3,
  },
  {
    type: 'gear',
    teeth: 8,
    color: MODULE_COLORS.marketing.primary,
    startPos: [1.5, 0.8, 0.3],
    freqX: 0.5, freqY: 0.35, freqZ: 0.45,
    ampX: 0.18, ampY: 0.12, ampZ: 0.15,
    phase: 1.2,
    rotationSpeed: -0.5,
  },
  {
    type: 'gear',
    teeth: 10,
    color: MODULE_COLORS.automations.primary,
    startPos: [-0.8, -1.4, 0.6],
    freqX: 0.3, freqY: 0.5, freqZ: 0.25,
    ampX: 0.2, ampY: 0.15, ampZ: 0.12,
    phase: 2.4,
    rotationSpeed: 0.4,
  },
  {
    type: 'gear',
    teeth: 6,
    color: MODULE_COLORS.analytics.primary,
    startPos: [1.2, -1.0, -0.8],
    freqX: 0.55, freqY: 0.4, freqZ: 0.35,
    ampX: 0.12, ampY: 0.18, ampZ: 0.14,
    phase: 3.6,
    rotationSpeed: -0.35,
  },
  // 3 ServerNodes
  {
    type: 'server',
    color: MODULE_COLORS.crm.primary,
    startPos: [0.5, 1.6, -0.3],
    freqX: 0.35, freqY: 0.45, freqZ: 0.55,
    ampX: 0.16, ampY: 0.14, ampZ: 0.1,
    phase: 0.8,
  },
  {
    type: 'server',
    color: MODULE_COLORS.marketing.primary,
    startPos: [-1.5, -0.5, 0.4],
    freqX: 0.45, freqY: 0.3, freqZ: 0.4,
    ampX: 0.14, ampY: 0.2, ampZ: 0.12,
    phase: 1.8,
  },
  {
    type: 'server',
    color: MODULE_COLORS.automations.primary,
    startPos: [2.0, 0.2, -0.6],
    freqX: 0.38, freqY: 0.52, freqZ: 0.28,
    ampX: 0.18, ampY: 0.16, ampZ: 0.13,
    phase: 2.8,
  },
];

export default function FloatingParts({ progress, globalProgress, mouseX, mouseY }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const partRefs = useRef<(THREE.Group | null)[]>([]);

  // Fade out after 55% global progress
  const opacity = globalProgress <= 0.45 ? 1 : Math.max(0, 1 - (globalProgress - 0.45) / 0.1);

  // Drift inward factor when globalProgress > 0.1
  const driftFactor = Math.max(0, Math.min(1, (globalProgress - 0.1) / 0.4));

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();

    // Mouse parallax on entire group
    groupRef.current.position.x = mouseX * 15 * 0.01;
    groupRef.current.position.y = mouseY * 15 * 0.01;

    // Animate each part
    for (let i = 0; i < PARTS.length; i++) {
      const ref = partRefs.current[i];
      if (!ref) continue;

      const part = PARTS[i];
      const t = time + part.phase;

      // Base oscillating position
      const oscX = part.startPos[0] + Math.sin(t * part.freqX) * part.ampX;
      const oscY = part.startPos[1] + Math.cos(t * part.freqY) * part.ampY;
      const oscZ = part.startPos[2] + Math.sin(t * part.freqZ) * part.ampZ;

      // Lerp toward center based on drift factor
      ref.position.x = THREE.MathUtils.lerp(oscX, 0, driftFactor * 0.6);
      ref.position.y = THREE.MathUtils.lerp(oscY, 0, driftFactor * 0.6);
      ref.position.z = THREE.MathUtils.lerp(oscZ, 0, driftFactor * 0.6);
    }
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      {/* Background particle field */}
      <ParticleField count={200} spread={6} />

      {/* Mechanical parts */}
      {PARTS.map((part, i) => (
        <group
          key={i}
          ref={(el) => {
            partRefs.current[i] = el;
          }}
          position={part.startPos}
        >
          {part.type === 'gear' ? (
            <Gear
              teeth={part.teeth!}
              color={part.color}
              rotationSpeed={part.rotationSpeed ?? 0.3}
              emissiveIntensity={0.6 * opacity}
            />
          ) : (
            <ServerNode
              color={part.color}
              scale={opacity}
            />
          )}
        </group>
      ))}
    </group>
  );
}
