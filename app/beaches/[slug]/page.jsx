import Link from 'next/link';
import { notFound } from 'next/navigation';
import { beaches, beachBySlug, townBySlug, regionBySlug, heroImage, displayName, isLifeguarded } from '../../../lib/data';
import { ROUNDUPS, roundupPath } from '../../../lib/roundups';
import Hero from '../../../components/Hero';
import Byline from '../../../components/Byline';
import Badges from '../../../components/Badges';
import Photo from '../../../components/Photo';
import FactTable from '../../../components/FactTable';
import OsmMap from '../../../components/OsmMap';
import Nearby from '../../../components/Nearby';
import { Container, Crumbs, WeVisited, StayNearby, Sources, Callout } from '../../../components/Blocks';
import JsonLd from '../../../components/JsonLd';
import { beachTitle, beachDescription, beachLd } from '../../../lib/seo';
import { imgSrc } from '../../../lib/data';
import { enrichment, pairLookup } from '../../../lib/enrichment';
import { EnrichedOverview, EnrichedExpect, EnrichedGoodToKnow, EnrichedNote, EnrichedWeek, EnrichedTips } from '../../../components/Enriched';

export const dynamicParams = false;
export const generateStaticParams = () => beaches.map((b) => ({ slug: b.slug }));
export async function generateMetadata({ params }) {
  const b = beachBySlug((await params).slug);
  const img = heroImage(b);
  return {
    title: { absolute: beachTitle(b) },
    description: beachDescription(b),
    alternates: { canonical: `/beaches/${b.slug}/` },
    openGraph: { title: beachTitle(b), description: beachDescription(b), url: `/beaches/${b.slug}/`, ...(img ? { images: [{ url: imgSrc(img), alt: displayName(b) }] } : {}) },
  };
}

function Planner({ guide }) {
  if (!guide) return null;
  const items = [
    ['Who it suits', guide.whoItSuits?.join('; ')],
    ['How long to allow', guide.howLongToAllow],
    ['Best time to go', guide.bestTimeToGo?.join('. ')],
  ].filter(([, v]) => v);
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

export default async function BeachPage({ params }) {
  const b = beachBySlug((await params).slug);
  if (!b) notFound();
  const town = townBySlug(b.town);
  const region = regionBySlug(b.region);
  const hero = heroImage(b);
  const gallery = (b.images || []).filter((i) => i !== hero);
  const name = displayName(b);
  const inRoundups = Object.values(ROUNDUPS).filter((r) => r.test(b));
  const e = enrichment('beach', b.slug);
  return (
    <article>
      <JsonLd data={beachLd(b, `/beaches/${b.slug}/`)} />
      <Hero crumbs={[['Home', '/'], [region.name, `/regions/${region.slug}/`], [town.name, `/towns/${town.slug}/`], [name]]} lastChecked={b.lastChecked} image={hero} title={name} kicker={`${b.townDistanceKm} km from ${town.name} · ${region.name}`} lat={b.lat} lng={b.lng}>
        <Badges b={b} className="mt-6" />
      </Hero>

      <Container className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <WeVisited place={b} />
          {e ? <EnrichedOverview e={e} /> : <p className="max-w-[60ch] font-[family-name:var(--font-display)] text-[1.6rem] leading-[1.45] text-atlantic-950">{b.customDescription || b.description}</p>}
          <EnrichedNote e={e} />
          {b.altNames?.length ? <p className="mt-2 text-sm text-atlantic-950/55">Also known as {b.altNames.join(', ')}.</p> : null}

          {b.dogs.councilListed ? (
            <Callout tone="warn" title="Dogs">
              {b.dogs.summary}{' '}
              {b.dogs.mapPdf ? <a href={b.dogs.mapPdf} rel="nofollow noopener" target="_blank">Council map of the restricted area (PDF)</a> : null}
            </Callout>
          ) : (
            <Callout tone="ok" title="Dogs">{b.dogs.summary}</Callout>
          )}
          {isLifeguarded(b) ? (
            <Callout title="Lifeguards">
              {b.lifeguards.note} <a href={b.lifeguards.rnliPage} rel="nofollow noopener" target="_blank">RNLI page for {b.lifeguards.unit}</a>
            </Callout>
          ) : null}

          <EnrichedExpect e={e} title="What’s it like?" />
          <EnrichedWeek e={e} nearby={pairLookup(b, e)} />
          <EnrichedGoodToKnow e={e} />
          <EnrichedTips e={e} />

          {!e?.week ? <h2 className="mt-16 mb-6 text-3xl">Planning your visit</h2> : null}
          {!e?.week ? <Planner guide={b.guide} /> : null}
          {!e?.week && b.guide?.method ? <p className="mt-2 text-xs text-atlantic-950/50">{b.guide.method}</p> : null}

          <h2 className="mt-16 mb-6 text-3xl">The facts</h2>
          <FactTable
            rows={[
              ['Dogs', b.dogs],
              ['Lifeguards', b.lifeguards],
              ['Swimming', b.swimming],
              ['Surface', b.surface],
              ['Size', b.size, b.size.areaM2 ? <span className="block text-sm text-atlantic-950/60">Mapped area about {(b.size.areaM2 / 10000).toFixed(1)} ha, which changes with the tide</span> : null],
              ['Faces', b.facing],
              ['Parking', b.parking],
              ['Toilets', b.toilets],
              ['Café or kiosk', b.cafeNearby],
              ['Surfing', b.surf],
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

          <StayNearby place={b} />
          <Sources sources={[...(e?.sources || []), ...b.sources.filter((s) => !e?.sources?.some((x) => x.url === s.url))]} lastChecked={b.lastChecked} note={b.curated ? b.curated.note : ''} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <OsmMap lat={b.lat} lng={b.lng} label={name} />
          <Nearby title="Nearby beaches" items={b.nearbyBeaches?.slice(0, 6)} base="/beaches/" />
          <Nearby title="Pubs and cafés nearby" items={b.nearbyFood?.slice(0, 6)} base="/food-and-drink/" />
          <Nearby title="Things to do nearby" items={b.nearbyAttractions?.slice(0, 5)} base="/things-to-do/" />
          <Nearby title="Nearby towns and villages" items={b.nearbyTowns?.slice(0, 4)} base="/towns/" />
          {inRoundups.length ? (
            <div className="flex flex-wrap gap-2">
              {inRoundups.map((r) => (
                <Link key={r.slug} href={roundupPath(r)} className="pill-link">More {r.label.toLowerCase()} beaches →</Link>
              ))}
            </div>
          ) : null}
        </aside>
      </Container>
    </article>
  );
}
