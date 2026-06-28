import Link from 'next/link';
import {
  Cube,
  Cursor,
  CalendarCheck,
  Wine,
  Confetti,
  ArrowRight,
  Star,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui';

const FEATURES = [
  {
    icon: Cube,
    title: 'Walk it in 3D',
    body: 'Step through reception, suites, the rooftop and the bar in a guided 3D tour before you commit.',
  },
  {
    icon: CalendarCheck,
    title: 'Real-time availability',
    body: 'Live inventory and an availability calendar mean the room you see is the room you get.',
  },
  {
    icon: Wine,
    title: 'Reserve the night',
    body: 'Book a table, pick your tier, and RSVP to events with a QR pass waiting at the door.',
  },
];

const ZONES = [
  { icon: Cursor, label: 'Reception' },
  { icon: Cube, label: 'Suites' },
  { icon: Wine, label: 'Bar & Lounge' },
  { icon: Confetti, label: 'Events' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--accent)/0.14),transparent_70%)]" />
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Immersive booking · Now in 3D
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Walk the property before you ever <span className="text-accent">book the room.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              LuxStay 3D turns browsing into an experience. Tour suites, the rooftop pool and the
              bar in real time — then reserve your stay, table or event in a few taps.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/tour">
                <Button
                  size="lg"
                  variant="accent"
                  rightIcon={<ArrowRight size={18} weight="bold" />}
                >
                  Start the 3D tour
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" variant="outline">
                  Browse rooms
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star size={16} weight="fill" className="text-accent" /> 4.9 guest rating
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} weight="fill" className="text-success" /> Secure Razorpay
                checkout
              </span>
            </div>
          </div>

          {/* Hero visual placeholder for the 3D canvas (built in the 3D module) */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary to-primary/80 shadow-xl">
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-primary-foreground">
                <Cube size={48} weight="duotone" className="text-accent" />
                <p className="text-sm text-primary-foreground/70">
                  Interactive 3D scene loads here
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border/70 bg-card p-4 shadow-lg sm:block">
              <p className="text-xs text-muted-foreground">Tonight from</p>
              <p className="font-display text-2xl font-semibold">
                ₹8,900<span className="text-sm font-normal text-muted-foreground"> / night</span>
              </p>
            </div>
          </div>
        </div>

        {/* Zone strip */}
        <div className="border-y border-border/60 bg-surface-sunken/40">
          <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-5">
            {ZONES.map((z) => (
              <span
                key={z.label}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground"
              >
                <z.icon size={18} weight="duotone" className="text-accent" />
                {z.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rule-gold mx-auto mb-6 w-24" />
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            A stay you can see coming
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything a modern property needs — and everything a guest wishes they had before
            booking.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <f.icon size={22} weight="duotone" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,hsl(var(--accent)/0.25),transparent)]" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Your suite is one tour away.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-primary-foreground/70">
            Explore the property in 3D and lock in your dates with secure online payment.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tour">
              <Button size="lg" variant="accent" rightIcon={<ArrowRight size={18} weight="bold" />}>
                Take the 3D tour
              </Button>
            </Link>
            <Link href="/rooms">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                See availability
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
