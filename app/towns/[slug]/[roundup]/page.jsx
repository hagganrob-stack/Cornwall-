import { notFound } from 'next/navigation';
import { townBySlug, regionBySlug } from '../../../../lib/data';
import { ROUNDUPS, townRoundupPairs, townRoundupBeaches } from '../../../../lib/roundups';
import Roundup from '../../../../components/Roundup';

// /towns/<town>/<roundup>-beaches/, only where 3+ nearby beaches qualify.
export const dynamicParams = false;
export const generateStaticParams = () => townRoundupPairs().map(({ town, roundup }) => ({ slug: town.slug, roundup: `${roundup.slug}-beaches` }));
const resolve = async (params) => {
  const { slug, roundup } = await params;
  return { t: townBySlug(slug), r: ROUNDUPS[roundup.replace(/-beaches$/, '')] };
};
export async function generateMetadata({ params }) {
  const { t, r } = await resolve(params);
  return { title: r.townTitle(t.name), description: `${townRoundupBeaches(t, r).length} ${r.label.toLowerCase()} beaches within 5 km of ${t.name}.` };
}

export default async function Page({ params }) {
  const { t, r } = await resolve(params);
  if (!t || !r) notFound();
  const region = regionBySlug(t.region);
  return (
    <Roundup
      title={r.townTitle(t.name)}
      intro={r.intro}
      criteria={`${r.criteria} Within 5 km of ${t.name}.`}
      distanceFrom={t.name}
      crumbs={[['Home', '/'], [region.name, `/regions/${region.slug}/`], [t.name, `/towns/${t.slug}/`], [r.label]]}
      items={townRoundupBeaches(t, r)}
    />
  );
}
