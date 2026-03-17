'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';

interface ServerNodeProps {
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export default function ServerNode({
  color = '#00D4FF',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: ServerNodeProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Main hexagonal body */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 6]} />
        <meshStandardMaterial
          color="#0a0f1a"
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Top circuit disc */}
      <mesh position={[0, 0.021, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.002, 6]} />
        <meshStandardMaterial
          color="#050a12"
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner circuit ring detail */}
      <mesh position={[0, 0.022, 0]}>
        <ringGeometry args={[0.04, 0.06, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, 0.023, 0]}>
        <circleGeometry args={[0.015, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
