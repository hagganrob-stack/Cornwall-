import Link from 'next/link';
import Image from 'next/image';
import { heroImage, displayName, imgSrc } from '../lib/data';
import MapCard from './MapCard';
import Badges from './Badges';
import AttractionBadges from './AttractionBadges';
import FoodBadges from './FoodBadges';
import Rating from './Rating';

// Editorial card: photo, small meta line, serif title, at most a few quiet tags. No box.
// The photo credit sits on the image as plain text (the card is a link, so no nested <a>).
export default function PlaceCard({ place, href, meta, beach = false, attraction = false, food = false, size = 'md' }) {
  const img = heroImage(place);
  const name = beach ? displayName(place) : place.customTitle || place.name;
  // Pubs and restaurants rarely have an open photo: show them as a clean text entry instead of a placeholder.
  const textOnly = food && !img;
  return (
    <Link href={href} className={`group block text-atlantic-950 no-underline hover:text-atlantic-950 ${textOnly ? 'border-t border-atlantic-950/15' : ''}`}>
      {textOnly ? null : <div className={`relative overflow-hidden rounded-2xl bg-sand-100 ${size === 'lg' ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        {img ? (
          <Image src={imgSrc(img)} alt={name} fill sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        ) : (
          <MapCard name={name} lat={place.lat} lng={place.lng} className="h-full w-full" />
        )}
        {img ? (
          <p className="absolute right-2 bottom-2 max-w-[85%] truncate rounded-full bg-atlantic-950/45 px-2 py-0.5 text-[10px] text-white/85 backdrop-blur-sm">
            Photo: {img.photographer || 'unknown'}{img.licence ? ` · ${img.licence}` : ''}
          </p>
        ) : null}
      </div>}
      <div className={textOnly ? 'pt-5' : 'pt-4'}>
        {meta ? <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-atlantic-950/50">{meta}</p> : null}
        <h3 className="mt-1 text-[1.4rem] leading-snug transition-colors group-hover:text-seaglass-600">{name}</h3>
        {food ? <Rating rating={place.rating} compact className="mt-1" /> : null}
        {beach ? <Badges b={place} max={3} className="mt-3" /> : null}
        {attraction ? <AttractionBadges a={place} max={3} className="mt-3" /> : null}
        {food ? <FoodBadges v={place} max={2} kind={false} className="mt-3" /> : null}
      </div>
    </Link>
  );
}

export function CardGrid({ children, cols = 3 }) {
  const c = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid grid-cols-1 gap-x-6 gap-y-12 ${c}`}>{children}</div>;
}
