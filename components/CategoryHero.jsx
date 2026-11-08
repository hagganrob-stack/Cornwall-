import Image from 'next/image';
import { Crumbs } from './Blocks';
import Byline from './Byline';

// Full-bleed photo header for the main category pages, matching the homepage hero:
// dark gradient over the photo, breadcrumbs, kicker, big white serif title and standfirst.
export default function CategoryHero({ hero, title, kicker, standfirst, crumbs, lastChecked, sourcesHref = '/editorial-policy/' }) {
  return (
    <header>
      <section className="relative isolate overflow-hidden bg-atlantic-950">
        <div className="relative h-[52vh] min-h-[380px] max-h-[720px] w-full sm:h-[62vh] sm:min-h-[440px]">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className={`object-cover ${hero.position || ''}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-atlantic-950/85 via-atlantic-950/25 to-atlantic-950/40" />
        </div>
        <div className="absolute inset-0 flex flex-col">
          <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
            {crumbs ? <Crumbs items={crumbs} light /> : null}
          </div>
          <div className="mx-auto mt-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            {kicker ? <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">{kicker}</p> : null}
            <h1 className="mt-4 max-w-5xl text-[2.75rem] text-white sm:text-6xl lg:text-[5.25rem]">{title}</h1>
            {standfirst ? <p className="mt-6 hidden max-w-[60ch] text-xl leading-relaxed text-white/85 sm:block">{standfirst}</p> : null}
          </div>
        </div>
      </section>
      {/* On phones the standfirst sits under the photo so it doesn't cover it. */}
      {standfirst ? (
        <div className="mx-auto max-w-7xl px-4 sm:hidden">
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-atlantic-950/75">{standfirst}</p>
        </div>
      ) : null}
      {hero.credit ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mt-2 text-right text-[11px] leading-snug text-atlantic-950/55">
            Photo:{' '}
            <a className="text-inherit underline" href={hero.credit.sourceUrl} rel="nofollow noopener" target="_blank">
              {hero.credit.photographer}
            </a>
            {hero.credit.licence ? ` · ${hero.credit.licence}` : ''}
          </p>
        </div>
      ) : null}
      {lastChecked ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Byline lastChecked={lastChecked} sourcesHref={sourcesHref} className="mt-6" />
        </div>
      ) : null}
    </header>
  );
}
