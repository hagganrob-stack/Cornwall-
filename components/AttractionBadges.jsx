// At-a-glance chips for an attraction.
export default function AttractionBadges({ a, className = '' }) {
  const out = [];
  if (a.weVisited) out.push(['bg-atlantic-900 text-white', '★ We’ve been']);
  if (a.setting?.value === 'indoor') out.push(['bg-atlantic-100 text-atlantic-800', 'Indoors']);
  else if (a.setting?.value === 'indoor and outdoor') out.push(['bg-atlantic-100 text-atlantic-800', 'Indoor & outdoor']);
  else if (a.setting?.value === 'outdoor') out.push(['bg-sand-100 text-sand-700', 'Outdoors']);
  if (a.kids?.value === 'yes') out.push(['bg-seaglass-100 text-seaglass-600', 'With kids']);
  if (a.entry?.value === 'free') out.push(['bg-seaglass-100 text-seaglass-600', 'Free entry']);
  if (a.allow?.value && a.allow.value !== 'not stated') out.push(['bg-sand-100 text-sand-700', a.allow.value]);
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {out.map(([c, t]) => (
        <li key={t} className={`chip ${c}`}>{t}</li>
      ))}
    </ul>
  );
}
