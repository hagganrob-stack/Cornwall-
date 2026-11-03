import { isLifeguarded } from '../lib/data';
import Tags from './Tags';

// At-a-glance tags for a beach.
export default function Badges({ b, className = '', max, tone }) {
  const out = [];
  if (b.weVisited) out.push(['★ We’ve been', true]);
  out.push([b.dogs?.councilListed ? (b.dogs.restriction === 'leads' ? 'Dogs on leads in season' : b.dogs.allYear ? 'No dogs' : 'Seasonal dog ban') : 'Dogs welcome']);
  if (isLifeguarded(b)) out.push(['Lifeguards in season']);
  if (b.parking?.value === 'yes') out.push(['Parking']);
  if (b.toilets?.value === 'yes') out.push(['Toilets']);
  if (b.cafeNearby?.value === 'yes') out.push(['Café']);
  if (b.surf?.value === 'yes') out.push(['Surf']);
  return <Tags items={out} max={max} tone={tone} className={className} />;
}
