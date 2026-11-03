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
  const field = 'rounded-full border border-atlantic-950/15 bg-white px-4 py-2.5 text-[15px] focus:border-seaglass-500 focus:ring-2 focus:ring-seaglass-500/30 focus:outline-none';
  return (
    <div>
      <div className="rounded-3xl border border-atlantic-950/10 bg-white p-4 sm:p-5">
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
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${need[k] ? 'bg-atlantic-950 text-white' : 'border border-atlantic-950/15 text-atlantic-950 hover:border-atlantic-950/40'}`}
            >
              {l} <span className="opacity-60">({counts[k]})</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-atlantic-950/60" aria-live="polite">Showing {list.length} of {rows.length} things to do</p>
      <ul className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={`/things-to-do/${r.slug}/`} className="group block no-underline">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand-100">
                {r.img ? (
                  <Image src={r.img.src} alt={r.name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="bg-sand-100 object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-end bg-gradient-to-br from-seaglass-500 via-atlantic-700 to-atlantic-900 p-4 font-[family-name:var(--font-display)] text-lg font-bold text-white">{r.name}</div>
                )}
              </div>
              <div className="pt-4">
                <h3 className="text-xl text-atlantic-950 group-hover:text-seaglass-600">{r.name}</h3>
                <p className="text-sm text-atlantic-950/60">{r.category} · near {r.town}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {r.setting === 'indoor' ? <li className="chip">Indoors</li> : r.setting === 'indoor and outdoor' ? <li className="chip">Indoor & outdoor</li> : r.setting === 'outdoor' ? <li className="chip">Outdoors</li> : null}
                  {r.kids ? <li className="chip">With kids</li> : null}
                  {r.free ? <li className="chip">Free entry</li> : null}
                  {r.allow ? <li className="chip">{r.allow}</li> : null}
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
