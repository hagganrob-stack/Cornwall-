import { towns, regions, latestChecked } from '../../lib/data';
import Byline from '../../components/Byline';
import PlaceCard, { CardGrid } from '../../components/PlaceCard';
import { Container, Crumbs, SectionHeading } from '../../components/Blocks';

export const metadata = { alternates: { canonical: '/towns/' }, title: 'Towns and villages to base your week', description: `${towns.length} towns and villages in Cornwall to base a week around, with the beaches near each.` };

export default function TownsPage() {
  return (
    <Container className="pt-8 sm:pt-12">
      <Crumbs items={[['Home', '/'], ['Towns']]} />
      <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">Choose a base</h1>
      <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">{towns.length} towns and villages, grouped by region, with the beaches within 5 km of each.</p>
      <Byline lastChecked={latestChecked(towns)} sourcesHref="/editorial-policy/" className="mt-6" />
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
  );
}
