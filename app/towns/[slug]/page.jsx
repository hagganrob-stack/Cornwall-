import Link from 'next/link';
import { notFound } from 'next/navigation';
import { towns, townBySlug, regionBySlug, beachBySlug, heroImage, displayName } from '../../../lib/data';
import Photo from '../../../components/Photo';
import Badges from '../../../components/Badges';
import OsmMap from '../../../components/OsmMap';

export const dynamicParams = false;
export const generateStaticParams = () => towns.map((t) => ({ slug: t.slug }));
export async function generateMetadata({ params }) {
  const t = townBySlug((await params).slug);
  return { title: `${t.name}: beaches nearby`, description: t.description };
}

export default async function TownPage({ params }) {
  const t = townBySlug((await params).slug);
  if (!t) notFound();
  const region = regionBySlug(t.region);
  const near = (t.beachesNearby || []).map((n) => ({ ...n, b: beachBySlug(n.slug) })).filter((n) => n.b);
  return (
    <article>
      <p className="crumbs">
        <Link href="/">Home</Link> › <Link href={`/regions/${region.slug}/`}>{region.name}</Link> › {t.name}
      </p>
      <h1>{t.name}</h1>
      <Photo image={heroImage(t)} alt={t.name} className="hero" eager />
      <div className="two-col">
        <div>
          <p className="lede">{t.description}</p>
          {t.ourNotes ? <p className="our-notes">{t.ourNotes}</p> : null}
          <h2>Beaches within 5 km</h2>
          {near.length ? (
            <div className="cards">
              {near.map(({ b, km }) => (
                <Link key={b.slug} href={`/beaches/${b.slug}/`} className="card">
                  <Photo image={heroImage(b)} alt={displayName(b)} linked={false} />
                  <div className="card-body">
                    <h3>{displayName(b)}</h3>
                    <p className="meta">{km} km</p>
                    <Badges b={b} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No named beaches are mapped within 5 km.</p>
          )}
        </div>
        <aside>
          <OsmMap lat={t.lat} lng={t.lng} zoomDeg={0.03} label={t.name} />
          {t.nearbyTowns?.length ? (
            <>
              <h3>Nearby towns</h3>
              <ul className="plain">
                {t.nearbyTowns.slice(0, 5).map((n) => (
                  <li key={n.slug}><Link href={`/towns/${n.slug}/`}>{n.name}</Link> <span className="meta">{n.km} km</span></li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
