import { towns, regions, latestChecked } from '../../lib/data';
import PlaceCard, { CardGrid } from '../../components/PlaceCard';
import { Container, SectionHeading } from '../../components/Blocks';
import CategoryHero from '../../components/CategoryHero';
import { CATEGORY_HEROES } from '../../lib/siteImages';

export const metadata = { alternates: { canonical: '/towns/' }, title: 'Towns and villages to base your week', description: `${towns.length} towns and villages in Cornwall to base a week around, with the beaches near each.` };

export default function TownsPage() {
  return (
    <>
    <CategoryHero
      hero={CATEGORY_HEROES.towns}
      crumbs={[['Home', '/'], ['Towns']]}
      kicker={`${towns.length} towns and villages`}
      title="Choose a base"
      standfirst={`${towns.length} towns and villages, grouped by region, with the beaches within 5 km of each.`}
      lastChecked={latestChecked(towns)}
    />
    <Container>
      {regions.map((r) => (
        <section key={r.slug} className="mt-14">
          <SectionHeading>{r.name}</SectionHeading>
          <CardGrid cols={4}>
            {towns.filter((t) => t.region === r.slug).sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
              <PlaceCard key={t.slug} place={t} href={`/towns/${t.slug}/`} meta={`${(t.beachesNearby || []).length} beaches within 5 km`} />
            ))}
          </CardGrid>
        </section>
      ))}
    </Container>
    </>
  );
}
