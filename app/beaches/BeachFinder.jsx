'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const DOGS = { none: 'No Council restriction', seasonal: 'Seasonal ban', leads: 'Leads in season', banned: 'No dogs' };

export default function BeachFinder({ rows, regions }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [dogs, setDogs] = useState(false);
  const [need, setNeed] = useState({ lifeguards: false, parking: false, toilets: false, cafe: false, surf: false });
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!s || r.name.toLowerCase().includes(s) || r.town.toLowerCase().includes(s)) &&
        (!region || r.region === region) &&
        (!dogs || r.dogs === 'none') &&
        Object.entries(need).every(([k, on]) => !on || r[k])
    );
  }, [rows, q, region, dogs, need]);
  const toggle = (k) => setNeed((n) => ({ ...n, [k]: !n[k] }));
  return (
    <div className="finder">
      <div className="filters">
        <input type="search" placeholder="Search beach or town" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search beach or town" />
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>{r.name}</option>
          ))}
        </select>
        <label><input type="checkbox" checked={dogs} onChange={() => setDogs(!dogs)} /> Dogs: no Council restriction</label>
        <label><input type="checkbox" checked={need.lifeguards} onChange={() => toggle('lifeguards')} /> RNLI lifeguards</label>
        <label><input type="checkbox" checked={need.parking} onChange={() => toggle('parking')} /> Parking</label>
        <label><input type="checkbox" checked={need.toilets} onChange={() => toggle('toilets')} /> Toilets</label>
        <label><input type="checkbox" checked={need.cafe} onChange={() => toggle('cafe')} /> Café</label>
        <label><input type="checkbox" checked={need.surf} onChange={() => toggle('surf')} /> Surf</label>
      </div>
      <p className="meta">{list.length} of {rows.length} beaches</p>
      <ul className="rows">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={`/beaches/${r.slug}/`} className="row">
              {r.thumb ? <img src={r.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="noimg" />}
              <span className="row-main">
                <strong>{r.name}</strong>
                <span className="meta">
                  {r.town}
                  {r.size ? ` · ${r.size}` : ''}
                  {r.surface ? ` · ${r.surface}` : ''}
                  {r.facing ? ` · faces ${r.facing}` : ''}
                </span>
                <span className="meta">
                  Dogs: {DOGS[r.dogs]}
                  {r.lifeguards ? ' · RNLI lifeguards' : ''}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
