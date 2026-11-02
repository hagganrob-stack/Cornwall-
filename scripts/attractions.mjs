#!/usr/bin/env node
// Phase 2: collect attractions / things to do in mainland Cornwall.
//
//   Google Maps via SerpApi   discovery, categories, opening hours, website, address, coordinates
//                             (ratings and review counts are used ONLY as an inclusion threshold and
//                             are never stored or shown; Google's own descriptions and photos are not used)
//   The attraction's website  free / paid entry, quoted from the page
//
// One "things to do" search per search centre (towns closer than SPACING_KM share one).
// Responses are cached in data/raw/serpapi (git-ignored), so re-runs cost nothing.
// A hard budget (--max-searches=N, default 70) stops before the monthly SerpApi allowance is used up.
// The key comes from env SERPAPI_KEY (or SERPapi); it is never written to disk.
//
// Usage: node scripts/attractions.mjs [--max-searches=70] [--refetch-sites]
// Manually curated fields (ourNotes, weVisited, customTitle, customDescription, images) survive re-runs.
import fs from 'node:fs/promises';
import { cachedFetch, readJson, writeJson, slugify, haversineKm, sleep, TODAY, NOT_STATED, UA } from './lib/util.mjs';
import { ATTRACTION_EXCLUDE, ATTRACTION_RENAME } from './lib/matching.mjs';

const KEY = process.env.SERPAPI_KEY || process.env.SERPapi;
const MAX_SEARCHES = +((process.argv.find((a) => a.startsWith('--max-searches=')) || '=70').split('=')[1]);
const REFETCH_SITES = process.argv.includes('--refetch-sites');
const SPACING_KM = 7;
const MIN_REVIEWS = 30;
const MAX_FROM_TOWN_KM = 12;

const towns = await readJson('data/towns.json');
const regions = await readJson('data/regions.json');
const beaches = await readJson('data/beaches.json');
const previous = Object.fromEntries(((await readJson('data/attractions.json')) || []).map((a) => [a.googlePlaceId, a]));

// ---------- 1. Search centres -------------------------------------------------------------
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
  // cachedFetch writes the response body only (the key is in the URL, never in the file).
  return cachedFetch(url, file, { retries: 2, minDelay: 300 });
}

const raw = [];
let skipped = 0;
for (const c of centres) {
  const res = await serp({ engine: 'google_maps', type: 'search', q: 'things to do', ll: `@${c.lat},${c.lng},13z` }, `ttd-${c.slug}`);
  if (!res) {
    skipped++;
    continue;
  }
  for (const r of res.local_results || []) raw.push({ ...r, _centre: c.slug });
}
console.log(`${centres.length} search centres (${spent} new searches, ${skipped} skipped by budget) -> ${raw.length} raw results`);

// ---------- 2. Filter to real attractions in mainland Cornwall ------------------------------
const POSTCODE = /\b(TR(?:[1-9]|1\d|20|26|27)|PL(?:1[0-8]|2[2-9]|3[0-5])|EX2[23])\s?\d[A-Z]{2}\b/; // excludes Scilly (TR21-25), Plymouth, Devon
const KEEP =
  /tourist attraction|museum|gallery|garden|park|nature reserve|wildlife|zoo|aquarium|farm|castle|historical|heritage|landmark|monument|archaeolog|scenic|observation|lighthouse|hiking|boat tour|sightseeing|railway|escape room|indoor playground|play ?area|playground|bowling|climbing|trampoline|cinema|theatre|water park|amusement|theme park|adventure|mini golf|crazy golf|mine|visitor cent|botanical|maze|sanctuary/i;
const DROP =
  /restaurant|caf[eé]|pub\b|bar\b|hotel|inn\b|bed & breakfast|guest house|holiday|camp|caravan|cottage|lodge|shop|store|supermarket|market|car park|parking|beach\b|bus|taxi|real estate|estate agent|church|chapel|cathedral|school|hospital|surgery|gym|spa\b|salon|marina|port authority|harbour master|car hire|petrol|golf club|golf course|wedding|event venue|winery|vineyard|brewery|distillery/i;
