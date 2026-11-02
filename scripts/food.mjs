#!/usr/bin/env node
// Phase 3: collect pubs, restaurants and cafés in mainland Cornwall (food & drink).
//
//   Google Maps via SerpApi   discovery, type, opening hours, website, address, coordinates
//                             Google rating and review count are stored and shown (dated, linked to the listing),
//                             as on the Brighton Beer Guide; Google's photos and descriptions are not used
//
// One search per query per search centre (same centres as attractions). Responses are cached in
// data/raw/serpapi, so re-runs cost nothing; --max-searches stops before the monthly allowance runs out.
// Facilities come later from each venue's own website (scripts/food-enrich.mjs).
//
// Usage: node scripts/food.mjs [--max-searches=80] [--queries=pubs,restaurants]
// Manually curated fields (ourNotes, weVisited, customTitle, customDescription, images) survive re-runs.
import fs from 'node:fs/promises';
import { cachedFetch, readJson, writeJson, slugify, haversineKm, TODAY, NOT_STATED } from './lib/util.mjs';
import { FOOD_EXCLUDE } from './lib/matching.mjs';

const KEY = process.env.SERPAPI_KEY || process.env.SERPapi;
const MAX_SEARCHES = +((process.argv.find((a) => a.startsWith('--max-searches=')) || '=80').split('=')[1]);
const QUERIES = ((process.argv.find((a) => a.startsWith('--queries=')) || '=pubs,restaurants').split('=')[1]).split(',');
const SPACING_KM = 7;
const MIN_REVIEWS = 30;
const MAX_FROM_TOWN_KM = 10;

const towns = await readJson('data/towns.json');
const regions = await readJson('data/regions.json');
const previous = Object.fromEntries(((await readJson('data/food.json')) || []).map((v) => [v.googlePlaceId, v]));

// Same search centres as attractions: towns, with nearby ones sharing a centre.
const rank = { town: 0, administrative: 1, village: 2, hamlet: 3 };
const centres = [];
for (const t of [...towns].sort((a, b) => (rank[a.placeType] ?? 9) - (rank[b.placeType] ?? 9))) {
  if (!centres.some((c) => haversineKm(c, t) < SPACING_KM)) centres.push(t);
}

let spent = 0;
async function serp(params, cacheName) {
  const file = `data/raw/serpapi/${cacheName}.json`;
  const hit = await fs.readFile(file, 'utf8').catch(() => null);
  if (hit) return JSON.parse(hit);
  if (!KEY) throw new Error('No SerpApi key: set SERPAPI_KEY');
  if (spent >= MAX_SEARCHES) return null;
  spent++;
  const url = `https://serpapi.com/search.json?${new URLSearchParams({ ...params, hl: 'en', gl: 'uk', api_key: KEY })}`;
  return cachedFetch(url, file, { retries: 2, minDelay: 300 });
}

const raw = [];
let skipped = 0;
for (const q of QUERIES) {
  for (const c of centres) {
    const res = await serp({ engine: 'google_maps', type: 'search', q, ll: `@${c.lat},${c.lng},14z` }, `${slugify(q)}-${c.slug}`);
    if (!res) {
      skipped++;
      continue;
    }
    for (const r of res.local_results || []) raw.push(r);
  }
}
console.log(`${centres.length} centres × ${QUERIES.length} queries: ${spent} new searches, ${skipped} skipped by budget -> ${raw.length} raw results`);

// ---------- Filter -------------------------------------------------------------------------------
const POSTCODE = /\b(TR(?:[1-9]|1\d|20|26|27)|PL(?:1[0-8]|2[2-9]|3[0-5])|EX2[23])\s?\d[A-Z]{2}\b/; // mainland Cornwall only
const PUB = /\b(pub|inn|bar|tavern|gastropub|brewpub|free house|beer garden)\b/i;
const RESTAURANT = /restaurant|bistro|brasserie|steak|seafood|fish|pizza|grill|kitchen|dining|tapas|eatery/i;
const CAFE = /\b(caf[eé]|coffee|tea ?room|tea house|bakery|ice cream|creamery|deli)\b/i;
const FAST = /fast food|takeaway|take away|meal takeaway|chip shop|fish and chips? takeaway|kebab|food court/i;
const CHAINS = /^(mcdonald|kfc|burger king|subway|greggs|domino|pizza hut|costa|starbucks|caffe nero|papa john|five guys|nando|toby carvery|harvester|frankie|wimpy|morrisons|tesco|sainsbury|asda|lidl|aldi|co-?op|marks)/i;

