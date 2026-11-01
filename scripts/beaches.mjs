#!/usr/bin/env node
// Phase 1: collect every NAMED beach in Cornwall from OpenStreetMap (Overpass API), then attach
// facts from official sources. Every fact carries its source; anything unconfirmed is "not stated".
//
//   OSM (ODbL)                 name, location, outline -> size, surface, wheelchair/dog/lifeguard tags,
//                              nearby car parks / toilets / cafés / surf schools, coastline -> facing
//   RNLI open data             lifeguard units (data/lifeguards.json)
//   Cornwall Council PSPO page dog restrictions (data/dog-restrictions.json)
//
// Overpass responses are cached in data/raw/overpass (git-ignored). Use --refetch to refresh.
// Manually curated fields (ourNotes, weVisited, customTitle, customDescription, images.hero) are
// preserved across re-runs.
import fs from 'node:fs/promises';
import { cachedFetch, readJson, writeJson, slugify, haversineKm, TODAY, NOT_STATED } from './lib/util.mjs';
import { polygonAreaM2, centroid, distanceToBeachM, seawardBearing, compass } from './lib/geo.mjs';
import { DOG_MATCHES, LIFEGUARD_MATCHES, EXCLUDE_NAMES } from './lib/matching.mjs';

const OVERPASS = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
const REFETCH = process.argv.includes('--refetch');
const BBOX = '49.94,-5.76,50.94,-4.16'; // mainland Cornwall (Isles of Scilly excluded)

async function overpass(name, query) {
  const file = `data/raw/overpass/${name}.json`;
  if (REFETCH) await fs.rm(file, { force: true });
  return cachedFetch(OVERPASS, file, {
    init: { method: 'POST', body: new URLSearchParams({ data: query }), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    retries: 4,
  });
}

const AREA = 'area["ISO3166-2"="GB-CON"]->.c;';
const [beachRes, amenityRes, coastRes] = [
  // `out geom` (not `out tags ...`): relations need their members to build an outline. The cache name is
  // versioned so a stale cache from the old query isn't reused.
  await overpass('beaches-v2', `[out:json][timeout:240];${AREA}nwr["natural"="beach"]["name"](area.c);out geom;`),
  await overpass(
    'amenities',
    `[out:json][timeout:240];${AREA}(nwr["amenity"~"^(parking|toilets|cafe|ice_cream)$"](area.c);nwr["sport"="surfing"](area.c);nwr["shop"="surf"](area.c);nwr["leisure"="slipway"](area.c););out tags center;`
  ),
  await overpass('coastline', `[out:json][timeout:240];way["natural"="coastline"](${BBOX});out geom;`),
];

const towns = await readJson('data/towns.json');
const regions = await readJson('data/regions.json');
const dogData = await readJson('data/dog-restrictions.json');
const lifeguardData = await readJson('data/lifeguards.json');
const previous = Object.fromEntries(((await readJson('data/beaches.json')) || []).map((b) => [b.osmId, b]));

const OSM_SOURCE = (el) => ({ label: 'OpenStreetMap', url: `https://www.openstreetmap.org/${el.type}/${el.id}`, licence: 'ODbL' });
const COUNCIL_SOURCE = { label: 'Cornwall Council – Dogs on beaches (PSPO)', url: dogData.source };
const RNLI_SOURCE = { label: 'RNLI open data – Lifeguard Units', url: lifeguardData.source.url };

// ---------- 1. Beaches from OSM ----------------------------------------------------------
function geometryPoints(el) {
  if (el.type === 'way' && el.geometry) return el.geometry.map((g) => ({ lat: g.lat, lng: g.lon }));
  if (el.type === 'relation' && el.members) {
    // Use the largest outer ring for area/outline.
    const outers = el.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map((g) => ({ lat: g.lat, lng: g.lon })));
    return outers.sort((a, b) => b.length - a.length)[0] || null;
  }
  return null;
}

let raw = beachRes.elements
  .filter((el) => el.tags?.name && !EXCLUDE_NAMES.some((re) => re.test(el.tags.name)))
  .map((el) => {
    const outline = geometryPoints(el);
    const c =
      el.type === 'node'
        ? { lat: el.lat, lng: el.lon }
        : el.center
          ? { lat: el.center.lat, lng: el.center.lon }
          : outline
            ? centroid(outline)
            : el.bounds
              ? { lat: (el.bounds.minlat + el.bounds.maxlat) / 2, lng: (el.bounds.minlon + el.bounds.maxlon) / 2 }
              : null;
    if (!c) return null;
    return { el, name: el.tags.name.trim(), lat: c.lat, lng: c.lng, outline, areaM2: outline ? polygonAreaM2(outline) : null };
  })
  .filter(Boolean);

