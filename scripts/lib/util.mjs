import fs from 'node:fs/promises';
import path from 'node:path';

export const UA = 'OneWeekInCornwall-data/0.1 (+https://github.com/hagganrob-stack/Cornwall-)';
export const TODAY = new Date().toISOString().slice(0, 10);
export const NOT_STATED = 'not stated';

export function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with on-disk cache (data/raw is git-ignored) so re-runs don't hit APIs again.
export async function cachedFetch(url, cacheFile, { json = true, init = {}, retries = 3, minDelay = 0 } = {}) {
  const cached = await fs.readFile(cacheFile, 'utf8').catch(() => null);
  if (cached != null) return json ? JSON.parse(cached) : cached;
  for (let attempt = 0; ; attempt++) {
    if (minDelay) await sleep(minDelay);
    const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...(init.headers || {}) } });
    if (res.ok) {
      const body = await res.text();
      await fs.mkdir(path.dirname(cacheFile), { recursive: true });
      await fs.writeFile(cacheFile, body);
      return json ? JSON.parse(body) : body;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const wait = (Number(res.headers.get('retry-after')) || 2 ** (attempt + 2)) * 1000;
      await sleep(wait);
      continue;
    }
    throw new Error(`${res.status} ${url}`);
  }
}

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function listJoin(items, conj = 'and') {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`;
}
