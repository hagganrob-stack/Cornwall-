import { TTD_ROUNDUPS, ttdRoundupItems } from '../../../lib/ttd';
import Roundup from '../../../components/Roundup';

const r = TTD_ROUNDUPS['free'];
const path = '/things-to-do/free/';
export const metadata = { alternates: { canonical: path }, title: r.title, description: `${ttdRoundupItems(r).length} ${r.title.toLowerCase().replace(' in cornwall', '')} in Cornwall. ${r.intro}`.slice(0, 300) };

export default function Page() {
  return (
    <Roundup
      kind="attraction"
      title={r.title}
      path={path}
      intro={r.intro}
      criteria={r.criteria}
      crumbs={[['Home', '/'], ['Things to do', '/things-to-do/'], [r.label]]}
      items={ttdRoundupItems(r).map((b) => ({ b })).sort((a, b) => a.b.name.localeCompare(b.b.name))}
      sources={[{ label: 'Google Maps listings (via SerpApi)', url: 'https://www.google.com/maps' }, { label: 'Each attraction’s official website (linked on its page)', url: '/editorial-policy/' }]}
    />
  );
}