const PRIMARY_DROP = /beach|town|village|city|neighbourhood|harbour|bay/i;

const tidyName = (n) => ATTRACTION_RENAME[n] || n.replace(/\s+[-–|]\s+.*(cornwall|escape room|live).*$/i, '').trim();
const townNames = new Set(towns.map((t) => t.name.toLowerCase().replace(/[^a-z]/g, '')));
const seen = new Map();
const reasons = {};
const drop = (why) => ((reasons[why] = (reasons[why] || 0) + 1), false);
for (const r of raw) {
  if (!r.place_id || seen.has(r.place_id)) continue;
  const types = (r.types || [r.type]).filter(Boolean).join(', ');
  const ok = (() => {
    if (ATTRACTION_EXCLUDE.includes(r.place_id) || ATTRACTION_EXCLUDE.includes(r.title) || ATTRACTION_EXCLUDE.includes(tidyName(r.title))) return drop('excluded by hand');
    if (!POSTCODE.test(r.address || '')) return drop('not mainland Cornwall');
    if ((r.reviews || 0) < MIN_REVIEWS) return drop('too few reviews');
    if (!KEEP.test(types)) return drop('not an attraction type');
    if (DROP.test(types) && !/tourist attraction|museum|castle|garden/i.test(types)) return drop('food/shop/stay/other');
    if (PRIMARY_DROP.test(r.type || '') && !/tourist attraction/i.test(r.type || '')) return drop('beach/harbour/place');
    if (townNames.has(r.title.toLowerCase().replace(/[^a-z]/g, ''))) return drop('is a town');
    const near = beaches.find((b) => haversineKm(b, { lat: r.gps_coordinates.latitude, lng: r.gps_coordinates.longitude }) < 0.4 && r.title.toLowerCase().includes(b.name.toLowerCase().replace(/ beach$/, '')));
    if (near || /\b(beach|sands)\b/i.test(r.title)) return drop('is a beach');
    return true;
  })();
  if (ok) seen.set(r.place_id, r);
}
console.log(`Kept ${seen.size} attractions. Dropped: ${JSON.stringify(reasons)}`);

// ---------- 3. Categories -> setting, kids, time to allow ----------------------------------
// Matched in order against each Google category; the first rule per category wins.
const RULES = [
  [/amphitheatre|open[- ]air/i, { setting: 'outdoor', allow: [2, 3] }],
  [/sculpture (?:park|garden)/i, { setting: 'outdoor', allow: [1, 2] }],
  [/indoor playground|soft play|trampoline|laser/i, { setting: 'indoor', kids: true, allow: [2, 3] }],
  [/escape room|bowling|cinema|theatre|climbing/i, { setting: 'indoor', allow: [1, 2] }],
  [/aquarium/i, { setting: 'indoor', kids: true, allow: [1, 3] }],
  [/museum|gallery|heritage cent|visitor cent|exhibit/i, { setting: 'indoor', allow: [1, 2] }],
  [/zoo|wildlife|animal|sanctuary|bird/i, { setting: 'outdoor', kids: true, allow: [3, 5] }],
  [/farm/i, { setting: 'outdoor', kids: true, allow: [2, 4] }],
  [/theme park|amusement|water park|adventure|maze|play ?area|playground|mini golf|crazy golf/i, { setting: 'outdoor', kids: true, allow: [3, 6] }],
  [/botanical|garden/i, { setting: 'outdoor', allow: [2, 4] }],
  [/castle|historical|landmark|monument|archaeolog|heritage|lighthouse|mine/i, { setting: 'outdoor', allow: [1, 2] }],
  [/nature reserve|hiking|scenic|observation|park/i, { setting: 'outdoor', allow: [1, 3] }],
  [/boat tour|sightseeing|railway|coasteering|kayak|canoe|outdoor activit|ropes|via ferrata|karting|go-?cart/i, { setting: 'outdoor', allow: [1, 3] }],
  [/waterfall|\bhead(?:land)?\b|\bpoint\b|\bcave\b|valley|woods?\b|\btrail\b|\bwell\b|\btor\b|\brock\b/i, { setting: 'outdoor', allow: [1, 2] }],
];
// Some categories say nothing about setting; the name is a fallback hint only when categories give none.
const NAME_FIRST = /trampoline|amphitheatre|sculpture (?:park|garden)|coasteering/i;
function classify(types, name) {
  const first = [name, ...types].find((x) => NAME_FIRST.test(x));
  let hits = first ? [RULES.find(([re]) => re.test(first))[1]] : types.map((t) => RULES.find(([re]) => re.test(t))).filter(Boolean).map(([, v]) => v);
  if (!hits.length) hits = [RULES.find(([re]) => re.test(name))].filter(Boolean).map(([, v]) => v);
  if (!hits.length) return { setting: null, kids: false, allow: null };
  const settings = new Set(hits.map((h) => h.setting));
  return {
    setting: settings.size > 1 ? 'indoor and outdoor' : [...settings][0],
    kids: hits.some((h) => h.kids),
    allow: [Math.min(...hits.map((h) => h.allow[0])), Math.max(...hits.map((h) => h.allow[1]))],
  };
}
const allowText = ([a, b]) => (b >= 5 ? (a >= 3 ? 'Most of a day' : 'Half a day to a full day') : b >= 3 ? (a >= 2 ? 'Two hours to half a day' : 'One to three hours') : 'An hour or two');