// Merge OSM features that share a name and sit within 1 km (beaches mapped in pieces, or a node + an area).
const merged = [];
for (const b of raw.sort((a, b) => (b.areaM2 || 0) - (a.areaM2 || 0))) {
  const twin = merged.find((m) => m.name.toLowerCase() === b.name.toLowerCase() && haversineKm(m, b) < 1);
  if (twin) {
    twin.parts.push(b.el);
    if (b.areaM2) twin.areaM2 = (twin.areaM2 || 0) + b.areaM2;
  } else merged.push({ ...b, parts: [b.el] });
}

// ---------- 2. Context data ---------------------------------------------------------------
const amenities = amenityRes.elements
  .map((el) => ({ el, tags: el.tags || {}, lat: el.lat ?? el.center?.lat, lng: el.lon ?? el.center?.lon }))
  .filter((a) => a.lat != null);
const coastSegments = [];
for (const w of coastRes.elements) {
  const g = w.geometry || [];
  for (let i = 0; i < g.length - 1; i++) coastSegments.push([{ lat: g[i].lat, lng: g[i].lon }, { lat: g[i + 1].lat, lng: g[i + 1].lon }]);
}

function nearby(beach, predicate, maxM) {
  return amenities
    .filter((a) => predicate(a.tags) && Math.abs(a.lat - beach.lat) < 0.02 && Math.abs(a.lng - beach.lng) < 0.03)
    .map((a) => ({ a, d: Math.round(distanceToBeachM(a, beach)) }))
    .filter((x) => x.d <= maxM)
    .sort((x, y) => x.d - y.d);
}

// ---------- 3. Field builders --------------------------------------------------------------
const tagOf = (b, key) => b.parts.map((p) => p.tags?.[key]).find((v) => v != null);

function surfaceFact(b) {
  const s = tagOf(b, 'surface');
  if (!s) return { value: NOT_STATED };
  const map = { sand: 'sand', fine_gravel: 'shingle', gravel: 'shingle', pebbles: 'shingle', pebblestone: 'shingle', shingle: 'shingle', stone: 'rocky', rock: 'rocky', mud: 'mud', dirt: 'mixed', ground: 'mixed' };
  const parts = s.split(/[;,]/).map((x) => map[x.trim()] || x.trim());
  const uniq = [...new Set(parts)];
  return { value: uniq.length > 1 ? uniq.join(' and ') : uniq[0], osmTag: `surface=${s}`, source: OSM_SOURCE(b.parts[0]) };
}

function sizeFact(b) {
  if (!b.areaM2) return { value: NOT_STATED };
  const a = Math.round(b.areaM2);
  // Thresholds on the mapped outline (which shifts with the tide line): small < 1 ha, medium < 5 ha.
  const value = a < 10_000 ? 'small' : a < 50_000 ? 'medium' : 'large';
  return { value, areaM2: a, method: 'Area of the beach outline mapped in OpenStreetMap', source: OSM_SOURCE(b.parts[0]) };
}

function facingFact(b) {
  const r = seawardBearing(b, coastSegments.filter(([p]) => Math.abs(p.lat - b.lat) < 0.012 && Math.abs(p.lng - b.lng) < 0.018));
  if (!r) return { value: NOT_STATED };
  return { value: compass(r.bearing), bearing: r.bearing, method: 'Calculated from the OpenStreetMap coastline next to the beach', source: { label: 'OpenStreetMap coastline', url: `https://www.openstreetmap.org/#map=16/${b.lat.toFixed(5)}/${b.lng.toFixed(5)}`, licence: 'ODbL' } };
}

const places = (list) =>
  list.slice(0, 3).map(({ a, d }) => ({
    name: a.tags.name || null,
    distanceM: d,
    fee: a.tags.fee || null,
    wheelchair: a.tags.wheelchair || null,
    osm: `https://www.openstreetmap.org/${a.el.type}/${a.el.id}`,
  }));

