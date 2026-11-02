import { notFound } from 'next/navigation';
import { beaches, towns, regions, regionBySlug, heroImage, townName, latestChecked } from '../../../lib/data';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import PlaceCard, { CardGrid } from '../../../components/PlaceCard';
import { Container, Crumbs, SectionHeading, Sources, AuthorBio } from '../../../components/Blocks';

export const dynamicParams = false;
export const generateStaticParams = () => regions.map((r) => ({ slug: r.slug }));
export async function generateMetadata({ params }) {
  const r = regionBySlug((await params).slug);
  return { title: `${r.name}: beaches and places to stay`, description: r.summary, alternates: { canonical: `/regions/${r.slug}/` } };
}

export default async function RegionPage({ params }) {
  const r = regionBySlug((await params).slug);
  if (!r) notFound();
  const rb = beaches.filter((b) => b.region === r.slug);
  const rt = towns.filter((t) => t.region === r.slug).sort((a, b) => a.name.localeCompare(b.name));
  const hero = heroImage(rb.filter((b) => heroImage(b)?.width > 1500).sort((a, b) => (heroImage(b).score || 0) - (heroImage(a).score || 0))[0] || rb[0]);
  return (
    <>
      <Hero image={hero} title={r.name} kicker={`${rb.length} beaches · ${rt.length} places to stay`} />
      <Container className="mt-6">
        <Crumbs items={[['Home', '/'], [r.name]]} />
        <Byline lastChecked={latestChecked(rb)} className="mt-3" />
        <p className="mt-6 max-w-[68ch] text-xl leading-relaxed text-atlantic-950/85">{r.summary}</p>
        {r.status === 'draft' ? <p className="mt-2 text-sm text-atlantic-950/55">{r.boundaryNote}</p> : null}
      </Container>
      <Container className="mt-14">
        <SectionHeading kicker="Where to base yourself">Towns and villages</SectionHeading>
        <CardGrid cols={4}>
          {rt.map((t) => (
            <PlaceCard key={t.slug} place={t} href={`/towns/${t.slug}/`} meta={`${(t.beachesNearby || []).length} beaches within 5 km`} />
          ))}
        </CardGrid>
      </Container>
      <Container className="mt-16">
        <SectionHeading kicker="On the coast">{rb.length} beaches</SectionHeading>
        <CardGrid>
          {rb.map((b) => (
            <PlaceCard key={b.slug} place={b} beach href={`/beaches/${b.slug}/`} meta={`Near ${townName(b.town)}`} />
          ))}
        </CardGrid>
        <AuthorBio />
        <Sources sources={[{ label: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', licence: 'ODbL' }, { label: 'Cornwall Council – Dogs on beaches (PSPO)', url: 'https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/' }, { label: 'RNLI open data – Lifeguard Units', url: 'https://rnli.org/find-my-nearest/lifeguarded-beaches' }]} lastChecked={latestChecked(rb)} note="Region boundaries are our own draft." />
      </Container>
    </>
  );
}
