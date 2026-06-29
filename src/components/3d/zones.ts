import type { TourZone } from '@/lib/constants';

export type Vec3 = [number, number, number];

export interface ZoneDef {
  /** Stable id — matches a value in TOUR_ZONES. */
  id: TourZone;
  /** Human-facing label for nav + Html markers. */
  label: string;
  /** Short descriptor shown in the zone marker tooltip. */
  blurb: string;
  /** World position of the zone's marker / focal point. */
  position: Vec3;
  /** Where the camera should look when this zone is active. */
  cameraTarget: Vec3;
  /** Where the camera should fly to when this zone is active. */
  cameraPosition: Vec3;
  /** Accent color for the marker + label (hex). */
  color: string;
}

/**
 * Stylized property layout. Positions are laid out across a single ground plane
 * so the camera can glide between named experiences (reception → suites →
 * dining → bar → events → rooftop/pool) without jump cuts.
 */
export const ZONES: ZoneDef[] = [
  {
    id: 'reception',
    label: 'Reception',
    blurb: 'Check in & concierge',
    position: [0, 1, 0],
    cameraTarget: [0, 1, 0],
    cameraPosition: [0, 3.2, 9],
    color: '#caa14a',
  },
  {
    id: 'rooms',
    label: 'Suites',
    blurb: 'Rooms & suites',
    position: [-9, 1, -3],
    cameraTarget: [-9, 1, -3],
    cameraPosition: [-9, 2.8, 4],
    color: '#b8893f',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    blurb: 'Fine dining',
    position: [9, 1, -3],
    cameraTarget: [9, 1, -3],
    cameraPosition: [9, 2.8, 4],
    color: '#cf9a4d',
  },
  {
    id: 'bar',
    label: 'Bar & Lounge',
    blurb: 'Cocktails & lounge',
    position: [-9, 1, -12],
    cameraTarget: [-9, 1, -12],
    cameraPosition: [-9, 2.6, -5],
    color: '#a87b3a',
  },
  {
    id: 'events',
    label: 'Events',
    blurb: 'Banquet & ballroom',
    position: [9, 1, -12],
    cameraTarget: [9, 1, -12],
    cameraPosition: [9, 3, -5],
    color: '#d2a455',
  },
  {
    id: 'rooftop',
    label: 'Rooftop',
    blurb: 'Skyline terrace',
    position: [0, 5.5, -18],
    cameraTarget: [0, 5.5, -18],
    cameraPosition: [0, 7.5, -10],
    color: '#e0b765',
  },
  {
    id: 'pool',
    label: 'Pool',
    blurb: 'Infinity pool',
    position: [0, 5, -24],
    cameraTarget: [0, 5, -24],
    cameraPosition: [0, 7, -17],
    color: '#7fb3c4',
  },
];

/** Lookup a zone definition, falling back to the first zone. */
export function getZone(id: TourZone): ZoneDef {
  return ZONES.find((z) => z.id === id) ?? ZONES[0]!;
}
