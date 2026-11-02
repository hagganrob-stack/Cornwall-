import Image from 'next/image';
import { imgSrc } from '../lib/data';

// An openly licensed photo with its attribution under it. linked={false} gives a plain-text credit,
// for photos inside a card that is itself a link (no nested <a>).
export function Credit({ image, linked = true, className = '' }) {
  if (!image) return null;
  const cls = `text-[11px] leading-snug text-atlantic-950/55 ${className}`;
  if (!linked)
    return (
      <p className={cls}>
        Photo: {image.photographer || 'unknown'}
        {image.licence ? ` · ${image.licence}` : ''}
      </p>
    );
  return (
    <p className={cls}>
      Photo:{' '}
      <a className="text-inherit underline" href={image.sourceUrl} rel="nofollow noopener" target="_blank">
        {image.photographer || 'unknown'}
      </a>
      {image.licence ? (
        <>
          {' · '}
          <a className="text-inherit underline" href={image.licenceUrl} rel="license nofollow noopener" target="_blank">
            {image.licence}
          </a>
        </>
      ) : null}
      {image.via ? ` · via ${image.via}` : null}
    </p>
  );
}

export default function Photo({ image, alt, className = '', aspect = 'aspect-[4/3]', rounded = 'rounded-2xl', sizes = '(min-width: 640px) 50vw, 100vw', linked = true }) {
  if (!image) return null;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden bg-sand-100 ${aspect} ${rounded}`}>
        <Image src={imgSrc(image)} alt={alt || image.title || ''} fill sizes={sizes} className="object-cover" />
      </div>
      <figcaption className="mt-1.5">
        <Credit image={image} linked={linked} />
      </figcaption>
    </figure>
  );
}
