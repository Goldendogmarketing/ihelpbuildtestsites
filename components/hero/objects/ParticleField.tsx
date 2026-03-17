'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MODULE_COLORS } from '@/components/hero/lib/colors';

interface ParticleFieldProps {
  count?: number;
  spread?: number;
  colors?: string[];
}

const DEFAULT_COLORS = Object.values(MODULE_COLORS).map((m) => m.primary);

interface ParticleData {
  positions: Float32Array;
  colorArray: Float32Array;
  scales: Float32Array;
  speeds: Float32Array;
  phases: Float32Array;
}

export default function ParticleField({
  count = 200,
  spread = 5,
  colors = DEFAULT_COLORS,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleData = useMemo<ParticleData>(() => {
    const positions = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Random position within spread cube
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // Random color from palette
      const hex = colors[Math.floor(Math.random() * colors.length)];
      tempColor.set(hex);
      colorArray[i * 3] = tempColor.r;
      colorArray[i * 3 + 1] = tempColor.g;
      colorArray[i * 3 + 2] = tempColor.b;

      // Random scale 0.5 - 1.5
      scales[i] = 0.5 + Math.random();

      // Random oscillation speed and phase
      speeds[i] = 0.3 + Math.random() * 0.7;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colorArray, scales, speeds, phases };
  }, [count, spread, colors]);

  // Set initial instance colors on mount
  useMemo(() => {
    if (!meshRef.current) return;
    const tempColor = new THREE.Color();
    for (let i = 0; i < count; i++) {
      tempColor.setRGB(
        particleData.colorArray[i * 3],
        particleData.colorArray[i * 3 + 1],
        particleData.colorArray[i * 3 + 2]
      );
      meshRef.current.setColorAt(i, tempColor);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particleData, count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const { positions, scales, speeds, phases, colorArray } = particleData;

    // Set colors on first frame if not yet set
    if (meshRef.current.instanceColor === null) {
      const tempColor = new THREE.Color();
      for (let i = 0; i < count; i++) {
        tempColor.setRGB(
          colorArray[i * 3],
          colorArray[i * 3 + 1],
          colorArray[i * 3 + 2]
        );
        meshRef.current.setColorAt(i, tempColor);
      }
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }

    for (let i = 0; i < count; i++) {
      const baseX = positions[i * 3];
      const baseY = positions[i * 3 + 1];
      const baseZ = positions[i * 3 + 2];

      // Gentle sine oscillation on Y
      const yOffset = Math.sin(time * speeds[i] + phases[i]) * 0.05;

      dummy.position.set(baseX, baseY + yOffset, baseZ);
      const s = scales[i];
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.008, 6, 6]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