function parkingFact(b) {
  const tag = tagOf(b, 'parking');
  const list = nearby(b, (t) => t.amenity === 'parking' && !/private|no|customers/.test(t.access || ''), 400);
  if (!list.length) return { value: NOT_STATED, ...(tag ? { osmTag: `parking=${tag}` } : {}) };
  return { value: 'yes', summary: `Car park mapped ${list[0].d < 60 ? 'next to the beach' : `about ${roundM(list[0].d)} from the beach`}`, places: places(list), source: { label: 'OpenStreetMap', url: places(list)[0].osm, licence: 'ODbL' } };
}

function toiletsFact(b) {
  const tag = tagOf(b, 'toilets');
  if (tag === 'yes') return { value: 'yes', summary: 'Toilets at the beach', source: OSM_SOURCE(b.parts[0]) };
  const list = nearby(b, (t) => t.amenity === 'toilets' && !/private|customers/.test(t.access || ''), 300);
  if (!list.length) return { value: NOT_STATED };
  return { value: 'yes', summary: `Public toilets mapped ${list[0].d < 60 ? 'at the beach' : `about ${roundM(list[0].d)} away`}`, places: places(list), source: { label: 'OpenStreetMap', url: places(list)[0].osm, licence: 'ODbL' } };
}

function cafeFact(b) {
  const list = nearby(b, (t) => (t.amenity === 'cafe' || t.amenity === 'ice_cream') && t.disused !== 'yes', 300);
  if (!list.length) return { value: NOT_STATED };
  return { value: 'yes', summary: `${list.length} café${list.length > 1 ? 's' : ''} or kiosk${list.length > 1 ? 's' : ''} mapped within 300 m`, places: places(list), source: { label: 'OpenStreetMap', url: places(list)[0].osm, licence: 'ODbL' } };
}

function accessibilityFact(b) {
  const wc = tagOf(b, 'wheelchair');
  const toiletsWc = nearby(b, (t) => t.amenity === 'toilets' && t.wheelchair === 'yes', 300);
  const slip = nearby(b, (t) => t.leisure === 'slipway', 150);
  const notes = [];
  if (wc === 'yes') notes.push('The beach is tagged as wheelchair accessible in OpenStreetMap.');
  if (wc === 'limited') notes.push('The beach is tagged as having limited wheelchair access in OpenStreetMap.');
  if (wc === 'no') notes.push('The beach is tagged as not wheelchair accessible in OpenStreetMap.');
  if (toiletsWc.length) notes.push(`Wheelchair-accessible toilets mapped about ${roundM(toiletsWc[0].d)} away.`);
  if (slip.length) notes.push('A slipway is mapped at the beach.');
  if (!notes.length) return { value: NOT_STATED };
  const value = wc === 'yes' ? 'yes' : wc === 'limited' ? 'limited' : wc === 'no' ? 'no' : 'partial info';
  return { value, wheelchairTag: wc || null, notes, source: OSM_SOURCE(b.parts[0]) };
}

function surfFact(b) {
  if (/surfing/.test(tagOf(b, 'sport') || '')) return { value: 'yes', summary: 'Tagged as a surfing beach in OpenStreetMap', source: OSM_SOURCE(b.parts[0]) };
  const list = nearby(b, (t) => t.sport === 'surfing' || t.shop === 'surf', 300);
  if (!list.length) return { value: NOT_STATED };
  return { value: 'yes', summary: `Surf school or surf shop mapped ${list[0].d < 60 ? 'at the beach' : `about ${roundM(list[0].d)} away`}`, places: places(list), source: { label: 'OpenStreetMap', url: places(list)[0].osm, licence: 'ODbL' } };
}

function rockPoolsFact(b) {
  const tag = tagOf(b, 'rock_pools') || tagOf(b, 'rockpools');
  if (tag === 'yes') return { value: 'yes', source: OSM_SOURCE(b.parts[0]) };
  return { value: NOT_STATED };
}

