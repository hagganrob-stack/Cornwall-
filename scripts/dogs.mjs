#!/usr/bin/env node
// Parse Cornwall Council's official "Dogs on beaches" page (Public Spaces Protection Order list).
// Output: data/dog-restrictions.json — one record per council entry, matched to beaches later.
import { cachedFetch, writeJson, slugify, TODAY } from './lib/util.mjs';

const PAGE = 'https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/';
const html = await cachedFetch(PAGE, 'data/raw/council/dogs.html', { json: false });

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&ndash;|&#8211;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();

const lastUpdated = (html.match(/Last Updated:\s*<\/[^>]+>\s*<[^>]+>\s*([\d/]+)/) || html.match(/Last Updated:[\s\S]{0,200}?(\d{2}\/\d{2}\/\d{4})/) || [])[1] || null;
const orderPdfs = [...html.matchAll(/href="([^"]+\.pdf)"[^>]*>([^<]*(?:Order|Protection)[^<]*)</gi)].map((m) => ({ label: decode(m[2]), url: new URL(m[1], PAGE).href }));

// Split into the "Dogs Prohibited" and "Dogs must be on Leads" sections.
const prohibitedStart = html.search(/Dogs Prohibited/i);
const leadsStart = html.search(/Dogs must be on Leads/i);
const sections = [
  { type: 'prohibited', body: html.slice(prohibitedStart, leadsStart) },
  { type: 'leads', body: html.slice(leadsStart, html.search(/Further information/i)) },
];

const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
function parseDates(s) {
  if (/all year/i.test(s)) return { allYear: true, from: null, to: null };
  const m = s.match(/(\d{1,2})\s+([A-Za-z]+)\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)/);
  if (!m) return { allYear: false, from: null, to: null, raw: s };
  const md = (d, mon) => `${String(MONTHS[mon.toLowerCase()]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return { allYear: false, from: md(m[1], m[2]), to: md(m[3], m[4]) };
}
function parseTimes(s) {
  if (/24 hour/i.test(s)) return { allDay: true, from: null, to: null };
  const m = s.match(/(\d{1,2})\s*am\s*[-–]\s*(\d{1,2})\s*pm/i);
  return m ? { allDay: false, from: `${m[1].padStart(2, '0')}:00`, to: `${+m[2] + 12}:00` } : { allDay: false, raw: s };
}

const out = [];
for (const { type, body } of sections) {
  for (const row of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1]);
    if (cells.length < 3) continue;
    const mapLink = cells[0].match(/href="([^"]+\.pdf)"/i);
    // First cell holds the beach label followed by a "... Beach Map" link text.
    const label = decode(cells[0].replace(/<a[\s\S]*?<\/a>/gi, ''));
    const dates = decode(cells[1]);
    const times = decode(cells[2]);
    if (!label || /^beach$/i.test(label)) continue;
    out.push({
      id: slugify(label),
      councilName: label,
      restriction: type, // 'prohibited' = no dogs during the period; 'leads' = dogs on leads during the period
      datesText: dates,
      timesText: times,
      dates: parseDates(dates),
      times: parseTimes(times),
      mapPdf: mapLink ? new URL(mapLink[1], PAGE).href : null,
      source: { label: 'Cornwall Council – Dogs on beaches (Public Spaces Protection Order)', url: PAGE, pageLastUpdated: lastUpdated, retrieved: TODAY },
    });
  }
}
await writeJson('data/dog-restrictions.json', { source: PAGE, pageLastUpdated: lastUpdated, orders: orderPdfs, retrieved: TODAY, entries: out });
console.log(`${out.length} council dog entries (page last updated ${lastUpdated}); orders: ${orderPdfs.map((o) => o.label).join('; ')}`);
for (const e of out) console.log(`${e.restriction.padEnd(10)} ${e.councilName.padEnd(45)} ${e.datesText} | ${e.timesText}`);
