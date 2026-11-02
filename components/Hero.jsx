import Image from 'next/image';
import { Credit } from './Photo';
import MapCard from './MapCard';
import { imgSrc } from '../lib/data';

// Full-width hero: photo with the title over a gradient, credit underneath.
export default function Hero({ image, title, kicker, children, lat, lng }) {
  return (
    <section className="relative">
      <div className="relative h-[52vh] min-h-[320px] max-h-[620px] w-full overflow-hidden bg-atlantic-900">
        {image ? (
          <Image src={imgSrc(image)} alt={image.title || title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <MapCard name="" lat={lat} lng={lng} className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 via-atlantic-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
            {kicker ? <div className="mb-2 text-sm font-medium text-seaglass-300">{kicker}</div> : null}
            <h1 className="max-w-4xl text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h1>
            {children}
          </div>
        </div>
      </div>
      {image ? (
        <div className="mx-auto max-w-6xl px-4 pt-1.5 sm:px-6">
          <Credit image={image} />
        </div>
      ) : null}
    </section>
  );
}
