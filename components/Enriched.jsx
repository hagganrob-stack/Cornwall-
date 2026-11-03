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
    <div className="max-w-[66ch] space-y-5 text-[1.125rem] leading-[1.75] text-atlantic-950/80 [&>p:first-child]:font-[family-name:var(--font-display)] [&>p:first-child]:text-[1.6rem] [&>p:first-child]:leading-[1.45] [&>p:first-child]:text-atlantic-950">
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
      <h2 className="mt-16 mb-6 text-3xl">{title}</h2>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {e.expect.map((x, i) => (
          <div key={x.title} className="border-t border-atlantic-950/15 pt-4">
            <p className="font-[family-name:var(--font-display)] text-sm text-seaglass-600 italic">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-1 text-xl">{x.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-atlantic-950/75">{x.text}</p>
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
      <h2 className="mt-16 mb-6 text-3xl">Before you go</h2>
      <dl className="divide-y divide-atlantic-950/10 border-y border-atlantic-950/10">
        {e.goodToKnow.map((x) => (
          <div key={x.label} className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-8">
            <dt className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-atlantic-950/50">{x.label}</dt>
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
    <section className="mt-16 rounded-3xl bg-atlantic-950 p-6 text-white/80 sm:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-seaglass-300">Fitting it into your week</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white sm:text-5xl">{e.week.slot}</p>
      <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-relaxed">{e.week.text}</p>
      {e.week.pairWith?.length ? (
        <>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Pair it with</p>
          <ul className="mt-3 grid gap-x-6 sm:grid-cols-3">
            {e.week.pairWith.map((p) => (
              <li key={p.slug}>
                <Link href={`${href[p.kind]}${p.slug}/`} className="group block h-full border-t border-white/15 py-4 no-underline">
                  <span className="block font-[family-name:var(--font-display)] text-xl text-white group-hover:text-seaglass-300">
                    {nearby[p.slug]?.name || p.slug}
                    {nearby[p.slug]?.km != null ? <span className="font-sans text-sm text-white/50"> · {nearby[p.slug].km} km</span> : null}
                  </span>
                  <span className="mt-1 block text-sm text-white/65">{p.why}</span>
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
    <section className="mt-16">
      <h2 className="text-3xl">Handy tips</h2>
      <ul className="mt-5 space-y-3">
        {e.tips.map((t) => (
          <li key={t} className="flex gap-4 text-[1.0625rem] leading-relaxed text-atlantic-950/80">
            <span className="mt-[0.7em] h-px w-5 shrink-0 bg-seaglass-500" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
