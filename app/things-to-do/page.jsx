import Link from 'next/link';
import { attractions, attractionRows, regions, latestChecked } from '../../lib/data';
import { TTD_ROUNDUPS, ttdRoundupPath, ttdRoundupItems } from '../../lib/ttd';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import ThingsFinder from './ThingsFinder';

export const metadata = {
  alternates: { canonical: '/things-to-do/' },
  title: 'Things to do in Cornwall',
  description: `${attractions.length} things to do in Cornwall, from museums and gardens to wildlife parks, with rainy-day, with-kids and free filters, opening hours and what’s nearby.`,
};

export default function ThingsToDo() {
  return (
    <Container className="pt-8">
      <Crumbs items={[['Home', '/'], ['Things to do']]} />
      <h1 className="mt-4 text-4xl sm:text-5xl">Things to do in Cornwall</h1>
      <p className="mt-3 max-w-[68ch] text-lg text-atlantic-950/75">
        {attractions.length} attractions, from gardens and castles to aquariums and indoor play. Filter for a rainy day, for the kids, or for places that are free to get into.
      </p>
      <Byline lastChecked={latestChecked(attractions)} sourcesHref="/editorial-policy/" className="mt-4" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.values(TTD_ROUNDUPS).map((r) => (
          <Link key={r.slug} href={ttdRoundupPath(r)} className="chip bg-sand-100 px-4 py-2 text-sm text-atlantic-900 no-underline hover:bg-sand-200">
            {r.label} ({ttdRoundupItems(r).length})
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <ThingsFinder rows={attractionRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
      </div>
    </Container>
  );
}
