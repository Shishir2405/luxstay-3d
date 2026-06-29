'use client';

import { create } from 'zustand';
import { TOUR_ZONES, type TourZone } from '@/lib/constants';

export type DayNight = 'day' | 'night';

interface TourState {
  /** Active zone the camera is focused on. */
  zone: TourZone;
  setZone: (z: TourZone) => void;

  /** Lighting mood for the scene. */
  dayNight: DayNight;
  toggleDayNight: () => void;

  /** Whether the guest has clicked through the branded entrance overlay. */
  entered: boolean;
  enter: () => void;
}

/** Default landing zone — reception reads as the welcoming "lobby" view. */
const DEFAULT_ZONE: TourZone = TOUR_ZONES.includes('reception') ? 'reception' : TOUR_ZONES[0];

export const useTourStore = create<TourState>((set, get) => ({
  zone: DEFAULT_ZONE,
  setZone: (z) => set({ zone: z }),

  dayNight: 'day',
  toggleDayNight: () => set({ dayNight: get().dayNight === 'day' ? 'night' : 'day' }),

  entered: false,
  enter: () => set({ entered: true }),
}));
