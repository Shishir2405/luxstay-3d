'use client';

import dynamic from 'next/dynamic';

// The 3D tour is WebGL — load it client-only so it never runs during SSR.
const ImmersiveTour = dynamic(
  () => import('@/components/3d/ImmersiveTour').then((m) => m.ImmersiveTour),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
        Preparing your 3D tour…
      </div>
    ),
  },
);

export default function TourPage() {
  return <ImmersiveTour />;
}
