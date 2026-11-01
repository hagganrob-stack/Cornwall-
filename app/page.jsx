import Link from 'next/link';
import { beaches, towns, regions, heroImage, displayName } from '../lib/data';
import Photo from '../components/Photo';

export default function Home() {
  const lifeguarded = beaches.filter((b) => b.lifeguards.value.startsWith('RNLI')).length;
  const dogFree = beaches.filter((b) => !b.dogs.councilListed).length;
  const featured = beaches.filter((b) => b.images?.some((i) => i.heroCandidate)).slice(0, 6);
  return (
    <>
      <section className="intro">
        <h1>Plan a week in Cornwall, beach by beach</h1>
        <p className="lede">
          {beaches.length} named beaches and {towns.length} towns and villages. Dog rules come from Cornwall Council, lifeguard cover from the RNLI, and parking, toilets and cafés from
          OpenStreetMap. Every fact links to where it came from, and anything we couldn’t confirm says “not stated”.
        </p>
        <ul className="stats">
          <li><strong>{beaches.length}</strong> beaches</li>
          <li><strong>{lifeguarded}</strong> with RNLI lifeguards in season</li>
          <li><strong>{dogFree}</strong> with no Council dog restriction</li>
        </ul>
        <p><Link className="button" href="/beaches/">Find a beach</Link></p>
      </section>

      <h2>Regions</h2>
      <div className="cards">
        {regions.map((r) => {
          const rb = beaches.filter((b) => b.region === r.slug);
          const img = heroImage(rb.find((b) => b.lifeguards.value.startsWith('RNLI')) || rb[0] || {});
          return (
            <Link key={r.slug} href={`/regions/${r.slug}/`} className="card">
              <Photo image={img} alt={r.name} linked={false} />
              <div className="card-body">
                <h3>{r.name}</h3>
                <p>{r.summary}</p>
                <p className="meta">{rb.length} beaches · {towns.filter((t) => t.region === r.slug).length} towns</p>
              </div>
            </Link>
          );
        })}
      </div>

      {featured.length ? (
        <>
          <h2>Some of the beaches</h2>
          <div className="cards">
            {featured.map((b) => (
              <Link key={b.slug} href={`/beaches/${b.slug}/`} className="card">
                <Photo image={heroImage(b)} alt={displayName(b)} linked={false} />
                <div className="card-body">
                  <h3>{displayName(b)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
