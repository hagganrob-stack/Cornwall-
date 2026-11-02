// Build-time access to the data pipeline's JSON. Nothing here runs in the browser.
import beaches from '../data/beaches.json';
import towns from '../data/towns.json';
import regions from '../data/regions.json';

export const NOT_STATED = 'not stated';
export { beaches, towns, regions };
export const beachBySlug = (s) => beaches.find((b) => b.slug === s);
export const townBySlug = (s) => towns.find((t) => t.slug === s);
export const regionBySlug = (s) => regions.find((r) => r.slug === s);
export const has = (f) => !!(f && f.value && f.value !== NOT_STATED);
export const isLifeguarded = (b) => b.lifeguards.value.startsWith('RNLI');

// Hero photo: a manually approved one (hero: true) wins, else the best-scored candidate.
export const heroImage = (place) => place?.images?.find((i) => i.hero) || place?.images?.[0] || null;
export const displayName = (b) => b.customTitle || b.name;
export const townName = (slug) => townBySlug(slug)?.name || slug;

// Newest "last checked" date across a set of places, for listing pages.
export const latestChecked = (list) => list.map((p) => p.lastChecked).filter(Boolean).sort().at(-1) || null;

// Dog restriction in a given month (1-12): does the Council restriction cover any of that month?
export function dogsRestrictedInMonth(b, month) {
  const d = b.dogs;
  if (!d.councilListed) return false;
  if (d.allYear) return true;
  const from = +d.from.slice(0, 2);
  const to = +d.to.slice(0, 2);
  return from <= to ? month >= from && month <= to : month >= from || month <= to;
}

export const fmtDate = (iso) => (iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');

// Compact rows for the client-side beach finder.
export const beachRows = () =>
  beaches.map((b) => {
    const img = heroImage(b);
    return {
      slug: b.slug,
      name: displayName(b),
      town: townName(b.town),
      region: b.region,
      dogsListed: b.dogs.councilListed,
      dogsAllYear: !!b.dogs.allYear,
      dogsLeads: b.dogs.restriction === 'leads',
      dogFrom: b.dogs.from || null,
      dogTo: b.dogs.to || null,
      lifeguards: isLifeguarded(b),
      parking: has(b.parking),
      toilets: has(b.toilets),
      cafe: has(b.cafeNearby),
      surf: has(b.surf),
      size: has(b.size) ? b.size.value : null,
      facing: has(b.facing) ? b.facing.value : null,
      surface: has(b.surface) ? b.surface.value : null,
      lat: b.lat,
      lng: b.lng,
      img: img ? { src: imgSrc(img), by: img.photographer, licence: img.licence } : null,
    };
  });

// Source URL for a photo, capped at 1920px wide. Wikimedia originals ("unscaled") can be 4000px+,
// so they are rewritten to a standard 1920px thumbnail when the original is wider than that.
export function imgSrc(image) {
  if (!image) return null;
  const src = image.thumbUrl || image.url;
  const thumb = src.match(/^(https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^?]+\/)(\d+)px-([^/?]+)/);
  if (thumb) return `${thumb[1]}${Math.min(+thumb[2], 1920)}px-${thumb[3]}`;
  const orig = src.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/?]+)/);
  if (orig) return image.width > 1920 ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${orig[1]}/${orig[2]}/1920px-${orig[2]}` : src.split('?')[0];
  return src;
}
