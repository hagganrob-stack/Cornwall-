import { beaches } from '../../../lib/data';
import { ROUNDUPS } from '../../../lib/roundups';
import Roundup from '../../../components/Roundup';

const r = ROUNDUPS['dog-friendly'];
export const metadata = { alternates: { canonical: '/beaches/dog-friendly/' }, title: r.title, description: `${beaches.filter(r.test).length} Cornish beaches with no Council dog restriction, plus beaches where dogs are welcome outside summer.` };

export default function Page() {
  const byName = (a, b) => a.b.name.localeCompare(b.b.name);
  return (
    <Roundup
      title={r.title}
      path="/beaches/dog-friendly/"
      intro={r.intro}
      criteria={r.criteria}
      crumbs={[['Home', '/'], ['Beaches', '/beaches/'], [r.label]]}
      items={beaches.filter(r.test).map((b) => ({ b })).sort(byName)}
      secondary={{ ...r.secondary, items: beaches.filter(r.secondary.test).map((b) => ({ b })).sort(byName) }}
    />
  );
}
