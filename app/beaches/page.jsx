import Link from 'next/link';
import { beaches, beachRows, regions, latestChecked } from '../../lib/data';
import { ROUNDUPS, roundupPath, roundupBeaches } from '../../lib/roundups';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import BeachFinder from './BeachFinder';

export const metadata = { alternates: { canonical: '/beaches/' }, title: 'Find a beach in Cornwall', description: `Filter all ${beaches.length} named beaches in Cornwall by dog rules by month, lifeguards, parking, surf and more.` };

export default function BeachesPage() {
  return (
    <Container className="pt-8 sm:pt-12">
      <Crumbs items={[['Home', '/'], ['Beaches']]} />
      <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">Find a beach</h1>
      <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">
        All {beaches.length} named beaches in Cornwall. Filters only use facts we have a source for, so a beach without a tick might still have the facility; it just isn’t confirmed yet.
      </p>
      <Byline lastChecked={latestChecked(beaches)} sourcesHref="/editorial-policy/" className="mt-6" />
      <div className="mt-8 flex flex-wrap gap-2">
        {Object.values(ROUNDUPS).map((r) => (
          <Link key={r.slug} href={roundupPath(r)} className="pill-link">
            {r.label} ({roundupBeaches(r).length})
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <BeachFinder rows={beachRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
      </div>
    </Container>
  );
}
