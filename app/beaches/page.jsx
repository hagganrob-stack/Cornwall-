import Link from 'next/link';
import { beachRows, regions } from '../../lib/data';
import BeachFinder from './BeachFinder';

export const metadata = { title: 'Find a beach', description: 'Filter every named beach in Cornwall by dog rules, lifeguards, parking, toilets and more.' };

export default function BeachesPage() {
  return (
    <>
      <p className="crumbs"><Link href="/">Home</Link> › Beaches</p>
      <h1>Find a beach</h1>
      <p className="lede">Filters only use facts we hold a source for. A beach without a tick may still have the facility; it just isn’t confirmed.</p>
      <BeachFinder rows={beachRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
    </>
  );
}
