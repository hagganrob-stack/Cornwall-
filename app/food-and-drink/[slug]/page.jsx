import Link from 'next/link';
import { notFound } from 'next/navigation';
import { food, foodBySlug, townBySlug, regionBySlug, heroImage, imgSrc, FOOD_FEATURES, KIND_LABEL } from '../../../lib/data';
import { FOOD_ROUNDUPS, foodRoundupPath } from '../../../lib/foodRoundups';
import { foodTitle, foodDescription, foodLd } from '../../../lib/seo';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import FoodBadges from '../../../components/FoodBadges';
import Rating from '../../../components/Rating';
import HoursTable from '../../../components/HoursTable';
import OsmMap from '../../../components/OsmMap';
import Nearby from '../../../components/Nearby';
import JsonLd from '../../../components/JsonLd';
import { Container, Crumbs, WeVisited, StayNearby, Sources } from '../../../components/Blocks';

export const dynamicParams = false;
export const generateStaticParams = () => food.map((v) => ({ slug: v.slug }));
export async function generateMetadata({ params }) {
  const v = foodBySlug((await params).slug);
  const img = heroImage(v);
  return {
    title: { absolute: foodTitle(v) },
    description: foodDescription(v),
    alternates: { canonical: `/food-and-drink/${v.slug}/` },
    openGraph: { title: foodTitle(v), description: foodDescription(v), url: `/food-and-drink/${v.slug}/`, ...(img ? { images: [{ url: imgSrc(img), alt: v.name }] } : {}) },
  };
}

// What the venue's own website says, feature by feature, with the quote and page.
function WebsiteSays({ v }) {
  const rows = FOOD_FEATURES.map(([k, label]) => ({ k, label, f: v.features?.[k] })).filter((r) => r.f);
  const said = rows.filter((r) => r.f.value !== 'unknown');
  const unsaid = rows.filter((r) => r.f.value === 'unknown').map((r) => r.label.toLowerCase());
  if (!v.features) return <p className="text-atlantic-950/70">We haven’t been able to check this venue’s website yet.</p>;
  return (
    <>
      {said.length ? (
        <dl className="divide-y divide-atlantic-950/10 overflow-hidden rounded-2xl ring-1 ring-atlantic-950/10">
          {said.map(({ k, label, f }) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
              <dt className="text-sm font-semibold text-atlantic-900">{label}</dt>
              <dd>
                <span className="font-medium">{f.value === 'yes' ? 'Yes' : 'No'}</span>
                {f.evidence?.quote ? <span className="mt-0.5 block text-sm text-atlantic-950/70">“{f.evidence.quote}”</span> : null}
                {f.evidence?.url ? (
                  <span className="mt-1 block text-xs text-atlantic-950/50">
                    Source: <a href={f.evidence.url} rel="nofollow noopener" target="_blank" className="text-inherit underline">their website</a>
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {unsaid.length ? <p className="mt-3 text-sm text-atlantic-950/55">Not mentioned on their website: {unsaid.join(', ')}. Worth asking when you book.</p> : null}
      {v.featuresSource ? <p className="mt-1 text-xs text-atlantic-950/45">Checked from {v.featuresSource}.</p> : null}
    </>
  );
}

export default async function FoodPage({ params }) {
  const v = foodBySlug((await params).slug);
  if (!v) notFound();
  const town = townBySlug(v.town);
  const region = regionBySlug(v.region);
  const name = v.customTitle || v.name;
  const inRoundups = Object.values(FOOD_ROUNDUPS).filter((r) => r.test(v));
  return (
    <article>
      <JsonLd data={foodLd(v, `/food-and-drink/${v.slug}/`)} />
      <Hero image={heroImage(v)} title={name} kicker={`${KIND_LABEL[v.kind]} · ${v.townDistanceKm < 1 ? 'in' : `${v.townDistanceKm} km from`} ${town.name}`} lat={v.lat} lng={v.lng}>
        <FoodBadges v={v} className="mt-4" max={6} />
      </Hero>
      <Container className="mt-6">
        <Crumbs items={[['Home', '/'], ['Food and drink', '/food-and-drink/'], [town.name, `/towns/${town.slug}/`], [name]]} />
        <Byline lastChecked={v.lastChecked} className="mt-3" />
      </Container>
      <Container className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <WeVisited place={v} />
          <Rating rating={v.rating} className="mb-4" />
          <p className="max-w-[68ch] text-xl leading-relaxed text-atlantic-950/85">{v.customDescription || v.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {v.website ? (
              <a href={v.website} rel="nofollow noopener" target="_blank" className="inline-block rounded-full bg-atlantic-900 px-5 py-2.5 font-semibold text-white no-underline hover:bg-atlantic-700 hover:text-white">Website and menus ↗</a>
            ) : null}
            {v.phone ? <a href={`tel:${v.phone.replace(/\s/g, '')}`} className="inline-block rounded-full px-5 py-2.5 font-semibold no-underline ring-1 ring-atlantic-950/20">Call {v.phone}</a> : null}
          </div>

          <h2 className="mt-12 mb-4 text-2xl">What their website says</h2>
          <WebsiteSays v={v} />

          {v.hours?.value === 'listed' ? (
            <>
              <h2 className="mt-12 mb-4 text-2xl">Opening hours</h2>
              <HoursTable hours={v.hours} />
            </>
          ) : null}

          {v.address ? <p className="mt-8 text-sm text-atlantic-950/70"><strong>Address:</strong> {v.address}</p> : null}
          <StayNearby place={v} />
          <Sources sources={v.sources} lastChecked={v.lastChecked} note="Type, hours, address and the Google rating come from the Google Maps listing; facilities come only from the venue’s own website. We don’t use Google’s photos or review text." />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <OsmMap lat={v.lat} lng={v.lng} zoomDeg={0.006} label={name} />
          <Nearby title="Beaches nearby" items={v.nearbyBeaches} base="/beaches/" />
          <Nearby title="Things to do nearby" items={v.nearbyAttractions} base="/things-to-do/" />
          <Nearby title="Other places to eat nearby" items={v.nearbyFood} base="/food-and-drink/" />
          {inRoundups.length ? (
            <div className="flex flex-wrap gap-2">
              {inRoundups.map((r) => (
                <Link key={r.slug} href={foodRoundupPath(r)} className="chip bg-seaglass-100 text-seaglass-600 no-underline">More {r.label.toLowerCase()} →</Link>
              ))}
            </div>
          ) : null}
        </aside>
      </Container>
    </article>
  );
}
