import { KIND_LABEL, featureYes } from '../lib/data';
import Tags from './Tags';

const FLAGS = [
  ['dogFriendly', 'Dogs welcome'],
  ['seaView', 'Sea views'],
  ['familyFriendly', 'Children welcome'],
  ['vegan', 'Vegan options'],
  ['glutenFree', 'Gluten-free options'],
  ['sundayRoast', 'Sunday roast'],
  ['beerGarden', 'Beer garden'],
];

// At-a-glance tags for a pub, restaurant or café (only facilities its own website confirms).
export default function FoodBadges({ v, className = '', max = 4, tone, kind = true }) {
  const out = [v.weVisited ? ['★ We’ve been', true] : null, kind ? [KIND_LABEL[v.kind]] : null, ...FLAGS.filter(([k]) => featureYes(v, k)).map(([, l]) => [l])];
  return <Tags items={out} max={max + 1} tone={tone} className={className} />;
}
