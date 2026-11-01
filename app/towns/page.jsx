import Link from 'next/link';
import { towns, regions } from '../../lib/data';

export const metadata = { title: 'Towns and villages', description: 'Towns and villages in Cornwall to base a week around, with the beaches near each.' };

export default function TownsPage() {
  return (
    <>
      <p className="crumbs"><Link href="/">Home</Link> › Towns</p>
      <h1>Towns and villages</h1>
      {regions.map((r) => (
        <section key={r.slug}>
          <h2>{r.name}</h2>
          <ul className="inline-list">
            {towns.filter((t) => t.region === r.slug).sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
              <li key={t.slug}><Link href={`/towns/${t.slug}/`}>{t.name}</Link></li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
