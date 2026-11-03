import Image from 'next/image';
import { Credit } from './Photo';
import MapCard from './MapCard';
import Byline from './Byline';
import { Container, Crumbs } from './Blocks';
import { imgSrc } from '../lib/data';

// Editorial header: breadcrumbs, kicker, big serif title and byline on paper, then a wide photo
// (or the map when there's no openly licensed photo) with its credit underneath.
export default function Hero({ image, title, kicker, children, lat, lng, crumbs, lastChecked, sourcesHref, standfirst }) {
  return (
    <header>
      <Container className="pt-8 sm:pt-12">
        {crumbs ? <Crumbs items={crumbs} /> : null}
        {kicker ? <p className="eyebrow mt-8">{kicker}</p> : null}
        <h1 className="mt-3 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">{title}</h1>
        {standfirst ? <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-atlantic-950/75 sm:text-[1.35rem]">{standfirst}</p> : null}
        {children}
        {lastChecked ? <Byline lastChecked={lastChecked} sourcesHref={sourcesHref} className="mt-6" /> : null}
      </Container>
      <Container className="mt-8 sm:mt-10">
        <div className={`relative w-full overflow-hidden rounded-3xl bg-sand-100 ${image ? 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]' : 'h-28 sm:h-40'}`}>
          {image ? (
            <Image src={imgSrc(image)} alt={image.title || title} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
          ) : (
            <MapCard name="" lat={lat} lng={lng} className="h-full w-full" />
          )}
        </div>
        {image ? <Credit image={image} className="mt-2 text-right" /> : null}
      </Container>
    </header>
  );
}
