// Small geometry helpers (no dependencies). Coordinates are {lat, lng}.
import { haversineKm } from './util.mjs';

const R = 6371008.8;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

// Local equirectangular projection around a reference point -> metres.
export function projector(ref) {
  const k = Math.cos(toRad(ref.lat));
  return (p) => ({ x: toRad(p.lng - ref.lng) * R * k, y: toRad(p.lat - ref.lat) * R });
}

export function polygonAreaM2(points) {
  if (!points || points.length < 3) return 0;
  const proj = projector(points[0]);
  const xy = points.map(proj);
  let a = 0;
  for (let i = 0; i < xy.length; i++) {
    const p = xy[i];
    const q = xy[(i + 1) % xy.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

export function centroid(points) {
  const n = points.length;
  return { lat: points.reduce((s, p) => s + p.lat, 0) / n, lng: points.reduce((s, p) => s + p.lng, 0) / n };
}

// Distance in metres from point p to segment a-b (projected locally).
export function pointSegmentM(p, a, b) {
  const proj = projector(p);
  const A = proj(a);
  const B = proj(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? -(A.x * dx + A.y * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(A.x + t * dx, A.y + t * dy);
}

export function bearingDeg(a, b) {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
const COMPASS_SHORT = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export const compass = (deg) => COMPASS[Math.round(deg / 45) % 8];
export const compassShort = (deg) => COMPASS_SHORT[Math.round(deg / 45) % 8];

// Minimum distance (m) from point p to a beach (outline if we have one, otherwise its centre).
export function distanceToBeachM(p, beach) {
  if (beach.outline && beach.outline.length > 2) {
    let best = Infinity;
    for (let i = 0; i < beach.outline.length - 1; i++) best = Math.min(best, pointSegmentM(p, beach.outline[i], beach.outline[i + 1]));
    return best;
  }
  return haversineKm(p, beach) * 1000;
}

/**
 * Seaward direction of a beach from OSM coastline ways.
 * OSM convention: natural=coastline is drawn with land on the LEFT and sea on the RIGHT,
 * so the seaward normal of a segment is its bearing + 90°. We average the normals of
 * coastline segments within `radiusM` of the beach, weighted by length / distance.
 */
export function seawardBearing(beach, coastSegments, radiusM = 400) {
  let sx = 0;
  let sy = 0;
  let used = 0;
  let wsum = 0;
  const c = { lat: beach.lat, lng: beach.lng };
  for (const [a, b] of coastSegments) {
    const d = Math.min(distanceToBeachM(a, beach), distanceToBeachM(b, beach), pointSegmentM(c, a, b));
    if (d > radiusM) continue;
    const len = haversineKm(a, b) * 1000;
    if (len < 1) continue;
    const normal = toRad((bearingDeg(a, b) + 90) % 360);
    const w = len / (25 + d);
    sx += Math.sin(normal) * w;
    sy += Math.cos(normal) * w;
    wsum += w;
    used++;
  }
  if (!used) return null;
  // Consistency 0..1: near 0 when normals cancel out (e.g. a beach wrapped round a headland).
  const consistency = Math.hypot(sx, sy) / wsum;
  if (consistency < 0.35) return null;
  return { bearing: Math.round((toDeg(Math.atan2(sx, sy)) + 360) % 360), segments: used, consistency: +consistency.toFixed(2) };
}
