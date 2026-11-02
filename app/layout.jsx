import './globals.css';
import Link from 'next/link';
import { Inter, Outfit } from 'next/font/google';
import { SITE_NAME, SITE_URL, GO_LIVE } from '../lib/site';
import JsonLd from '../components/JsonLd';
import { siteGraph } from '../lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-outfit', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: plan your own week, beach by beach`, template: `%s | ${SITE_NAME}` },
  description: 'Every named beach in Cornwall with dog rules from Cornwall Council, RNLI lifeguard cover and facilities from OpenStreetMap, each fact linked to its source.',
  // Whole site noindexed until GO_LIVE=true.
  alternates: { canonical: '/' },
  openGraph: { siteName: SITE_NAME, locale: 'en_GB', type: 'website' },
  robots: GO_LIVE ? { index: true, follow: true } : { index: false, follow: false },
};

const NAV = [
  ['Beaches', '/beaches/'],
  ['Dog-friendly', '/beaches/dog-friendly/'],
  ['Things to do', '/things-to-do/'],
  ['Rainy day', '/things-to-do/rainy-day/'],
  ['Towns', '/towns/'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${outfit.variable}`} style={{ '--font-sans': 'var(--font-inter)', '--font-display': 'var(--font-outfit)' }}>
      <body className="flex min-h-screen flex-col font-sans">
        <JsonLd data={siteGraph()} />
        {!GO_LIVE ? <div className="bg-sand-200 px-4 py-1.5 text-center text-xs font-medium text-sand-700">Preview: content still being checked, not yet public.</div> : null}
        <header className="sticky top-0 z-30 border-b border-atlantic-950/5 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-atlantic-900 text-seaglass-300">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
                  <path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
                  <circle cx="16" cy="7" r="3" />
                </svg>
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg font-extrabold text-atlantic-900">{SITE_NAME}</span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
              {NAV.map(([l, h]) => (
                <Link key={h} href={h} className="text-atlantic-900 no-underline hover:text-seaglass-600">{l}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-20 bg-atlantic-950 text-atlantic-100">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-extrabold text-white">{SITE_NAME}</p>
              <p className="mt-2 text-sm text-atlantic-100/70">A family-run guide to planning your own week in Cornwall. Facts come from official and open sources, and every page shows where.</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-white">Explore</p>
              <ul className="space-y-1.5 text-sm">
                {[...NAV, ['Regions', '/#regions']].map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-atlantic-100/80 no-underline hover:text-seaglass-300">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-white">About this guide</p>
              <ul className="space-y-1.5 text-sm">
                {[['About', '/about/'], ['Editorial policy', '/editorial-policy/'], ['Affiliate disclosure', '/affiliate-disclosure/'], ['Corrections', '/corrections/']].map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-atlantic-100/80 no-underline hover:text-seaglass-300">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-atlantic-100/60 sm:px-6">
              Map and facility data ©{' '}
              <a className="text-inherit underline" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL). Dog rules: Cornwall Council. Lifeguard units: RNLI open data. Photos credited individually. Always check signs and the RNLI page on the day.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
