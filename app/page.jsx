import Link from 'next/link';
import Image from 'next/image';
import { beaches, towns, regions, heroImage, isLifeguarded, beachBySlug, latestChecked, displayName, townName, imgSrc } from '../lib/data';
import { ROUNDUPS, roundupBeaches, roundupPath } from '../lib/roundups';
import { TTD_ROUNDUPS, ttdRoundupItems, ttdRoundupPath } from '../lib/ttd';
import { attractions, food } from '../lib/data';
import { FOOD_ROUNDUPS, foodRoundupItems, foodRoundupPath } from '../lib/foodRoundups';
import Byline from '../components/Byline';
import PlaceCard, { CardGrid } from '../components/PlaceCard';
import { Container, SectionHeading } from '../components/Blocks';

const FEATURED = ['porthcurno', 'kynance-cove', 'summerleaze-beach', 'godrevy-beach', 'sennen-cove', 'porthgwidden-beach'];

export default function Home() {
  const lifeguarded = beaches.filter(isLifeguarded).length;
  const featured = FEATURED.map(beachBySlug).filter(Boolean);
  const pick = (list, w = 1500) => heroImage(list.find((x) => heroImage(x)?.width > w) || list.find((x) => heroImage(x)));
  const moods = [
    ...Object.values(ROUNDUPS).map((r) => { const l = roundupBeaches(r); return { href: roundupPath(r), title: r.title.replace(' in Cornwall', ''), n: `${l.length} beaches`, img: pick(l) }; }),
    ...Object.values(TTD_ROUNDUPS).map((r) => { const l = ttdRoundupItems(r); return { href: ttdRoundupPath(r), title: r.title.replace(' in Cornwall', ''), n: `${l.length} places`, img: pick(l, 1200) }; }),
  ];
  const layout = ['lg:col-span-7 lg:row-span-2 aspect-[4/3] lg:aspect-auto', 'lg:col-span-5 aspect-[16/10]', 'lg:col-span-5 aspect-[16/10]', 'lg:col-span-6 aspect-[16/9]', 'lg:col-span-6 aspect-[16/9]'];
  return (
    <>
      {/* Big header: Rob's own photo (public/images/home-hero.jpg). */}
      <section className="relative isolate overflow-hidden bg-atlantic-950">
        <div className="relative h-[92vh] min-h-[600px] max-h-[960px] w-full">
          <Image src="/images/home-hero.jpg" alt="Families paddling in clear turquoise water on a sandy Cornish beach under a blue sky" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 via-atlantic-950/20 to-atlantic-950/25" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">A family-run guide · Beaches, days out, food and where to stay</p>
            <h1 className="mt-5 max-w-5xl text-[3.25rem] text-white sm:text-7xl lg:text-[7rem]">
              Plan your <span className="italic text-seaglass-300">favourite</span> week of the year
            </h1>
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
                A friendly, one-stop guide to planning your own week in Cornwall: where to base yourself, which beach suits which day, what to do when it rains, and how to fit it all together.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/towns/" className="rounded-full bg-white px-7 py-3.5 font-semibold text-atlantic-950 no-underline hover:bg-seaglass-300 hover:text-atlantic-950">Choose your base</Link>
                <Link href="/beaches/" className="font-semibold text-white no-underline decoration-white/40 hover:text-white hover:underline">Find a beach →</Link>
                <Link href="/things-to-do/" className="font-semibold text-white no-underline decoration-white/40 hover:text-white hover:underline">Things to do →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Container className="mt-24 sm:mt-32">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <p className="eyebrow pt-3">What this guide is</p>
          <div>
            <p className="max-w-4xl font-[family-name:var(--font-display)] text-[2rem] leading-[1.25] tracking-[-0.015em] text-atlantic-950 sm:text-[2.6rem]">
              You’ve got one precious week in Cornwall and a hundred places you could go. This guide helps you make the most of it, <span className="italic text-seaglass-600">like a friend who knows the county</span> and has done the homework for you.
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-[62ch] text-[1.0625rem] leading-relaxed text-atlantic-950/70">
                Instead of a ready-made itinerary, you get everything you need to plan your own: dog rules for every beach by month, where the lifeguards are, where to park, rainy-day backups, how long to allow for each place, and what’s nearby to pair it with. Every fact links to where it came from, so you can trust it.
              </p>
              <Byline lastChecked={latestChecked(beaches)} sourcesHref="/editorial-policy/" />
            </div>
          </div>
        </div>

        <ol className="mt-20 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Choose your base', `Pick from ${towns.length} towns and villages and see what’s within reach of each.`, '/towns/'],
            ['Line up your beaches', `${beaches.length} beaches with dog rules, lifeguards, parking and which way they face.`, '/beaches/'],
            ['Have a rainy-day plan', `${ttdRoundupItems(TTD_ROUNDUPS['rainy-day']).length} places with indoor space for when the weather turns.`, '/things-to-do/rainy-day/'],
            ['Fit it all together', 'Each guide says how long to allow, when to go and what to pair it with nearby.', '/things-to-do/'],
          ].map(([t, d, h], i) => (
            <li key={t}>
              <Link href={h} className="group block border-t border-atlantic-950/15 pt-5 text-atlantic-950 no-underline hover:text-atlantic-950">
                <span className="font-[family-name:var(--font-display)] text-lg text-seaglass-600 italic">0{i + 1}</span>
                <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl group-hover:text-seaglass-600">{t}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-atlantic-950/65">{d}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-24">
        <dl className="grid grid-cols-2 divide-atlantic-950/10 border-y border-atlantic-950/10 lg:grid-cols-4 lg:divide-x">
          {[
            [beaches.length, 'beaches, every one checked for dog rules'],
            [lifeguarded, 'with RNLI lifeguards in season'],
            [attractions.length, 'things to do, from gardens to museums'],
            [food.length, 'pubs, cafés and restaurants'],
          ].map(([n, l]) => (
            <div key={l} className="py-8 lg:px-8 lg:first:pl-0">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="block font-[family-name:var(--font-display)] text-5xl tracking-[-0.03em] text-atlantic-950 sm:text-6xl">{n}</span>
                <span className="mt-2 block max-w-[22ch] text-[15px] text-atlantic-950/60">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <Container className="mt-24">
        <SectionHeading kicker="Start with the day you want">Beaches and days out</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {moods.map((m, i) => (
            <Link key={m.href} href={m.href} className={`group relative block overflow-hidden rounded-3xl bg-atlantic-900 no-underline ${layout[i] || 'lg:col-span-4 aspect-[4/3]'}`}>
              {m.img ? <Image src={imgSrc(m.img)} alt="" fill sizes="(min-width: 1024px) 60vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/80 via-atlantic-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/70">{m.n}</p>
                  <h3 className={`mt-1 text-white ${i === 0 ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>{m.title}</h3>
                </div>
                <span className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition group-hover:bg-white group-hover:text-atlantic-950" aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <div className="grid gap-12 border-t border-atlantic-950/10 pt-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-3">{food.length} pubs, cafés and restaurants</p>
            <h2 className="text-4xl sm:text-5xl">Where to eat <span className="italic">and</span> drink</h2>
            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-atlantic-950/70">
              Every pub and restaurant shows its Google rating, and facilities like dog-friendly, sea views or gluten-free options only appear when the venue’s own website says so.
            </p>
            <Link href="/food-and-drink/" className="mt-6 inline-flex rounded-full bg-atlantic-950 px-6 py-3 font-semibold text-white no-underline hover:bg-seaglass-600 hover:text-white">Browse all food and drink</Link>
          </div>
          <ul className="grid sm:grid-cols-2 sm:gap-x-10">
            {Object.values(FOOD_ROUNDUPS).map((r) => (
              <li key={r.slug} className="border-b border-atlantic-950/10">
                <Link href={foodRoundupPath(r)} className="group flex items-baseline justify-between gap-4 py-4 text-atlantic-950 no-underline hover:text-atlantic-950">
                  <span className="font-[family-name:var(--font-display)] text-2xl group-hover:text-seaglass-600">{r.label}</span>
                  <span className="shrink-0 text-sm tabular-nums text-atlantic-950/45">{foodRoundupItems(r).length} <span className="transition group-hover:text-seaglass-600">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="mt-24">
        <div id="regions" className="scroll-mt-24" />
        <SectionHeading kicker="Five corners of Cornwall">Choose a region</SectionHeading>
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {regions.map((r, i) => {
            const rb = beaches.filter((b) => b.region === r.slug);
            const p = rb.filter((b) => heroImage(b)?.width > 1500).sort((a, b) => (heroImage(b).score || 0) - (heroImage(a).score || 0))[0] || rb[0];
            const img = heroImage(p);
            return (
              <Link key={r.slug} href={`/regions/${r.slug}/`} className="group relative block aspect-[3/4] w-[72vw] shrink-0 snap-start overflow-hidden rounded-3xl bg-atlantic-900 no-underline sm:w-auto">
                {img ? <Image src={imgSrc(img)} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 72vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 via-atlantic-950/10 to-transparent" />
                <span className="absolute top-5 left-5 font-[family-name:var(--font-display)] text-lg text-white/80 italic">0{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-2xl leading-tight text-white">{r.name}</h3>
                  <p className="mt-1 text-[13px] text-white/70">{rb.length} beaches · {towns.filter((t) => t.region === r.slug).length} places to stay</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>

      <Container className="mt-24">
        <SectionHeading kicker="A few favourites from the map" action={<Link href="/beaches/" className="link-arrow">All {beaches.length} beaches →</Link>}>
          Beaches to start with
        </SectionHeading>
        <CardGrid cols={3}>
          {featured.map((b) => (
            <PlaceCard key={b.slug} place={b} beach href={`/beaches/${b.slug}/`} meta={`Near ${townName(b.town)}`} />
          ))}
        </CardGrid>
      </Container>

      <Container className="mt-28">
        <div className="grid gap-12 rounded-[2rem] bg-sand-100 p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:p-16">
          <div>
            <p className="eyebrow mb-3">Our promise</p>
            <h2 className="text-4xl sm:text-5xl">How we check <span className="italic">the facts</span></h2>
            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-atlantic-950/70">
              Dog rules come straight from Cornwall Council, lifeguard cover from the RNLI, and parking, toilets and cafés from OpenStreetMap. If we can’t confirm something, we say so rather than guess.
            </p>
            <Link href="/editorial-policy/" className="link-arrow mt-6">Read our editorial policy →</Link>
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {[
              ['Every fact links to its source', 'So you can check it yourself, and see when it was last looked at.'],
              ['Dog rules by season', 'Not just yes or no: which months, which hours and where the line is.'],
              ['First-hand notes, honestly', 'Personal notes appear only where we’ve actually been.'],
              ['Open photos, always credited', 'Every photo is openly licensed and named under the picture.'],
            ].map(([t, d]) => (
              <li key={t} className="border-t border-atlantic-950/15 pt-4">
                <p className="font-[family-name:var(--font-display)] text-xl">{t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-atlantic-950/65">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
