#!/usr/bin/env node
// Coverage report for the Step 1 review: counts per region and % of beaches with key facts.
// Writes data/report.md.
import fs from 'node:fs/promises';
import { readJson, NOT_STATED } from './lib/util.mjs';

const beaches = (await readJson('data/beaches.json')) || [];
const towns = (await readJson('data/towns.json')) || [];
const regions = await readJson('data/regions.json');
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');
const has = (f) => f && f.value && f.value !== NOT_STATED;

const lines = ['# Step 1 data report', '', `Generated ${new Date().toISOString().slice(0, 10)}.`, ''];
lines.push('| Region | Towns | Beaches | Council dog rule | RNLI lifeguards | Photo |', '|---|---:|---:|---:|---:|---:|');
for (const r of regions) {
  const b = beaches.filter((x) => x.region === r.slug);
  lines.push(
    `| ${r.name} | ${towns.filter((t) => t.region === r.slug).length} | ${b.length} | ${b.filter((x) => x.dogs.councilListed).length} | ${b.filter((x) => x.lifeguards.value.startsWith('RNLI')).length} | ${b.filter((x) => x.images?.length).length} |`
  );
}
const n = beaches.length;
lines.push(`| **Total** | ${towns.length} | ${n} | ${beaches.filter((x) => x.dogs.councilListed).length} | ${beaches.filter((x) => x.lifeguards.value.startsWith('RNLI')).length} | ${beaches.filter((x) => x.images?.length).length} |`, '');

const fields = ['surface', 'size', 'facing', 'parking', 'toilets', 'cafeNearby', 'accessibility', 'surf', 'rockPools', 'swimming', 'lifeguards'];
lines.push('## Field coverage (beaches)', '', '| Field | Has a sourced value |', '|---|---:|');
lines.push(`| Dog rules (Council-listed restriction) | ${pct(beaches.filter((x) => x.dogs.councilListed).length, n)} |`);
lines.push(`| Dog status stated (Council list checked: restricted or not listed) | ${pct(beaches.filter((x) => x.dogs.source).length, n)} |`);
for (const f of fields) lines.push(`| ${f} | ${pct(beaches.filter((x) => has(x[f])).length, n)} |`);
lines.push(`| Photo (openly licensed) | ${pct(beaches.filter((x) => x.images?.length).length, n)} |`);
lines.push(`| Towns with photo | ${pct(towns.filter((x) => x.images?.length).length, towns.length)} |`, '');

await fs.writeFile('data/report.md', lines.join('\n') + '\n');
console.log(lines.join('\n'));
