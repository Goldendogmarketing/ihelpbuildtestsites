'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import ParticleField from '@/components/hero/objects/ParticleField';
import { MODULE_COLORS } from '@/components/hero/lib/colors';

interface StageProps {
  progress: number;
  globalProgress: number;
  mouseX: number;
  mouseY: number;
}

/** Generate a sine-wave line with animated offset */
function generateGraphPoints(
  time: number,
  offset: number,
  baseX: number,
  baseY: number,
  pointCount: number,
  width: number,
  amplitude: number
): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    const x = baseX + t * width;
    const y = baseY + Math.sin(t * Math.PI * 2.5 + time * 1.8 + offset) * amplitude;
    points.push([x, y, 0.05]);
  }
  return points;
}

export default function EngineActive({ progress, globalProgress, mouseX, mouseY }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const light3Ref = useRef<THREE.PointLight>(null);
  const graph1Ref = useRef<[number, number, number][]>([]);
  const graph2Ref = useRef<[number, number, number][]>([]);

  // Static initial graph points (updated each frame via Line re-render)
  const [graphPoints1, setGraphPoints1] = [
    useRef<[number, number, number][]>(generateGraphPoints(0, 0, 0.5, -0.7, 8, 0.6, 0.08)),
    (pts: [number, number, number][]) => { graph1Ref.current = pts; },
  ];
  const [graphPoints2, setGraphPoints2] = [
    useRef<[number, number, number][]>(generateGraphPoints(0, 1.5, 0.5, -0.9, 8, 0.6, 0.06)),
    (pts: [number, number, number][]) => { graph2Ref.current = pts; },
  ];

  // Use refs that trigger re-renders for graph lines via a counter
  const frameCounterRef = useRef(0);
  const graphUpdateRef = useRef({ g1: graphPoints1.current, g2: graphPoints2.current });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const intensityMult = progress;

    // Pulse point lights
    if (light1Ref.current) {
      light1Ref.current.intensity = (1.5 + Math.sin(time * 2.0) * 0.8) * intensityMult;
    }
    if (light2Ref.current) {
      light2Ref.current.intensity = (1.2 + Math.sin(time * 2.5 + 1.0) * 0.6) * intensityMult;
    }
    if (light3Ref.current) {
      light3Ref.current.intensity = (1.0 + Math.sin(time * 1.8 + 2.0) * 0.7) * intensityMult;
    }

    // Update graph points
    graphUpdateRef.current.g1 = generateGraphPoints(time, 0, 0.5, -0.7, 8, 0.6, 0.08 * intensityMult);
    graphUpdateRef.current.g2 = generateGraphPoints(time, 1.5, 0.5, -0.9, 8, 0.6, 0.06 * intensityMult);

    // Mouse parallax
    groupRef.current.position.x = mouseX * 4 * 0.01;
    groupRef.current.position.y = mouseY * 4 * 0.01;

    frameCounterRef.current += 1;
  });

  // Graph visualization colors
  const analyticsColor = MODULE_COLORS.analytics.primary;

  return (
    <group ref={groupRef}>
      {/* Pulsing point lights around the scene */}
      <pointLight
        ref={light1Ref}
        position={[-1.2, 0.8, 0.5]}
        color={MODULE_COLORS.crm.primary}
        intensity={0}
        distance={4}
        decay={2}
      />
      <pointLight
        ref={light2Ref}
        position={[1.2, 0.8, 0.5]}
        color={MODULE_COLORS.marketing.primary}
        intensity={0}
        distance={4}
        decay={2}
      />
      <pointLight
        ref={light3Ref}
        position={[0, -0.5, 1]}
        color={MODULE_COLORS.aiCore.primary}
        intensity={0}
        distance={4}
        decay={2}
      />

      {/* Large ambient particle burst */}
      <ParticleField count={80} spread={8} />

      {/* Animated graph visualizations near analytics area */}
      <AnimatedGraph
        baseX={0.5}
        baseY={-0.7}
        color={analyticsColor}
        pointCount={8}
        width={0.6}
        amplitude={0.08}
        timeOffset={0}
        intensity={progress}
      />
      <AnimatedGraph
        baseX={0.5}
        baseY={-0.9}
        color={analyticsColor}
        pointCount={8}
        width={0.6}
        amplitude={0.06}
        timeOffset={1.5}
        intensity={progress}
      />

      {/* Emissive boost plane (subtle bloom enhancer) */}
      <mesh position={[0, 0, -1]} visible={progress > 0.1}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial
          color="#000000"
          emissive={MODULE_COLORS.aiCore.primary}
          emissiveIntensity={progress * 0.15}
          transparent
          opacity={progress * 0.1}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Self-animating graph line component */
function AnimatedGraph({
  baseX,
  baseY,
  color,
  pointCount,
  width,
  amplitude,
  timeOffset,
  intensity,
}: {
  baseX: number;
  baseY: number;
  color: string;
  pointCount: number;
  width: number;
  amplitude: number;
  timeOffset: number;
  intensity: number;
}) {
  const pointsRef = useRef<[number, number, number][]>([]);
  const lineRef = useRef<THREE.Line>(null);

  // Initial points
  const initialPoints = useMemo(
    () => generateGraphPoints(0, timeOffset, baseX, baseY, pointCount, width, amplitude),
    [baseX, baseY, pointCount, width, amplitude, timeOffset]
  );

  useFrame(({ clock }) => {
    if (!lineRef.current) return;

    const time = clock.getElapsedTime();
    const pts = generateGraphPoints(time, timeOffset, baseX, baseY, pointCount, width, amplitude * intensity);

    // Update geometry positions directly
    const geometry = lineRef.current.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute('position');

    if (posAttr && posAttr.count === pts.length) {
      for (let i = 0; i < pts.length; i++) {
        posAttr.setXYZ(i, pts[i][0], pts[i][1], pts[i][2]);
      }
      posAttr.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  });

  return (
    <Line
      ref={lineRef as React.RefObject<never>}
      points={initialPoints}
      color={color}
      lineWidth={2}
      transparent
      opacity={intensity * 0.8}
    />
  );
}
