// Hand-written (AI-assisted) guide copy per place, from data/enrichment/<kind>/<slug>.json.
// Read at build time only.
import fs from 'node:fs';
import path from 'node:path';

const cache = {};
export function enrichment(kind, slug) {
  const key = `${kind}/${slug}`;
  if (key in cache) return cache[key];
  const file = path.join(process.cwd(), 'data', 'enrichment', kind, `${slug}.json`);
  cache[key] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  return cache[key];
}

// Name + distance for each place a guide pairs with, from the place's own nearby lists (or any list).
import { beaches, towns, attractions } from './data';
import { haversine } from './geo';
export function pairLookup(place, e) {
  const out = {};
  for (const p of e?.week?.pairWith || []) {
    const list = p.kind === 'beach' ? beaches : p.kind === 'town' ? towns : attractions;
    const hit = list.find((x) => x.slug === p.slug);
    if (hit) out[p.slug] = { name: hit.customTitle || hit.name, km: +haversine(place, hit).toFixed(1) };
  }
  return out;
}
