import Link from 'next/link';
import { AUTHOR } from '../lib/site';
import { fmtDate } from '../lib/data';

// Author, last-checked date and a jump to sources: shown on every page.
export default function Byline({ lastChecked, sourcesHref = '#sources', className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-atlantic-950/60 ${className}`}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-atlantic-950 font-[family-name:var(--font-display)] text-[13px] text-white">R</span>
      <span>
        By <Link href={AUTHOR.url} className="font-semibold text-atlantic-950 no-underline hover:underline">{AUTHOR.name}</Link>
      </span>
      {lastChecked ? <><span className="text-atlantic-950/25">/</span><span>Checked {fmtDate(lastChecked)}</span></> : null}
      {sourcesHref ? (
        <>
          <span className="text-atlantic-950/25">/</span>
          <a href={sourcesHref} className="text-atlantic-950/60">Sources</a>
        </>
      ) : null}
    </p>
  );
}
