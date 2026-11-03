import { NOT_STATED } from '../lib/data';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// Facts with value, detail and source. "Not stated" is shown honestly rather than hidden.
export default function FactTable({ rows }) {
  const present = rows.filter(([, f]) => f && f.value && f.value !== NOT_STATED);
  const missing = rows.filter(([, f]) => !f || !f.value || f.value === NOT_STATED).map(([l]) => l.toLowerCase());
  return (
    <>
    <dl className="divide-y divide-atlantic-950/10 border-y border-atlantic-950/10">
      {present.map(([label, fact, extra]) => {
        if (!fact) return null;
        const missing = !fact.value || fact.value === NOT_STATED;
        const detail = fact.summary || fact.note || (fact.notes ? fact.notes.join(' ') : null);
        return (
          <div key={label} className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-8">
            <dt className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-atlantic-950/50">{label}</dt>
            <dd>
              <span className={missing ? 'italic text-atlantic-950/45' : 'font-medium'}>{missing ? 'Not stated' : cap(fact.value)}</span>
              {!missing && detail ? <span className="mt-0.5 block text-sm text-atlantic-950/70">{detail}</span> : null}
              {!missing && fact.places?.length ? (
                <span className="mt-0.5 block text-sm text-atlantic-950/60">
                  {fact.places.map((p, i) => (
                    <span key={p.osm}>
                      {i ? ', ' : ''}
                      <a href={p.osm} rel="nofollow noopener" target="_blank">{p.name || 'unnamed'}</a> ({p.distanceM} m{p.fee === 'yes' ? ', pay' : ''})
                    </span>
                  ))}
                </span>
              ) : null}
              {extra}
              {!missing && fact.source?.url ? (
                <span className="mt-1 block text-xs text-atlantic-950/45">
                  Source: <a href={fact.source.url} rel="nofollow noopener" target="_blank" className="text-inherit underline">{fact.source.label}</a>
                  {fact.source.pageLastUpdated ? ` (page updated ${fact.source.pageLastUpdated})` : ''}
                </span>
              ) : null}
            </dd>
          </div>
        );
      })}
    </dl>
    {missing.length ? <p className="mt-3 text-sm text-atlantic-950/55">Not yet confirmed by a source: {missing.join(', ')}.</p> : null}
    </>
  );
}
