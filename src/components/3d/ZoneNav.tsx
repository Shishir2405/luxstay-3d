'use client';

import {
  DoorOpen,
  Bed,
  ForkKnife,
  Wine,
  Confetti,
  Buildings,
  Waves,
  Sun,
  Moon,
  type Icon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';
import { useTourStore } from '@/store/tour';
import { ZONES } from './zones';
import type { TourZone } from '@/lib/constants';

/** Phosphor icon per zone. */
const ZONE_ICONS: Record<TourZone, Icon> = {
  entrance: DoorOpen,
  reception: DoorOpen,
  rooms: Bed,
  restaurant: ForkKnife,
  bar: Wine,
  events: Confetti,
  rooftop: Buildings,
  pool: Waves,
};

/**
 * Fixed overlay with zone jump buttons + a day/night toggle. Pure DOM (not
 * inside the Canvas) so it stays crisp and accessible.
 */
export function ZoneNav() {
  const activeZone = useTourStore((s) => s.zone);
  const setZone = useTourStore((s) => s.setZone);
  const dayNight = useTourStore((s) => s.dayNight);
  const toggleDayNight = useTourStore((s) => s.toggleDayNight);

  return (
    <>
      {/* Zone rail — bottom center */}
      <nav
        aria-label="Tour zones"
        className="pointer-events-auto fixed inset-x-0 bottom-5 z-20 flex justify-center px-4"
      >
        <div className="glass flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1.5 shadow-lg">
          {ZONES.map((zone) => {
            const ZoneIcon = ZONE_ICONS[zone.id];
            const active = zone.id === activeZone;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => setZone(zone.id)}
                aria-pressed={active}
                title={zone.label}
                className={cn(
                  'group inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium',
                  'transition-colors duration-150 ease-out-expo',
                  active
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground',
                )}
              >
                <ZoneIcon
                  size={18}
                  weight={active ? 'fill' : 'duotone'}
                  className={active ? '' : 'text-accent'}
                />
                <span className="hidden sm:inline">{zone.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Day / night toggle — top right */}
      <div className="pointer-events-auto fixed right-5 top-5 z-20">
        <button
          type="button"
          onClick={toggleDayNight}
          aria-label={dayNight === 'day' ? 'Switch to night' : 'Switch to day'}
          title={dayNight === 'day' ? 'Switch to night' : 'Switch to day'}
          className="glass inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors hover:bg-muted/70"
        >
          {dayNight === 'day' ? (
            <Moon size={20} weight="duotone" className="text-foreground/80" />
          ) : (
            <Sun size={20} weight="fill" className="text-accent" />
          )}
        </button>
      </div>
    </>
  );
}
