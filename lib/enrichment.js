// Hand-written (AI-assisted) guide copy per place, from data/enrichment/<kind>/<slug>.json.
// Read at build time only.
import fs from 'node:fs';
import path from 'node:path';

const cache = {};
export function enrichment(kind, slug) {
  const key = `${kind}/${slug}`;
  if (key in cache) return cache[key];
  const file = path.join(process.cwd(), 'data', 'enrichment', kind, `${slug}.json`);
  cache[key] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  return cache[key];
}
