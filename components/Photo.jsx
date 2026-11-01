// An openly licensed photo with its required attribution (photographer, licence, source).
// linked={false}: plain-text credit, for photos inside a card that is itself a link (no nested <a>).
export default function Photo({ image, alt, className = '', eager = false, linked = true }) {
  if (!image) return null;
  const src = image.thumbUrl || image.url;
  return (
    <figure className={`photo ${className}`}>
      <img src={src} alt={alt || image.title || ''} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" />
      {!linked ? (
        <figcaption>
          Photo: {image.photographer || 'unknown'}
          {image.licence ? ` · ${image.licence}` : ''}
        </figcaption>
      ) : (
      <figcaption>
        Photo: <a href={image.sourceUrl} rel="nofollow noopener" target="_blank">{image.photographer || 'unknown'}</a>
        {image.licence ? (
          <>
            {' · '}
            <a href={image.licenceUrl} rel="license nofollow noopener" target="_blank">{image.licence}</a>
          </>
        ) : null}
        {image.via ? ` · via ${image.via}` : null}
      </figcaption>
      )}
    </figure>
  );
}
