import Link from 'next/link';

// "Nearby" list from coordinates (distances computed by the data pipeline).
export default function Nearby({ title, items, base }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-atlantic-950/50">{title}</h3>
      <ul className="divide-y divide-atlantic-950/8 border-t border-atlantic-950/10 text-[15px]">
        {items.map((n) => (
          <li key={n.slug}>
            <Link href={`${base}${n.slug}/`} className="group flex justify-between gap-3 py-2.5 text-atlantic-950 no-underline">
              <span className="font-medium group-hover:text-seaglass-600">{n.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-atlantic-950/45">{n.km} km</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
