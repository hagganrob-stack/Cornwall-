// Roundup pages. Each test uses only sourced facts; the criteria are printed on the page.
import { beaches, towns, beachBySlug, has, isLifeguarded } from './data';

export const ROUNDUPS = {
  'dog-friendly': {
    slug: 'dog-friendly',
    label: 'Dog-friendly',
    title: 'Dog-friendly beaches in Cornwall',
    townTitle: (t) => `Dog-friendly beaches near ${t}`,
    test: (b) => !b.dogs.councilListed,
    intro:
      'These beaches are not on Cornwall Council’s list of beaches with dog restrictions, so there is no Council ban at any time of year. Privately owned beaches can set their own rules, so check signs when you arrive.',
    criteria: 'Not listed in Cornwall Council’s Public Spaces Protection Order for dogs on beaches.',
    // Also list beaches where dogs are fine outside the restricted dates and hours.
    secondary: {
      title: 'Dogs welcome outside the summer restriction',
      test: (b) => b.dogs.councilListed && !b.dogs.allYear && b.dogs.restriction !== 'leads',
      intro: 'These beaches have a seasonal Council ban, usually during the day in summer. Outside those dates and hours there is no Council restriction.',
    },
  },
  'family-friendly': {
    slug: 'family-friendly',
    label: 'Family-friendly',
    title: 'Family-friendly beaches in Cornwall',
    townTitle: (t) => `Family-friendly beaches near ${t}`,
    test: (b) => isLifeguarded(b) && has(b.toilets) && (has(b.parking) || has(b.cafeNearby)),
    intro:
      'Beaches with the basics that make a day out with children easier: RNLI lifeguards in season, toilets close by, and a car park or café nearby.',
    criteria: 'RNLI lifeguard unit (RNLI open data), public toilets mapped nearby, and a car park or café mapped nearby (OpenStreetMap).',
  },
};

export const roundupBeaches = (r) => beaches.filter(r.test);

// Town + roundup pages exist only where at least 3 nearby beaches qualify.
export const MIN_TOWN_ROUNDUP = 3;
export const townRoundupBeaches = (town, r) =>
  (town.beachesNearby || [])
    .map((n) => ({ ...n, b: beachBySlug(n.slug) }))
    .filter((n) => n.b && r.test(n.b));

export const townRoundupPairs = () =>
  towns.flatMap((t) => Object.values(ROUNDUPS).filter((r) => townRoundupBeaches(t, r).length >= MIN_TOWN_ROUNDUP).map((r) => ({ town: t, roundup: r })));

export const roundupPath = (r) => `/beaches/${r.slug}/`;
export const townRoundupPath = (t, r) => `/towns/${t.slug}/${r.slug}-beaches/`;
