import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbLd } from '../lib/seo';
import { AUTHOR } from '../lib/site';

export function Container({ children, className = '' }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Crumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-atlantic-950/55">
      <JsonLd data={breadcrumbLd(items)} />
      {items.map(([label, href], i) => (
        <span key={label}>
          {i ? <span className="mx-1.5">›</span> : null}
          {href ? <Link href={href} className="text-inherit no-underline hover:underline">{label}</Link> : <span aria-current="page">{label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeading({ children, kicker, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-seaglass-600">{kicker}</p> : null}
        <h2 className="text-2xl sm:text-3xl">{children}</h2>
      </div>
      {action}
    </div>
  );
}

// Shown only when Rob has visited (weVisited: true), with his own notes.
export function WeVisited({ place }) {
  if (!place.weVisited) return null;
  return (
    <aside className="my-6 rounded-2xl border-l-4 border-seaglass-500 bg-seaglass-100/60 p-5">
      <p className="chip mb-2 bg-atlantic-900 text-white">★ We’ve been here</p>
      {place.ourNotes ? <p className="text-lg leading-relaxed">{place.ourNotes}</p> : null}
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
    <section id="sources" className="mt-14 border-t border-atlantic-950/10 pt-8">
      <h2 className="text-xl">Sources</h2>
      <ul className="mt-3 space-y-1 text-sm">
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
  const t = tone === 'warn' ? 'bg-coral-100 text-coral-700' : tone === 'ok' ? 'bg-seaglass-100 text-atlantic-900' : 'bg-atlantic-100 text-atlantic-900';
  return (
    <div className={`my-4 rounded-2xl p-5 ${t}`}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-[15px] leading-relaxed [&_a]:text-inherit [&_a]:underline">{children}</div>
    </div>
  );
}

// Short author bio for town hubs, roundups and guide pages.
export function AuthorBio() {
  return (
    <aside className="mt-14 flex gap-4 rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-seaglass-100 font-bold text-seaglass-600">R</span>
      <div>
        <p className="font-semibold text-atlantic-900">Written by <Link href={AUTHOR.url}>{AUTHOR.name}</Link></p>
        <p className="mt-1 text-[15px] text-atlantic-950/75">
          Rob runs One Week in Cornwall, a family-run guide started because we love Cornwall and want every visitor to make the most of their week there. Facts on this page are checked against official and open sources; see our <Link href="/editorial-policy/">editorial policy</Link>.
        </p>
      </div>
    </aside>
  );
}
