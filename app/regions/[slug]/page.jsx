import Link from 'next/link';
import { notFound } from 'next/navigation';
import { beaches, towns, regions, regionBySlug, heroImage, displayName } from '../../../lib/data';
import Photo from '../../../components/Photo';
import Badges from '../../../components/Badges';

export const dynamicParams = false;
export const generateStaticParams = () => regions.map((r) => ({ slug: r.slug }));
export async function generateMetadata({ params }) {
  const r = regionBySlug((await params).slug);
  return { title: `Beaches in ${r.name}`, description: r.summary };
}

export default async function RegionPage({ params }) {
  const r = regionBySlug((await params).slug);
  if (!r) notFound();
  const rb = beaches.filter((b) => b.region === r.slug);
  const rt = towns.filter((t) => t.region === r.slug).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <p className="crumbs"><Link href="/">Home</Link> › {r.name}</p>
      <h1>{r.name}</h1>
      <p className="lede">{r.summary}</p>
      {r.status === 'draft' ? <p className="note">{r.boundaryNote}</p> : null}

      <h2>Towns and villages</h2>
      <ul className="inline-list">
        {rt.map((t) => (
          <li key={t.slug}><Link href={`/towns/${t.slug}/`}>{t.name}</Link></li>
        ))}
      </ul>

      <h2>{rb.length} beaches</h2>
      <div className="cards">
        {rb.map((b) => (
          <Link key={b.slug} href={`/beaches/${b.slug}/`} className="card">
            <Photo image={heroImage(b)} alt={displayName(b)} linked={false} />
            <div className="card-body">
              <h3>{displayName(b)}</h3>
              <p className="meta">Near {towns.find((t) => t.slug === b.town)?.name}</p>
              <Badges b={b} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
