'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const KINDS = [['', 'Everything'], ['pub', 'Pubs'], ['restaurant', 'Restaurants'], ['cafe', 'Cafés'], ['bar', 'Bars']];
const TOGGLES = [
  ['dogFriendly', 'Dogs welcome'],
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

export default function FoodFinder({ rows, regions }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [kind, setKind] = useState('');
  const [need, setNeed] = useState({});
  const [shown, setShown] = useState(PAGE);
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
  const field = 'rounded-xl border-0 bg-white px-4 py-2.5 text-[15px] ring-1 ring-atlantic-950/15 focus:ring-2 focus:ring-seaglass-500 focus:outline-none';
  return (
    <div>
      <div className="rounded-3xl bg-sand-50 p-5 ring-1 ring-sand-200">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input type="search" placeholder="Search a name, town or food (e.g. seafood)" value={q} onChange={(e) => (setQ(e.target.value), setShown(PAGE))} aria-label="Search" className={field} />
          <select value={region} onChange={(e) => (setRegion(e.target.value), setShown(PAGE))} aria-label="Region" className={field}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
          <select value={kind} onChange={(e) => (setKind(e.target.value), setShown(PAGE))} aria-label="Type" className={field}>
            {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOGGLES.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={!!need[k]} onClick={() => (setNeed((n) => ({ ...n, [k]: !n[k] })), setShown(PAGE))}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${need[k] ? 'bg-atlantic-900 text-white' : 'bg-white text-atlantic-900 ring-1 ring-atlantic-950/15 hover:ring-seaglass-500'}`}>
              {l} <span className="opacity-60">({counts[k]})</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-atlantic-950/60" aria-live="polite">Showing {Math.min(shown, list.length)} of {list.length} places</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, shown).map((r) => (
          <li key={r.slug}>
            <Link href={`/food-and-drink/${r.slug}/`} className="group block h-full rounded-2xl bg-white p-5 no-underline shadow-sm ring-1 ring-atlantic-950/5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-seaglass-600">{LABEL[r.kind]} · {r.town}</p>
              <h3 className="mt-1 text-lg text-atlantic-900 group-hover:text-seaglass-600">{r.name}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {TOGGLES.filter(([k]) => r[k]).slice(0, 4).map(([k, l]) => <li key={k} className="chip bg-sand-100 text-sand-700">{l}</li>)}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
      {shown < list.length ? (
        <p className="mt-6 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="rounded-full bg-atlantic-900 px-6 py-3 font-semibold text-white">Show more</button>
        </p>
      ) : null}
    </div>
  );
}
