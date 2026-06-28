import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'LuxStay 3D — Walk the property before you book',
    template: '%s · LuxStay 3D',
  },
  description:
    'An immersive 3D hotel & bar experience. Tour rooms, reserve tables, and RSVP to events — all before you arrive.',
  openGraph: {
    type: 'website',
    siteName: 'LuxStay 3D',
    title: 'LuxStay 3D',
    description: 'Walk the property in 3D, then book the perfect stay.',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1713' },
  ],
};

/** Applies the persisted theme before first paint to avoid a flash. */
const themeScript = `(function(){try{var t=localStorage.getItem('luxstay-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
