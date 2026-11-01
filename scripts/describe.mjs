#!/usr/bin/env node
// Write short descriptions + practical guide fields for every beach and town, built ONLY from
// collected facts (and values computed from them: distances, counts). No first-person voice,
// no invented visits or opinions, no superlatives. Rob's own words go in `ourNotes` only.
//
// Also computes "nearby" lists (by coordinates) for every place.
import { readJson, writeJson, haversineKm, listJoin, NOT_STATED } from './lib/util.mjs';

const beaches = await readJson('data/beaches.json');
const towns = await readJson('data/towns.json');
const regions = await readJson('data/regions.json');
const regionName = (slug) => regions.find((r) => r.slug === slug)?.name || slug;
const townBy = Object.fromEntries(towns.map((t) => [t.slug, t]));
const known = (f) => f && f.value && f.value !== NOT_STATED;

function picker(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (options) => {
    h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0;
    return options[h % options.length];
  };
}
const kmText = (km) => (km < 1 ? `${Math.round((km * 1000) / 50) * 50} m` : `${km.toFixed(1)} km`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- nearby ---------------------------------------------------------------------------
for (const b of beaches) {
  b.nearbyBeaches = beaches
    .filter((o) => o !== b)
    .map((o) => ({ slug: o.slug, name: o.name, km: +haversineKm(b, o).toFixed(1) }))
    .filter((o) => o.km <= 8)
    .sort((x, y) => x.km - y.km)
    .slice(0, 6);
  b.nearbyTowns = towns
    .map((t) => ({ slug: t.slug, name: t.name, km: +haversineKm(b, t).toFixed(1) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, 3);
}
for (const t of towns) {
  const near = beaches.map((b) => ({ b, km: haversineKm(t, b) })).filter((x) => x.km <= 5).sort((x, y) => x.km - y.km);
  t.beachesNearby = near.map(({ b, km }) => ({ slug: b.slug, name: b.name, km: +km.toFixed(1) }));
  t.nearbyTowns = towns
    .filter((o) => o !== t)
    .map((o) => ({ slug: o.slug, name: o.name, km: +haversineKm(t, o).toFixed(1) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, 5);
}

// ---------- beach guide fields (derived from facts; `basis` says how) --------------------------
function beachGuide(b) {
  const suits = [];
  const basis = [];
  const lifeguarded = b.lifeguards.value.startsWith('RNLI');
  if (lifeguarded && known(b.toilets)) {
    suits.push('families who want lifeguards and toilets close by in summer');
    basis.push('RNLI lifeguard unit + toilets mapped nearby');
  } else if (lifeguarded) {
    suits.push('swimmers and families who prefer a lifeguarded beach in summer');
    basis.push('RNLI lifeguard unit');
  }
  if (known(b.surf)) {
    suits.push('surfers and anyone keen to try a lesson');
    basis.push('surf tag or surf school/shop mapped');
  }
  if (!b.dogs.councilListed) {
    suits.push('dog owners (no Council restriction listed; check local signs)');
    basis.push('not on Cornwall Council dog restriction list');
  } else if (!b.dogs.allYear) {
    suits.push('dog owners outside the restricted dates and hours');
    basis.push('Council seasonal restriction');
  }
  if (known(b.rockPools)) suits.push('rock-poolers at low tide');
  if (b.size.value === 'small' && !known(b.parking)) {
    suits.push('people happy to walk in to a smaller beach');
    basis.push('small mapped outline, no car park mapped within 400 m');
  }

  let allow = null;
  if (b.size.value === 'large' && (known(b.cafeNearby) || known(b.toilets))) allow = 'Half a day to a full day';
  else if (b.size.value === 'large') allow = 'Half a day or more';
  else if (b.size.value === 'medium') allow = 'Two hours to half a day';
  else if (b.size.value === 'small') allow = 'An hour or two';
  if (allow) basis.push(`allow time scaled from mapped beach size (${b.size.value})`);

  const best = [];
  if (lifeguarded) best.push('In the RNLI lifeguard season if you plan to swim (dates on the RNLI page)');
  if (b.dogs.councilListed && !b.dogs.allYear && b.dogs.from) {
    best.push(`With a dog: before ${b.dogs.hoursFrom?.replace(':00', '')}am or after ${+(b.dogs.hoursTo || '18').slice(0, 2) - 12}pm during the restricted period, or any time outside it`);
  }
  if (b.facing.value !== NOT_STATED && /west/.test(b.facing.value)) best.push(`Late afternoon and evening: the beach faces ${b.facing.value}, towards the setting sun`);
  if (b.facing.value !== NOT_STATED && /east/.test(b.facing.value)) best.push(`Morning: the beach faces ${b.facing.value}, towards the rising sun`);

  return {
    whoItSuits: suits.length ? suits : null,
    howLongToAllow: allow,
    bestTimeToGo: best.length ? best : null,
    basis,
    method: 'Derived automatically from the facts on this page; not a first-hand recommendation.',
  };
}

// ---------- beach description -----------------------------------------------------------------
function describeBeach(b) {
  const pick = picker(b.slug);
  const town = townBy[b.town];
  const s = [];
  const size = b.size.value !== NOT_STATED ? `${b.size.value} ` : '';
  const surface = b.surface.value !== NOT_STATED ? `${b.surface.value} ` : '';
  const where = b.townDistanceKm < 0.6 ? `at ${town.name}` : `${kmText(b.townDistanceKm)} from ${town.name}`;
  const desc = `${size}${surface}beach`;
  s.push(`${b.name} is ${/^[aeiou]/i.test(desc) ? 'an' : 'a'} ${desc} ${where}, in ${regionName(b.region)}.`);
  if (b.facing.value !== NOT_STATED) s.push(pick([`It faces ${b.facing.value}.`, `The beach faces ${b.facing.value}.`]));

  const fac = [];
  if (known(b.parking)) fac.push(b.parking.places?.[0]?.distanceM < 60 ? 'a car park beside the beach' : `a car park about ${roundM(b.parking.places?.[0]?.distanceM)} away`);
  if (known(b.toilets)) fac.push('public toilets');
  if (known(b.cafeNearby)) fac.push(b.cafeNearby.places?.length > 1 ? 'cafés or kiosks nearby' : 'a café or kiosk nearby');
  if (fac.length) s.push(`On the map there ${fac[0].startsWith('public') || fac[0].startsWith('caf') ? 'are' : 'is'} ${listJoin(fac)}.`);

  if (b.lifeguards.value.startsWith('RNLI')) s.push('RNLI lifeguards patrol in season, so check the RNLI page for this year’s dates.');
  if (known(b.surf)) s.push(pick(['There is a surf school or surf shop close by.', 'Surf schools or shops are mapped close by.']));
  if (b.dogs.councilListed) s.push(b.dogs.summary);
  else s.push('It isn’t on Cornwall Council’s dog restriction list, but check signs on arrival.');

  return s.join(' ');
}
const roundM = (m) => (m == null ? '' : m < 100 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${Math.round(m / 50) * 50} m`);

// ---------- town description ------------------------------------------------------------------
function describeTown(t) {
  const pick = picker(t.slug);
  const s = [];
  const typeWord = { city: 'city', town: 'town', village: 'village', hamlet: 'hamlet' }[t.placeType] || 'place';
  s.push(`${t.name} is a ${typeWord === 'place' ? 'visitor base' : typeWord} in ${regionName(t.region)}.`);
  const near = t.beachesNearby || [];
  if (near.length) {
    const lifeguarded = near.filter(({ slug }) => beaches.find((b) => b.slug === slug)?.lifeguards.value.startsWith('RNLI'));
    const dogOk = near.filter(({ slug }) => !beaches.find((b) => b.slug === slug)?.dogs.councilListed);
    s.push(
      `There ${near.length === 1 ? 'is 1 named beach' : `are ${near.length} named beaches`} within 5 km, the closest being ${near[0].name} (${kmText(near[0].km)}).`
    );
    if (lifeguarded.length) s.push(`${lifeguarded.length} of them ${lifeguarded.length === 1 ? 'has' : 'have'} RNLI lifeguard cover in season.`);
    if (dogOk.length && dogOk.length < near.length) s.push(`${dogOk.length} ${dogOk.length === 1 ? 'isn’t' : 'aren’t'} on Cornwall Council’s dog restriction list.`);
  } else {
    s.push(pick(['There are no named beaches mapped within 5 km, so plan on a short drive to the coast.', 'No named beaches are mapped within 5 km.']));
  }
  const nt = t.nearbyTowns.slice(0, 2);
  s.push(`The nearest other bases are ${listJoin(nt.map((n) => `${n.name} (${kmText(n.km)})`))}.`);
  return s.join(' ');
}

for (const b of beaches) {
  b.guide = beachGuide(b);
  b.description = describeBeach(b);
}
for (const t of towns) t.description = describeTown(t);

await writeJson('data/beaches.json', beaches);
await writeJson('data/towns.json', towns);
console.log(`Described ${beaches.length} beaches and ${towns.length} towns.`);
