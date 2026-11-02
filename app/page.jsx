import Link from 'next/link';
import Image from 'next/image';
import { beaches, towns, regions, heroImage, isLifeguarded, beachBySlug, latestChecked, displayName, townName, imgSrc } from '../lib/data';
import { ROUNDUPS, roundupBeaches, roundupPath } from '../lib/roundups';
import Hero from '../components/Hero';
import Byline from '../components/Byline';
import PlaceCard, { CardGrid } from '../components/PlaceCard';
import { Container, SectionHeading } from '../components/Blocks';

const FEATURED = ['porthcurno', 'kynance-cove', 'summerleaze-beach', 'godrevy-beach', 'sennen-cove', 'porthgwidden-beach'];

export default function Home() {
  const lifeguarded = beaches.filter(isLifeguarded).length;
  const dogFree = beaches.filter((b) => !b.dogs.councilListed).length;
  const hero = heroImage(beachBySlug('porthcurno')) || heroImage(beaches[0]);
  const featured = FEATURED.map(beachBySlug).filter(Boolean);
  return (
    <>
      <Hero image={hero} title="Plan your own week in Cornwall" kicker="Beaches, towns and the facts that matter">
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          {beaches.length} beaches and {towns.length} places to stay, with dog rules, lifeguards, parking and toilets checked against official sources.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/beaches/" className="rounded-full bg-seaglass-500 px-6 py-3 font-semibold text-atlantic-950 no-underline hover:bg-seaglass-300">Find a beach</Link>
          <Link href="/towns/" className="rounded-full bg-white/15 px-6 py-3 font-semibold text-white no-underline ring-1 ring-white/40 backdrop-blur hover:bg-white/25">Choose a base</Link>
        </div>
      </Hero>

      <Container className="mt-8">
        <Byline lastChecked={latestChecked(beaches)} sourcesHref="/editorial-policy/" />
      </Container>

      <Container className="mt-10">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [beaches.length, 'named beaches'],
            [lifeguarded, 'with RNLI lifeguards in season'],
            [dogFree, 'with no Council dog restriction'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-sand-50 p-6 ring-1 ring-sand-200">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="block font-[family-name:var(--font-display)] text-4xl font-extrabold text-atlantic-900">{n}</span>
                <span className="text-atlantic-950/70">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <Container className="mt-16">
        <SectionHeading kicker="Start here">Beaches for how you travel</SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.values(ROUNDUPS).map((r) => {
            const list = roundupBeaches(r);
            const img = heroImage(list.find((b) => heroImage(b)?.width > 1500) || list[0]);
            return (
              <Link key={r.slug} href={roundupPath(r)} className="group relative block aspect-[16/9] overflow-hidden rounded-3xl no-underline">
                {img ? <Image src={imgSrc(img)} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 to-atlantic-950/10" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-2xl text-white sm:text-3xl">{r.title.replace(' in Cornwall', '')}</h3>
                  <p className="mt-1 text-white/85">{list.length} beaches →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>

      <Container className="mt-16" >
        <div id="regions" className="scroll-mt-24" />
        <SectionHeading kicker="Five corners of Cornwall">Choose a region</SectionHeading>
        <CardGrid cols={3}>
          {regions.map((r) => {
            const rb = beaches.filter((b) => b.region === r.slug);
            const pick = rb.filter((b) => heroImage(b)?.width > 1500).sort((a, b) => (heroImage(b).score || 0) - (heroImage(a).score || 0))[0] || rb[0];
            return (
              <PlaceCard
                key={r.slug}
                place={{ ...pick, name: r.name, customTitle: null, slug: r.slug }}
                href={`/regions/${r.slug}/`}
                meta={`${rb.length} beaches · ${towns.filter((t) => t.region === r.slug).length} places to stay`}
              />
            );
          })}
        </CardGrid>
      </Container>

      <Container className="mt-16">
        <SectionHeading kicker="A few favourites from the map" action={<Link href="/beaches/" className="text-sm font-semibold">All {beaches.length} beaches →</Link>}>
          Beaches to start with
        </SectionHeading>
        <CardGrid cols={3}>
          {featured.map((b) => (
            <PlaceCard key={b.slug} place={b} beach href={`/beaches/${b.slug}/`} meta={`Near ${townName(b.town)}`} />
          ))}
        </CardGrid>
      </Container>

      <Container className="mt-16">
        <div className="grid gap-8 rounded-3xl bg-atlantic-900 p-8 text-atlantic-100 sm:p-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl text-white">How we check the facts</h2>
            <p className="mt-3 text-atlantic-100/80">
              Dog rules come straight from Cornwall Council, lifeguard cover from the RNLI, and parking, toilets and cafés from OpenStreetMap. If we can’t confirm something, we say “not stated” rather than guess.
            </p>
            <Link href="/editorial-policy/" className="mt-5 inline-block font-semibold text-seaglass-300">Read our editorial policy →</Link>
          </div>
          <ul className="space-y-3 text-[15px]">
            {['Every fact links to its source', 'Dog rules by season, not just yes or no', 'First-hand notes only where we’ve actually been', 'Openly licensed photos, always credited'].map((t) => (
              <li key={t} className="flex gap-3"><span className="text-seaglass-300">✓</span>{t}</li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
