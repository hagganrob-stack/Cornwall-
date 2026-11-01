import Link from 'next/link';
import { beaches, towns } from '../../lib/data';

export const metadata = { title: 'Sources and method', description: 'Where every fact on One Week in Cornwall comes from, and how it is checked.' };

const pct = (n) => `${Math.round((n / beaches.length) * 100)}%`;
const has = (k) => beaches.filter((b) => b[k]?.value && b[k].value !== 'not stated').length;

export default function About() {
  const rows = [
    ['Council dog rule listed', beaches.filter((b) => b.dogs.councilListed).length],
    ['RNLI lifeguards', beaches.filter((b) => b.lifeguards.value.startsWith('RNLI')).length],
    ['Parking', has('parking')],
    ['Toilets', has('toilets')],
    ['Café or kiosk', has('cafeNearby')],
    ['Surface', has('surface')],
    ['Direction it faces', has('facing')],
    ['Accessibility info', has('accessibility')],
    ['Photo', beaches.filter((b) => b.images?.length).length],
  ];
  return (
    <>
      <p className="crumbs"><Link href="/">Home</Link> › Sources</p>
      <h1>Sources and method</h1>
      <p className="lede">We only publish facts we can point to a source for. If we couldn’t confirm something, the page says “not stated” rather than guessing.</p>
      <h2>Where the facts come from</h2>
      <ul>
        <li><strong>Beaches, locations, outlines and facilities</strong> — <a href="https://www.openstreetmap.org/">OpenStreetMap</a> (© OpenStreetMap contributors, ODbL). Size is the area of the mapped beach outline; the direction a beach faces is calculated from the mapped coastline.</li>
        <li><strong>Dog restrictions</strong> — <a href="https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/">Cornwall Council’s Public Spaces Protection Order list</a>. A beach not on the list has no Council restriction, but privately owned beaches can set their own rules.</li>
        <li><strong>Lifeguards</strong> — RNLI open data on lifeguard units. Patrol dates and times change every year: always check the RNLI beach page.</li>
        <li><strong>Photos</strong> — <a href="https://www.geograph.org.uk/">Geograph Britain and Ireland</a> and <a href="https://commons.wikimedia.org/">Wikimedia Commons</a>, under the licence shown with each photo.</li>
      </ul>
      <h2>Coverage today</h2>
      <p>{beaches.length} beaches and {towns.length} towns. Share of beaches with each fact:</p>
      <table className="facts compact">
        <tbody>
          {rows.map(([k, n]) => (
            <tr key={k}><th scope="row">{k}</th><td>{n} ({pct(n)})</td></tr>
          ))}
        </tbody>
      </table>
      <p className="note">“Who it suits”, “how long to allow” and “when to go” are derived automatically from the facts on each page, not first-hand recommendations.</p>
    </>
  );
}
