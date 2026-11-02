import Link from 'next/link';
import { notFound } from 'next/navigation';
import { towns, townBySlug, regionBySlug, beachBySlug, heroImage } from '../../../lib/data';
import { ROUNDUPS, townRoundupBeaches, townRoundupPath, MIN_TOWN_ROUNDUP } from '../../../lib/roundups';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import PlaceCard, { CardGrid } from '../../../components/PlaceCard';
import OsmMap from '../../../components/OsmMap';
import Nearby from '../../../components/Nearby';
import { Container, Crumbs, SectionHeading, WeVisited, StayNearby, Sources, AuthorBio } from '../../../components/Blocks';
import JsonLd from '../../../components/JsonLd';
import { townTitle, townDescription, townLd } from '../../../lib/seo';
import { imgSrc } from '../../../lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => towns.map((t) => ({ slug: t.slug }));
export async function generateMetadata({ params }) {
  const t = townBySlug((await params).slug);
  const img = heroImage(t);
  return {
    title: { absolute: townTitle(t) },
    description: townDescription(t),
    alternates: { canonical: `/towns/${t.slug}/` },
    openGraph: { title: townTitle(t), description: townDescription(t), url: `/towns/${t.slug}/`, ...(img ? { images: [{ url: imgSrc(img), alt: t.name }] } : {}) },
  };
}

export default async function TownPage({ params }) {
  const t = townBySlug((await params).slug);
  if (!t) notFound();
  const region = regionBySlug(t.region);
  const near = (t.beachesNearby || []).map((n) => ({ ...n, b: beachBySlug(n.slug) })).filter((n) => n.b);
  const combos = Object.values(ROUNDUPS).map((r) => ({ r, n: townRoundupBeaches(t, r).length })).filter((x) => x.n >= MIN_TOWN_ROUNDUP);
  return (
    <article>
      <JsonLd data={townLd(t, `/towns/${t.slug}/`)} />
      <Hero image={heroImage(t)} title={t.name} kicker={`${region.name} · ${near.length} beaches within 5 km`} lat={t.lat} lng={t.lng} />
      <Container className="mt-6">
        <Crumbs items={[['Home', '/'], [region.name, `/regions/${region.slug}/`], [t.name]]} />
        <Byline lastChecked={t.lastChecked} className="mt-3" />
      </Container>
      <Container className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <WeVisited place={t} />
          <p className="max-w-[68ch] text-xl leading-relaxed text-atlantic-950/85">{t.description}</p>
          {combos.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {combos.map(({ r, n }) => (
                <Link key={r.slug} href={townRoundupPath(t, r)} className="chip bg-seaglass-100 px-4 py-2 text-sm text-atlantic-900 no-underline hover:bg-seaglass-300">
                  {n} {r.label.toLowerCase()} beaches nearby →
                </Link>
              ))}
            </div>
          ) : null}
          <section className="mt-12">
            <SectionHeading kicker="Within 5 km">Beaches near {t.name}</SectionHeading>
            {near.length ? (
              <CardGrid cols={2}>
                {near.map(({ b, km }) => (
                  <PlaceCard key={b.slug} place={b} beach href={`/beaches/${b.slug}/`} meta={`${km} km from ${t.name}`} />
                ))}
              </CardGrid>
            ) : (
              <p className="text-atlantic-950/70">No named beaches are mapped within 5 km.</p>
            )}
          </section>
          {/* Attractions and food & drink sections will slot in here. */}
          <StayNearby place={t} />
          <AuthorBio />
          <Sources sources={t.sources} lastChecked={t.lastChecked} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <OsmMap lat={t.lat} lng={t.lng} zoomDeg={0.03} label={t.name} />
          <Nearby title="Other places to stay nearby" items={t.nearbyTowns?.slice(0, 5)} base="/towns/" />
        </aside>
      </Container>
    </article>
  );
}
