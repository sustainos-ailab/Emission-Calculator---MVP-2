import { lineTco2e, sortByQuarter, fmt } from '../lib/calc.js'

export default function Review({ lines, onBack, onConfirm }) {
  const rows = sortByQuarter(lines)
  const hasR22 = lines.some((l) => l.montrealProtocol)

  return (
    <section className="px-6 py-10">
      <h2 className="text-2xl mb-1">Review &amp; confirm</h2>
      <p className="text-ink/70 mb-6">
        Check each line and its computed emissions (quantity &times; EF &divide; 1000) before viewing the dashboard.
      </p>

      <div className="overflow-x-auto border border-ink">
        <table className="w-full text-sm">
          <thead className="bg-ink text-chalk">
            <tr>
              <th className="text-left px-3 py-2">Quarter</th>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-left px-3 py-2">Fuel / Substance</th>
              <th className="text-left px-3 py-2">Unit</th>
              <th className="text-right px-3 py-2">Quantity</th>
              <th className="text-right px-3 py-2">tCO2e</th>
              <th className="text-left px-3 py-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-ink/20">
                <td className="px-3 py-2">{l.quarter}</td>
                <td className="px-3 py-2">{l.category}</td>
                <td className="px-3 py-2">{l.fuel}</td>
                <td className="px-3 py-2">{l.unit}</td>
                <td className="px-3 py-2 text-right tabular-nums">{l.quantity}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(lineTco2e(l))}</td>
                <td className="px-3 py-2">
                  {l.montrealProtocol && <span className="ec-tag">Memo &mdash; excl. Scope 1</span>}
                  {l.status === 'PROVISIONAL' && <span className="ec-tag">Provisional EF</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasR22 && (
        <p className="ec-memo mt-4">
          R-22 (Montreal Protocol) is calculated and shown above as a memo line only. It is never
          added to the Scope 1 total.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button className="ec-btn" onClick={onBack}>Back to entry</button>
        <button className="ec-btn-primary" onClick={onConfirm}>Confirm</button>
      </div>
    </section>
  )
}
