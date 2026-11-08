import Link from 'next/link';
import { food, foodRows, regions, latestChecked } from '../../lib/data';
import { FOOD_ROUNDUPS, foodRoundupPath, foodRoundupItems } from '../../lib/foodRoundups';
import { Container } from '../../components/Blocks';
import CategoryHero from '../../components/CategoryHero';
import { CATEGORY_HEROES } from '../../lib/siteImages';
import FoodFinder from './FoodFinder';

export const metadata = {
  alternates: { canonical: '/food-and-drink/' },
  title: 'Pubs, cafés and restaurants in Cornwall',
  description: `${food.length} pubs, restaurants and cafés across Cornwall, with Google ratings and filters for dogs, children, vegan, vegetarian and gluten-free food, sea views and Sunday roasts.`,
};

export default function FoodAndDrink() {
  return (
    <>
    <CategoryHero
      hero={CATEGORY_HEROES.food}
      crumbs={[['Home', '/'], ['Food and drink']]}
      kicker={`${food.length} places to eat and drink`}
      title="Pubs, cafés and restaurants"
      standfirst={`${food.length} places to eat and drink, from harbourside pubs to beach cafés. Ratings come from Google. The filters only use what each venue’s own website says, so a place without a tick might still welcome your dog or do a vegan dish; it just doesn’t say so online.`}
      lastChecked={latestChecked(food)}
    />
    <Container>
      <div className="mt-8 flex flex-wrap gap-2">
        {Object.values(FOOD_ROUNDUPS).map((r) => (
          <Link key={r.slug} href={foodRoundupPath(r)} className="pill-link">
            {r.label} ({foodRoundupItems(r).length})
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <FoodFinder rows={foodRows()} regions={regions.map((r) => ({ slug: r.slug, name: r.name }))} />
      </div>
    </Container>
    </>
  );
}
