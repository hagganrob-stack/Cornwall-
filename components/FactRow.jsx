import { NOT_STATED } from '../lib/data';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// One fact with its value, detail and source. "not stated" is shown honestly rather than hidden.
export default function FactRow({ label, fact, extra }) {
  if (!fact) return null;
  const missing = !fact.value || fact.value === NOT_STATED;
  const detail = fact.summary || fact.note || (fact.notes ? fact.notes.join(' ') : null);
  return (
    <tr className={missing ? 'missing' : ''}>
      <th scope="row">{label}</th>
      <td>
        <span className="fact-value">{missing ? 'Not stated' : cap(fact.value)}</span>
        {detail && !missing ? <span className="fact-detail">{detail}</span> : null}
        {fact.places?.length ? (
          <span className="fact-detail">
            {fact.places.map((p, i) => (
              <span key={p.osm}>
                {i ? ', ' : ''}
                <a href={p.osm} rel="nofollow noopener" target="_blank">{p.name || 'unnamed'}</a> ({p.distanceM} m{p.fee === 'yes' ? ', pay' : ''})
              </span>
            ))}
          </span>
        ) : null}
        {extra}
        {fact.source?.url && !missing ? (
          <span className="source">
            Source: <a href={fact.source.url} rel="nofollow noopener" target="_blank">{fact.source.label}</a>
            {fact.source.pageLastUpdated ? ` (page updated ${fact.source.pageLastUpdated})` : ''}
          </span>
        ) : null}
      </td>
    </tr>
  );
}
