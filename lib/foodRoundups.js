// Food & drink roundups. Each test uses only facts the venue's own website states; criteria are printed on the page.
import { food, towns, foodBySlug, featureYes } from './data';

export const FOOD_ROUNDUPS = {
  'dog-friendly': {
    slug: 'dog-friendly',
    label: 'Dog-friendly',
    title: 'Dog-friendly pubs, cafés and restaurants in Cornwall',
    townTitle: (t) => `Dog-friendly places to eat and drink near ${t}`,
    test: (v) => featureYes(v, 'dogFriendly'),
    intro: 'Places whose own websites say dogs are welcome. Some only allow dogs in the bar or outside, so it’s worth checking when you book.',
    criteria: 'The venue’s own website says dogs are welcome (we quote it on each page).',
  },
  'sea-views': {
    slug: 'sea-views',
    label: 'Sea views',
    title: 'Pubs and restaurants with sea views in Cornwall',
    townTitle: (t) => `Places to eat with a sea view near ${t}`,
    test: (v) => featureYes(v, 'seaView'),
    intro: 'Somewhere to eat or drink with a view over the sea, a harbour, a beach or an estuary.',
    criteria: 'The venue’s own website mentions views over the sea, harbour, beach or estuary, or a waterside or clifftop setting.',
  },
  'sunday-roast': {
    slug: 'sunday-roast',
    label: 'Sunday roast',
    title: 'Sunday roasts in Cornwall',
    townTitle: (t) => `Sunday roasts near ${t}`,
    test: (v) => featureYes(v, 'sundayRoast'),
    intro: 'Pubs and restaurants that say they serve a Sunday roast or carvery. Booking ahead is wise in the holidays.',
    criteria: 'The venue’s own website mentions Sunday roasts, Sunday lunch or a Sunday carvery.',
  },
  'family-friendly': {
    slug: 'family-friendly',
    label: 'Family-friendly',
    title: 'Family-friendly places to eat in Cornwall',
    townTitle: (t) => `Family-friendly places to eat near ${t}`,
    test: (v) => featureYes(v, 'familyFriendly'),
    intro: 'Pubs, cafés and restaurants that say children are welcome or have a children’s menu.',
    criteria: 'The venue’s own website says children or families are welcome, or mentions a children’s menu or high chairs.',
  },
  vegan: {
    slug: 'vegan',
    label: 'Vegan',
    title: 'Vegan-friendly places to eat in Cornwall',
    townTitle: (t) => `Vegan-friendly places to eat near ${t}`,
    test: (v) => featureYes(v, 'vegan'),
    intro: 'Pubs, cafés and restaurants whose own websites mention vegan or plant-based options.',
    criteria: 'The venue’s own website mentions vegan or plant-based dishes, or marks them on its menu.',
  },
  'gluten-free': {
    slug: 'gluten-free',
    label: 'Gluten-free',
    title: 'Gluten-free friendly places to eat in Cornwall',
    townTitle: (t) => `Gluten-free friendly places to eat near ${t}`,
    test: (v) => featureYes(v, 'glutenFree'),
    intro: 'Places whose own websites mention gluten-free options. If you’re coeliac, always check how they handle cross-contamination.',
    criteria: 'The venue’s own website mentions gluten-free options or marks them on its menu.',
  },
  'beer-gardens': {
    slug: 'beer-gardens',
    label: 'Beer gardens',
    title: 'Pubs with beer gardens in Cornwall',
    townTitle: (t) => `Beer gardens near ${t}`,
    test: (v) => featureYes(v, 'beerGarden'),
    intro: 'Pubs with a garden, courtyard or terrace for sunny afternoons.',
    criteria: 'The venue’s own website mentions a beer garden, pub garden, courtyard or terrace.',
  },
};

export const foodRoundupPath = (r) => `/food-and-drink/${r.slug}/`;
export const townFoodPath = (t, r) => `/towns/${t.slug}/${r.slug}-food-and-drink/`;
export const MIN_TOWN_FOOD = 3;
export const townFoodItems = (town, r) =>
  (town.foodNearby || []).map((n) => ({ ...n, b: foodBySlug(n.slug) })).filter((n) => n.b && r.test(n.b));
export const townFoodPairs = () =>
  towns.flatMap((t) => Object.values(FOOD_ROUNDUPS).filter((r) => townFoodItems(t, r).length >= MIN_TOWN_FOOD).map((r) => ({ town: t, roundup: r })));
export const foodRoundupItems = (r) => food.filter(r.test);
