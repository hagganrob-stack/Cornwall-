import { KIND_LABEL, featureYes } from '../lib/data';

// At-a-glance chips for a pub, restaurant or café (only facilities its own website confirms).
export default function FoodBadges({ v, className = '', max = 4 }) {
  const out = [['bg-atlantic-100 text-atlantic-800', KIND_LABEL[v.kind]]];
  if (v.weVisited) out.unshift(['bg-atlantic-900 text-white', '★ We’ve been']);
  const flags = [
    ['dogFriendly', 'Dogs welcome', 'bg-seaglass-100 text-seaglass-600'],
    ['seaView', 'Sea views', 'bg-seaglass-100 text-seaglass-600'],
    ['familyFriendly', 'Children welcome', 'bg-sand-100 text-sand-700'],
    ['vegan', 'Vegan options', 'bg-sand-100 text-sand-700'],
    ['glutenFree', 'Gluten-free options', 'bg-sand-100 text-sand-700'],
    ['sundayRoast', 'Sunday roast', 'bg-sand-100 text-sand-700'],
    ['beerGarden', 'Beer garden', 'bg-sand-100 text-sand-700'],
  ];
  for (const [k, l, c] of flags) if (featureYes(v, k) && out.length < max + 1) out.push([c, l]);
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {out.map(([c, t]) => (
        <li key={t} className={`chip ${c}`}>{t}</li>
      ))}
    </ul>
  );
}
