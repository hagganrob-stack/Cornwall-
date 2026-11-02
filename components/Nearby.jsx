import Link from 'next/link';

// "Nearby" list from coordinates (distances computed by the data pipeline).
export default function Nearby({ title, items, base }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200">
      <h3 className="mb-3 text-base">{title}</h3>
      <ul className="space-y-2 text-[15px]">
        {items.map((n) => (
          <li key={n.slug} className="flex justify-between gap-3">
            <Link href={`${base}${n.slug}/`} className="font-medium no-underline">{n.name}</Link>
            <span className="shrink-0 text-atlantic-950/50">{n.km} km</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
