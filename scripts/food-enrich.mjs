#!/usr/bin/env node
// Phase 3b: facilities for each pub, restaurant and café from its OWN website only.
// Adapted from the Brighton Beer Guide pipeline. Only explicit statements count (yes / no / unknown),
// each with a quote and the page it came from. robots.txt is respected and sites that refuse the
// crawler are left unread (no retrying them in a browser); the browser is only used to render pages
// that load fine but build their text with JavaScript.
// Usage: node scripts/food-enrich.mjs [--refetch] [--only=slug]
// Fetched page text is cached in data/raw/sites/ (git-ignored) so detectors can be tuned offline.
import path from 'node:path';
import { createRequire } from 'node:module';
import { detectAll, FEATURES } from './lib/detect.mjs';
import { readJson, writeJson, haversineKm, UA as BASE_UA } from './lib/util.mjs';

const TOWNS = (await readJson('data/towns.json')) || [];

const REFETCH = process.argv.includes('--refetch');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const SITE_DIR = 'data/raw/food-sites';
const UA = `${BASE_UA} independent visitor guide, checking venue facilities`;
const MAX_SUBPAGES = 8;
const CONCURRENCY = 6;
const SOCIAL = /(facebook|instagram|twitter|x\.com|tiktok|linktr\.ee|untappd|tripadvisor|google\.)/i;
const SUBPAGE_HINT =
  /(food|menu|eat|drink|sunday|roast|event|whats-?on|what-s-on|quiz|music|about|facilit|faq|dog|garden|terrace|family|children|kids|info|visit|find-us|contact|our-pub|the-pub|restaurant|cafe|bar)/i;

function htmlToText(html) {
  return html
    .replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article|\/header|\/footer|\/td)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;|&#8217;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();
}

function extractLinks(html, base) {
  const out = [];
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], base);
      out.push({ url: u.href.split('#')[0], text: htmlToText(m[2]).slice(0, 80) });
    } catch {}
  }
  return out;
}

const toHttps = (url) => url.replace(/^http:\/\//i, 'https://');
const PROXY_ERROR = /agent-proxy relay|__agentproxy/;

async function fetchText(url, timeoutMs = 15000) {
  url = toHttps(url);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' }, redirect: 'follow', signal: ctrl.signal });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !/html|text\/plain/.test(type)) return { status: res.status, finalUrl: res.url, html: '' };
    const html = await res.text();
    if (PROXY_ERROR.test(html)) return { status: 0, error: 'proxy', html: '' };
    return { status: res.status, finalUrl: res.url, html };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code || e.name || e), html: '' };
  } finally {
    clearTimeout(t);
  }
}

// Minimal robots.txt check (User-agent: * group and our own UA token).
const robotsCache = new Map();
async function allowedByRobots(url) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    const { html } = await fetchText(`${u.origin}/robots.txt`, 8000);
    const rules = [];
    let groupAgents = [];
    let inRules = false;
    for (const raw of (html || '').split('\n')) {
      const line = raw.replace(/#.*/, '').trim();
      const i = line.indexOf(':');
      if (i < 0) continue;
      const k = line.slice(0, i).trim().toLowerCase();
      const v = line.slice(i + 1).trim();
      if (k === 'user-agent') {
        if (inRules) (groupAgents = []), (inRules = false); // a new group starts
        groupAgents.push(v.toLowerCase());
      } else if (k === 'allow' || k === 'disallow') {
        inRules = true;
        const applies = groupAgents.some((a) => a === '*' || a.includes('oneweekincornwall'));
        if (applies && v) rules.push({ allow: k === 'allow', re: robotsPattern(v), len: v.length });
      }
    }
    robotsCache.set(u.origin, rules);
  }
  // Longest matching rule wins (Google/RFC 9309 semantics).
  const target = u.pathname + u.search;
  const hit = robotsCache
    .get(u.origin)
    .filter((r) => r.re.test(target))
    .sort((a, b) => b.len - a.len)[0];
  return !hit || hit.allow;
}

