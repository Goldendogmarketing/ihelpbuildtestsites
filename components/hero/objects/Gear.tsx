'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GearProps {
  teeth?: number;
  module?: number;
  thickness?: number;
  boreRadius?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  rotationSpeed?: number;
  emissiveIntensity?: number;
}

export default function Gear({
  teeth = 12,
  module: gearModule = 0.08,
  thickness = 0.06,
  boreRadius = 0.02,
  color = '#00D4FF',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationSpeed = 0.3,
  emissiveIntensity = 0.6,
}: GearProps) {
  const groupRef = useRef<THREE.Group>(null);

  const gearGeometry = useMemo(() => {
    const pitchRadius = (teeth * gearModule) / 2;
    const outerRadius = pitchRadius + gearModule;
    const rootRadius = pitchRadius - gearModule * 1.25;
    const toothArc = (Math.PI * 2) / teeth;

    const shape = new THREE.Shape();

    // Build gear profile: walk around the circle creating tooth bumps
    const segments = teeth * 8; // 8 segments per tooth for smooth profile
    const points: THREE.Vector2[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const toothPhase = (angle % toothArc) / toothArc;

      let radius: number;
      // Tooth profile: flat top, flat root, with angled transitions
      if (toothPhase < 0.15) {
        // Rising flank
        const t = toothPhase / 0.15;
        radius = rootRadius + (outerRadius - rootRadius) * t;
      } else if (toothPhase < 0.35) {
        // Tooth tip
        radius = outerRadius;
      } else if (toothPhase < 0.5) {
        // Falling flank
        const t = (toothPhase - 0.35) / 0.15;
        radius = outerRadius - (outerRadius - rootRadius) * t;
      } else {
        // Root
        radius = rootRadius;
      }

      points.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
    }

    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();

    // Center bore hole
    const holePath = new THREE.Path();
    const holeSegments = 32;
    holePath.moveTo(boreRadius, 0);
    for (let i = 1; i <= holeSegments; i++) {
      const angle = (i / holeSegments) * Math.PI * 2;
      holePath.lineTo(Math.cos(angle) * boreRadius, Math.sin(angle) * boreRadius);
    }
    shape.holes.push(holePath);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }, [teeth, gearModule, thickness, boreRadius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh geometry={gearGeometry}>
        <meshStandardMaterial
          color="#0a0f1a"
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
