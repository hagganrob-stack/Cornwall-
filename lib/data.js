// Build-time access to the data pipeline's JSON. Nothing here runs in the browser.
import beaches from '../data/beaches.json';
import towns from '../data/towns.json';
import regions from '../data/regions.json';

export const NOT_STATED = 'not stated';
export const SITE_NAME = 'One Week in Cornwall';

export { beaches, towns, regions };
export const beachBySlug = (s) => beaches.find((b) => b.slug === s);
export const townBySlug = (s) => towns.find((t) => t.slug === s);
export const regionBySlug = (s) => regions.find((r) => r.slug === s);
export const has = (f) => f && f.value && f.value !== NOT_STATED;

// Hero photo: a manually approved one (hero: true) wins, else the best-scored candidate.
export const heroImage = (place) => place.images?.find((i) => i.hero) || place.images?.[0] || null;

export const displayName = (b) => b.customTitle || b.name;

// Compact rows for the client-side beach finder.
export const beachRows = () =>
  beaches.map((b) => ({
    slug: b.slug,
    name: displayName(b),
    town: townBySlug(b.town)?.name || b.town,
    region: b.region,
    dogs: b.dogs.councilListed ? (b.dogs.restriction === 'leads' ? 'leads' : b.dogs.allYear ? 'banned' : 'seasonal') : 'none',
    lifeguards: b.lifeguards.value.startsWith('RNLI'),
    parking: has(b.parking),
    toilets: has(b.toilets),
    cafe: has(b.cafeNearby),
    surf: has(b.surf),
    size: has(b.size) ? b.size.value : null,
    facing: has(b.facing) ? b.facing.value : null,
    surface: has(b.surface) ? b.surface.value : null,
    thumb: heroImage(b)?.thumbUrl || heroImage(b)?.url || null,
  }));
