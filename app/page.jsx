import Link from 'next/link';
import Image from 'next/image';
import { beaches, towns, regions, heroImage, isLifeguarded, beachBySlug, latestChecked, displayName, townName, imgSrc } from '../lib/data';
import { ROUNDUPS, roundupBeaches, roundupPath } from '../lib/roundups';
import { TTD_ROUNDUPS, ttdRoundupItems, ttdRoundupPath } from '../lib/ttd';
import { attractions } from '../lib/data';
import Byline from '../components/Byline';
import PlaceCard, { CardGrid } from '../components/PlaceCard';
import { Container, SectionHeading } from '../components/Blocks';

const FEATURED = ['porthcurno', 'kynance-cove', 'summerleaze-beach', 'godrevy-beach', 'sennen-cove', 'porthgwidden-beach'];

export default function Home() {
  const lifeguarded = beaches.filter(isLifeguarded).length;
  const featured = FEATURED.map(beachBySlug).filter(Boolean);
  return (
    <>
      {/* Big header: Rob's own photo (public/images/home-hero.jpg). */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[88vh] min-h-[560px] max-h-[900px] w-full">
          <Image src="/images/home-hero.jpg" alt="Families paddling in clear turquoise water on a sandy Cornish beach under a blue sky" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-atlantic-950/55 via-atlantic-950/10 to-atlantic-950/70" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-atlantic-950/70 via-atlantic-950/30 to-transparent sm:block" />
        </div>
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-0">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-seaglass-300">One Week in Cornwall</p>
            <h1 className="max-w-3xl text-5xl leading-[1.05] text-white [text-shadow:0_2px_24px_rgba(6,26,46,0.45)] sm:text-6xl lg:text-7xl">Plan your favourite week of the year</h1>
            <p className="mt-5 max-w-2xl text-lg text-white [text-shadow:0_1px_12px_rgba(6,26,46,0.6)] sm:text-xl">
              A friendly, one-stop guide to planning your own week in Cornwall: where to base yourself, which beach suits which day, what to do when it rains, and how to fit it all together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/towns/" className="rounded-full bg-seaglass-500 px-6 py-3 font-semibold text-atlantic-950 no-underline hover:bg-seaglass-300">Choose your base</Link>
              <Link href="/beaches/" className="rounded-full bg-white/15 px-6 py-3 font-semibold text-white no-underline ring-1 ring-white/40 backdrop-blur hover:bg-white/25">Find a beach</Link>
              <Link href="/things-to-do/" className="rounded-full bg-white/15 px-6 py-3 font-semibold text-white no-underline ring-1 ring-white/40 backdrop-blur hover:bg-white/25">Things to do</Link>
            </div>
          </div>
        </div>
      </section>

      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-seaglass-600">What this guide is</p>
            <h2 className="mt-1 text-3xl sm:text-4xl">Everything you need to plan your week, in one place</h2>
            <div className="prose-copy mt-5">
              <p>
                You’ve got one precious week in Cornwall and a hundred places you could go. This guide is here to help you make the most of it, like a friend who knows the county and has done the homework for you.
              </p>
              <p>
                Instead of a ready-made itinerary, you get everything you need to plan your own: dog rules for every beach by month, where the lifeguards are, where to park, rainy-day backups, how long to allow for each place, and what’s nearby to pair it with. Every fact links to where it came from, so you can trust it.
              </p>
            </div>
            <div className="mt-4">
              <Byline lastChecked={latestChecked(beaches)} sourcesHref="/editorial-policy/" />
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              ['1', 'Choose your base', `Pick from ${towns.length} towns and villages and see what’s within reach of each.`, '/towns/'],
              ['2', 'Line up your beaches', `${beaches.length} beaches with dog rules, lifeguards, parking and which way they face.`, '/beaches/'],
              ['3', 'Have a rainy-day plan', `${ttdRoundupItems(TTD_ROUNDUPS['rainy-day']).length} places with indoor space for when the weather turns.`, '/things-to-do/rainy-day/'],
              ['4', 'Fit it all together', 'Each guide says how long to allow, when to go and what to pair it with nearby.', '/things-to-do/'],
            ].map(([n, t, d, h]) => (
              <li key={n}>
                <Link href={h} className="block h-full rounded-2xl bg-sand-50 p-5 no-underline ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-atlantic-900 text-sm font-bold text-seaglass-300">{n}</span>
                  <span className="mt-3 block font-[family-name:var(--font-display)] text-lg font-bold text-atlantic-900">{t}</span>
                  <span className="mt-1 block text-[15px] text-atlantic-950/75">{d}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <Container className="mt-14">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [beaches.length, 'beaches, every one checked for dog rules'],
            [lifeguarded, 'with RNLI lifeguards in season'],
            [attractions.length, 'things to do, from gardens to rainy-day museums'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-white p-6 ring-1 ring-atlantic-950/10">
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

      <Container className="mt-16">
        <SectionHeading kicker={`${attractions.length} days out`} action={<Link href="/things-to-do/" className="text-sm font-semibold no-underline">All things to do →</Link>}>
          Things to do, whatever the weather
        </SectionHeading>
        <div className="grid gap-6 sm:grid-cols-3">
          {Object.values(TTD_ROUNDUPS).map((r) => {
            const list = ttdRoundupItems(r);
            const img = heroImage(list.find((a) => heroImage(a)?.width > 1200) || list.find((a) => heroImage(a)));
            return (
              <Link key={r.slug} href={ttdRoundupPath(r)} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-seaglass-500 to-atlantic-900 no-underline">
                {img ? <Image src={imgSrc(img)} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 to-atlantic-950/10" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-2xl text-white">{r.title.replace(' in Cornwall', '')}</h3>
                  <p className="mt-1 text-white/85">{list.length} places →</p>
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
        <SectionHeading kicker="A few favourites from the map" action={<Link href="/beaches/" className="text-sm font-semibold no-underline">All {beaches.length} beaches →</Link>}>
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
            <Link href="/editorial-policy/" className="mt-5 inline-block font-semibold text-seaglass-300 no-underline">Read our editorial policy →</Link>
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
