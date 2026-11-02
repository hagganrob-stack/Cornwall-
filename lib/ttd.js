// Things-to-do roundups. Each test uses only sourced facts; the criteria are printed on the page.
import { attractions, towns, attractionBySlug, has } from './data';

export const TTD_ROUNDUPS = {
  'rainy-day': {
    slug: 'rainy-day',
    label: 'Rainy-day',
    title: 'Rainy-day things to do in Cornwall',
    townTitle: (t) => `Rainy-day things to do near ${t}`,
    test: (a) => has(a.rainyDay),
    intro: 'When the weather turns, these places have indoor space: museums, galleries, aquariums, indoor play and more.',
    criteria: 'Indoors or with indoor areas, going by the place’s Google Maps categories.',
  },
  'with-kids': {
    slug: 'with-kids',
    label: 'With kids',
    title: 'Things to do with kids in Cornwall',
    townTitle: (t) => `Things to do with kids near ${t}`,
    test: (a) => has(a.kids),
    intro: 'Days out aimed at families: wildlife parks, farms, aquariums, adventure parks and indoor play.',
    criteria: 'Listed on Google Maps in a family category (for example zoo, wildlife park, aquarium, farm, theme park or indoor playground).',
  },
  free: {
    slug: 'free',
    label: 'Free',
    title: 'Free things to do in Cornwall',
    townTitle: (t) => `Free things to do near ${t}`,
    test: (a) => a.entry.value === 'free',
    intro: 'Places whose own website says entry is free. Parking, tours and extras may still cost money.',
    criteria: 'The attraction’s official website says entry is free (we quote it on each page).',
  },
};

export const ttdRoundupPath = (r) => `/things-to-do/${r.slug}/`;
export const townTtdPath = (t, r) => `/towns/${t.slug}/${r.slug}-things-to-do/`;
export const MIN_TOWN_TTD = 3;
export const townTtdItems = (town, r) =>
  (town.attractionsNearby || []).map((n) => ({ ...n, b: attractionBySlug(n.slug) })).filter((n) => n.b && r.test(n.b));
export const townTtdPairs = () =>
  towns.flatMap((t) => Object.values(TTD_ROUNDUPS).filter((r) => townTtdItems(t, r).length >= MIN_TOWN_TTD).map((r) => ({ town: t, roundup: r })));
export const ttdRoundupItems = (r) => attractions.filter(r.test);
