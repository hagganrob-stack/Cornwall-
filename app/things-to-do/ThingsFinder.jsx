'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TOGGLES = [
  ['rainy', 'Rainy day'],
  ['kids', 'With kids'],
  ['free', 'Free entry'],
];

export default function ThingsFinder({ rows, regions }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [setting, setSetting] = useState('');
  const [need, setNeed] = useState({});
  const counts = useMemo(() => Object.fromEntries(TOGGLES.map(([k]) => [k, rows.filter((r) => r[k]).length])), [rows]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!s || r.name.toLowerCase().includes(s) || r.town.toLowerCase().includes(s) || (r.category || '').toLowerCase().includes(s)) &&
        (!region || r.region === region) &&
        (!setting || (setting === 'indoor' ? r.setting === 'indoor' || r.setting === 'indoor and outdoor' : r.setting === 'outdoor' || r.setting === 'indoor and outdoor')) &&
        TOGGLES.every(([k]) => !need[k] || r[k])
    );
  }, [rows, q, region, setting, need]);
  const field = 'rounded-xl border-0 bg-white px-4 py-2.5 text-[15px] ring-1 ring-atlantic-950/15 focus:ring-2 focus:ring-seaglass-500 focus:outline-none';
  return (
    <div>
      <div className="rounded-3xl bg-sand-50 p-5 ring-1 ring-sand-200">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input type="search" placeholder="Search a place, town or type (e.g. museum)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" className={field} />
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region" className={field}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
          <select value={setting} onChange={(e) => setSetting(e.target.value)} aria-label="Indoor or outdoor" className={field}>
            <option value="">Indoor or outdoor</option>
            <option value="indoor">Has indoor space</option>
            <option value="outdoor">Has outdoor space</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOGGLES.map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={!!need[k]}
              onClick={() => setNeed((n) => ({ ...n, [k]: !n[k] }))}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${need[k] ? 'bg-atlantic-900 text-white' : 'bg-white text-atlantic-900 ring-1 ring-atlantic-950/15 hover:ring-seaglass-500'}`}
            >
              {l} <span className="opacity-60">({counts[k]})</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-atlantic-950/60" aria-live="polite">Showing {list.length} of {rows.length} things to do</p>
      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={`/things-to-do/${r.slug}/`} className="group block overflow-hidden rounded-2xl bg-white no-underline shadow-sm ring-1 ring-atlantic-950/5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden">
                {r.img ? (
                  <Image src={r.img.src} alt={r.name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="bg-sand-100 object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-end bg-gradient-to-br from-seaglass-500 via-atlantic-700 to-atlantic-900 p-4 font-[family-name:var(--font-display)] text-lg font-bold text-white">{r.name}</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg text-atlantic-900 group-hover:text-seaglass-600">{r.name}</h3>
                <p className="text-sm text-atlantic-950/60">{r.category} · near {r.town}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {r.setting === 'indoor' ? <li className="chip bg-atlantic-100 text-atlantic-800">Indoors</li> : r.setting === 'indoor and outdoor' ? <li className="chip bg-atlantic-100 text-atlantic-800">Indoor & outdoor</li> : r.setting === 'outdoor' ? <li className="chip bg-sand-100 text-sand-700">Outdoors</li> : null}
                  {r.kids ? <li className="chip bg-seaglass-100 text-seaglass-600">With kids</li> : null}
                  {r.free ? <li className="chip bg-seaglass-100 text-seaglass-600">Free entry</li> : null}
                  {r.allow ? <li className="chip bg-sand-100 text-sand-700">{r.allow}</li> : null}
                </ul>
              </div>
            </Link>
            {r.img ? <p className="mt-1 px-1 text-[11px] text-atlantic-950/55">Photo: {r.img.by}{r.img.licence ? ` · ${r.img.licence}` : ''}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
