import Link from 'next/link';
import InfoPage from '../../components/InfoPage';

export const metadata = { alternates: { canonical: '/about/' }, title: 'About us' };

// PLACEHOLDER: to be rewritten from Rob's answers (see the questions in the hand-over notes).
export default function About() {
  return (
    <InfoPage title="About One Week in Cornwall" lastChecked="2026-11-02">
      <p>
        One Week in Cornwall is a family-run guide for people planning their own week in Cornwall: which beach suits which day, where dogs are welcome and when, where the lifeguards are, and where to park.
      </p>
      <p>
        It’s written by Rob. Where we’ve been somewhere ourselves, you’ll see a “We’ve been” badge and our own notes. Everything else is built from official and open sources, and each page shows where every fact came from. You can read more about that in our <Link href="/editorial-policy/">editorial policy</Link>.
      </p>
      <p className="rounded-2xl bg-sand-100 p-5 text-base">This page is a placeholder while we write our full story.</p>
    </InfoPage>
  );
}
