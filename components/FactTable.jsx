import { NOT_STATED } from '../lib/data';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// Facts with value, detail and source. "Not stated" is shown honestly rather than hidden.
export default function FactTable({ rows }) {
  return (
    <dl className="divide-y divide-atlantic-950/10 overflow-hidden rounded-2xl ring-1 ring-atlantic-950/10">
      {rows.map(([label, fact, extra]) => {
        if (!fact) return null;
        const missing = !fact.value || fact.value === NOT_STATED;
        const detail = fact.summary || fact.note || (fact.notes ? fact.notes.join(' ') : null);
        return (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="text-sm font-semibold text-atlantic-900">{label}</dt>
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
                <span className="mt-1 block text-xs text-atlantic-950/50">
                  Source: <a href={fact.source.url} rel="nofollow noopener" target="_blank" className="text-inherit underline">{fact.source.label}</a>
                  {fact.source.pageLastUpdated ? ` (page updated ${fact.source.pageLastUpdated})` : ''}
                </span>
              ) : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