function lifeguardFact(b) {
  const units = lifeguardData.units;
  const osmId = `${b.parts[0].type}/${b.parts[0].id}`;
  const manual = osmId in LIFEGUARD_MATCHES ? LIFEGUARD_MATCHES[osmId] : LIFEGUARD_MATCHES[b.name];
  let unit = manual !== undefined ? units.find((u) => u.name === manual) : null;
  if (manual === undefined) {
    const norm = (s) => s.toLowerCase().replace(/\b(beach|bay|cove|sands|the)\b/g, '').replace(/[^a-z]/g, '');
    unit = units.find((u) => norm(u.name) && norm(u.name) === norm(b.name) && haversineKm(u, b) < 2) || units.find((u) => distanceToBeachM(u, b) < 150);
  }
  if (unit) {
    return { value: 'RNLI (seasonal)', unit: unit.name, rnliPage: unit.rnliPage, note: 'RNLI lifeguards patrol here in season. Check the RNLI beach page for this year’s dates and times.', source: { ...RNLI_SOURCE, url: unit.rnliPage || RNLI_SOURCE.url } };
  }
  const sup = tagOf(b, 'supervised') || tagOf(b, 'lifeguard');
  if (sup === 'yes' || sup === 'seasonal') return { value: 'lifeguarded (per OSM)', note: 'Mapped as supervised in OpenStreetMap; not listed in RNLI open data.', source: OSM_SOURCE(b.parts[0]) };
  return { value: NOT_STATED };
}

const fmtDate = (md) => {
  if (!md) return null;
  const [m, d] = md.split('-').map(Number);
  return `${d} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]}`;
};

function dogFact(b) {
  const entryId = Object.entries(DOG_MATCHES).find(([, names]) => names.some((n) => dogNameMatches(n, b)))?.[0];
  const entry = entryId && dogData.entries.find((e) => e.id === entryId);
  const osmDog = tagOf(b, 'dog');
  if (entry) {
    const period = entry.dates.allYear ? 'all year' : `${fmtDate(entry.dates.from)} to ${fmtDate(entry.dates.to)}`;
    const hours = entry.times.allDay ? '24 hours a day' : `${entry.times.from.replace(':00', '')}am to ${+entry.times.to.slice(0, 2) - 12}pm`;
    const rule =
      entry.restriction === 'leads'
        ? `Dogs must be on leads ${period}, ${hours}.`
        : entry.dates.allYear
          ? 'Dogs are not allowed at any time (all-year ban).'
          : `Dogs are not allowed ${period}, ${hours}. Outside those dates and times there is no Council restriction.`;
    return {
      value: entry.restriction === 'leads' ? 'leads in season' : entry.dates.allYear ? 'banned all year' : 'seasonal ban',
      councilListed: true,
      councilEntry: entry.councilName,
      restriction: entry.restriction,
      from: entry.dates.from,
      to: entry.dates.to,
      allYear: entry.dates.allYear,
      hoursFrom: entry.times.from,
      hoursTo: entry.times.to,
      summary: rule,
      mapPdf: entry.mapPdf,
      source: { ...COUNCIL_SOURCE, pageLastUpdated: dogData.pageLastUpdated },
    };
  }
  return {
    value: 'no council restriction listed',
    councilListed: false,
    summary: 'This beach is not on Cornwall Council’s list of beaches with dog restrictions. Privately owned beaches can set their own rules, so check signs on arrival.',
    osmDogTag: osmDog || null,
    source: { ...COUNCIL_SOURCE, pageLastUpdated: dogData.pageLastUpdated },
  };
}
// A match is a string (exact name), a RegExp, or { name, near: [lat, lng] } for names that occur
// more than once in Cornwall (e.g. two "Harbour Beach"es): the beach must then be within 3 km of `near`.
function dogNameMatches(n, b) {
  if (n instanceof RegExp) return n.test(b.name);
  if (typeof n === 'string') return n === b.name;
  return n.name === b.name && haversineKm(b, { lat: n.near[0], lng: n.near[1] }) < 3;
}