// ---------- 4. Free / paid entry from the attraction's own website -------------------------
const FREE = /\b(free (?:entry|admission|to (?:visit|enter|explore))|admission (?:is )?free|entry (?:is )?(?:completely )?free|no (?:admission|entry) (?:charge|fee))\b/gi;
const PAID = /(?:admission|tickets?|entry|adults?)[^.<>]{0,50}£\s?\d+(?:\.\d\d)?|£\s?\d+(?:\.\d\d)?\s*(?:per (?:adult|person)|adults?\b)/gi;
// Context that means a match is NOT about general admission.
const NOT_FREE = /member|parking|car ?park|under ?\d|under-?\d|children|aged|and under|carers?|for (?:locals|residents)|shop|café|cafe|gift|during your stay|all year|annual|pay once|donation|tate (?:britain|modern|liverpool)/i;
const NOT_PAID = /parking|car ?park|annual|membership|gift aid only|per (?:car|vehicle)|whole day £/i;
const htmlText = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&pound;/g, '£').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
async function siteText(slug, url) {
  const file = `data/raw/websites/${slug}.txt`;
  if (!REFETCH_SITES) {
    const hit = await fs.readFile(file, 'utf8').catch(() => null);
    if (hit != null) return hit;
  }
  let text = '';
  try {
    const ctl = AbortSignal.timeout(12000);
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: ctl });
    if (res.ok && /html/.test(res.headers.get('content-type') || '')) text = htmlText((await res.text()).slice(0, 600000));
  } catch {}
  await fs.mkdir('data/raw/websites', { recursive: true });
  await fs.writeFile(file, text);
  await sleep(700);
  return text;
}
function entryFact(text, url) {
  if (!text) return { value: NOT_STATED };
  const around = (m, n = 60) => text.slice(Math.max(0, m.index - n), m.index + m[0].length + n);
  const clean = (re, not, n) => [...text.matchAll(re)].filter((m) => !not.test(around(m, n)));
  const quote = (m) => `…${around(m, 40).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/[\u2B25]/g, '·').replace(/\s+/g, ' ').replace(/^\S*\s/, '').replace(/\s\S*$/, '').trim()}…`;
  // Paid wins: a free-for-members line on a paying attraction must not make it "free".
  const p = clean(PAID, NOT_PAID, 15)[0];
  if (p) return { value: 'paid', quote: quote(p), source: { label: 'Official website', url } };
  const f = clean(FREE, NOT_FREE, 60)[0];
  if (f) return { value: 'free', quote: quote(f), source: { label: 'Official website', url } };
  return { value: NOT_STATED };
}

