import './globals.css';
import Link from 'next/link';
import { SITE_NAME } from '../lib/data';

export const metadata = {
  title: { default: `${SITE_NAME} – beaches and towns, from official sources`, template: `%s | ${SITE_NAME}` },
  description: 'Every named beach in Cornwall with dog rules from Cornwall Council, RNLI lifeguard cover and facilities from OpenStreetMap — each fact linked to its source.',
  // Phase 1 preview: keep it out of search engines until the content has been reviewed.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="logo">{SITE_NAME}</Link>
            <nav>
              <Link href="/beaches/">Beaches</Link>
              <Link href="/towns/">Towns</Link>
              <Link href="/about/">Sources</Link>
            </nav>
          </div>
        </header>
        <div className="preview-banner">Phase 1 preview — data draft, not yet reviewed.</div>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              Beach and facility data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL). Dog rules from{' '}
              <a href="https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/">Cornwall Council</a>. Lifeguard units from RNLI open data. Photos
              credited individually.
            </p>
            <p>Always check signs and the RNLI page on the day — conditions and rules change.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