function robotsPattern(rule) {
  const anchored = rule.endsWith('$');
  const body = (anchored ? rule.slice(0, -1) : rule).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

let browserPromise = null;
async function renderWithBrowser(url) {
  if (!browserPromise) {
    const { chromium } = createRequire(import.meta.url)('playwright');
    const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
    browserPromise = chromium.launch({ proxy });
  }
  const browser = await browserPromise;
  const page = await browser.newPage({ userAgent: UA });
  try {
    await page.goto(toHttps(url), { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2500);
    const html = await page.content();
    if (PROXY_ERROR.test(html)) return { finalUrl: url, html: '', error: 'proxy' };
    return { finalUrl: page.url(), html };
  } catch (e) {
    return { finalUrl: url, html: '', error: String(e.message || e).slice(0, 120) };
  } finally {
    await page.close();
  }
}

async function getPage(url) {
  if (!(await allowedByRobots(url))) return { url, text: '', note: 'blocked by robots.txt' };
  let r = await fetchText(url);
  let text = htmlToText(r.html);
  let rendered = false;
  // Render in a browser only when the page loaded fine but is mostly JavaScript; never to get round a refusal.
  if (r.status === 200 && text.length < 600) {
    const b = await renderWithBrowser(url);
    const bText = htmlToText(b.html);
    if (bText.length > text.length) (r = { ...r, ...b }), (text = bText), (rendered = true);
  }
  return { url: r.finalUrl || url, html: r.html, text, status: r.status, rendered };
}

async function crawlSite(pub) {
  await mkdirp(SITE_DIR);
  const cacheFile = path.join(SITE_DIR, `${pub.slug}.json`);
  if (!REFETCH) {
    const cached = await readJson(cacheFile);
    if (cached) return cached;
  }
  const home = await getPage(pub.website);
  const pages = [{ url: home.url, text: home.text }];
  if (home.html) {
    const baseUrl = new URL(home.url);
    // On multi-venue group sites, stay inside this pub's own section.
    const prefix = baseUrl.pathname.replace(/\/[^/]*\.[a-z]+$/i, '').replace(/\/$/, '');
    const seen = new Set([home.url.replace(/\/$/, '')]);
    const candidates = extractLinks(home.html, home.url)
      .filter((l) => {
        const u = new URL(l.url);
        return u.host === baseUrl.host && (!prefix || u.pathname.startsWith(prefix)) && !/\.(pdf|jpe?g|png|webp|gif|zip|docx?)$/i.test(u.pathname);
      })
      .filter((l) => SUBPAGE_HINT.test(l.url) || SUBPAGE_HINT.test(l.text));
    for (const l of candidates) {
      const key = l.url.replace(/\/$/, '');
      if (seen.has(key) || seen.size > MAX_SUBPAGES) continue;
      seen.add(key);
      const p = await getPage(l.url);
      if (p.text) pages.push({ url: p.url, text: p.text });
    }
  }
  const out = { website: pub.website, fetchedAt: new Date().toISOString(), homeStatus: home.status, rendered: home.rendered, note: home.note, pages };
  await writeJson(cacheFile, out);
  return out;
}

function emptyFeatures(reason) {
  return Object.fromEntries(Object.keys(FEATURES).map((k) => [k, { value: 'unknown', evidence: null }]).concat([['_source', reason]]));
}

async function enrichOne(pub) {
  if (!pub.website) return { ...emptyFeatures('no website listed'), _checkedAt: today() };
  if (SOCIAL.test(pub.website)) return { ...emptyFeatures('website is a social media page (not crawled)'), _checkedAt: today() };
  const site = await crawlSite(pub);
  const textLen = site.pages.reduce((n, p) => n + p.text.length, 0);
  if (textLen < 200) return { ...emptyFeatures(`website unreadable (${site.note || 'status ' + site.homeStatus})`), _checkedAt: site.fetchedAt.slice(0, 10) };
  // Group sites list their other venues ("Explore our sister venues…"): cut those blocks out first.
  const SISTERS = /(sister (venues|pubs|sites|restaurants|hotels)|our other (pubs|venues|restaurants|sites|hotels)|more of our (pubs|venues)|explore our .{0,30}(venues|pubs)|see all .{0,30}pubs|discover (more of )?our (pubs|venues))/i;
  const END = /(newsletter|sign up|copyright|©|privacy|follow us)/i;
  const clean = site.pages.map((p) => {
    const lines = p.text.split('\n');
    const keep = [];
    for (let i = 0; i < lines.length; i++) {
      if (SISTERS.test(lines[i])) {
        let j = i + 1;
        while (j < lines.length && j - i < 40 && !END.test(lines[j])) j++;
        i = j - 1;
        continue;
      }
      keep.push(lines[i]);
    }
    return { ...p, text: keep.join('\n') };
  });
  const f = detectAll(clean);
  // Group websites (pub chains, restaurant groups) talk about sister venues. Drop evidence that names
  // a different Cornish town more than 5 km from this venue.
  const far = TOWNS.filter((t) => haversineKm(t, pub) > 5).map((t) => t.name).filter((n) => n.length > 3);
  // A "no" found on an events page is about that event (e.g. an over-18s night), not the venue.
  for (const v of Object.values(f)) {
    if (v?.value === 'no' && /event|whats-?on|what-s-on|gig/i.test(v.evidence?.url || '')) {
      v.value = 'unknown';
      v.evidence = null;
    }
  }
  for (const v of Object.values(f)) {
    const q = v?.evidence?.quote;
    if (v?.value === 'yes' && q && far.some((n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(q))) {
      v.value = 'unknown';
      v.evidence = null;
      v.note = 'evidence was about another venue in the same group';
    }
  }
  return { ...f, _source: `own website (${site.pages.length} page${site.pages.length > 1 ? 's' : ''})`, _checkedAt: site.fetchedAt.slice(0, 10) };
}

async function mkdirp(d) {
  await (await import('node:fs/promises')).mkdir(d, { recursive: true });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const pubs = await readJson('data/food.json');
  const queue = pubs.filter((p) => !ONLY || p.slug === ONLY);
  let done = 0;
  async function worker() {
    while (queue.length) {
      const pub = queue.shift();
      try {
        const res = await enrichOne(pub);
        const { _source, _checkedAt, ...features } = res;
        pub.features = features;
        pub.featuresSource = _source;
        pub.detailsCheckedAt = _checkedAt;
      } catch (e) {
        console.error(`  ! ${pub.slug}: ${e.message}`);
      }
      if (++done % 10 === 0) console.log(`  ${done} done`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (browserPromise) await (await browserPromise).close();
  await writeJson('data/food.json', pubs);

  const counts = {};
  for (const p of pubs) for (const [k, v] of Object.entries(p.features || {})) (counts[k] ??= { yes: 0, no: 0, unknown: 0 })[v.value]++;
  console.table(counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
