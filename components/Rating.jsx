import { fmtDate } from '../lib/data';

// Google rating, shown as on the Brighton Beer Guide: value, review count, date checked, link to the listing.
export default function Rating({ rating, compact = false, className = '' }) {
  if (!rating?.value) return null;
  const n = rating.reviews?.toLocaleString('en-GB');
  if (compact)
    return (
      <span className={`inline-flex items-center gap-1 text-sm text-atlantic-950/70 ${className}`}>
        <span aria-hidden="true" className="text-sand-700">★</span>
        <span className="font-semibold text-atlantic-900">{rating.value.toFixed(1)}</span>
        <span>({n})</span>
        <span className="sr-only">Google rating {rating.value} from {n} reviews</span>
      </span>
    );
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-[15px] ${className}`}>
      <span aria-hidden="true" className="text-lg text-sand-700">★</span>
      <span>
        <strong className="text-atlantic-900">{rating.value.toFixed(1)}</strong> Google rating from {n} reviews
      </span>
      <span className="text-xs text-atlantic-950/50">
        (as of {fmtDate(rating.asOf)},{' '}
        <a href={rating.source?.url} rel="nofollow noopener" target="_blank" className="text-inherit underline">see the listing</a>)
      </span>
    </p>
  );
}
