import Link from 'next/link';
import { food, foodRows, regions, latestChecked } from '../../lib/data';
import { FOOD_ROUNDUPS, foodRoundupPath, foodRoundupItems } from '../../lib/foodRoundups';
import Byline from '../../components/Byline';
import { Container, Crumbs } from '../../components/Blocks';
import FoodFinder from './FoodFinder';

export const metadata = {
  alternates: { canonical: '/food-and-drink/' },
  title: 'Pubs, cafés and restaurants in Cornwall',
  description: `${food.length} pubs, restaurants and cafés across Cornwall, with Google ratings and filters for dogs, children, vegan, vegetarian and gluten-free food, sea views and Sunday roasts.`,
};

export default function FoodAndDrink() {
  return (
    <Container className="pt-8 sm:pt-12">
      <Crumbs items={[['Home', '/'], ['Food and drink']]} />
      <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">Pubs, cafés and restaurants</h1>
      <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">
        {food.length} places to eat and drink, from harbourside pubs to beach cafés. Ratings come from Google. The filters only use what each venue’s own website says, so a place without a tick might still welcome your dog or do a vegan dish; it just doesn’t say so online.
      </p>
      <Byline lastChecked={latestChecked(food)} sourcesHref="/editorial-policy/" className="mt-6" />
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
  );
}
