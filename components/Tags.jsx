// Quiet hairline tags. Cards show only a few; pages can show more. tone="dark" for use over photos.
export default function Tags({ items, max = 99, tone = 'light', className = '' }) {
  const list = items.filter(Boolean).slice(0, max);
  if (!list.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {list.map(([t, accent]) => (
        <li key={t} className={`chip ${accent ? 'chip-accent' : ''} ${tone === 'dark' && !accent ? 'chip-dark' : ''}`}>{t}</li>
      ))}
    </ul>
  );
}
