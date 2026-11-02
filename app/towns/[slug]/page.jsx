import Link from 'next/link';
import { notFound } from 'next/navigation';
import { towns, townBySlug, regionBySlug, beachBySlug, attractionBySlug, heroImage } from '../../../lib/data';
import { TTD_ROUNDUPS, townTtdItems, townTtdPath, MIN_TOWN_TTD } from '../../../lib/ttd';
import { FOOD_ROUNDUPS, townFoodItems, townFoodPath, MIN_TOWN_FOOD } from '../../../lib/foodRoundups';
import { foodBySlug } from '../../../lib/data';
import { ROUNDUPS, townRoundupBeaches, townRoundupPath, MIN_TOWN_ROUNDUP } from '../../../lib/roundups';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import PlaceCard, { CardGrid } from '../../../components/PlaceCard';
import OsmMap from '../../../components/OsmMap';
import FoodBadges from '../../../components/FoodBadges';
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
  const combos = [
    ...Object.values(ROUNDUPS).map((r) => ({ r, n: townRoundupBeaches(t, r).length, href: townRoundupPath(t, r), what: 'beaches' })).filter((x) => x.n >= MIN_TOWN_ROUNDUP),
    ...Object.values(TTD_ROUNDUPS).map((r) => ({ r, n: townTtdItems(t, r).length, href: townTtdPath(t, r), what: 'things to do' })).filter((x) => x.n >= MIN_TOWN_TTD),
    ...Object.values(FOOD_ROUNDUPS).map((r) => ({ r, n: townFoodItems(t, r).length, href: townFoodPath(t, r), what: 'places to eat' })).filter((x) => x.n >= MIN_TOWN_FOOD),
  ];
  const eat = (t.foodNearby || []).map((n) => ({ ...n, v: foodBySlug(n.slug) })).filter((n) => n.v);
  const ttd = (t.attractionsNearby || []).map((n) => ({ ...n, a: attractionBySlug(n.slug) })).filter((n) => n.a);
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
              {combos.map(({ r, n, href, what }) => (
                <Link key={href} href={href} className="chip bg-seaglass-100 px-4 py-2 text-sm text-atlantic-900 no-underline hover:bg-seaglass-300">
                  {n} {r.label.toLowerCase()} {what} nearby →
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
          <section className="mt-14">
            <SectionHeading kicker="Within 10 km">Things to do near {t.name}</SectionHeading>
            {ttd.length ? (
              <CardGrid cols={2}>
                {ttd.slice(0, 8).map(({ a, km }) => (
                  <PlaceCard key={a.slug} place={a} attraction href={`/things-to-do/${a.slug}/`} meta={`${a.category} · ${km} km`} />
                ))}
              </CardGrid>
            ) : (
              <p className="text-atlantic-950/70">We haven’t listed any attractions within 10 km yet.</p>
            )}
            {ttd.length > 8 ? <p className="mt-4"><Link href="/things-to-do/">See all {ttd.length} nearby in the things-to-do finder →</Link></p> : null}
          </section>
          <section className="mt-14">
            <SectionHeading kicker="Within 3 km">Where to eat and drink</SectionHeading>
            {eat.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {eat.slice(0, 10).map(({ v, km }) => (
                  <li key={v.slug}>
                    <Link href={`/food-and-drink/${v.slug}/`} className="block h-full rounded-2xl bg-white p-4 no-underline ring-1 ring-atlantic-950/10 hover:ring-seaglass-500">
                      <span className="block font-semibold text-atlantic-900">{v.name}</span>
                      <span className="text-sm text-atlantic-950/60">{v.category} · {km} km</span>
                      <FoodBadges v={v} className="mt-2" max={3} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-atlantic-950/70">We haven’t listed anywhere to eat within 3 km yet.</p>
            )}
            {eat.length > 10 ? <p className="mt-4"><Link href="/food-and-drink/">See all {eat.length} nearby in the food and drink finder →</Link></p> : null}
          </section>
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
