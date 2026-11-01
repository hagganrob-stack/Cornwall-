// Small at-a-glance chips for a beach.
export default function Badges({ b }) {
  const out = [];
  if (b.lifeguards?.value?.startsWith('RNLI')) out.push(['lifeguard', 'RNLI lifeguards (seasonal)']);
  if (b.dogs?.councilListed) out.push(['dogs-restricted', b.dogs.restriction === 'leads' ? 'Dogs on leads in season' : b.dogs.allYear ? 'No dogs' : 'Seasonal dog ban']);
  else out.push(['dogs-ok', 'No Council dog restriction']);
  if (b.parking?.value === 'yes') out.push(['plain', 'Parking']);
  if (b.toilets?.value === 'yes') out.push(['plain', 'Toilets']);
  if (b.cafeNearby?.value === 'yes') out.push(['plain', 'Café']);
  if (b.surf?.value === 'yes') out.push(['plain', 'Surf']);
  return (
    <ul className="badges">
      {out.map(([k, t]) => (
        <li key={t} className={`badge badge-${k}`}>{t}</li>
      ))}
    </ul>
  );
}