const roundM = (m) => (m < 100 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${Math.round(m / 50) * 50} m`);

// ---------- 4. Town & region ---------------------------------------------------------------
function nearestTown(b) {
  const ranked = towns.map((t) => ({ t, km: haversineKm(t, b) })).sort((x, y) => x.km - y.km);
  return ranked[0];
}

// ---------- 5. Assemble ---------------------------------------------------------------------
const slugCount = {};
const beaches = merged.map((b) => {
  const { t: town, km } = nearestTown(b);
  const prev = previous[`${b.parts[0].type}/${b.parts[0].id}`] || {};
  let slug = slugify(b.name);
  return {
    _slugBase: slug,
    _townSlug: town.slug,
    osmId: `${b.parts[0].type}/${b.parts[0].id}`,
    osmIds: b.parts.map((p) => `${p.type}/${p.id}`),
    name: b.name,
    altNames: [...new Set(b.parts.flatMap((p) => [p.tags.alt_name, p.tags['name:kw']].filter(Boolean)))],
    lat: +b.lat.toFixed(5),
    lng: +b.lng.toFixed(5),
    town: town.slug,
    townDistanceKm: +km.toFixed(1),
    region: town.region,
    surface: surfaceFact(b),
    size: sizeFact(b),
    facing: facingFact(b),
    parking: parkingFact(b),
    toilets: toiletsFact(b),
    cafeNearby: cafeFact(b),
    accessibility: accessibilityFact(b),
    surf: surfFact(b),
    rockPools: rockPoolsFact(b),
    swimming: { value: NOT_STATED },
    lifeguards: lifeguardFact(b),
    dogs: dogFact(b),
    wikidata: tagOf(b, 'wikidata') || null,
    wikipedia: tagOf(b, 'wikipedia') || null,
    access: tagOf(b, 'access') || null,
    lastChecked: TODAY,
    ourNotes: prev.ourNotes || '',
    weVisited: prev.weVisited || false,
    ...(prev.customTitle ? { customTitle: prev.customTitle } : {}),
    ...(prev.customDescription ? { customDescription: prev.customDescription } : {}),
    ...(prev.images ? { images: prev.images } : {}),
  };
});

// Unique slugs: same-name beaches get the town appended ("church-cove-gunwalloe").
for (const b of beaches) slugCount[b._slugBase] = (slugCount[b._slugBase] || 0) + 1;
for (const b of beaches) {
  b.slug = slugCount[b._slugBase] > 1 ? `${b._slugBase}-${b._townSlug}` : b._slugBase;
  delete b._slugBase;
  delete b._townSlug;
}
const seen = {};
for (const b of beaches) {
  if (seen[b.slug]) b.slug = `${b.slug}-${++seen[b.slug]}`;
  else seen[b.slug] = 1;
}

// Swimming notes from facts we hold (lifeguards + dog rules are separate; this is safety framing only).
for (const b of beaches) {
  if (b.lifeguards.value.startsWith('RNLI')) {
    b.swimming = { value: 'Lifeguarded in season', summary: 'RNLI lifeguards patrol in season: swim between the red and yellow flags.', source: b.lifeguards.source };
  }
  // Sources list: unique URLs across all facts.
  const srcs = new Map();
  for (const v of Object.values(b)) if (v && typeof v === 'object' && v.source?.url) srcs.set(v.source.url, v.source);
  srcs.set(`https://www.openstreetmap.org/${b.osmId}`, { label: 'OpenStreetMap', url: `https://www.openstreetmap.org/${b.osmId}`, licence: 'ODbL' });
  b.sources = [...srcs.values()];
}

beaches.sort((a, b) => a.name.localeCompare(b.name));
const order = ['slug', 'name', 'altNames', 'town', 'townDistanceKm', 'region', 'lat', 'lng'];
const out = beaches.map((b) => Object.fromEntries([...order.map((k) => [k, b[k]]), ...Object.entries(b).filter(([k]) => !order.includes(k))]));
await writeJson('data/beaches.json', out);

// Diagnostics for matching review.
const dogMatched = new Set(out.filter((b) => b.dogs.councilListed).map((b) => b.dogs.councilEntry));
const lgMatched = new Set(out.filter((b) => b.lifeguards.unit).map((b) => b.lifeguards.unit));
await writeJson('data/raw/match-report.json', {
  councilEntriesUnmatched: dogData.entries.filter((e) => !dogMatched.has(e.councilName)).map((e) => e.councilName),
  rnliUnitsUnmatched: lifeguardData.units.filter((u) => !lgMatched.has(u.name)).map((u) => u.name),
});
console.log(`${raw.length} named OSM beach features -> ${out.length} beaches`);
console.log(`Unmatched council entries: ${dogData.entries.length - dogMatched.size}; unmatched RNLI units: ${lifeguardData.units.length - lgMatched.size}`);
console.log(regions.map((r) => `${r.name}: ${out.filter((b) => b.region === r.slug).length}`).join(' | '));
