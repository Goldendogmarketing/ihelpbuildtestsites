'use client';

import { useRef } from 'react';
import * as THREE from 'three';

interface GlassPanelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  tintColor?: string;
  opacity?: number;
}

export default function GlassPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  tintColor = '#00D4FF',
  opacity = 0.3,
}: GlassPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        color={tintColor}
        transmission={0.6}
        roughness={0.15}
        metalness={0}
        thickness={0.05}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
