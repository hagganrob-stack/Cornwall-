import Link from 'next/link';
import { AUTHOR } from '../lib/site';
import { fmtDate } from '../lib/data';

// Author, last-checked date and a jump to sources: shown on every page.
export default function Byline({ lastChecked, sourcesHref = '#sources', className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-atlantic-950/65 ${className}`}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-seaglass-100 text-xs font-bold text-seaglass-600">R</span>
      <span>
        By <Link href={AUTHOR.url} className="font-semibold text-atlantic-900">{AUTHOR.name}</Link>
      </span>
      {lastChecked ? <span>· Last checked {fmtDate(lastChecked)}</span> : null}
      {sourcesHref ? (
        <span>
          · <a href={sourcesHref}>Sources</a>
        </span>
      ) : null}
    </p>
  );
}
