'use client';

import { Html, useProgress } from '@react-three/drei';

/**
 * Branded progressive loading screen, rendered as a drei <Html> overlay inside
 * the Canvas Suspense fallback. Reads real asset progress via useProgress.
 */
export function LoadingScreen() {
  const { progress, active } = useProgress();
  const pct = Math.min(100, Math.round(progress));

  return (
    <Html center fullscreen>
      <div className="flex h-full w-full flex-col items-center justify-center bg-background/95 text-foreground">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            LuxStay <span className="text-accent">3D</span>
          </p>

          <div className="h-px w-40 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

          <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gold-sheen transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {active ? `Preparing your tour · ${pct}%` : 'Almost there…'}
          </p>
        </div>
      </div>
    </Html>
  );
}
