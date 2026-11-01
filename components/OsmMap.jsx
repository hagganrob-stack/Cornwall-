// Lightweight OpenStreetMap embed (no JS library, no API key).
export default function OsmMap({ lat, lng, zoomDeg = 0.012, label }) {
  const bbox = [lng - zoomDeg * 1.6, lat - zoomDeg, lng + zoomDeg * 1.6, lat + zoomDeg].map((n) => n.toFixed(5)).join(',');
  return (
    <div className="map">
      <iframe title={`Map of ${label}`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`} />
      <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} rel="nofollow noopener" target="_blank">Open larger map</a>
      {' · '}
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} rel="nofollow noopener" target="_blank">Directions</a>
    </div>
  );
}
