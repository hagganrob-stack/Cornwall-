import Link from 'next/link';
import { attractions, attractionRows, regions, latestChecked } from '../../lib/data';
import { TTD_ROUNDUPS, ttdRoundupPath, ttdRoundupItems } from '../../lib/ttd';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import CategoryHero from '../../components/CategoryHero';
import { CATEGORY_HEROES, heroAvailable } from '../../lib/siteImages';
import ThingsFinder from './ThingsFinder';

export const metadata = {
  alternates: { canonical: '/things-to-do/' },
  title: 'Things to do in Cornwall',
  description: `${attractions.length} things to do in Cornwall, from museums and gardens to wildlife parks, with rainy-day, with-kids and free filters, opening hours and what’s nearby.`,
};

export default function ThingsToDo() {
  const crumbs = [['Home', '/'], ['Things to do']];
  const title = 'Things to do in Cornwall';
  const standfirst = `${attractions.length} attractions, from gardens and castles to aquariums and indoor play. Filter for a rainy day, for the kids, or for places that are free to get into.`;
  const hero = heroAvailable(CATEGORY_HEROES.thingsToDo) ? CATEGORY_HEROES.thingsToDo : null;
  return (
    <>
    {hero ? <CategoryHero hero={hero} crumbs={crumbs} kicker={`${attractions.length} attractions`} title={title} standfirst={standfirst} lastChecked={latestChecked(attractions)} /> : null}
    <Container className={hero ? '' : 'pt-8 sm:pt-12'}>
      {hero ? null : (
        <>
          <Crumbs items={crumbs} />
          <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">{title}</h1>
          <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">{standfirst}</p>
          <Byline lastChecked={latestChecked(attractions)} sourcesHref="/editorial-policy/" className="mt-6" />
        </>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        {Object.values(TTD_ROUNDUPS).map((r) => (
          <Link key={r.slug} href={ttdRoundupPath(r)} className="pill-link">
            {r.label} ({ttdRoundupItems(r).length})
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <ThingsFinder rows={attractionRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
      </div>
    </Container>
    </>
  );
}
