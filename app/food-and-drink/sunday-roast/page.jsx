import { FOOD_ROUNDUPS, foodRoundupItems } from '../../../lib/foodRoundups';
import Roundup from '../../../components/Roundup';

const r = FOOD_ROUNDUPS['sunday-roast'];
const path = '/food-and-drink/sunday-roast/';
export const metadata = { alternates: { canonical: path }, title: r.title, description: `${foodRoundupItems(r).length} places. ${r.intro}`.slice(0, 300) };

export default function Page() {
  return (
    <Roundup
      kind="food"
      title={r.title}
      path={path}
      intro={r.intro}
      criteria={r.criteria}
      crumbs={[['Home', '/'], ['Food and drink', '/food-and-drink/'], [r.label]]}
      items={foodRoundupItems(r).map((b) => ({ b })).sort((a, b) => a.b.name.localeCompare(b.b.name))}
      sources={[{ label: 'Google Maps listings (via SerpApi)', url: 'https://www.google.com/maps' }, { label: 'Each venue’s own website (quoted on its page)', url: '/editorial-policy/' }]}
    />
  );
}
