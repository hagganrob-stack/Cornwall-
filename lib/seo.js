// Titles, descriptions and structured data generated from the data, with customTitle /
// customDescription overrides. Titles adapt to what we actually know about a place.
import { SITE_NAME, SITE_URL, AUTHOR } from './site';
import { displayName, townName, regionBySlug, isLifeguarded, has, heroImage, imgSrc } from './data';

export const abs = (path) => `${SITE_URL}${path}`;

const listJoin = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

export function beachTitle(b) {
  if (b.customTitle) return b.customTitle;
  const name = displayName(b);
  const facts = [];
  facts.push(b.dogs.councilListed ? 'dog rules' : 'dog-friendly');
  if (has(b.parking)) facts.push('parking');
  if (isLifeguarded(b)) facts.push('lifeguards');
  else if (has(b.toilets)) facts.push('toilets');
  const near = /beach|sands|cove|bay|strand|haven|porth/i.test(name) ? name : `${name} beach`;
  return `${near}, ${townName(b.town)}: ${facts.slice(0, 3).join(', ')}`;
}

export function beachDescription(b) {
  if (b.customDescription) return b.customDescription;
  const name = displayName(b);
  const bits = [];
  if (has(b.size) && has(b.surface)) bits.push(`A ${b.size.value} ${b.surface.value} beach near ${townName(b.town)}`);
  else bits.push(`${name}, near ${townName(b.town)}`);
  const extras = [];
  if (isLifeguarded(b)) extras.push('RNLI lifeguards in season');
  if (has(b.parking)) extras.push('parking');
  if (has(b.toilets)) extras.push('toilets');
  const dogs = b.dogs.councilListed ? (b.dogs.allYear ? 'no dogs all year' : b.dogs.restriction === 'leads' ? 'dogs on leads in season' : 'seasonal dog ban') : 'no Council dog restriction';
  return `${bits[0]}${extras.length ? ` with ${listJoin(extras)}` : ''}; ${dogs}. Who it suits, how long to allow and what’s nearby.`.slice(0, 300);
}

export function townTitle(t) {
  if (t.customTitle) return t.customTitle;
  const n = (t.beachesNearby || []).length;
  return n ? `${t.name}: ${n} beaches nearby and planning a stay` : `${t.name}: planning a stay`;
}

export function townDescription(t) {
  if (t.customDescription) return t.customDescription;
  const n = (t.beachesNearby || []).length;
  return `Planning a week in ${t.name}? ${n ? `${n} named beaches within 5 km, with dog rules, lifeguards and parking for each` : 'Where it is and the nearest beaches'}, from official sources.`;
}

// ----- JSON-LD -------------------------------------------------------------------------------
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#rob`;

export const siteGraph = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME, url: `${SITE_URL}/`, founder: { '@id': PERSON_ID } },
    { '@type': 'Person', '@id': PERSON_ID, name: AUTHOR.name, url: abs(AUTHOR.url), worksFor: { '@id': ORG_ID } },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, publisher: { '@id': ORG_ID }, inLanguage: 'en-GB' },
  ],
});

export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(href ? { item: abs(href) } : {}) })),
});

const imageLd = (img) =>
  img
    ? { '@type': 'ImageObject', contentUrl: imgSrc(img), creator: { '@type': 'Person', name: img.photographer }, license: img.licenceUrl, acquireLicensePage: img.sourceUrl, creditText: `${img.photographer} / ${img.licence}` }
    : undefined;

const pageMeta = (path, lastChecked) => ({
  url: abs(path),
  author: { '@id': PERSON_ID },
  publisher: { '@id': ORG_ID },
  ...(lastChecked ? { dateModified: lastChecked } : {}),
});

export function beachLd(b, path) {
  const feats = [
    ['Car parking nearby', has(b.parking)],
    ['Public toilets nearby', has(b.toilets)],
    ['Café or kiosk nearby', has(b.cafeNearby)],
    ['RNLI lifeguards in season', isLifeguarded(b)],
    ['Dogs allowed (no Council restriction)', !b.dogs.councilListed],
  ].filter(([, v]) => v);
  return {
    '@context': 'https://schema.org',
    '@type': 'Beach',
    name: displayName(b),
    description: b.customDescription || b.description,
    geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng },
    address: { '@type': 'PostalAddress', addressLocality: townName(b.town), addressRegion: 'Cornwall', addressCountry: 'GB' },
    containedInPlace: { '@type': 'Place', name: regionBySlug(b.region)?.name },
    ...(heroImage(b) ? { image: imageLd(heroImage(b)) } : {}),
    ...(feats.length ? { amenityFeature: feats.map(([name]) => ({ '@type': 'LocationFeatureSpecification', name, value: true })) } : {}),
    ...(b.altNames?.length ? { alternateName: b.altNames } : {}),
    sameAs: [`https://www.openstreetmap.org/${b.osmId}`, b.wikidata ? `https://www.wikidata.org/wiki/${b.wikidata}` : null].filter(Boolean),
    ...pageMeta(path, b.lastChecked),
  };
}

