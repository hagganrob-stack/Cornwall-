import Link from 'next/link';
import { beaches, beachRows, regions, latestChecked } from '../../lib/data';
import { ROUNDUPS, roundupPath, roundupBeaches } from '../../lib/roundups';
import { Container } from '../../components/Blocks';
import CategoryHero from '../../components/CategoryHero';
import { CATEGORY_HEROES } from '../../lib/siteImages';
import BeachFinder from './BeachFinder';

export const metadata = { alternates: { canonical: '/beaches/' }, title: 'Find a beach in Cornwall', description: `Filter all ${beaches.length} named beaches in Cornwall by dog rules by month, lifeguards, parking, surf and more.` };

export default function BeachesPage() {
  return (
    <>
    <CategoryHero
      hero={CATEGORY_HEROES.beaches}
      crumbs={[['Home', '/'], ['Beaches']]}
      kicker={`${beaches.length} named beaches`}
      title="Find a beach"
      standfirst={`All ${beaches.length} named beaches in Cornwall. Filters only use facts we have a source for, so a beach without a tick might still have the facility; it just isn’t confirmed yet.`}
      lastChecked={latestChecked(beaches)}
    />
    <Container>
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
    </>
  );
}
