// Site-wide settings. SITE_URL has no default domain yet; set it in Vercel when the domain exists.
export const SITE_NAME = 'One Week in Cornwall';
export const SITE_URL = (process.env.SITE_URL || 'https://cornwall-phi.vercel.app').replace(/\/$/, '');
export const AUTHOR = { name: 'Rob', url: '/about/' };
// The corrections address is shown only when CONTACT_EMAIL is set (no invented addresses).
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || null;
// The whole site stays noindexed until GO_LIVE=true is set deliberately.
export const GO_LIVE = process.env.GO_LIVE === 'true';
