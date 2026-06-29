'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bed, Eye, ArrowRight } from '@phosphor-icons/react';
import { listPublicRooms, type PublicRoomType } from '@/lib/api/rooms';
import { formatMoney } from '@/lib/format';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<PublicRoomType[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    listPublicRooms({ limit: 24 })
      .then((res) => {
        setRooms(res.items);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="container py-16 md:py-24">
      <header className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-accent">Accommodations</p>
        <h1 className="font-display text-4xl md:text-5xl">Rooms &amp; Suites</h1>
        <p className="mt-4 text-muted-foreground">
          Choose your space, check live availability, and reserve in a few taps.
        </p>
      </header>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="py-20 text-center text-muted-foreground">
          Couldn&apos;t load rooms right now. Please refresh in a moment.
        </p>
      )}

      {status === 'ready' && rooms.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">
          No rooms are published yet. Check back soon.
        </p>
      )}

      {status === 'ready' && rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {room.images?.[0]?.url ? (
                  <img
                    src={room.images[0].url}
                    alt={room.images[0].alt || room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gold-sheen/10 text-muted-foreground">
                    <Bed size={40} weight="thin" />
                  </div>
                )}
                {room.isFeatured && (
                  <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-display text-2xl transition-colors group-hover:text-accent">
                  {room.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {room.shortDescription || room.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Bed size={15} /> {room.bedType}
                  </span>
                  {room.view && (
                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={15} /> {room.view}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <span className="font-display text-2xl">
                      {formatMoney(room.basePrice, room.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground"> / night</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Book{' '}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
