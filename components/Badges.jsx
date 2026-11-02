import { isLifeguarded } from '../lib/data';

// At-a-glance chips for a beach.
export default function Badges({ b, className = '' }) {
  const out = [];
  if (b.weVisited) out.push(['bg-atlantic-900 text-white', '★ We’ve been']);
  if (isLifeguarded(b)) out.push(['bg-atlantic-100 text-atlantic-800', 'Lifeguards in season']);
  if (b.dogs?.councilListed)
    out.push(['bg-coral-100 text-coral-700', b.dogs.restriction === 'leads' ? 'Dogs on leads in season' : b.dogs.allYear ? 'No dogs' : 'Seasonal dog ban']);
  else out.push(['bg-seaglass-100 text-seaglass-600', 'Dogs welcome']);
  if (b.parking?.value === 'yes') out.push(['bg-sand-100 text-sand-700', 'Parking']);
  if (b.toilets?.value === 'yes') out.push(['bg-sand-100 text-sand-700', 'Toilets']);
  if (b.cafeNearby?.value === 'yes') out.push(['bg-sand-100 text-sand-700', 'Café']);
  if (b.surf?.value === 'yes') out.push(['bg-sand-100 text-sand-700', 'Surf']);
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {out.map(([c, t]) => (
        <li key={t} className={`chip ${c}`}>{t}</li>
      ))}
    </ul>
  );
}
