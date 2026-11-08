import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbLd } from '../lib/seo';
import { AUTHOR } from '../lib/site';

export function Container({ children, className = '' }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Crumbs({ items, light = false }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-[13px] ${light ? 'text-white/80' : 'text-atlantic-950/50'}`}>
      <JsonLd data={breadcrumbLd(items)} />
      {items.map(([label, href], i) => (
        <span key={label}>
          {i ? <span className={`mx-2 ${light ? 'text-white/45' : 'text-atlantic-950/25'}`}>/</span> : null}
          {href ? <Link href={href} className="text-inherit no-underline hover:underline">{label}</Link> : <span aria-current="page">{label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeading({ children, kicker, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-atlantic-950/10 pt-6">
      <div className="max-w-3xl">
        {kicker ? <p className="eyebrow mb-3">{kicker}</p> : null}
        <h2 className="text-3xl sm:text-4xl">{children}</h2>
      </div>
      {action}
    </div>
  );
}

// Shown only when Rob has visited (weVisited: true), with his own notes.
export function WeVisited({ place }) {
  if (!place.weVisited) return null;
  return (
    <aside className="my-8 border-l-2 border-seaglass-500 pl-6">
      <p className="chip chip-accent mb-2">★ We’ve been here</p>
      {place.ourNotes ? <p className="font-[family-name:var(--font-display)] text-2xl leading-snug italic">{place.ourNotes}</p> : null}
      <p className="mt-2 text-sm text-atlantic-950/60">— Rob</p>
    </aside>
  );
}

// "Stay nearby" slot: renders nothing until accommodation feeds (Awin) are added.
export function StayNearby() {
  return null;
}

export function Sources({ sources, lastChecked, note }) {
  return (
    <section id="sources" className="mt-16 border-t border-atlantic-950/10 pt-8">
      <h2 className="eyebrow !font-sans !text-atlantic-950/50">Sources</h2>
      <ul className="mt-4 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="nofollow noopener" target="_blank">{s.label}</a>
            {s.licence ? <span className="text-atlantic-950/55"> ({s.licence})</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-atlantic-950/55">
        {lastChecked ? `Last checked ${lastChecked}. ` : ''}
        {note || ''} Spotted something wrong? <Link href="/corrections/">Tell us</Link>.
      </p>
    </section>
  );
}

export function Callout({ tone = 'info', title, children }) {
  const t = tone === 'warn' ? 'border-coral-700 bg-coral-100/60' : tone === 'ok' ? 'border-seaglass-500 bg-seaglass-100/60' : 'border-atlantic-700 bg-atlantic-100/60';
  return (
    <div className={`my-4 rounded-r-2xl border-l-2 px-5 py-4 text-atlantic-950 ${t}`}>
      {title ? <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-atlantic-950/60">{title}</p> : null}
      <div className="text-[15px] leading-relaxed [&_a]:text-inherit [&_a]:underline">{children}</div>
    </div>
  );
}

// Short author bio for town hubs, roundups and guide pages.
export function AuthorBio() {
  return (
    <aside className="mt-16 flex gap-5 border-t border-atlantic-950/10 pt-8">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-atlantic-950 font-[family-name:var(--font-display)] text-xl text-white">R</span>
      <div>
        <p className="font-[family-name:var(--font-display)] text-xl text-atlantic-950">Written by <Link href={AUTHOR.url}>{AUTHOR.name}</Link></p>
        <p className="mt-1 max-w-[66ch] text-[15px] leading-relaxed text-atlantic-950/70">
          Rob runs One Week in Cornwall, a family-run guide started because we love Cornwall and want every visitor to make the most of their week there. Facts on this page are checked against official and open sources; see our <Link href="/editorial-policy/">editorial policy</Link>.
        </p>
      </div>
    </aside>
  );
}
