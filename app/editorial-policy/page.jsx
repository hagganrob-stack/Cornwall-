import Link from 'next/link';
import { beaches, towns, has, isLifeguarded } from '../../lib/data';
import InfoPage from '../../components/InfoPage';

export const metadata = { title: 'Editorial policy', description: 'How One Week in Cornwall gathers and checks its facts, including how AI tools are used.' };

export default function EditorialPolicy() {
  const pct = (n) => `${Math.round((n / beaches.length) * 100)}%`;
  const rows = [
    ['Dog rules checked against the Council list', beaches.length],
    ['On the Council dog restriction list', beaches.filter((b) => b.dogs.councilListed).length],
    ['RNLI lifeguards in season', beaches.filter(isLifeguarded).length],
    ['Parking mapped nearby', beaches.filter((b) => has(b.parking)).length],
    ['Toilets mapped nearby', beaches.filter((b) => has(b.toilets)).length],
    ['Café or kiosk mapped nearby', beaches.filter((b) => has(b.cafeNearby)).length],
    ['Surface (sand, shingle…)', beaches.filter((b) => has(b.surface)).length],
    ['Direction it faces', beaches.filter((b) => has(b.facing)).length],
    ['Openly licensed photo', beaches.filter((b) => b.images?.length).length],
  ];
  return (
    <InfoPage title="Editorial policy" lastChecked="2026-11-02">
      <p>We want you to be able to trust every fact on this site, so here is exactly where they come from and how we check them.</p>
      <h2>Where the facts come from</h2>
      <ul>
        <li><strong>Dog restrictions</strong> come from <a href="https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/">Cornwall Council’s Public Spaces Protection Order</a>, including the dates and hours. A beach that isn’t on that list has no Council restriction, but privately owned beaches can set their own rules.</li>
        <li><strong>Lifeguards</strong> come from RNLI open data on lifeguard units. Patrol dates change every year, so we link to each beach’s RNLI page.</li>
        <li><strong>Beaches, locations, parking, toilets, cafés and surf schools</strong> come from <a href="https://www.openstreetmap.org/">OpenStreetMap</a> (© OpenStreetMap contributors, ODbL). A beach’s size is the area of its mapped outline; the direction it faces is calculated from the mapped coastline.</li>
        <li><strong>Photos</strong> come from <a href="https://www.geograph.org.uk/">Geograph</a> and <a href="https://commons.wikimedia.org/">Wikimedia Commons</a> under open licences, and every photo is credited. We never use Google photos.</li>
      </ul>
      <h2>Our rules</h2>
      <ul>
        <li>We only state a fact when a source confirms it. Otherwise the page says “not stated”.</li>
        <li>No superlatives the facts don’t support: we won’t call a beach “the best” or “hidden”.</li>
        <li>First-hand opinions and stories only appear where we have actually visited, marked with a “We’ve been” badge.</li>
        <li>Every page shows when it was last checked and lists its sources.</li>
      </ul>
      <h2>How we use AI</h2>
      <p>
        We use AI tools to help collect data from the sources above, match them up (for example, linking a Council dog rule to the right beach), and draft the short factual descriptions from those facts. The “who it suits”, “how long to allow” and “best time to go” notes are worked out automatically from the facts on each page and say so. A person reviews the matching and the pages, and AI is never used to invent visits, opinions or reviews.
      </p>
      <h2>What we cover today</h2>
      <p>{beaches.length} beaches and {towns.length} towns and villages. Share of beaches with each fact:</p>
      <div className="mb-6 max-w-xl overflow-hidden rounded-2xl ring-1 ring-atlantic-950/10">
        <table className="w-full text-left text-[15px]">
          <tbody className="divide-y divide-atlantic-950/10">
            {rows.map(([k, n]) => (
              <tr key={k}><th scope="row" className="px-4 py-2.5 font-medium">{k}</th><td className="px-4 py-2.5 text-right tabular-nums">{n} ({pct(n)})</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Corrections</h2>
      <p>If something is wrong or out of date, please <Link href="/corrections/">let us know</Link>. We fix errors quickly and update the “last checked” date.</p>
    </InfoPage>
  );
}
