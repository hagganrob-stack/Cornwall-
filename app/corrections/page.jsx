import Link from 'next/link';
import InfoPage from '../../components/InfoPage';
import { CONTACT_EMAIL } from '../../lib/site';

export const metadata = { title: 'Corrections' };

export default function Corrections() {
  return (
    <InfoPage title="Corrections" lastChecked="2026-11-02">
      <p>Rules, car parks and cafés change. If you spot something wrong or out of date, we’d really like to hear about it.</p>
      {CONTACT_EMAIL ? (
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}?subject=Correction`}>{CONTACT_EMAIL}</a> with the page and what needs changing. A link to an official source helps us fix it quickly.
        </p>
      ) : (
        <p className="rounded-2xl bg-sand-100 p-5 text-base">Our corrections address is being set up.</p>
      )}
      <p>Where a fact comes from OpenStreetMap, you can also fix it at source, which helps everyone. See our <Link href="/editorial-policy/">editorial policy</Link> for how we check facts.</p>
    </InfoPage>
  );
}