// Classify by the MAIN Google category first; secondary categories only break ties.
const PUB_PRIMARY = /\b(pub|inn|tavern|gastropub|brewpub|brewery|microbrewery|taproom|free house)\b/i;
const kindOf = (types, title) => {
  const [primary = '', ...rest] = types;
  const others = rest.join(' | ');
  if (PUB_PRIMARY.test(primary) || /\b(inn|arms|tavern)\b/i.test(title)) return 'pub';
  if (CAFE.test(primary)) return 'cafe';
  if (RESTAURANT.test(primary)) return 'restaurant';
  if (/\bbar\b/i.test(primary)) {
    if (PUB_PRIMARY.test(others)) return 'pub';
    if (CAFE.test(others) || /caf[eé]/i.test(title)) return 'cafe';
    if (RESTAURANT.test(others)) return 'restaurant';
    return 'bar';
  }
  if (PUB.test(others)) return 'pub';
  if (CAFE.test(others)) return 'cafe';
  if (RESTAURANT.test(others)) return 'restaurant';
  return null;
};

const seen = new Map();
const reasons = {};
const drop = (why) => ((reasons[why] = (reasons[why] || 0) + 1), false);
for (const r of raw) {
  if (!r.place_id || seen.has(r.place_id)) continue;
  const types = (r.types || [r.type]).filter(Boolean);
  const ok = (() => {
    if (FOOD_EXCLUDE.includes(r.place_id) || FOOD_EXCLUDE.includes(r.title)) return drop('excluded by hand');
    if (!POSTCODE.test(r.address || '')) return drop('not mainland Cornwall');
    if ((r.reviews || 0) < MIN_REVIEWS) return drop('too few reviews');
    if (CHAINS.test(r.title)) return drop('national chain');
    if (FAST.test(r.type || '')) return drop('fast food / takeaway');
    if (!kindOf(types, r.title)) return drop('not a pub, restaurant or café');
    if (/permanently closed|temporarily closed/i.test(r.open_state || '')) return drop('closed');
    return true;
  })();
  if (ok) seen.set(r.place_id, r);
}
console.log(`Kept ${seen.size}. Dropped: ${JSON.stringify(reasons)}`);

// ---------- Assemble ------------------------------------------------------------------------------
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const gmaps = (r) => `https://www.google.com/maps/place/?q=place_id:${r.place_id}`;
const tidy = (n) => n.replace(/\s+[-–|]\s+.*$/, '').replace(/\s*\((?:[^)]*)\)\s*$/, '').trim();

const out = [];
const slugCount = {};
for (const r of seen.values()) {
  const prev = previous[r.place_id] || {};
  const lat = +r.gps_coordinates.latitude.toFixed(5);
  const lng = +r.gps_coordinates.longitude.toFixed(5);
  const { t: town, km } = towns.map((t) => ({ t, km: haversineKm(t, { lat, lng }) })).sort((a, b) => a.km - b.km)[0];
  if (km > MAX_FROM_TOWN_KM) continue;
  const types = (r.types || [r.type]).filter(Boolean);
  const name = tidy(r.title);
  const listing = { label: 'Google Maps listing (via SerpApi)', url: gmaps(r) };
  const hours = r.operating_hours && DAYS.every((d) => r.operating_hours[d]) ? DAYS.map((d) => [cap(d), r.operating_hours[d]]) : null;
  const v = {
    slug: slugify(name),
    name,
    kind: kindOf(types, r.title),
    category: types[0] || r.type,
    categories: types,
    town: town.slug,
    townDistanceKm: +km.toFixed(1),
    region: town.region,
    lat,
    lng,
    address: r.address || null,
    website: r.website || null,
    phone: r.phone || null,
    price: r.price || null,
    rating: r.rating ? { value: r.rating, reviews: r.reviews || 0, asOf: TODAY, source: listing } : null,
    hours: hours ? { value: 'listed', days: hours, closedDays: hours.filter(([, h]) => /closed/i.test(h)).map(([d]) => d), note: 'Hours from the Google Maps listing. Kitchen times and seasonal hours often differ, so check before you go.', source: listing } : { value: NOT_STATED },
    googlePlaceId: r.place_id,
    lastChecked: TODAY,
    features: prev.features || null,
    featuresSource: prev.featuresSource || null,
    ourNotes: prev.ourNotes || '',
    weVisited: prev.weVisited || false,
    ...(prev.customTitle ? { customTitle: prev.customTitle } : {}),
    ...(prev.customDescription ? { customDescription: prev.customDescription } : {}),
    ...(prev.images ? { images: prev.images } : {}),
    sources: [listing, ...(r.website ? [{ label: `${name} – official website`, url: r.website }] : [])],
  };
  slugCount[v.slug] = (slugCount[v.slug] || 0) + 1;
  out.push(v);
}
for (const v of out) if (slugCount[v.slug] > 1) v.slug = `${v.slug}-${v.town}`;
out.sort((a, b) => a.name.localeCompare(b.name));
await writeJson('data/food.json', out);

const by = (k) => out.filter((v) => v.kind === k).length;
console.log(`${out.length} venues written: ${by('pub')} pubs, ${by('restaurant')} restaurants, ${by('cafe')} cafés, ${by('bar')} bars (${spent} searches used)`);
console.log(regions.map((r) => `${r.name}: ${out.filter((v) => v.region === r.slug).length}`).join(' | '));
