import { notFound } from 'next/navigation';
import { townBySlug, regionBySlug } from '../../../../lib/data';
import { ROUNDUPS, townRoundupPairs, townRoundupBeaches } from '../../../../lib/roundups';
import { TTD_ROUNDUPS, townTtdPairs, townTtdItems } from '../../../../lib/ttd';
import { FOOD_ROUNDUPS, townFoodPairs, townFoodItems } from '../../../../lib/foodRoundups';
import Roundup from '../../../../components/Roundup';

// /towns/<town>/<roundup>-beaches/ and /towns/<town>/<roundup>-things-to-do/, only where 3+ places qualify.
export const dynamicParams = false;
export const generateStaticParams = () => [
  ...townRoundupPairs().map(({ town, roundup }) => ({ slug: town.slug, roundup: `${roundup.slug}-beaches` })),
  ...townTtdPairs().map(({ town, roundup }) => ({ slug: town.slug, roundup: `${roundup.slug}-things-to-do` })),
  ...townFoodPairs().map(({ town, roundup }) => ({ slug: town.slug, roundup: `${roundup.slug}-food-and-drink` })),
];
const resolve = async (params) => {
  const { slug, roundup } = await params;
  const t = townBySlug(slug);
  if (roundup.endsWith('-food-and-drink')) {
    const r = FOOD_ROUNDUPS[roundup.replace(/-food-and-drink$/, '')];
    return { t, r, kind: 'food', items: t && r ? townFoodItems(t, r) : [], path: `/towns/${slug}/${roundup}/`, radius: 3 };
  }
  if (roundup.endsWith('-things-to-do')) {
    const r = TTD_ROUNDUPS[roundup.replace(/-things-to-do$/, '')];
    return { t, r, kind: 'attraction', items: t && r ? townTtdItems(t, r) : [], path: `/towns/${slug}/${roundup}/`, radius: 10 };
  }
  const r = ROUNDUPS[roundup.replace(/-beaches$/, '')];
  return { t, r, kind: 'beach', items: t && r ? townRoundupBeaches(t, r) : [], path: `/towns/${slug}/${roundup}/`, radius: 5 };
};
export async function generateMetadata({ params }) {
  const { t, r, kind, items, path, radius } = await resolve(params);
  return { alternates: { canonical: path }, title: r.townTitle(t.name), description: `${items.length} ${r.label.toLowerCase()} ${kind === 'attraction' ? 'things to do' : kind === 'food' ? 'places to eat and drink' : 'beaches'} within ${radius} km of ${t.name}. ${r.intro}`.slice(0, 300) };
}

export default async function Page({ params }) {
  const { t, r, kind, items, path, radius } = await resolve(params);
  if (!t || !r) notFound();
  const region = regionBySlug(t.region);
  return (
    <Roundup
      kind={kind}
      title={r.townTitle(t.name)}
      path={path}
      intro={r.intro}
      criteria={`${r.criteria} Within ${radius} km of ${t.name}.`}
      distanceFrom={t.name}
      crumbs={[['Home', '/'], [region.name, `/regions/${region.slug}/`], [t.name, `/towns/${t.slug}/`], [r.label]]}
      items={items}
      sources={kind !== 'beach' ? [{ label: 'Google Maps listings (via SerpApi)', url: 'https://www.google.com/maps' }, { label: 'Each attraction’s official website (linked on its page)', url: '/editorial-policy/' }] : undefined}
    />
  );
}
