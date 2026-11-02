import Link from 'next/link';
import { notFound } from 'next/navigation';
import { attractions, attractionBySlug, townBySlug, regionBySlug, heroImage, imgSrc, has } from '../../../lib/data';
import { TTD_ROUNDUPS, ttdRoundupPath } from '../../../lib/ttd';
import { attractionTitle, attractionDescription, attractionLd } from '../../../lib/seo';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import AttractionBadges from '../../../components/AttractionBadges';
import Photo from '../../../components/Photo';
import FactTable from '../../../components/FactTable';
import HoursTable from '../../../components/HoursTable';
import OsmMap from '../../../components/OsmMap';
import Nearby from '../../../components/Nearby';
import JsonLd from '../../../components/JsonLd';
import { Container, Crumbs, WeVisited, StayNearby, Sources } from '../../../components/Blocks';

export const dynamicParams = false;
export const generateStaticParams = () => attractions.map((a) => ({ slug: a.slug }));
export async function generateMetadata({ params }) {
  const a = attractionBySlug((await params).slug);
  const img = heroImage(a);
  return {
    title: { absolute: attractionTitle(a) },
    description: attractionDescription(a),
    alternates: { canonical: `/things-to-do/${a.slug}/` },
    openGraph: { title: attractionTitle(a), description: attractionDescription(a), url: `/things-to-do/${a.slug}/`, ...(img ? { images: [{ url: imgSrc(img), alt: a.name }] } : {}) },
  };
}

function Planner({ guide }) {
  if (!guide) return null;
  const items = [
    ['Who it suits', guide.whoItSuits?.join('; ')],
    ['How long to allow', guide.howLongToAllow],
    ['Best time to go', guide.bestTimeToGo?.join('. ')],
  ].filter(([, v]) => v);
  if (!items.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-sand-700">{k}</p>
          <p className="mt-1.5 leading-snug">{v[0].toUpperCase() + v.slice(1)}</p>
        </div>
      ))}
    </div>
  );
}

export default async function AttractionPage({ params }) {
  const a = attractionBySlug((await params).slug);
  if (!a) notFound();
  const town = townBySlug(a.town);
  const region = regionBySlug(a.region);
  const hero = heroImage(a);
  const gallery = (a.images || []).filter((i) => i !== hero);
  const name = a.customTitle || a.name;
  const inRoundups = Object.values(TTD_ROUNDUPS).filter((r) => r.test(a));
  const entry = a.entry.value === 'not stated' ? a.entry : { ...a.entry, summary: `Its website: “${a.entry.quote.replace(/^…|…$/g, '').trim()}”` };
  const withMethod = (f) => (has(f) && f.method ? { ...f, summary: f.method } : f);
  return (
    <article>
      <JsonLd data={attractionLd(a, `/things-to-do/${a.slug}/`)} />
      <Hero image={hero} title={name} kicker={`${a.category} · ${a.townDistanceKm < 1 ? 'in' : `${a.townDistanceKm} km from`} ${town.name}`} lat={a.lat} lng={a.lng}>
        <AttractionBadges a={a} className="mt-4" />
      </Hero>

      <Container className="mt-6">
        <Crumbs items={[['Home', '/'], ['Things to do', '/things-to-do/'], [town.name, `/towns/${town.slug}/`], [name]]} />
        <Byline lastChecked={a.lastChecked} className="mt-3" />
      </Container>

      <Container className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <WeVisited place={a} />
          <p className="max-w-[68ch] text-xl leading-relaxed text-atlantic-950/85">{a.customDescription || a.description}</p>
          {a.website ? (
            <p className="mt-5">
              <a href={a.website} rel="nofollow noopener" target="_blank" className="inline-block rounded-full bg-atlantic-900 px-5 py-2.5 font-semibold text-white no-underline hover:bg-atlantic-700 hover:text-white">
                Official website ↗
              </a>
            </p>
          ) : null}

          <h2 className="mt-12 mb-4 text-2xl">Planning your visit</h2>
          <Planner guide={a.guide} />
          {a.guide?.method ? <p className="mt-2 text-xs text-atlantic-950/50">{a.guide.method}</p> : null}

          {a.hours?.value === 'listed' ? (
            <>
              <h2 className="mt-12 mb-4 text-2xl">Opening hours</h2>
              <HoursTable hours={a.hours} />
            </>
          ) : null}

          <h2 className="mt-12 mb-4 text-2xl">The facts</h2>
          <FactTable
            rows={[
              ['Indoor or outdoor', withMethod(a.setting)],
              ['Rainy day', withMethod(a.rainyDay)],
              ['Good for kids', withMethod(a.kids)],
              ['Entry', entry],
              ['How long to allow', withMethod(a.allow)],
              ['Address', a.address ? { value: a.address, source: a.sources[0] } : null],
            ]}
          />

          {gallery.length ? (
            <>
              <h2 className="mt-12 mb-4 text-2xl">More photos</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {gallery.map((i) => (
                  <Photo key={i.file} image={i} alt={`${name}: ${i.title}`} />
                ))}
              </div>
            </>
          ) : null}

          <StayNearby place={a} />
          <Sources sources={a.sources} lastChecked={a.lastChecked} note="Opening hours and categories come from the place’s Google Maps listing; we never use Google’s photos, reviews or descriptions." />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <OsmMap lat={a.lat} lng={a.lng} label={name} />
          <Nearby title="Beaches nearby" items={a.nearbyBeaches?.slice(0, 5)} base="/beaches/" />
          <Nearby title="More things to do nearby" items={a.nearbyAttractions?.slice(0, 5)} base="/things-to-do/" />
          <Nearby title="Towns and villages nearby" items={a.nearbyTowns} base="/towns/" />
          {inRoundups.length ? (
            <div className="flex flex-wrap gap-2">
              {inRoundups.map((r) => (
                <Link key={r.slug} href={ttdRoundupPath(r)} className="chip bg-seaglass-100 text-seaglass-600 no-underline">More {r.label.toLowerCase()} ideas →</Link>
              ))}
            </div>
          ) : null}
        </aside>
      </Container>
    </article>
  );
}
