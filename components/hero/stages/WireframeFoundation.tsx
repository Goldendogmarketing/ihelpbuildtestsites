'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

interface StageProps {
  progress: number;
  globalProgress: number;
  mouseX: number;
  mouseY: number;
}

/**
 * Define wireframe segments as pairs of [start, end] points.
 * The layout represents a simplified website wireframe viewed head-on.
 * Coordinates are in a ~3.2 x 2.4 unit space centered at origin.
 */
function createWireframeSegments(): [number, number, number][][] {
  const W = 1.6;   // half width
  const H = 1.2;   // half height
  const segments: [number, number, number][][] = [];

  // Browser chrome bar (top)
  const chromeTop = H;
  const chromeBottom = H - 0.15;
  // Outer rectangle
  segments.push([[-W, chromeTop, 0], [W, chromeTop, 0]]);
  segments.push([[W, chromeTop, 0], [W, chromeBottom, 0]]);
  segments.push([[W, chromeBottom, 0], [-W, chromeBottom, 0]]);
  segments.push([[-W, chromeBottom, 0], [-W, chromeTop, 0]]);

  // 3 dots in browser chrome
  const dotY = (chromeTop + chromeBottom) / 2;
  const dotR = 0.025;
  for (let d = 0; d < 3; d++) {
    const cx = -W + 0.12 + d * 0.08;
    const pts: [number, number, number][] = [];
    for (let s = 0; s <= 8; s++) {
      const a = (s / 8) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * dotR, dotY + Math.sin(a) * dotR, 0]);
    }
    segments.push(pts);
  }

  // Navigation bar
  const navTop = chromeBottom;
  const navBottom = navTop - 0.1;
  segments.push([[-W, navBottom, 0], [W, navBottom, 0]]);

  // Nav items (small rectangles)
  for (let n = 0; n < 4; n++) {
    const nx = -W + 0.3 + n * 0.35;
    segments.push([[nx, navTop - 0.02, 0], [nx + 0.2, navTop - 0.02, 0]]);
    segments.push([[nx + 0.2, navTop - 0.02, 0], [nx + 0.2, navBottom + 0.02, 0]]);
    segments.push([[nx + 0.2, navBottom + 0.02, 0], [nx, navBottom + 0.02, 0]]);
    segments.push([[nx, navBottom + 0.02, 0], [nx, navTop - 0.02, 0]]);
  }

  // Large hero section
  const heroTop = navBottom - 0.05;
  const heroBottom = heroTop - 0.55;
  segments.push([[-W + 0.05, heroTop, 0], [W - 0.05, heroTop, 0]]);
  segments.push([[W - 0.05, heroTop, 0], [W - 0.05, heroBottom, 0]]);
  segments.push([[W - 0.05, heroBottom, 0], [-W + 0.05, heroBottom, 0]]);
  segments.push([[-W + 0.05, heroBottom, 0], [-W + 0.05, heroTop, 0]]);

  // Horizontal line in hero (text placeholder)
  const heroMidY = (heroTop + heroBottom) / 2 + 0.08;
  segments.push([[-W + 0.3, heroMidY, 0], [W - 0.3, heroMidY, 0]]);
  segments.push([[-W + 0.5, heroMidY - 0.08, 0], [W - 0.5, heroMidY - 0.08, 0]]);

  // 3-column content grid
  const gridTop = heroBottom - 0.08;
  const gridBottom = gridTop - 0.45;
  const colW = (2 * W - 0.3) / 3; // column width
  const gap = 0.05;

  for (let c = 0; c < 3; c++) {
    const lx = -W + 0.05 + c * (colW + gap);
    const rx = lx + colW;
    segments.push([[lx, gridTop, 0], [rx, gridTop, 0]]);
    segments.push([[rx, gridTop, 0], [rx, gridBottom, 0]]);
    segments.push([[rx, gridBottom, 0], [lx, gridBottom, 0]]);
    segments.push([[lx, gridBottom, 0], [lx, gridTop, 0]]);

    // Inner text lines
    const lineY1 = gridTop - 0.08;
    const lineY2 = gridTop - 0.16;
    segments.push([[lx + 0.05, lineY1, 0], [rx - 0.05, lineY1, 0]]);
    segments.push([[lx + 0.05, lineY2, 0], [rx - 0.15, lineY2, 0]]);
  }

  // Footer bar
  const footerTop = gridBottom - 0.05;
  const footerBottom = -H;
  segments.push([[-W, footerTop, 0], [W, footerTop, 0]]);
  segments.push([[W, footerTop, 0], [W, footerBottom, 0]]);
  segments.push([[W, footerBottom, 0], [-W, footerBottom, 0]]);
  segments.push([[-W, footerBottom, 0], [-W, footerTop, 0]]);

  // Footer content lines
  const fMidY = (footerTop + footerBottom) / 2;
  segments.push([[-W + 0.2, fMidY, 0], [-W + 0.8, fMidY, 0]]);
  segments.push([[W - 0.8, fMidY, 0], [W - 0.2, fMidY, 0]]);

  return segments;
}

export default function WireframeFoundation({ progress, globalProgress, mouseX, mouseY }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);

  const wireframeSegments = useMemo(() => createWireframeSegments(), []);

  // Scale from 0.7 to 1.0
  const scale = 0.7 + progress * 0.3;

  // Fade out after globalProgress 0.55
  const fadeOpacity = globalProgress <= 0.55
    ? 1
    : Math.max(0, 1 - (globalProgress - 0.55) / 0.15);

  useFrame(() => {
    if (!groupRef.current) return;

    // Mouse parallax
    groupRef.current.position.x = mouseX * 8 * 0.01;
    groupRef.current.position.y = mouseY * 8 * 0.01;
  });

  if (fadeOpacity <= 0) return null;

  return (
    <group ref={groupRef} rotation={[-0.1, 0, 0]} scale={[scale, scale, scale]}>
      {wireframeSegments.map((points, i) => {
        // Each line has a different draw-in delay based on its index
        const totalSegments = wireframeSegments.length;
        const segDelay = (i / totalSegments) * 0.6; // stagger over 60% of progress
        const segProgress = Math.max(0, Math.min(1, (progress - segDelay) / 0.4));

        // dashOffset controls how much of the line is visible
        // Total length varies per segment; we use a normalized approach
        const lineLength = computeLineLength(points);
        const dashTotal = lineLength;
        const visibleLength = dashTotal * segProgress;

        return (
          <Line
            key={i}
            points={points}
            color="#334155"
            lineWidth={1.5}
            dashed
            dashSize={visibleLength}
            gapSize={dashTotal - visibleLength + 0.001}
            dashScale={1}
            transparent
            opacity={fadeOpacity * 0.9}
          />
        );
      })}
    </group>
  );
}

function computeLineLength(points: [number, number, number][]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    const dz = points[i][2] - points[i - 1][2];
    length += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return length;
}
