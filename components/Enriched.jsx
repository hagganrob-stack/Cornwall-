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
      <h2 className="mt-12 mb-4 text-2xl">Good to know</h2>
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
