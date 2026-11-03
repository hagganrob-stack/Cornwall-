import Tags from './Tags';

// At-a-glance tags for an attraction.
export default function AttractionBadges({ a, className = '', max, tone }) {
  const s = a.setting?.value;
  const out = [
    a.weVisited ? ['★ We’ve been', true] : null,
    s === 'indoor' ? ['Indoors'] : s === 'indoor and outdoor' ? ['Indoor & outdoor'] : s === 'outdoor' ? ['Outdoors'] : null,
    a.entry?.value === 'free' ? ['Free entry'] : null,
    a.kids?.value === 'yes' ? ['With kids'] : null,
    a.allow?.value && a.allow.value !== 'not stated' ? [a.allow.value] : null,
  ];
  return <Tags items={out} max={max} tone={tone} className={className} />;
}
