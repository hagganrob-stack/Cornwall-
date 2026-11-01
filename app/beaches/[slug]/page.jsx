import Link from 'next/link';
import { notFound } from 'next/navigation';
import { beaches, beachBySlug, townBySlug, regionBySlug, heroImage, displayName } from '../../../lib/data';
import Photo from '../../../components/Photo';
import Badges from '../../../components/Badges';
import FactRow from '../../../components/FactRow';
import OsmMap from '../../../components/OsmMap';

export const dynamicParams = false;
export const generateStaticParams = () => beaches.map((b) => ({ slug: b.slug }));
export async function generateMetadata({ params }) {
  const b = beachBySlug((await params).slug);
  return { title: `${displayName(b)}, ${townBySlug(b.town)?.name || ''}`, description: b.customDescription || b.description };
}

export default async function BeachPage({ params }) {
  const b = beachBySlug((await params).slug);
  if (!b) notFound();
  const town = townBySlug(b.town);
  const region = regionBySlug(b.region);
  const heroImg = heroImage(b);
  const gallery = (b.images || []).filter((i) => i !== heroImg);
  return (
    <article>
      <p className="crumbs">
        <Link href="/">Home</Link> › <Link href={`/regions/${region.slug}/`}>{region.name}</Link> › {displayName(b)}
      </p>
      <h1>{displayName(b)}</h1>
      <p className="meta">
        {b.townDistanceKm} km from <Link href={`/towns/${town.slug}/`}>{town.name}</Link>
        {b.altNames?.length ? ` · also known as ${b.altNames.join(', ')}` : ''}
      </p>
      <Badges b={b} />
      <Photo image={heroImg} alt={displayName(b)} className="hero" eager />

      <div className="two-col">
        <div>
          <p className="lede">{b.customDescription || b.description}</p>
          {b.ourNotes ? <p className="our-notes">{b.ourNotes}</p> : null}

          {b.dogs.councilListed ? (
            <div className={`callout callout-dogs`}>
              <strong>Dogs:</strong> {b.dogs.summary}{' '}
              {b.dogs.mapPdf ? <a href={b.dogs.mapPdf} rel="nofollow noopener" target="_blank">Council map of the restricted area (PDF)</a> : null}
            </div>
          ) : null}
          {b.lifeguards.rnliPage ? (
            <div className="callout callout-lifeguard">
              <strong>Lifeguards:</strong> {b.lifeguards.note}{' '}
              <a href={b.lifeguards.rnliPage} rel="nofollow noopener" target="_blank">RNLI page for {b.lifeguards.unit}</a>
            </div>
          ) : null}

          <h2>The facts</h2>
          <table className="facts">
            <tbody>
              <FactRow label="Dogs" fact={b.dogs} />
              <FactRow label="Lifeguards" fact={b.lifeguards} />
              <FactRow label="Swimming" fact={b.swimming} />
              <FactRow label="Surface" fact={b.surface} />
              <FactRow label="Size" fact={b.size} extra={b.size.areaM2 ? <span className="fact-detail">Mapped area about {(b.size.areaM2 / 10000).toFixed(1)} ha (changes with the tide)</span> : null} />
              <FactRow label="Faces" fact={b.facing} />
              <FactRow label="Parking" fact={b.parking} />
              <FactRow label="Toilets" fact={b.toilets} />
              <FactRow label="Café or kiosk" fact={b.cafeNearby} />
              <FactRow label="Accessibility" fact={b.accessibility} />
              <FactRow label="Surfing" fact={b.surf} />
              <FactRow label="Rock pools" fact={b.rockPools} />
            </tbody>
          </table>

          {b.guide ? (
            <>
              <h2>Planning notes</h2>
              <dl className="guide">
                {b.guide.whoItSuits?.length ? (<><dt>Who it suits</dt><dd>{b.guide.whoItSuits.join('; ')}</dd></>) : null}
                {b.guide.howLongToAllow ? (<><dt>How long to allow</dt><dd>{b.guide.howLongToAllow}</dd></>) : null}
                {b.guide.bestTimeToGo?.length ? (<><dt>When to go</dt><dd>{b.guide.bestTimeToGo.join('. ')}</dd></>) : null}
              </dl>
              <p className="note">{b.guide.method}</p>
            </>
          ) : null}
        </div>

        <aside>
          <OsmMap lat={b.lat} lng={b.lng} label={displayName(b)} />
          {b.nearbyBeaches?.length ? (
            <>
              <h3>Nearby beaches</h3>
              <ul className="plain">
                {b.nearbyBeaches.slice(0, 6).map((n) => (
                  <li key={n.slug}><Link href={`/beaches/${n.slug}/`}>{n.name}</Link> <span className="meta">{n.km} km</span></li>
                ))}
              </ul>
            </>
          ) : null}
          {b.nearbyTowns?.length ? (
            <>
              <h3>Nearby towns</h3>
              <ul className="plain">
                {b.nearbyTowns.slice(0, 4).map((n) => (
                  <li key={n.slug}><Link href={`/towns/${n.slug}/`}>{n.name}</Link> <span className="meta">{n.km} km</span></li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>

      {gallery.length ? (
        <>
          <h2>More photos</h2>
          <div className="gallery">
            {gallery.map((i) => (
              <Photo key={i.file} image={i} alt={i.title} />
            ))}
          </div>
        </>
      ) : null}

      <h2>Sources</h2>
      <ul className="sources">
        {b.sources.map((s) => (
          <li key={s.url}><a href={s.url} rel="nofollow noopener" target="_blank">{s.label}</a>{s.licence ? ` (${s.licence})` : ''}</li>
        ))}
      </ul>
      <p className="note">
        Last checked {b.lastChecked}.{b.curated ? ` ${b.curated.note}` : ''}
      </p>
    </article>
  );
}
