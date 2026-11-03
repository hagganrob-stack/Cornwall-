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
    <Container className="pt-8 sm:pt-12">
      <Crumbs items={[['Home', '/'], ['Things to do']]} />
      <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">Things to do in Cornwall</h1>
      <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">
        {attractions.length} attractions, from gardens and castles to aquariums and indoor play. Filter for a rainy day, for the kids, or for places that are free to get into.
      </p>
      <Byline lastChecked={latestChecked(attractions)} sourcesHref="/editorial-policy/" className="mt-6" />
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
  );
}
