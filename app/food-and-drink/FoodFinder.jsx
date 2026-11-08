'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import PlaceMap from '../../components/PlaceMap';

const KINDS = [['', 'Everything'], ['pub', 'Pubs'], ['restaurant', 'Restaurants'], ['cafe', 'Cafés'], ['bar', 'Bars']];
const TOGGLES = [
  ['dogFriendly', 'Dogs welcome'],
  ['vegan', 'Vegan'],
  ['vegetarian', 'Vegetarian'],
  ['glutenFree', 'Gluten-free'],
  ['familyFriendly', 'Children welcome'],
  ['seaView', 'Sea views'],
  ['sundayRoast', 'Sunday roast'],
  ['beerGarden', 'Beer garden'],
  ['outdoorSeating', 'Outdoor seating'],
  ['realAle', 'Real ale'],
  ['liveMusic', 'Live music'],
];
const LABEL = { pub: 'Pub', restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar' };
const PAGE = 60;
// Pin colours: brand palette, distinct enough to tell apart (and named in the legend).
const MAP_KINDS = {
  pub: { label: 'Pubs', color: '#1d4f7c' },
  restaurant: { label: 'Restaurants', color: '#c2410c' },
  cafe: { label: 'Cafés', color: '#12a196' },
  bar: { label: 'Bars', color: '#7c3aed' },
};

export default function FoodFinder({ rows, regions }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [kind, setKind] = useState('');
  const [need, setNeed] = useState({});
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState('rating');
  const counts = useMemo(() => Object.fromEntries(TOGGLES.map(([k]) => [k, rows.filter((r) => r[k]).length])), [rows]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!s || r.name.toLowerCase().includes(s) || r.town.toLowerCase().includes(s) || (r.category || '').toLowerCase().includes(s)) &&
        (!region || r.region === region) &&
        (!kind || r.kind === kind) &&
        TOGGLES.every(([k]) => !need[k] || r[k])
    );
  }, [rows, q, region, kind, need]);
  const sorted = useMemo(() => (sort === 'rating' ? [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews) : [...list].sort((a, b) => a.name.localeCompare(b.name))), [list, sort]);
  const mapPoints = useMemo(() => list.map((r) => ({ slug: r.slug, name: r.name, lat: r.lat, lng: r.lng, kind: r.kind, sub: r.town, rating: r.rating, href: `/food-and-drink/${r.slug}/` })), [list]);
  const field = 'rounded-full border border-atlantic-950/15 bg-white px-4 py-2.5 text-[15px] focus:border-seaglass-500 focus:ring-2 focus:ring-seaglass-500/30 focus:outline-none';
  return (
    <div>
      <div className="rounded-3xl border border-atlantic-950/10 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <input type="search" placeholder="Search a name, town or food (e.g. seafood)" value={q} onChange={(e) => (setQ(e.target.value), setShown(PAGE))} aria-label="Search" className={field} />
          <select value={region} onChange={(e) => (setRegion(e.target.value), setShown(PAGE))} aria-label="Region" className={field}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
          <select value={kind} onChange={(e) => (setKind(e.target.value), setShown(PAGE))} aria-label="Type" className={field}>
            {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className={field}>
            <option value="rating">Highest Google rating</option>
            <option value="name">A to Z</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOGGLES.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={!!need[k]} onClick={() => (setNeed((n) => ({ ...n, [k]: !n[k] })), setShown(PAGE))}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${need[k] ? 'bg-atlantic-950 text-white' : 'border border-atlantic-950/15 text-atlantic-950 hover:border-atlantic-950/40'}`}>
              {l} <span className="opacity-60">({counts[k]})</span>
            </button>
          ))}
        </div>
      </div>
      <section className="mt-8" aria-labelledby="food-map-heading">
        <h2 id="food-map-heading" className="sr-only">Map of matching places</h2>
        <p className="mb-4 max-w-[68ch] text-sm text-atlantic-950/60">
          {list.length === rows.length ? `All ${rows.length} places` : `The ${list.length} places matching your filters`} on the map. Tap a pin for the name and rating; the full list is below.
        </p>
        <PlaceMap points={mapPoints} kinds={MAP_KINDS} label="Map of pubs, cafés and restaurants" />
      </section>
      <p className="mt-5 text-sm text-atlantic-950/60" aria-live="polite">Showing {Math.min(shown, list.length)} of {list.length} places</p>
      <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.slice(0, shown).map((r) => (
          <li key={r.slug} className="border-t border-atlantic-950/10">
            <Link href={`/food-and-drink/${r.slug}/`} className="group block h-full py-5 no-underline">
              <p className="eyebrow">{LABEL[r.kind]} · {r.town}</p>
              <h3 className="mt-1 text-xl text-atlantic-950 group-hover:text-seaglass-600">{r.name}</h3>
              {r.rating ? <p className="mt-0.5 text-sm text-atlantic-950/70"><span className="text-sand-700" aria-hidden="true">★</span> <strong className="text-atlantic-900">{r.rating.toFixed(1)}</strong> ({r.reviews.toLocaleString('en-GB')} Google reviews)</p> : null}
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {TOGGLES.filter(([k]) => r[k]).slice(0, 3).map(([k, l]) => <li key={k} className="chip">{l}</li>)}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
      {shown < list.length ? (
        <p className="mt-6 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="rounded-full bg-atlantic-950 px-6 py-3 font-semibold text-white hover:bg-seaglass-600">Show more</button>
        </p>
      ) : null}
    </div>
  );
}
