import { beaches, towns, regions } from '../lib/data';
import { ROUNDUPS, roundupPath, townRoundupPairs, townRoundupPath } from '../lib/roundups';
import { SITE_URL } from '../lib/site';

// Every pre-rendered page, with its data's last-checked date where we have one.
export default function sitemap() {
  const u = (path, lastModified) => ({ url: `${SITE_URL}${path}`, ...(lastModified ? { lastModified } : {}) });
  return [
    u('/'),
    u('/beaches/'),
    u('/towns/'),
    ...['/about/', '/editorial-policy/', '/affiliate-disclosure/', '/corrections/'].map((p) => u(p)),
    ...regions.map((r) => u(`/regions/${r.slug}/`)),
    ...Object.values(ROUNDUPS).map((r) => u(roundupPath(r))),
    ...townRoundupPairs().map(({ town, roundup }) => u(townRoundupPath(town, roundup))),
    ...towns.map((t) => u(`/towns/${t.slug}/`, t.lastChecked)),
    ...beaches.map((b) => u(`/beaches/${b.slug}/`, b.lastChecked)),
  ];
}
