// Pages are all pre-rendered at build time (generateStaticParams); Vercel serves them statically.
// Photos go through Next.js image optimisation: Vercel fetches each openly licensed photo once,
// resizes it and serves cached WebP/AVIF from our own domain (no hotlinking from visitors' browsers).
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [160, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'thumb.wikimedia.org' },
      { protocol: 'https', hostname: '*.geograph.org.uk' },
      { protocol: 'https', hostname: 'geograph.org.uk' },
    ],
  },
};
export default nextConfig;
