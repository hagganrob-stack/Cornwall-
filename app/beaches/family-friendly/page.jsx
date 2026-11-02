import { beaches } from '../../../lib/data';
import { ROUNDUPS } from '../../../lib/roundups';
import Roundup from '../../../components/Roundup';

const r = ROUNDUPS['family-friendly'];
export const metadata = { alternates: { canonical: '/beaches/family-friendly/' }, title: r.title, description: `${beaches.filter(r.test).length} Cornish beaches with RNLI lifeguards in season, toilets and parking or a café nearby.` };

export default function Page() {
  return (
    <Roundup
      title={r.title}
      path="/beaches/family-friendly/"
      intro={r.intro}
      criteria={r.criteria}
      crumbs={[['Home', '/'], ['Beaches', '/beaches/'], [r.label]]}
      items={beaches.filter(r.test).map((b) => ({ b })).sort((a, b) => a.b.name.localeCompare(b.b.name))}
    />
  );
}
