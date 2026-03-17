'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import ServerNode from '@/components/hero/objects/ServerNode';
import GlassPanel from '@/components/hero/objects/GlassPanel';
import { MODULE_COLORS } from '@/components/hero/lib/colors';

interface StageProps {
  progress: number;
  globalProgress: number;
  mouseX: number;
  mouseY: number;
}

interface ModuleConfig {
  key: keyof typeof MODULE_COLORS;
  entryPos: [number, number, number];
  dockPos: [number, number, number];
  staggerOffset: number;
}

const MODULES: ModuleConfig[] = [
  {
    key: 'crm',
    entryPos: [-3, 3, 0],
    dockPos: [-0.8, 0.6, 0],
    staggerOffset: 0,
  },
  {
    key: 'marketing',
    entryPos: [3, 3, 0],
    dockPos: [0.8, 0.6, 0],
    staggerOffset: 0.1,
  },
  {
    key: 'automations',
    entryPos: [-3, -3, 0],
    dockPos: [-0.8, -0.6, 0],
    staggerOffset: 0.2,
  },
  {
    key: 'analytics',
    entryPos: [3, -3, 0],
    dockPos: [0.8, -0.6, 0],
    staggerOffset: 0.3,
  },
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function bounceScale(moduleProgress: number): number {
  if (moduleProgress < 0.9) return 1;
  // Subtle bounce: overshoot to 1.08 then settle to 1.0
  const bounceT = (moduleProgress - 0.9) / 0.1;
  const bounce = Math.sin(bounceT * Math.PI) * 0.08;
  return 1 + bounce;
}

export default function SystemModules({ progress, globalProgress, mouseX, mouseY }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const moduleRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Mouse parallax
    groupRef.current.position.x = mouseX * 8 * 0.01;
    groupRef.current.position.y = mouseY * 8 * 0.01;

    // Animate each module
    for (let i = 0; i < MODULES.length; i++) {
      const ref = moduleRefs.current[i];
      if (!ref) continue;

      const mod = MODULES[i];

      // Staggered progress calculation
      const rawProgress = (progress - mod.staggerOffset) * 1.5;
      const moduleProgress = Math.max(0, Math.min(1, rawProgress));
      const easedProgress = easeOutCubic(moduleProgress);

      // Lerp from entry to dock
      ref.position.x = THREE.MathUtils.lerp(mod.entryPos[0], mod.dockPos[0], easedProgress);
      ref.position.y = THREE.MathUtils.lerp(mod.entryPos[1], mod.dockPos[1], easedProgress);
      ref.position.z = THREE.MathUtils.lerp(mod.entryPos[2], mod.dockPos[2], easedProgress);

      // Bounce scale on arrival
      const s = bounceScale(moduleProgress);
      ref.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {MODULES.map((mod, i) => {
        const color = MODULE_COLORS[mod.key].primary;

        return (
          <group
            key={mod.key}
            ref={(el) => {
              moduleRefs.current[i] = el;
            }}
            position={mod.entryPos}
          >
            {/* ServerNode on the left side of the module */}
            <ServerNode
              color={color}
              position={[-0.18, 0, 0]}
              scale={0.8}
            />

            {/* GlassPanel on the right side of the module */}
            <GlassPanel
              tintColor={color}
              position={[0.12, 0, 0.01]}
              scale={[0.35, 0.25, 1]}
              opacity={0.25}
            />
          </group>
        );
      })}
    </group>
  );
}
