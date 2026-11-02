import PlaceCard, { CardGrid } from './PlaceCard';
import Byline from './Byline';
import { Container, Crumbs, Sources, AuthorBio } from './Blocks';
import JsonLd from './JsonLd';
import { itemListLd, attractionListLd, foodListLd } from '../lib/seo';
import { townName, latestChecked, heroImage } from '../lib/data';
import Hero from './Hero';

const SOURCES = [
  { label: 'Cornwall Council – Dogs on beaches (PSPO)', url: 'https://www.cornwall.gov.uk/environment/animal-welfare-and-enforcement/dogs-on-beaches/' },
  { label: 'RNLI open data – Lifeguard Units', url: 'https://rnli.org/find-my-nearest/lifeguarded-beaches' },
  { label: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', licence: 'ODbL' },
];

// Shared layout for /beaches/<roundup>/ and /towns/<town>/<roundup>-beaches/.
export default function Roundup({ title, intro, criteria, crumbs, items, secondary, distanceFrom, path, kind = 'beach', sources }) {
  const base = kind === 'attraction' ? '/things-to-do/' : kind === 'food' ? '/food-and-drink/' : '/beaches/';
  const all = [...items, ...(secondary?.items || [])].map((x) => x.b);
  const hero = heroImage(items.map((x) => x.b).find((b) => heroImage(b)?.width > 1500) || items[0]?.b);
  const card = ({ b, km }) => (
    <PlaceCard key={b.slug} place={b} beach={kind === 'beach'} attraction={kind === 'attraction'} food={kind === 'food'} href={`${base}${b.slug}/`} meta={km != null ? `${km} km from ${distanceFrom}` : `Near ${townName(b.town)}`} />
  );
  return (
    <>
      <JsonLd data={(kind === 'attraction' ? attractionListLd : kind === 'food' ? foodListLd : itemListLd)(title, items.map((x) => x.b), path)} />
      <Hero image={hero} title={title} kicker={`${items.length} ${kind === 'beach' ? 'beaches' : 'places'}`} lat={50.3} lng={-5} />
      <Container className="mt-6">
        <Crumbs items={crumbs} />
        <Byline lastChecked={latestChecked(all)} className="mt-3" />
        <p className="mt-6 max-w-[68ch] text-xl leading-relaxed text-atlantic-950/85">{intro}</p>
        <p className="mt-3 max-w-[68ch] text-sm text-atlantic-950/60"><strong>How we chose them:</strong> {criteria}</p>
        <div className="mt-10">
          <CardGrid>{items.map(card)}</CardGrid>
        </div>
        {secondary?.items?.length ? (
          <section className="mt-16">
            <h2 className="text-2xl sm:text-3xl">{secondary.title}</h2>
            <p className="mt-2 mb-8 max-w-[68ch] text-atlantic-950/75">{secondary.intro}</p>
            <CardGrid>{secondary.items.map(card)}</CardGrid>
          </section>
        ) : null}
        <AuthorBio />
        <Sources sources={sources || SOURCES} lastChecked={latestChecked(all)} />
      </Container>
    </>
  );
}
