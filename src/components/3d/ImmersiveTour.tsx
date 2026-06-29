'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { detectWebGL } from './webgl-support';
import { HotelScene } from './HotelScene';
import { CameraRig, type OrbitControlsRef } from './CameraRig';
import { LoadingScreen } from './LoadingScreen';
import { HotelEntrance } from './HotelEntrance';
import { ZoneNav } from './ZoneNav';
import { PhotoGalleryFallback } from './PhotoGalleryFallback';
import { useTourStore } from '@/store/tour';

/**
 * Top-level tour orchestrator.
 *
 * 1. SSR-safe: WebGL is probed only after mount.
 * 2. No WebGL  → graceful photo gallery fallback.
 * 3. WebGL ok  → branded entrance, then the live Canvas (Suspense + loader)
 *    with the camera rig and the DOM zone-nav overlay.
 */
export function ImmersiveTour() {
  const entered = useTourStore((s) => s.entered);
  const controlsRef = useRef<OrbitControlsRef>(null);

  // `null` = not yet probed (SSR / first paint); avoids hydration mismatch.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  // Before probe completes, render a neutral branded shell (no WebGL work).
  if (webgl === null) {
    return <div className="h-[100dvh] w-full bg-background" aria-hidden />;
  }

  if (!webgl) {
    return (
      <div className="min-h-[100dvh] w-full bg-background">
        <PhotoGalleryFallback note="Your device or browser doesn’t support WebGL, so we’re showing a photo tour instead." />
      </div>
    );
  }

  if (!entered) {
    return (
      <div className="h-[100dvh] w-full">
        <HotelEntrance />
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 3.2, 9], fov: 55, near: 0.1, far: 200 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <HotelScene />
        </Suspense>
        <CameraRig controls={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={3}
          maxDistance={28}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>

      {/* DOM overlay — outside the Canvas for crisp, accessible controls. */}
      <ZoneNav />
    </div>
  );
}
