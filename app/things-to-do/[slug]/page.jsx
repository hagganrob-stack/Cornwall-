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
import { enrichment, pairLookup } from '../../../lib/enrichment';
import { EnrichedOverview, EnrichedExpect, EnrichedGoodToKnow, EnrichedNote, EnrichedWeek, EnrichedTips } from '../../../components/Enriched';

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
        <div key={k} className="border-t border-atlantic-950/15 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-atlantic-950/50">{k}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl leading-snug">{v[0].toUpperCase() + v.slice(1)}</p>
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
  const entry = a.entry.value === 'not stated' || !a.entry.quote ? a.entry : { ...a.entry, summary: `Its website: “${a.entry.quote.replace(/^…|…$/g, '').trim()}”` };
  const e = enrichment('attraction', a.slug);
  const withMethod = (f) => (has(f) && f.method ? { ...f, summary: f.method } : f);
  return (
    <article>
      <JsonLd data={attractionLd(a, `/things-to-do/${a.slug}/`)} />
      <Hero crumbs={[['Home', '/'], ['Things to do', '/things-to-do/'], [town.name, `/towns/${town.slug}/`], [name]]} lastChecked={a.lastChecked} image={hero} title={name} kicker={`${a.category} · ${a.townDistanceKm < 1 ? 'in' : `${a.townDistanceKm} km from`} ${town.name}`} lat={a.lat} lng={a.lng}>
        <AttractionBadges a={a} className="mt-6" />
      </Hero>

      <Container className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <WeVisited place={a} />
          {e ? <EnrichedOverview e={e} /> : <p className="max-w-[60ch] font-[family-name:var(--font-display)] text-[1.6rem] leading-[1.45] text-atlantic-950">{a.customDescription || a.description}</p>}
          <EnrichedNote e={e} />
          {a.website ? (
            <p className="mt-5">
              <a href={a.website} rel="nofollow noopener" target="_blank" className="inline-block rounded-full bg-atlantic-900 px-5 py-2.5 font-semibold text-white no-underline hover:bg-atlantic-700 hover:text-white">
                Official website ↗
              </a>
            </p>
          ) : null}

          <EnrichedExpect e={e} title="What you’ll find" />
          <EnrichedWeek e={e} nearby={pairLookup(a, e)} />
          <EnrichedGoodToKnow e={e} />
          <EnrichedTips e={e} />

          {!e?.week ? <h2 className="mt-16 mb-6 text-3xl">Planning your visit</h2> : null}
          {!e?.week ? <Planner guide={a.guide} /> : null}
          {!e?.week && a.guide?.method ? <p className="mt-2 text-xs text-atlantic-950/50">{a.guide.method}</p> : null}

          {a.hours?.value === 'listed' ? (
            <>
              <h2 className="mt-16 mb-6 text-3xl">Opening hours</h2>
              <HoursTable hours={a.hours} />
            </>
          ) : null}

          <h2 className="mt-16 mb-6 text-3xl">The facts</h2>
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
              <h2 className="mt-16 mb-6 text-3xl">More photos</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {gallery.map((i) => (
                  <Photo key={i.file} image={i} alt={`${name}: ${i.title}`} />
                ))}
              </div>
            </>
          ) : null}

          <StayNearby place={a} />
          <Sources sources={[...(e?.sources || []), ...a.sources.filter((s) => !e?.sources?.some((x) => x.url === s.url))]} lastChecked={a.lastChecked} note="Opening hours and categories come from the place’s Google Maps listing; we never use Google’s photos, reviews or descriptions." />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <OsmMap lat={a.lat} lng={a.lng} label={name} />
          <Nearby title="Beaches nearby" items={a.nearbyBeaches?.slice(0, 5)} base="/beaches/" />
          <Nearby title="More things to do nearby" items={a.nearbyAttractions?.slice(0, 5)} base="/things-to-do/" />
          <Nearby title="Towns and villages nearby" items={a.nearbyTowns} base="/towns/" />
          {inRoundups.length ? (
            <div className="flex flex-wrap gap-2">
              {inRoundups.map((r) => (
                <Link key={r.slug} href={ttdRoundupPath(r)} className="pill-link">More {r.label.toLowerCase()} ideas →</Link>
              ))}
            </div>
          ) : null}
        </aside>
      </Container>
    </article>
  );
}
