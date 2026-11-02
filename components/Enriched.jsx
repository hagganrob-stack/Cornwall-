import Link from 'next/link';
import { fmtDate } from '../lib/data';

const SourceLink = ({ e, i }) =>
  e.sources?.[i] ? (
    <a href={e.sources[i].url} rel="nofollow noopener" target="_blank" className="text-inherit underline">
      {e.sources[i].label}
    </a>
  ) : null;

// Overview paragraphs (replace the short generated description when present).
export function EnrichedOverview({ e }) {
  if (!e?.overview?.length) return null;
  return (
    <div className="max-w-[68ch] space-y-4 text-lg leading-relaxed text-atlantic-950/85 [&>p:first-child]:text-xl">
      {e.overview.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  );
}

export function EnrichedExpect({ e, title = 'What to expect' }) {
  if (!e?.expect?.length) return null;
  return (
    <section>
      <h2 className="mt-12 mb-4 text-2xl">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {e.expect.map((x) => (
          <div key={x.title} className="rounded-2xl bg-white p-5 ring-1 ring-atlantic-950/10">
            <h3 className="text-lg">{x.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-atlantic-950/80">{x.text}</p>
            {x.source != null ? (
              <p className="mt-2 text-xs text-atlantic-950/50">
                Source: <SourceLink e={e} i={x.source} />
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EnrichedGoodToKnow({ e }) {
  if (!e?.goodToKnow?.length) return null;
  return (
    <section>
      <h2 className="mt-12 mb-4 text-2xl">Before you go</h2>
      <dl className="divide-y divide-atlantic-950/10 overflow-hidden rounded-2xl ring-1 ring-atlantic-950/10">
        {e.goodToKnow.map((x) => (
          <div key={x.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="text-sm font-semibold text-atlantic-900">{x.label}</dt>
            <dd>
              <span className="block leading-relaxed">{x.text}</span>
              {x.source != null ? (
                <span className="mt-1 block text-xs text-atlantic-950/50">
                  Source: <SourceLink e={e} i={x.source} />
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Transparency line about how the guide copy was written.
export function EnrichedNote({ e }) {
  if (!e) return null;
  return (
    <p className="mt-3 text-xs text-atlantic-950/55">
      Guide written {fmtDate(e.written)} with AI assistance, in our own words, from the sources listed below.{' '}
      {e.reviewedByRob ? 'Checked by Rob.' : 'Not yet checked in person.'} <Link href="/editorial-policy/#guides">How we write our guides</Link>.
    </p>
  );
}

// "Fitting it into your week": time to allow, how to slot it in, and what to pair it with nearby.
export function EnrichedWeek({ e, nearby = {} }) {
  if (!e?.week) return null;
  const href = { beach: '/beaches/', attraction: '/things-to-do/', town: '/towns/' };
  return (
    <section className="mt-12 rounded-3xl bg-atlantic-900 p-6 text-atlantic-100 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-seaglass-300">Fitting it into your week</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white">{e.week.slot}</p>
      <p className="mt-3 max-w-[62ch] leading-relaxed">{e.week.text}</p>
      {e.week.pairWith?.length ? (
        <>
          <p className="mt-6 text-sm font-semibold text-white">Pair it with</p>
          <ul className="mt-2 grid gap-3 sm:grid-cols-3">
            {e.week.pairWith.map((p) => (
              <li key={p.slug}>
                <Link href={`${href[p.kind]}${p.slug}/`} className="block h-full rounded-2xl bg-white/10 p-4 no-underline ring-1 ring-white/10 hover:bg-white/15">
                  <span className="block font-semibold text-white">
                    {nearby[p.slug]?.name || p.slug}
                    {nearby[p.slug]?.km != null ? <span className="font-normal text-atlantic-100/70"> · {nearby[p.slug].km} km</span> : null}
                  </span>
                  <span className="mt-1 block text-sm text-atlantic-100/80">{p.why}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function EnrichedTips({ e }) {
  if (!e?.tips?.length) return null;
  return (
    <section className="mt-8 rounded-2xl bg-seaglass-100/60 p-6">
      <h2 className="text-xl">Handy tips</h2>
      <ul className="mt-3 space-y-2">
        {e.tips.map((t) => (
          <li key={t} className="flex gap-3 leading-relaxed">
            <span className="text-seaglass-600" aria-hidden="true">→</span>
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
