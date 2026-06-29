'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Bed, Eye, Ruler, Users, Check, ArrowLeft } from '@phosphor-icons/react';
import { getPublicRoom, type PublicRoomType } from '@/lib/api/rooms';
import { BookingWidget } from '@/components/modules/booking/booking-widget';

export default function RoomDetailPage() {
  const params = useParams<{ slug: string }>();
  const [room, setRoom] = useState<PublicRoomType | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!params?.slug) return;
    getPublicRoom(params.slug)
      .then((r) => {
        setRoom(r);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [params?.slug]);

  if (status === 'loading') {
    return (
      <div className="container grid gap-8 py-16 lg:grid-cols-3">
        <div className="skeleton aspect-[4/3] rounded-2xl lg:col-span-2" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error' || !room) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">This room isn&apos;t available.</p>
        <Link href="/rooms" className="mt-4 inline-block text-accent">
          ← Back to all rooms
        </Link>
      </div>
    );
  }

  const hero = room.images?.[0]?.url;
  const gallery = room.images?.slice(1, 5) ?? [];

  return (
    <div className="container py-10 md:py-16">
      <Link
        href="/rooms"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> All rooms
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            {hero ? (
              <img src={hero} alt={room.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Bed size={56} weight="thin" />
              </div>
            )}
          </div>

          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={img.url}
                    alt={img.alt || room.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Accommodation</p>
            <h1 className="mt-2 font-display text-4xl">{room.name}</h1>

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users size={16} /> Up to {room.maxAdults} adults
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bed size={16} /> {room.bedType}
              </span>
              {room.view && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={16} /> {room.view} view
                </span>
              )}
              {room.sizeSqft > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler size={16} /> {room.sizeSqft} sq ft
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-foreground/80">{room.description}</p>

            {room.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl">Amenities</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {room.amenities.map((a) => (
                    <li key={a.id} className="inline-flex items-center gap-2 text-sm">
                      <Check size={16} className="text-accent" /> {a.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {room.model3dUrl && (
              <Link
                href="/tour"
                className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium hover:border-accent"
              >
                Walk this room in 3D →
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingWidget room={room} />
          </div>
        </div>
      </div>
    </div>
  );
}
