'use client';

import { useRef, type ElementRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useTourStore } from '@/store/tour';
import { getZone } from './zones';

/** Imperative handle of drei's OrbitControls (the three-stdlib instance). */
export type OrbitControlsRef = ElementRef<typeof OrbitControls>;

interface CameraRigProps {
  /** Ref to the OrbitControls so we can lerp its target in sync. */
  controls?: React.RefObject<OrbitControlsRef | null>;
}

/**
 * Smoothly lerps the camera (and the OrbitControls target) toward the active
 * zone's framing each frame. No jump cuts — everything eases via frame-rate
 * independent damping.
 */
export function CameraRig({ controls }: CameraRigProps) {
  const zoneId = useTourStore((s) => s.zone);

  // Reusable scratch vectors so we don't allocate per frame.
  const desiredPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());

  useFrame((state, delta) => {
    const zone = getZone(zoneId);
    desiredPos.current.set(...zone.cameraPosition);
    desiredTarget.current.set(...zone.cameraTarget);

    // Frame-rate independent smoothing factor.
    const t = 1 - Math.pow(0.001, delta);

    state.camera.position.lerp(desiredPos.current, t);

    const ctrl = controls?.current;
    if (ctrl) {
      ctrl.target.lerp(desiredTarget.current, t);
      ctrl.update();
    } else {
      state.camera.lookAt(desiredTarget.current);
    }
  });

  return null;
}
