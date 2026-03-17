'use client';

import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import ConnectionWire from '@/components/hero/objects/ConnectionWire';
import { MODULE_COLORS } from '@/components/hero/lib/colors';

interface StageProps {
  progress: number;
  globalProgress: number;
  mouseX: number;
  mouseY: number;
}

// Module dock positions (must match SystemModules.tsx)
const MODULE_DOCKS: { key: keyof typeof MODULE_COLORS; pos: [number, number, number] }[] = [
  { key: 'crm', pos: [-0.8, 0.6, 0] },
  { key: 'marketing', pos: [0.8, 0.6, 0] },
  { key: 'automations', pos: [-0.8, -0.6, 0] },
  { key: 'analytics', pos: [0.8, -0.6, 0] },
];

const CENTER: [number, number, number] = [0, 0, 0];

/**
 * Custom easeOutElastic function for scale animation.
 * t should be 0-1. Returns value that overshoots 1 then settles.
 */
function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const p = 0.4;
  const s = p / 4;
  return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
}

function AICoreModel({ progress }: { progress: number }) {
  const { scene } = useGLTF('/models/AICore.glb');
  const modelRef = useRef<THREE.Group>(null);

  // Scale with elastic easing
  const rawScale = Math.min(1, progress * 1.3);
  const elasticScale = rawScale > 0 ? easeOutElastic(rawScale) : 0;

  useFrame((_, delta) => {
    if (!modelRef.current) return;

    // Slow rotation on Y axis
    modelRef.current.rotation.y += 0.3 * delta;

    // Update emissive intensity on all mesh materials
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          mat.emissiveIntensity = progress * 2;
        }
      }
    });
  });

  return (
    <group ref={modelRef} scale={[elasticScale, elasticScale, elasticScale]}>
      <primitive object={scene} />
    </group>
  );
}

export default function AICore({ progress, globalProgress, mouseX, mouseY }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    // Mouse parallax (minimal - anchored feel)
    groupRef.current.position.x = mouseX * 4 * 0.01;
    groupRef.current.position.y = mouseY * 4 * 0.01;
  });

  // Point light intensity
  const lightIntensity = THREE.MathUtils.lerp(0, 3, progress);

  return (
    <group ref={groupRef}>
      {/* AI Core 3D model */}
      <Suspense fallback={null}>
        <AICoreModel progress={progress} />
      </Suspense>

      {/* Central point light */}
      <pointLight
        position={CENTER}
        color={MODULE_COLORS.aiCore.primary}
        intensity={lightIntensity}
        distance={5}
        decay={2}
      />

      {/* Connection wires from each module dock to center */}
      {MODULE_DOCKS.map((dock) => (
        <ConnectionWire
          key={dock.key}
          start={dock.pos}
          end={CENTER}
          color={MODULE_COLORS[dock.key].primary}
          progress={progress}
          active={progress > 0.3}
          flowSpeed={1.5}
        />
      ))}
    </group>
  );
}

// Preload the GLB model
useGLTF.preload('/models/AICore.glb');
