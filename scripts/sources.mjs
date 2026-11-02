#!/usr/bin/env node
// Gather source text for writing richer, original place guides (enrichment).
//
// For each place: the official website (home page + a few internal pages about visiting, tickets,
// opening, getting there, food, facilities, FAQs) and the Wikipedia article (by the place's
// wikipedia/wikidata tag, or a title search). Only readable prose is kept (lines of 8+ words),
// with the page URL, so every fact we write can be traced back. Output goes to
// data/raw/sources/<kind>/<slug>.json (git-ignored; it is other people's text and is never published).
//
// Usage: node scripts/sources.mjs --kind=attraction|beach --slugs=eden-project,fistral-beach
import fs from 'node:fs/promises';
import { readJson, writeJson, sleep, UA } from './lib/util.mjs';
import { WIKI_OVERRIDE } from './lib/matching.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1];
const KIND = arg('kind') || 'attraction';
const SLUGS = (arg('slugs') || '').split(',').filter(Boolean);
const FILE = { attraction: 'data/attractions.json', beach: 'data/beaches.json' }[KIND];
const places = (await readJson(FILE)).filter((p) => !SLUGS.length || SLUGS.includes(p.slug));

const USEFUL = /visit|plan|ticket|price|admission|opening|times|hours|getting|direction|travel|parking|park-|food|eat|cafe|café|restaurant|facilit|faq|question|access|about|explore|things-to-do|what-to-see|history|families|kids|dog/i;
const SKIP = /login|account|basket|cart|privacy|cookie|terms|career|job|press|news\/|blog\/|shop|wedding|venue-hire|corporate|donate|\.pdf$|\.jpg$|#|mailto:|tel:/i;

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&pound;/g, '£')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&(?:rsquo|lsquo);/g, '’')
    .replace(/&(?:rdquo|ldquo);/g, '"')
    .replace(/&[a-z]+;/g, ' ');

// Keep prose: block-level text with at least 8 words; drop menus, footers, cookie banners.
function prose(html) {
  const body = html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|li|h[1-6]|div|section|article|td|dd|dt|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const seen = new Set();
  return decode(body)
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.split(' ').length >= 8 && !/cookie|javascript|newsletter|sign up|subscribe|©|all rights reserved/i.test(l))
    .filter((l) => (seen.has(l) ? false : (seen.add(l), true)))
    .join('\n');
}

async function get(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !/html/.test(res.headers.get('content-type') || '')) return null;
    return { url: res.url, html: await res.text() };
  } catch {
    return null;
  }
}

async function website(site) {
  const pages = [];
  const home = await get(site);
  if (!home) return pages;
  pages.push({ url: home.url, text: prose(home.html) });
  const origin = new URL(home.url).origin;
  // A deep URL (e.g. english-heritage.org.uk/visit/places/tintagel-castle) means a page on a big
  // organisation's site: only follow links inside that section.
  const homePath = new URL(home.url).pathname.replace(/\/$/, '');
  const scope = homePath.split('/').filter(Boolean).length >= 2 ? origin + homePath : origin;
  const links = [...home.html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(([, href, label]) => {
      try {
        return { url: new URL(decode(href), home.url).href.split('#')[0], label: label.replace(/<[^>]+>/g, ' ').trim() };
      } catch {
        return null;
      }
    })
        .filter((l) => l && l.url.startsWith(scope) && l.url.replace(/\/$/, '') !== home.url.replace(/\/$/, '') && !SKIP.test(l.url) && USEFUL.test(`${l.url} ${l.label}`));
  const unique = [...new Map(links.map((l) => [l.url, l])).values()].slice(0, 7);
  for (const l of unique) {
    await sleep(800);
    const p = await get(l.url);
    if (p) pages.push({ url: p.url, text: prose(p.html) });
  }
  // Drop lines that repeat across pages (banners, site-wide notices).
  const count = {};
  for (const p of pages) for (const l of new Set(p.text.split('\n'))) count[l] = (count[l] || 0) + 1;
  if (pages.length > 2) for (const p of pages) p.text = p.text.split('\n').filter((l) => count[l] < 3).join('\n');
  return pages.filter((p) => p.text.length > 200);
}

async function wikipedia(place) {
  let title = WIKI_OVERRIDE[`${KIND}/${place.slug}`] || place.wikipedia?.replace(/^en:/, '') || null;
  if (!title && place.wikidata) {
    const wd = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${place.wikidata}.json`, { headers: { 'User-Agent': UA } }).then((r) => r.json()).catch(() => null);
    title = wd?.entities?.[place.wikidata]?.sitelinks?.enwiki?.title || null;
  }
  if (!title) {
    const q = `${place.name} Cornwall`;
    const s = await fetch(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', list: 'search', srsearch: q, srlimit: '3', format: 'json', origin: '*' })}`, { headers: { 'User-Agent': UA } }).then((r) => r.json()).catch(() => null);
    const key = place.name.toLowerCase().replace(/^(national trust|english heritage) - /, '').split(/\s+/).find((w) => !/^(the|a|an|st\.?|saint)$/.test(w)) || '';
    // Beaches: only accept an article whose title contains the beach's distinctive name, so a generic
    // name like "Harbour Beach" never pulls in an unrelated article.
    const core = place.name.toLowerCase().replace(/\b(beach|bay|cove|sands?|the|haven|towans)\b/g, '').replace(/[^a-z' -]/g, '').trim();
    const generic = /^(harbour|great western|town|first|middle|little|long|north|south|east|west)$/.test(core);
    const hit = KIND === 'beach'
      ? (core.length >= 4 && !generic ? s?.query?.search?.find((h) => h.title.toLowerCase().includes(core)) : null)
      : s?.query?.search?.find((h) => h.title.toLowerCase().includes(key));
    title = hit?.title || null;
  }
  if (!title) return null;
  const ex = await fetch(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', prop: 'extracts', explaintext: '1', titles: title, format: 'json', formatversion: '2', origin: '*' })}`, { headers: { 'User-Agent': UA } }).then((r) => r.json()).catch(() => null);
  const page = ex?.query?.pages?.[0];
  if (!page?.extract) return null;
  return { url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`, title: page.title, licence: 'CC BY-SA 4.0', text: page.extract.split(/\n== (?:See also|References|External links|Notes|Further reading) ==/)[0] };
}

for (const p of places) {
  const out = { slug: p.slug, name: p.name, kind: KIND, fetched: new Date().toISOString().slice(0, 10), pages: [] };
  if (p.website) out.pages.push(...(await website(p.website)).map((x) => ({ ...x, label: 'Official website' })));
  const wiki = await wikipedia(p);
  if (wiki) out.pages.push({ ...wiki, label: `Wikipedia: ${wiki.title}` });
  await writeJson(`data/raw/sources/${KIND}/${p.slug}.json`, out);
  console.log(`${p.slug}: ${out.pages.length} pages, ${out.pages.reduce((n, x) => n + x.text.length, 0)} chars`);
  await sleep(500);
}
