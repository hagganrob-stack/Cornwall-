#!/usr/bin/env node
// Plagiarism guard for enrichment copy: every run of N consecutive words (default 8) in our text is
// compared with the gathered source text for that place. Any shared run is reported and the script
// exits non-zero, so copied phrasing can't slip onto the site.
// Also checks the house rules: no first person outside ourNotes, no unsupported superlatives.
//
// Usage: node scripts/check-enrichment.mjs [--n=8] [kind/slug ...]
import fs from 'node:fs/promises';
import path from 'node:path';

const N = +((process.argv.find((a) => a.startsWith('--n=')) || '=8').split('=')[1]);
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const words = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9£'\s]/g, ' ').split(/\s+/).filter(Boolean);
const shingles = (s) => {
  const w = words(s);
  const out = new Set();
  for (let i = 0; i + N <= w.length; i++) out.add(w.slice(i, i + N).join(' '));
  return out;
};
const ourText = (e) => [...(e.overview || []), ...(e.expect || []).flatMap((x) => [x.title, x.text]), ...(e.goodToKnow || []).flatMap((x) => [x.label, x.text]), e.week?.slot || '', e.week?.text || '', ...(e.week?.pairWith || []).map((p) => p.why), ...(e.tips || [])].join('\n');
const FIRST_PERSON = /\b(we|we're|we've|our|us|i|i'm|my)\b/i;
const SUPERLATIVE = /\b(best|stunning|breathtaking|must-see|must see|hidden gem|unmissable|world-class|iconic|perfect|amazing|incredible|spectacular)\b/i;

let failed = 0;
let checked = 0;
for (const kind of ['attraction', 'beach']) {
  const dir = `data/enrichment/${kind}`;
  const files = await fs.readdir(dir).catch(() => []);
  for (const f of files.filter((x) => x.endsWith('.json'))) {
    const slug = path.basename(f, '.json');
    if (only.length && !only.includes(`${kind}/${slug}`)) continue;
    const e = JSON.parse(await fs.readFile(`${dir}/${f}`, 'utf8'));
    const src = JSON.parse(await fs.readFile(`data/raw/sources/${kind}/${slug}.json`, 'utf8').catch(() => '{"pages":[]}'));
    const theirs = new Set();
    for (const p of src.pages) for (const s of shingles(p.text)) theirs.add(s);
    const text = ourText(e);
    const copied = [...shingles(text)].filter((s) => theirs.has(s));
    const problems = [];
    if (copied.length) problems.push(`${copied.length} copied ${N}-word runs, e.g. "${copied.slice(0, 3).join('" | "')}"`);
    for (const line of text.split('\n')) {
      if (FIRST_PERSON.test(line.replace(/\bGrade I\b/g, ''))) problems.push(`first person: "${line.slice(0, 80)}"`);
      const m = line.match(SUPERLATIVE);
      if (m) problems.push(`superlative "${m[0]}": "${line.slice(0, 80)}"`);
    }
    const bad = (e.goodToKnow || []).concat(e.expect || []).filter((x) => x.source != null && !e.sources?.[x.source]);
    if (bad.length) problems.push(`${bad.length} items point at a missing source`);
    checked++;
    if (problems.length) {
      failed++;
      console.log(`✗ ${kind}/${slug}\n  - ${problems.join('\n  - ')}`);
    } else console.log(`✓ ${kind}/${slug} (${words(text).length} words)`);
  }
}
console.log(`${checked} checked, ${failed} with problems`);
process.exit(failed ? 1 : 0);
