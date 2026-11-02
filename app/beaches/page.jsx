import Link from 'next/link';
import { beaches, beachRows, regions, latestChecked } from '../../lib/data';
import { ROUNDUPS, roundupPath, roundupBeaches } from '../../lib/roundups';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import BeachFinder from './BeachFinder';

export const metadata = { title: 'Find a beach in Cornwall', description: `Filter all ${beaches.length} named beaches in Cornwall by dog rules by month, lifeguards, parking, surf and more.` };

export default function BeachesPage() {
  return (
    <Container className="pt-8">
      <Crumbs items={[['Home', '/'], ['Beaches']]} />
      <h1 className="mt-4 text-4xl sm:text-5xl">Find a beach</h1>
      <p className="mt-3 max-w-[68ch] text-lg text-atlantic-950/75">
        All {beaches.length} named beaches in Cornwall. Filters only use facts we have a source for, so a beach without a tick might still have the facility; it just isn’t confirmed yet.
      </p>
      <Byline lastChecked={latestChecked(beaches)} sourcesHref="/editorial-policy/" className="mt-4" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.values(ROUNDUPS).map((r) => (
          <Link key={r.slug} href={roundupPath(r)} className="chip bg-sand-100 px-4 py-2 text-sm text-atlantic-900 no-underline hover:bg-sand-200">
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
