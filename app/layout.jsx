import './globals.css';
import Link from 'next/link';
import { Inter, Fraunces } from 'next/font/google';
import { SITE_NAME, SITE_URL, GO_LIVE } from '../lib/site';
import JsonLd from '../components/JsonLd';
import { siteGraph } from '../lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz', 'SOFT'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: plan your favourite week of the year`, template: `%s | ${SITE_NAME}` },
  description: 'A friendly, one-stop guide to planning your own week in Cornwall: where to stay, which beach suits which day, dog rules, lifeguards, rainy-day plans and what to pair with what.',
  // Whole site noindexed until GO_LIVE=true.
  alternates: { canonical: '/' },
  openGraph: { siteName: SITE_NAME, locale: 'en_GB', type: 'website' },
  robots: GO_LIVE ? { index: true, follow: true } : { index: false, follow: false },
};

const NAV = [
  ['Beaches', '/beaches/'],
  ['Dog-friendly', '/beaches/dog-friendly/'],
  ['Things to do', '/things-to-do/'],
  ['Food & drink', '/food-and-drink/'],
  ['Towns', '/towns/'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${fraunces.variable}`} style={{ '--font-sans': 'var(--font-inter)', '--font-display': 'var(--font-fraunces)' }}>
      <body className="flex min-h-screen flex-col font-sans">
        <JsonLd data={siteGraph()} />
        {!GO_LIVE ? <div className="bg-atlantic-950 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/70">Preview: content still being checked, not yet public.</div> : null}
        <header className="sticky top-0 z-30 border-b border-atlantic-950/8 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-3.5 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-2.5 text-atlantic-950 no-underline hover:text-atlantic-950">
              <svg viewBox="0 0 28 28" className="h-7 w-7 text-seaglass-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="14" cy="14" r="13" className="text-atlantic-950" stroke="currentColor" />
                <circle cx="18" cy="10" r="2.6" />
                <path d="M5 17c1.8 0 1.8-1.6 3.6-1.6s1.8 1.6 3.6 1.6 1.8-1.6 3.6-1.6 1.8 1.6 3.6 1.6 1.8-1.6 3.6-1.6" />
                <path d="M6 21c1.6 0 1.6-1.4 3.2-1.4s1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4" />
              </svg>
              <span className="font-[family-name:var(--font-display)] text-[1.35rem] font-medium tracking-[-0.02em]">
                One Week <span className="italic text-seaglass-600">in</span> Cornwall
              </span>
            </Link>
            <nav aria-label="Main" className="-mx-1 flex max-w-full gap-x-1 overflow-x-auto text-[14px] font-medium [scrollbar-width:none]">
              {NAV.map(([l, h]) => (
                <Link key={h} href={h} className="shrink-0 rounded-full px-2 py-1.5 text-[13px] text-atlantic-950/80 sm:px-3 sm:text-[14px] no-underline hover:bg-atlantic-950/5 hover:text-atlantic-950">{l}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-28 bg-atlantic-950 text-white">
          <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
              <div>
                <p className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
                  One Week <span className="italic text-seaglass-300">in</span> Cornwall
                </p>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/60">A family-run guide to planning your own week in Cornwall. Facts come from official and open sources, and every page shows where.</p>
              </div>
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Explore</p>
                <ul className="space-y-2 text-[15px]">
                  {[...NAV, ['Regions', '/#regions']].map(([l, h]) => (
                    <li key={h}><Link href={h} className="text-white/80 no-underline hover:text-seaglass-300">{l}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">About this guide</p>
                <ul className="space-y-2 text-[15px]">
                  {[['About', '/about/'], ['Editorial policy', '/editorial-policy/'], ['Affiliate disclosure', '/affiliate-disclosure/'], ['Corrections', '/corrections/']].map(([l, h]) => (
                    <li key={h}><Link href={h} className="text-white/80 no-underline hover:text-seaglass-300">{l}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-16 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/45">
              Map and facility data ©{' '}
              <a className="text-inherit decoration-white/30 hover:text-white" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL). Dog rules: Cornwall Council. Lifeguard units: RNLI open data. Photos credited individually. Always check signs and the RNLI page on the day.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
