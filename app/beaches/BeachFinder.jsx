'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TOGGLES = [
  ['lifeguards', 'Lifeguarded'],
  ['parking', 'Parking'],
  ['toilets', 'Toilets'],
  ['cafe', 'Café'],
  ['surf', 'Surf'],
  ['rockPools', 'Rock pools'],
  ['accessible', 'Accessibility info'],
];

// Council restriction covers any part of the month? (seasonal bans run in MM-DD ranges)
function restricted(r, m) {
  if (!r.dogsListed) return false;
  if (r.dogsAllYear) return true;
  const f = +r.dogFrom.slice(0, 2), t = +r.dogTo.slice(0, 2);
  return f <= t ? m >= f && m <= t : m >= f || m <= t;
}

export default function BeachFinder({ rows, regions }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [dogMonth, setDogMonth] = useState(''); // '' = ignore, 'any' = no restriction at all, '1'..'12'
  const [need, setNeed] = useState({});
  const counts = useMemo(() => Object.fromEntries(TOGGLES.map(([k]) => [k, rows.filter((r) => r[k]).length])), [rows]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!s || r.name.toLowerCase().includes(s) || r.town.toLowerCase().includes(s)) &&
        (!region || r.region === region) &&
        (dogMonth === '' || (dogMonth === 'any' ? !r.dogsListed : !restricted(r, +dogMonth) || r.dogsLeads)) &&
        TOGGLES.every(([k]) => !need[k] || r[k])
    );
  }, [rows, q, region, dogMonth, need]);
  const dogLabel = (r) => {
    if (!r.dogsListed) return ['Dogs welcome', 'bg-seaglass-100 text-seaglass-600'];
    if (r.dogsLeads) return ['Dogs on leads in season', 'bg-coral-100 text-coral-700'];
    if (r.dogsAllYear) return ['No dogs', 'bg-coral-100 text-coral-700'];
    if (dogMonth && dogMonth !== 'any' && !restricted(r, +dogMonth)) return [`Dogs OK in ${MONTHS[+dogMonth - 1]}`, 'bg-seaglass-100 text-seaglass-600'];
    return ['Seasonal dog ban', 'bg-coral-100 text-coral-700'];
  };
  const field = 'rounded-xl border-0 bg-white px-4 py-2.5 text-[15px] ring-1 ring-atlantic-950/15 focus:ring-2 focus:ring-seaglass-500 focus:outline-none';
  return (
    <div>
      <div className="rounded-3xl bg-sand-50 p-5 ring-1 ring-sand-200">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input type="search" placeholder="Search a beach or town" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search a beach or town" className={field} />
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region" className={field}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
          <select value={dogMonth} onChange={(e) => setDogMonth(e.target.value)} aria-label="Dogs" className={field}>
            <option value="">Dogs: any rules</option>
            <option value="any">Dogs welcome all year</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>Dogs allowed in {m}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOGGLES.map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={!!need[k]}
              onClick={() => setNeed((n) => ({ ...n, [k]: !n[k] }))}
              disabled={!counts[k]}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${need[k] ? 'bg-atlantic-900 text-white' : 'bg-white text-atlantic-900 ring-1 ring-atlantic-950/15 hover:ring-seaglass-500'}`}
            >
              {l} <span className="opacity-60">({counts[k]})</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-atlantic-950/60" aria-live="polite">Showing {list.length} of {rows.length} beaches</p>
      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => {
          const [dl, dc] = dogLabel(r);
          return (
            <li key={r.slug}>
              <Link href={`/beaches/${r.slug}/`} className="group block overflow-hidden rounded-2xl bg-white no-underline shadow-sm ring-1 ring-atlantic-950/5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {r.img ? (
                    <Image src={r.img.src} alt={r.name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="bg-sand-100 object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-end bg-gradient-to-br from-seaglass-500 to-atlantic-900 p-4 font-bold text-white">{r.name}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-atlantic-900 group-hover:text-seaglass-600">{r.name}</h3>
                  <p className="text-sm text-atlantic-950/60">
                    Near {r.town}
                    {r.size ? ` · ${r.size}` : ''}
                    {r.surface ? ` ${r.surface}` : ''}
                    {r.facing ? ` · faces ${r.facing}` : ''}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    <li className={`chip ${dc}`}>{dl}</li>
                    {r.lifeguards ? <li className="chip bg-atlantic-100 text-atlantic-800">Lifeguards</li> : null}
                    {r.parking ? <li className="chip bg-sand-100 text-sand-700">Parking</li> : null}
                    {r.toilets ? <li className="chip bg-sand-100 text-sand-700">Toilets</li> : null}
                  </ul>
                </div>
              </Link>
              {r.img ? <p className="mt-1 px-1 text-[11px] text-atlantic-950/55">Photo: {r.img.by}{r.img.licence ? ` · ${r.img.licence}` : ''}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
