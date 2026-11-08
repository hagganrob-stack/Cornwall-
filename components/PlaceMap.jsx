'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

// Interactive map of many places (pins cluster when zoomed out). Leaflet is only downloaded
// when the map scrolls near the viewport, so it costs nothing for people who never reach it.
//
// Tiles: OpenStreetMap's standard tiles by default (fine for preview). Before launch, point
// NEXT_PUBLIC_MAP_TILES_URL / NEXT_PUBLIC_MAP_ATTRIBUTION at a tile provider (MapTiler, Stadia…);
// the key goes in that URL and the env var, never in the repo.
const TILES = process.env.NEXT_PUBLIC_MAP_TILES_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CORNWALL = [[49.95, -5.75], [50.95, -4.15]];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * points: [{ slug, name, lat, lng, kind, href, sub, rating }]
 * kinds:  { [kind]: { label, color } }  — pin colour + legend
 */
export default function PlaceMap({ points, kinds, label = 'Map', className = '' }) {
  const box = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const leaflet = useRef(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  // 1. Wait until the map is close to the viewport.
  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setNear(true), { rootMargin: '400px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  // 2. Load Leaflet + clustering and create the map once.
  useEffect(() => {
    if (!near || map.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      window.L = L; // markercluster attaches itself to the global L
      await import('leaflet.markercluster');
      if (cancelled || !box.current) return;
      leaflet.current = L;
      const m = L.map(box.current, { scrollWheelZoom: false, zoomSnap: 0.5 });
      m.fitBounds(CORNWALL);
      L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(m);
      // Scroll-wheel zoom only once someone has clicked into the map, so the page still scrolls.
      m.on('click focus', () => m.scrollWheelZoom.enable());
      m.on('mouseout', () => m.scrollWheelZoom.disable());
      layer.current = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, spiderfyOnMaxZoom: true }).addTo(m);
      map.current = m;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [near]);

  // 3. (Re)draw pins whenever the filtered list changes.
  useEffect(() => {
    const L = leaflet.current;
    if (!ready || !L) return;
    const g = layer.current;
    g.clearLayers();
    const markers = points.map((p) => {
      const k = kinds[p.kind] || { color: '#0b1d2e', label: '' };
      const icon = L.divIcon({ className: 'place-pin', html: `<span style="background:${k.color}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] });
      const rating = p.rating ? `<span class="pin-rating">★ ${p.rating.toFixed(1)}</span>` : '';
      return L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name, keyboard: true }).bindPopup(
        `<p class="pin-kind">${esc(k.label)}${p.sub ? ` · ${esc(p.sub)}` : ''}</p><a class="pin-name" href="${esc(p.href)}">${esc(p.name)}</a>${rating}`
      );
    });
    g.addLayers(markers);
    if (points.length) map.current.fitBounds(g.getBounds(), { padding: [30, 30], maxZoom: 14 });
    else map.current.fitBounds(CORNWALL);
  }, [points, kinds, ready]);

  useEffect(() => () => map.current?.remove(), []);

  return (
    <div className={className}>
      <div ref={box} role="region" aria-label={label} className="relative z-0 h-[440px] w-full overflow-hidden rounded-3xl border border-atlantic-950/10 bg-sand-100 sm:h-[560px]">
        {!ready ? <p className="absolute inset-0 grid place-items-center text-sm text-atlantic-950/50">Loading map…</p> : null}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-atlantic-950/70">
        {Object.entries(kinds).map(([k, v]) => (
          <li key={k} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full ring-2 ring-white" style={{ background: v.color }} aria-hidden="true" />
            {v.label}
          </li>
        ))}
        <li className="text-atlantic-950/50">Numbered circles group nearby places: zoom in or click to split them.</li>
      </ul>
    </div>
  );
}