// ---------- 5. Assemble ---------------------------------------------------------------------
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const gmaps = (r) => `https://www.google.com/maps/place/?q=place_id:${r.place_id}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

const slugCount = {};
const out = [];
for (const r of seen.values()) {
  const prev = previous[r.place_id] || {};
  const name = tidyName(r.title);
  const lat = +r.gps_coordinates.latitude.toFixed(5);
  const lng = +r.gps_coordinates.longitude.toFixed(5);
  const ranked = towns.map((t) => ({ t, km: haversineKm(t, { lat, lng }) })).sort((a, b) => a.km - b.km);
  const { t: town, km } = ranked[0];
  if (km > MAX_FROM_TOWN_KM) continue;
  const types = (r.types || [r.type]).filter(Boolean).filter((t) => !/^tourist attraction$/i.test(t));
  const cls = classify(types.length ? types : [r.type || ''], name);
  const listing = { label: 'Google Maps listing (via SerpApi)', url: gmaps(r) };
  const site = r.website || null;
  const text = site ? await siteText(slugify(name), site) : '';
  const hours = r.operating_hours && DAYS.every((d) => r.operating_hours[d]) ? DAYS.map((d) => [cap(d), r.operating_hours[d]]) : null;
  const closedDays = hours ? hours.filter(([, h]) => /closed/i.test(h)).map(([d]) => d) : [];
  const a = {
    slug: slugify(name),
    name,
    category: types[0] || r.type,
    categories: types,
    town: town.slug,
    townDistanceKm: +km.toFixed(1),
    region: town.region,
    lat,
    lng,
    address: r.address || null,
    website: site,
    setting: cls.setting ? { value: cls.setting, method: types.length ? `From its Google Maps categories (${types.join(', ')})` : 'From the kind of place it is', source: listing } : { value: NOT_STATED },
    rainyDay: cls.setting && cls.setting !== 'outdoor' ? { value: 'yes', method: cls.setting === 'indoor' ? 'Indoors' : 'Has indoor areas', source: listing } : { value: NOT_STATED },
    kids: cls.kids ? { value: 'yes', method: `Aimed at families (Google Maps category: ${types.find((t) => RULES.some(([re, v]) => v.kids && re.test(t))) || name})`, source: listing } : { value: NOT_STATED },
    entry: entryFact(text, site),
    hours: hours ? { value: 'listed', days: hours, closedDays, note: 'Hours from the Google Maps listing. Many Cornish attractions change their hours by season, so check the website before you go.', source: listing } : { value: NOT_STATED },
    allow: cls.allow ? { value: allowText(cls.allow), method: 'Typical time for this kind of place, worked out from its category; not first-hand.' } : { value: NOT_STATED },
    googlePlaceId: r.place_id,
    lastChecked: TODAY,
    ourNotes: prev.ourNotes || '',
    weVisited: prev.weVisited || false,
    ...(prev.customTitle ? { customTitle: prev.customTitle } : {}),
    ...(prev.customDescription ? { customDescription: prev.customDescription } : {}),
    ...(prev.images ? { images: prev.images } : {}),
  };
  a.sources = [listing, ...(site ? [{ label: `${name} – official website`, url: site }] : [])];
  slugCount[a.slug] = (slugCount[a.slug] || 0) + 1;
  out.push(a);
}
for (const a of out) if (slugCount[a.slug] > 1) a.slug = `${a.slug}-${a.town}`;
out.sort((x, y) => x.name.localeCompare(y.name));
await writeJson('data/attractions.json', out);

const pct = (f) => `${Math.round((out.filter(f).length / out.length) * 100)}%`;
const has = (f) => f && f.value !== NOT_STATED;
console.log(`${out.length} attractions written (${spent} SerpApi searches used this run)`);
console.log(regions.map((r) => `${r.name}: ${out.filter((a) => a.region === r.slug).length}`).join(' | '));
console.log(`setting ${pct((a) => has(a.setting))} · rainy-day ${pct((a) => has(a.rainyDay))} · kids ${pct((a) => has(a.kids))} · entry ${pct((a) => has(a.entry))} (free ${out.filter((a) => a.entry.value === 'free').length}) · hours ${pct((a) => has(a.hours))} · website ${pct((a) => a.website)}`);
