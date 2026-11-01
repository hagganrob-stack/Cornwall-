#!/usr/bin/env node
// Find openly licensed photos for every beach and town on Wikimedia Commons, by coordinates and name.
// Commons hosts a large mirror of Geograph Britain & Ireland (CC BY-SA 2.0); those files keep a
// link back to the original Geograph page. Google imagery is never used.
//
// Stores up to 3 candidates per place with URL, photographer, licence and source link, and flags
// the 20 strongest overall as hero candidates (heroCandidate: true) for Rob to approve
// (set hero: true on the one to use). Manual choices are preserved across runs.
//
// Usage: node scripts/images.mjs [--only=beaches|towns] [--refetch]
import fs from 'node:fs/promises';
import { cachedFetch, readJson, writeJson, slugify, haversineKm, sleep, TODAY } from './lib/util.mjs';

const API = 'https://commons.wikimedia.org/w/api.php';
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const REFETCH = process.argv.includes('--refetch');
const ALLOWED = /^(cc0|public domain|pd|cc by(-sa)? \d(\.\d)?( [a-z]{2,})?)/i;
const REJECT_TITLE = /\b(map|plan|diagram|sign|signs|notice|logo|chart|coat of arms|flag|drawing|postcard|ticket|interior|church|grave|memorial|plaque|bus|train|locomotive|car park sign|ship|vessel|boat)\b/i;

const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();

async function api(params, cacheKey) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
  const file = `data/raw/commons/${cacheKey}.json`;
  if (REFETCH) await fs.rm(file, { force: true });
  const hit = await fs.readFile(file, 'utf8').catch(() => null);
  if (hit) return JSON.parse(hit);
  await sleep(600); // be polite: well under Wikimedia's rate limits
  return cachedFetch(url, file, { retries: 5 });
}

async function candidatesFor(place, kind) {
  const radius = kind === 'town' ? 1200 : 450;
  // One request per place: geosearch as a generator, with image info + categories for each hit.
  const info = await api(
    {
      action: 'query',
      generator: 'geosearch',
      ggscoord: `${place.lat}|${place.lng}`,
      ggsradius: String(radius),
      ggsnamespace: '6',
      ggslimit: '40',
      prop: 'imageinfo|categories|coordinates',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1600',
      iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription|DateTimeOriginal',
      cllimit: 'max',
      clshow: '!hidden',
      colimit: 'max',
    },
    `gen-${kind}-${place.slug}`
  );
  const pages = info.query?.pages || [];
  const name = place.name.toLowerCase().replace(/\b(beach|bay|cove|sands)\b/g, '').trim();
  const nameRe = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const m = ii.extmetadata || {};
      const licence = strip(m.LicenseShortName?.value);
      const co = p.coordinates?.[0];
      const description = strip(m.ImageDescription?.value).slice(0, 300);
      const artist = strip(m.Artist?.value);
      const credit = strip(m.Credit?.value);
      const geographUrl = (m.Credit?.value || '').match(/https?:\/\/www\.geograph\.org\.uk\/photo\/\d+/)?.[0] || (m.ImageDescription?.value || '').match(/https?:\/\/www\.geograph\.org\.uk\/photo\/\d+/)?.[0] || null;
      const cats = (p.categories || []).map((c) => c.title);
      return {
        file: p.title,
        title: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
        description,
        url: ii.url,
        thumbUrl: ii.thumburl,
        width: ii.width,
        height: ii.height,
        mime: ii.mime,
        photographer: artist || null,
        licence,
        licenceUrl: m.LicenseUrl?.value || null,
        sourceUrl: ii.descriptionurl,
        via: geographUrl || /geograph/i.test(credit) ? 'Geograph (via Wikimedia Commons)' : 'Wikimedia Commons',
        geographUrl,
        dateTaken: strip(m.DateTimeOriginal?.value).slice(0, 10) || null,
        distanceM: co ? Math.round(haversineKm(place, { lat: co.lat, lng: co.lon }) * 1000) : null,
        quality: cats.some((c) => /Featured pictures|Quality images|Valued images/.test(c)) ? cats.find((c) => /Featured|Quality|Valued/.test(c)).replace('Category:', '') : null,
        _nameMatch: nameRe.test(p.title) || nameRe.test(description),
      };
    })
    .filter(Boolean)
    .filter((c) => /jpeg|png/.test(c.mime) && ALLOWED.test(c.licence) && c.photographer && c.width >= 1000 && c.width >= c.height * 1.1 && !REJECT_TITLE.test(c.title))
    .map((c) => {
      let score = 0;
      if (c._nameMatch) score += 40;
      if (c.quality) score += 35;
      score += Math.min(25, (c.width / 4000) * 25);
      score -= (c.distanceM || 0) / (kind === 'town' ? 80 : 30);
      const year = +(c.dateTaken || '').slice(0, 4);
      if (year >= 2015) score += 8;
      else if (year && year < 2008) score -= 8;
      if (/beach|sand|cove|bay|coast|sea|harbour|view/i.test(c.title + ' ' + c.description)) score += 10;
      return { ...c, score: Math.round(score) };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ _nameMatch, mime, ...c }) => ({ ...c, retrieved: TODAY }));
}

async function run(file, kind) {
  const places = await readJson(file);
  if (!places) return [];
  let i = 0;
  for (const p of places) {
    i++;
    const keep = (p.images || []).filter((im) => im.hero || im.manual); // Rob's choices survive
    const found = await candidatesFor(p, kind).catch((e) => {
      console.warn(`  ! ${p.slug}: ${e.message}`);
      return [];
    });
    const merged = [...keep, ...found.filter((f) => !keep.some((k) => k.file === f.file))].slice(0, 3);
    p.images = merged;
    if (i % 25 === 0) console.log(`  ${kind}s: ${i}/${places.length}`);
  }
  await writeJson(file, places);
  return places.map((p) => ({ kind, p }));
}

const all = [];
if (ONLY !== 'beaches') all.push(...(await run('data/towns.json', 'town')));
if (ONLY !== 'towns') all.push(...(await run('data/beaches.json', 'beach')));

// Hero candidates: the 20 best-scoring top images, beaches first, one per place.
const ranked = all
  .filter(({ p }) => p.images?.[0])
  .map(({ kind, p }) => ({ kind, p, s: p.images[0].score + (p.images[0].quality ? 10 : 0) + (kind === 'beach' ? 5 : 0) }))
  .sort((a, b) => b.s - a.s);
for (const { p } of all.map((x) => x)) for (const im of p.images || []) delete im.heroCandidate;
const heroes = ranked.slice(0, 20);
for (const { p } of heroes) p.images[0].heroCandidate = true;
await writeJson('data/towns.json', all.filter((x) => x.kind === 'town').map((x) => x.p).length ? all.filter((x) => x.kind === 'town').map((x) => x.p) : await readJson('data/towns.json'));
if (all.some((x) => x.kind === 'beach')) await writeJson('data/beaches.json', all.filter((x) => x.kind === 'beach').map((x) => x.p));
await writeJson(
  'data/hero-candidates.json',
  heroes.map(({ kind, p }) => ({ kind, slug: p.slug, name: p.name, ...p.images[0] }))
);
const withPhoto = all.filter(({ p }) => p.images?.length).length;
console.log(`${withPhoto}/${all.length} places have at least one openly licensed photo; ${heroes.length} hero candidates flagged.`);
