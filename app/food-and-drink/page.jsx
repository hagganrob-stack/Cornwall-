import Link from 'next/link';
import { food, foodRows, regions, latestChecked } from '../../lib/data';
import { FOOD_ROUNDUPS, foodRoundupPath, foodRoundupItems } from '../../lib/foodRoundups';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import FoodFinder from './FoodFinder';

export const metadata = {
  alternates: { canonical: '/food-and-drink/' },
  title: 'Pubs, cafés and restaurants in Cornwall',
  description: `${food.length} pubs, restaurants and cafés across Cornwall, with dog-friendly, sea-view, Sunday roast and family filters based on what each venue’s own website says.`,
};

export default function FoodAndDrink() {
  return (
    <Container className="pt-8">
      <Crumbs items={[['Home', '/'], ['Food and drink']]} />
      <h1 className="mt-4 text-4xl sm:text-5xl">Pubs, cafés and restaurants</h1>
      <p className="mt-3 max-w-[68ch] text-lg text-atlantic-950/75">
        {food.length} places to eat and drink, from harbourside pubs to beach cafés. The filters only use what each venue’s own website says, so a place without a tick might still welcome your dog; it just doesn’t say so online.
      </p>
      <Byline lastChecked={latestChecked(food)} sourcesHref="/editorial-policy/" className="mt-4" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.values(FOOD_ROUNDUPS).map((r) => (
          <Link key={r.slug} href={foodRoundupPath(r)} className="chip bg-sand-100 px-4 py-2 text-sm text-atlantic-900 no-underline hover:bg-sand-200">
            {r.label} ({foodRoundupItems(r).length})
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <FoodFinder rows={foodRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
      </div>
    </Container>
  );
}
