'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls, Stage } from '@react-three/drei';
import { PhotoGalleryFallback, type GalleryImage } from './PhotoGalleryFallback';
import { LoadingScreen } from './LoadingScreen';
import type { Vec3 } from './zones';

export interface Hotspot {
  label: string;
  position: Vec3;
}

interface RoomWalkthroughProps {
  /** URL of a .glb/.gltf room model. If omitted, renders the photo gallery. */
  modelUrl?: string;
  /** Images for the fallback gallery when no model is supplied. */
  images?: GalleryImage[];
  /** Optional labelled points of interest overlaid on the model. */
  hotspots?: Hotspot[];
  className?: string;
}

/* The loaded glTF model. Suspends while loading. */
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/* A floating Html hotspot marker pinned to a 3D point. */
function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  return (
    <Html position={hotspot.position} center distanceFactor={6}>
      <div className="pointer-events-none flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
        </span>
        <span className="whitespace-nowrap rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
          {hotspot.label}
        </span>
      </div>
    </Html>
  );
}

/**
 * Single-room walkthrough. If a model URL is supplied it loads the glTF inside a
 * Canvas with Suspense + hotspots; otherwise it gracefully degrades to the
 * responsive photo gallery.
 */
export function RoomWalkthrough({ modelUrl, images, hotspots, className }: RoomWalkthroughProps) {
  if (!modelUrl) {
    return (
      <PhotoGalleryFallback
        images={images}
        className={className}
        note="An interactive 3D model isn’t available for this room yet."
      />
    );
  }

  return (
    <div className={['relative h-full min-h-[24rem] w-full', className ?? ''].join(' ')}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 1.6, 5], fov: 50 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Stage environment="apartment" intensity={0.5} adjustCamera={1.1}>
            <Model url={modelUrl} />
          </Stage>
          {hotspots?.map((h, i) => (
            <HotspotMarker key={`${h.label}-${i}`} hotspot={h} />
          ))}
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
