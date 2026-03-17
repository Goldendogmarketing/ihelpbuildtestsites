'use client';

import { Suspense, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import FloatingParts from './stages/FloatingParts';
import WireframeFoundation from './stages/WireframeFoundation';
import SystemModules from './stages/SystemModules';
import AICore from './stages/AICore';
import EngineActive from './stages/EngineActive';

interface MachineSceneProps {
  globalProgress: number;
  stage: number;
  stageProgress: (i: number) => number;
  mouseX: number;
  mouseY: number;
  quality: 'high' | 'medium' | 'low';
}

export default function MachineScene({
  globalProgress,
  stage,
  stageProgress,
  mouseX,
  mouseY,
  quality,
}: MachineSceneProps) {
  const showPostprocessing = quality !== 'low' && stage >= 3;
  const bloomIntensity = useMemo(() => {
    if (stage < 3) return 0;
    return stageProgress(3) * 0.8 + (stage >= 4 ? stageProgress(4) * 0.7 : 0);
  }, [stage, stageProgress]);

  return (
    <>
      {/* Camera is set on Canvas */}

      {/* Lighting */}
      <ambientLight intensity={0.05} color="#222233" />
      <directionalLight
        position={[0, 4, 2]}
        intensity={1.5}
        color="#99bbff"
        castShadow={false}
      />
      <directionalLight
        position={[2, -1.5, -1]}
        intensity={0.8}
        color="#ffb366"
      />
      <directionalLight
        position={[-2, 2, 1]}
        intensity={0.4}
        color="#8899bb"
      />

      {/* Fog */}
      <fog attach="fog" args={['#050810', 4, 12]} />

      {/* Stages */}
      <Suspense fallback={null}>
        <FloatingParts
          progress={stageProgress(0)}
          globalProgress={globalProgress}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Suspense>

      <Suspense fallback={null}>
        <WireframeFoundation
          progress={stageProgress(1)}
          globalProgress={globalProgress}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Suspense>

      <Suspense fallback={null}>
        <SystemModules
          progress={stageProgress(2)}
          globalProgress={globalProgress}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Suspense>

      {globalProgress > 0.45 && (
        <Suspense fallback={null}>
          <AICore
            progress={stageProgress(3)}
            globalProgress={globalProgress}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        </Suspense>
      )}

      {globalProgress > 0.65 && (
        <Suspense fallback={null}>
          <EngineActive
            progress={stageProgress(4)}
            globalProgress={globalProgress}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        </Suspense>
      )}

      {/* Postprocessing */}
      {showPostprocessing && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            intensity={bloomIntensity}
            radius={0.8}
          />
          {quality === 'high' && (
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.002, 0.002)}
            />
          )}
          <Vignette
            darkness={0.4 * stageProgress(4)}
            offset={0.3}
          />
        </EffectComposer>
      )}
    </>
  );
}
