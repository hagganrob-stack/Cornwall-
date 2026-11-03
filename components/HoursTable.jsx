// Opening hours as listed, with the seasonal caveat.
export default function HoursTable({ hours }) {
  if (!hours || hours.value !== 'listed') return null;
  return (
    <div>
      <table className="w-full max-w-md text-[15px]">
        <tbody className="divide-y divide-atlantic-950/10">
          {hours.days.map(([d, h]) => (
            <tr key={d}>
              <th scope="row" className="py-2 pr-4 text-left font-medium">{d}</th>
              <td className={`py-2 tabular-nums ${/closed/i.test(h) ? 'text-atlantic-950/50' : ''}`}>{h}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm text-atlantic-950/60">{hours.note}</p>
    </div>
  );
}