export function townLd(t, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: t.name,
    description: t.customDescription || t.description,
    geo: { '@type': 'GeoCoordinates', latitude: t.lat, longitude: t.lng },
    address: { '@type': 'PostalAddress', addressLocality: t.name, addressRegion: 'Cornwall', addressCountry: 'GB' },
    containedInPlace: { '@type': 'Place', name: regionBySlug(t.region)?.name },
    ...(heroImage(t) ? { image: imageLd(heroImage(t)) } : {}),
    sameAs: t.osm ? [t.osm] : undefined,
    ...pageMeta(path, t.lastChecked),
  };
}

export const itemListLd = (name, items, path) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  url: abs(path),
  numberOfItems: items.length,
  itemListElement: items.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: displayName(b), url: abs(`/beaches/${b.slug}/`) })),
});

// ----- Attractions ----------------------------------------------------------------------------
export function attractionTitle(a) {
  if (a.customTitle) return a.customTitle;
  const bits = [];
  if (a.rainyDay?.value === 'yes') bits.push(a.setting.value === 'indoor' ? 'indoor' : 'rainy-day option');
  if (a.kids?.value === 'yes') bits.push('with kids');
  if (a.entry?.value === 'free') bits.push('free entry');
  if (a.hours?.value === 'listed') bits.push('opening hours');
  return `${a.name}, ${townName(a.town)}${bits.length ? `: ${bits.slice(0, 3).join(', ')}` : ''}`;
}
import { enrichment } from './enrichment';
const fromOverview = (e) => (e?.overview?.[0] ? e.overview[0].split(/(?<=\.)\s/).reduce((acc, s) => (acc.length + s.length < 158 ? `${acc} ${s}`.trim() : acc), '') : null);
export function attractionDescription(a) {
  if (a.customDescription) return a.customDescription;
  const ov = fromOverview(enrichment('attraction', a.slug));
  if (ov) return ov;
  return `${a.description} Opening hours, how long to allow and what’s nearby.`.slice(0, 300);
}
export function attractionLd(a, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: a.customTitle || a.name,
    description: a.customDescription || a.description,
    geo: { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng },
    address: { '@type': 'PostalAddress', streetAddress: a.address || undefined, addressLocality: townName(a.town), addressRegion: 'Cornwall', addressCountry: 'GB' },
    ...(a.entry?.value === 'free' ? { isAccessibleForFree: true } : a.entry?.value === 'paid' ? { isAccessibleForFree: false } : {}),
    ...(heroImage(a) ? { image: imageLd(heroImage(a)) } : {}),
    ...(a.website ? { sameAs: [a.website] } : {}),
    ...(a.kids?.value === 'yes' ? { touristType: 'Families' } : {}),
    ...pageMeta(path, a.lastChecked),
  };
}
export const attractionListLd = (name, items, path) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  url: abs(path),
  numberOfItems: items.length,
  itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: abs(`/things-to-do/${a.slug}/`) })),
});

// ----- Food & drink ----------------------------------------------------------------------------
const KIND_WORD = { pub: 'pub', restaurant: 'restaurant', cafe: 'café', bar: 'bar' };
export function foodTitle(v) {
  if (v.customTitle) return v.customTitle;
  const bits = [];
  if (v.features?.dogFriendly?.value === 'yes') bits.push('dog-friendly');
  if (v.features?.seaView?.value === 'yes') bits.push('sea views');
  if (v.features?.sundayRoast?.value === 'yes') bits.push('Sunday roast');
  if (v.features?.familyFriendly?.value === 'yes') bits.push('children welcome');
  return `${v.name}, ${townName(v.town)}${bits.length ? `: ${bits.slice(0, 3).join(', ')}` : ` (${KIND_WORD[v.kind]})`}`;
}
export function foodDescription(v) {
  if (v.customDescription) return v.customDescription;
  return `${v.description} Opening hours, what’s nearby and what their website says about dogs, children and food.`.slice(0, 300);
}
export function foodLd(v, path) {
  const type = v.kind === 'pub' || v.kind === 'bar' ? 'BarOrPub' : v.kind === 'cafe' ? 'CafeOrCoffeeShop' : 'Restaurant';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: v.customTitle || v.name,
    description: v.customDescription || v.description,
    geo: { '@type': 'GeoCoordinates', latitude: v.lat, longitude: v.lng },
    address: { '@type': 'PostalAddress', streetAddress: v.address || undefined, addressLocality: townName(v.town), addressRegion: 'Cornwall', addressCountry: 'GB' },
    ...(v.website ? { sameAs: [v.website] } : {}),
    ...(v.features?.food?.value === 'yes' || v.kind !== 'bar' ? { servesCuisine: v.kind === 'restaurant' ? v.category : undefined } : {}),
    ...pageMeta(path, v.lastChecked),
  };
}
export const foodListLd = (name, items, path) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  url: abs(path),
  numberOfItems: items.length,
  itemListElement: items.map((v, i) => ({ '@type': 'ListItem', position: i + 1, name: v.name, url: abs(`/food-and-drink/${v.slug}/`) })),
});
