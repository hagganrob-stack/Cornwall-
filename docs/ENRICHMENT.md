# Enriching place guides

Richer "What it is / What to expect / Good to know" copy for attractions and beaches, written in our
own words from public sources, with every practical point cited.

## Steps for each place

1. **Gather sources**
   `npm run enrich:sources -- --kind=attraction --slugs=eden-project,lands-end`
   Fetches the official website (home page plus visiting, tickets, opening, directions, food and FAQ
   pages, kept within the attraction's own section of big sites such as the National Trust or English
   Heritage) and the Wikipedia article. Saved to `data/raw/sources/<kind>/<slug>.json` (git-ignored,
   never published). If Wikipedia picks the wrong article, add the right title to `WIKI_OVERRIDE` in
   `scripts/lib/matching.mjs`. The scripts identify themselves honestly; sites that refuse them are skipped.

2. **Write** `data/enrichment/<kind>/<slug>.json`:
   - `overview`: 2–3 short paragraphs: what it is, why people go, what kind of day it is.
   - `expect`: 3–5 `{ title, text, source }` items: the main things you'll see or do.
   - `goodToKnow`: `{ label, text, source }` practical points (tickets, opening, parking, getting there,
     food, dogs, access, weather), each with the index of the page in `sources` it came from. Use
     `"source": null` only for general advice that isn't a factual claim.
   - `sources`: `{ label, url, licence? }` for the pages actually used.
   - `facts` (attractions, optional): corrections to category-derived facts, e.g.
     `"setting": { "value": "indoor and outdoor", "source": 0, "note": "Two covered Biomes plus outdoor gardens" }`
     (also `kids`, `entry`). Re-run `npm run data:attractions && npm run data:describe` to apply.
   - `written` (date) and `reviewedByRob` (true once Rob has checked it, ideally in person).

   - `week`: `{ slot, text, pairWith: [{ kind: beach|attraction|town, slug, why }] }` — "Fitting it
     into your week": how long to give it, what kind of day it suits (weather, tide, travel day), and
     2–3 nearby places to pair it with, chosen from the place's nearby lists. Don't repeat distances in
     `why` (the page shows them).
   - `tips`: 2–3 short practical tips, phrased as advice ("Check the tide times…"), never as claimed
     experience.

   Voice: a friendly advisor helping someone plan their own week, not a directory or review site.
   Talk to the reader as "you", be warm and practical, say what kind of day it makes and who'll enjoy
   it, and be honest about downsides (crowds, steep paths, weather).

   House rules (from the site plan): warm, practical UK English for a family planning one week; no
   first person (that's only in Rob's `ourNotes`); no superlatives the sources don't support; facts only
   when a source confirms them, so check details against the source text before including them; don't
   restate exact prices or dates that will go stale, but say what kinds of tickets exist and link.

3. **Check**: `npm run enrich:check`
   Fails on any run of 8 consecutive words shared with the source text, first-person wording, banned
   superlatives, or items pointing at a missing source. Reword and re-run until it passes.

4. Build (`npm run build`) and look at the page.

## Pilot (November 2026)

10 attractions (Eden Project, Land's End, Tintagel Castle, Heligan, the Minack, St Michael's Mount,
Bodmin Jail, Lanhydrock, Newquay Zoo, Cornish Seal Sanctuary) and 6 beaches (Fistral, Kynance Cove,
Sennen Cove, Polzeath, Porthcurno, Perranporth).
