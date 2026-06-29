'use client';

import Image from 'next/image';
import { ImageSquare } from '@phosphor-icons/react';

export interface GalleryImage {
  url: string;
  alt: string;
}

interface PhotoGalleryFallbackProps {
  images?: GalleryImage[];
  /** Optional note explaining why 3D is unavailable. */
  note?: string;
  className?: string;
}

/**
 * Tasteful responsive gallery shown when WebGL / the 3D scene is unavailable.
 * Falls back to a curated default set so the page is never empty.
 */
const DEFAULTS: GalleryImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=70',
    alt: 'Hotel reception and lobby',
  },
  {
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=70',
    alt: 'Luxury suite interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70',
    alt: 'Fine dining restaurant',
  },
  {
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=70',
    alt: 'Cocktail bar and lounge',
  },
  {
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=70',
    alt: 'Events ballroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=70',
    alt: 'Rooftop infinity pool',
  },
];

export function PhotoGalleryFallback({ images, note, className }: PhotoGalleryFallbackProps) {
  const items = images && images.length > 0 ? images : DEFAULTS;

  return (
    <div className={['w-full', className ?? ''].join(' ')}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <div className="rule-gold mx-auto mb-5 w-20" />
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Explore the property
          </h2>
          {note ? (
            <p className="mx-auto mt-3 inline-flex max-w-xl items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1 text-xs text-muted-foreground">
              <ImageSquare size={14} weight="duotone" className="text-accent" />
              {note}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {items.map((img, i) => (
            <figure
              key={`${img.url}-${i}`}
              className={[
                'group relative overflow-hidden rounded-xl border border-border/70 bg-muted',
                // First tile spans larger for an editorial layout.
                i === 0 ? 'col-span-2 row-span-2 aspect-[4/3] md:col-span-2' : 'aspect-[4/3]',
              ].join(' ')}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                unoptimized
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {img.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
