// Calm stand-in for places without an openly licensed photo: contour-line seascape and the name.
export default function MapCard({ name, lat, lng, className = '' }) {
  return (
    <div className={`relative flex items-end overflow-hidden bg-gradient-to-br from-atlantic-900 via-atlantic-800 to-seaglass-600 p-5 text-white ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="none" fill="none" stroke="#fff" strokeWidth="0.8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M-10 ${120 + i * 24} C 70 ${100 + i * 24} 130 ${150 + i * 22} 210 ${125 + i * 24} S 350 ${100 + i * 26} 410 ${118 + i * 24}`} />
        ))}
        <circle cx="318" cy="70" r="22" fill="#fff" fillOpacity=".25" stroke="none" />
      </svg>
      <div className="relative">
        {name ? <p className="font-[family-name:var(--font-display)] text-xl leading-tight">{name}</p> : null}
        {lat != null ? <p className="mt-0.5 text-[11px] tracking-wide opacity-70">{lat.toFixed(3)}°N, {Math.abs(lng).toFixed(3)}°W</p> : null}
      </div>
    </div>
  );
}
