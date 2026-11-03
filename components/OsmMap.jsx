// Lightweight OpenStreetMap embed (no JS library, no API key).
export default function OsmMap({ lat, lng, zoomDeg = 0.012, label }) {
  const bbox = [lng - zoomDeg * 1.6, lat - zoomDeg, lng + zoomDeg * 1.6, lat + zoomDeg].map((n) => n.toFixed(5)).join(',');
  return (
    <div>
      <iframe
        title={`Map of ${label}`}
        loading="lazy"
        className="h-64 w-full rounded-2xl bg-sand-100"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
      />
      <p className="mt-2 flex gap-4 text-sm">
        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} rel="nofollow noopener" target="_blank">Larger map</a>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} rel="nofollow noopener" target="_blank">Directions</a>
      </p>
    </div>
  );
}
