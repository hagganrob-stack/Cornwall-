#!/usr/bin/env node
// Geocode the proposed visitor bases with OSM Nominatim (max 1 request/second, cached).
// Output: data/towns.json  (name, slug, region, lat, lng, OSM place type, sources)
import { cachedFetch, readJson, writeJson, slugify, TODAY } from './lib/util.mjs';

const seed = await readJson('data/towns.seed.json');
const existing = Object.fromEntries(((await readJson('data/towns.json')) || []).map((t) => [t.slug, t]));
const PLACE_TYPES = ['city', 'town', 'village', 'hamlet', 'suburb', 'locality', 'neighbourhood', 'isolated_dwelling', 'quarter'];
const out = [];
// Where the visitor name differs from the OSM settlement name.
const QUERY_ALIAS = { 'The Lizard': 'Lizard' };

for (const [region, names] of Object.entries(seed)) {
  for (const name of names) {
    const slug = slugify(name);
    const q = `${QUERY_ALIAS[name] || name}, Cornwall, England`;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=gb&featureType=settlement&q=${encodeURIComponent(q)}`;
    const results = await cachedFetch(url, `data/raw/nominatim-settlement/${slug}.json`, { minDelay: 1100 });
    const inCornwall = results.filter((r) => r.address?.county === 'Cornwall' || r.address?.state_district === 'Cornwall' || /Cornwall/.test(r.display_name));
    const hit = inCornwall.find((r) => r.category === 'place' && PLACE_TYPES.includes(r.type)) || inCornwall.find((r) => r.category === 'boundary') || inCornwall[0];
    if (!hit) {
      console.warn(`!! no result for ${name}`);
      continue;
    }
    const prev = existing[slug] || {};
    out.push({
      slug,
      name,
      region,
      lat: +(+hit.lat).toFixed(5),
      lng: +(+hit.lon).toFixed(5),
      placeType: hit.type,
      osm: `https://www.openstreetmap.org/${hit.osm_type}/${hit.osm_id}`,
      sources: [{ label: 'OpenStreetMap (via Nominatim)', url: `https://www.openstreetmap.org/${hit.osm_type}/${hit.osm_id}`, licence: 'ODbL' }],
      lastChecked: TODAY,
      ourNotes: prev.ourNotes || '',
      weVisited: prev.weVisited || false,
      ...(prev.customTitle ? { customTitle: prev.customTitle } : {}),
      ...(prev.customDescription ? { customDescription: prev.customDescription } : {}),
    });
    console.log(`${name.padEnd(20)} ${hit.type.padEnd(10)} ${hit.lat},${hit.lon}  ${hit.display_name.slice(0, 70)}`);
  }
}
await writeJson('data/towns.json', out);
console.log(`\n${out.length} towns written`);
