import { GO_LIVE, SITE_URL } from '../lib/site';

// Disallow everything until GO_LIVE=true.
export default function robots() {
  return GO_LIVE ? { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` } : { rules: { userAgent: '*', disallow: '/' } };
}
