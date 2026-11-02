// Clean coastal-coloured stand-in for places without a good photo.
export default function MapCard({ name, lat, lng, className = '' }) {
  return (
    <div className={`relative flex items-end overflow-hidden bg-gradient-to-br from-seaglass-500 via-atlantic-700 to-atlantic-900 p-4 text-white ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0 210 C 60 190 120 230 200 205 S 340 180 400 200 L400 300 L0 300Z" fill="#fff" />
        <path d="M0 240 C 80 225 150 260 230 240 S 350 220 400 235 L400 300 L0 300Z" fill="#fff" />
        <circle cx="300" cy="80" r="28" fill="#fff" opacity=".5" />
      </svg>
      <div className="relative">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight">{name}</p>
        {lat != null ? <p className="text-xs opacity-80">{lat.toFixed(3)}°N, {Math.abs(lng).toFixed(3)}°W</p> : null}
      </div>
    </div>
  );
}
