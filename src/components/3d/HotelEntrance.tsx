'use client';

import { ArrowRight, Cube } from '@phosphor-icons/react';
import { Button } from '@/components/ui';
import { useTourStore } from '@/store/tour';

/**
 * Branded click-to-enter overlay. Sets the cinematic tone before the heavy 3D
 * scene mounts and lets the guest opt in (so we never autoplay WebGL work).
 */
export function HotelEntrance() {
  const enter = useTourStore((s) => s.enter);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-primary text-primary-foreground">
      {/* Ambient gold glow + faint grid for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,hsl(var(--accent)/0.28),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:48px_48px] opacity-[0.06]" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center animate-fade-in-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-medium text-primary-foreground/80">
          <Cube size={14} weight="duotone" className="text-accent" />
          Immersive 3D experience
        </span>

        <h1 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Step inside <span className="text-accent">LuxStay</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-pretty text-base text-primary-foreground/70 sm:text-lg">
          Glide through reception, the suites, our rooftop pool and the bar — a guided walk of the
          property before you ever book.
        </p>

        <div className="mt-9 flex items-center justify-center">
          <Button
            size="lg"
            variant="accent"
            onClick={enter}
            rightIcon={<ArrowRight size={18} weight="bold" />}
          >
            Enter the tour
          </Button>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-primary-foreground/50">
          Best with sound on · drag to look around
        </p>
      </div>
    </div>
  );
}
