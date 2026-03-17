'use client';

import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import MachineScene from './MachineScene';
import HeadlineReveal from './overlays/HeadlineReveal';
import StageIndicator from './overlays/StageIndicator';
import ScrollPrompt from './overlays/ScrollPrompt';
import ProgressBar from './overlays/ProgressBar';
import { useScrollStage } from './hooks/useScrollStage';
import { useAdaptiveQuality } from './hooks/useAdaptiveQuality';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const [mouseState, setMouseState] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const quality = useAdaptiveQuality();

  const { stage, stageProgress } = useScrollStage(globalProgress);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Smooth mouse lerp loop
    const lerp = () => {
      smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * 0.05;
      smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * 0.05;
      setMouseState({ x: smoothMouse.current.x, y: smoothMouse.current.y });
      rafRef.current = requestAnimationFrame(lerp);
    };
    rafRef.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Lenis + GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          setGlobalProgress(self.progress);
        },
      },
    });

    // Add a simple tween so the timeline has content
    tl.to({}, { duration: 1 });

    return () => {
      lenis.destroy();
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const dpr: [number, number] = quality.tier === 'high' ? [1, 2] : quality.tier === 'medium' ? [1, 1.5] : [1, 1];

  return (
    <div ref={heroContainerRef} className="relative" style={{ height: '500vh' }}>
      {/* Fixed canvas */}
      <div className="fixed inset-0 w-screen h-screen" style={{ zIndex: 1 }}>
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 1.5, 4], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: quality.tier !== 'low', alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#050810' }}
        >
          <Suspense fallback={null}>
            <MachineScene
              globalProgress={globalProgress}
              stage={stage}
              stageProgress={stageProgress}
              mouseX={mouseState.x}
              mouseY={mouseState.y}
              quality={quality.tier}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <StageIndicator currentStage={stage} stageProgress={stageProgress(stage)} />
        <ScrollPrompt visible={globalProgress < 0.05} />
        <ProgressBar progress={globalProgress} />
        <HeadlineReveal active={stage >= 4 && stageProgress(4) > 0.3} />
      </div>
    </div>
  );
}
