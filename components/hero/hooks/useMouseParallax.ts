import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function useMouseParallax(smoothingFactor = 0.05) {
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX / window.innerWidth;
      target.current.y = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    mouse.current.x = lerp(mouse.current.x, target.current.x, smoothingFactor);
    mouse.current.y = lerp(mouse.current.y, target.current.y, smoothingFactor);
  });

  return mouse;
}
