import Link from 'next/link';
import Image from 'next/image';
import { heroImage, displayName, imgSrc } from '../lib/data';
import { Credit } from './Photo';
import MapCard from './MapCard';
import Badges from './Badges';
import AttractionBadges from './AttractionBadges';
import FoodBadges from './FoodBadges';

// Large image card for a beach or town. Credit sits under the image, as plain text (the card is a link).
export default function PlaceCard({ place, href, meta, beach = false, attraction = false, food = false, size = 'md' }) {
  const img = heroImage(place);
  const name = beach ? displayName(place) : place.customTitle || place.name;
  return (
    <div className="group">
      <Link href={href} className="block overflow-hidden rounded-2xl bg-white no-underline shadow-sm ring-1 ring-atlantic-950/5 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className={`relative overflow-hidden ${size === 'lg' ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          {img ? (
            <Image src={imgSrc(img)} alt={name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="bg-sand-100 object-cover transition duration-500 group-hover:scale-[1.03]" />
          ) : (
            <MapCard name={name} lat={place.lat} lng={place.lng} className="h-full w-full" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg text-atlantic-900 group-hover:text-seaglass-600">{name}</h3>
          {meta ? <p className="mt-0.5 text-sm text-atlantic-950/60">{meta}</p> : null}
          {beach ? <Badges b={place} className="mt-3" /> : null}
          {attraction ? <AttractionBadges a={place} className="mt-3" /> : null}
          {food ? <FoodBadges v={place} className="mt-3" /> : null}
        </div>
      </Link>
      {img ? <Credit image={img} linked={false} className="mt-1 px-1" /> : null}
    </div>
  );
}

export function CardGrid({ children, cols = 3 }) {
  const c = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid grid-cols-1 gap-6 ${c}`}>{children}</div>;
}
