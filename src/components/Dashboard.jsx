import { aggregate, byFuel, byQuarter, fmt, buildCsv, downloadCsv } from '../lib/calc.js'
import BarChart from './charts/BarChart.jsx'
import LineChart from './charts/LineChart.jsx'

export default function Dashboard({ plant, year, lines, onStartOver }) {
  const agg = aggregate(lines)
  const fuelData = byFuel(lines)
  const quarterData = byQuarter(lines)
  const scopeData = [
    { label: 'Scope 1', value: agg.scope1 },
    { label: 'Scope 2 (LB)', value: agg.scope2 },
  ]

  function exportCsv() {
    downloadCsv(`emissions_${plant.plant_id}_${year}.csv`, buildCsv({ lines, plant, year }))
  }

  return (
    <section className="px-6 py-10">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl">Emissions dashboard</h2>
          <p className="text-ink/70">{plant.plant_name} &middot; FY {year} &middot; tCO2e</p>
        </div>
        <div className="flex gap-3">
          <button className="ec-btn" onClick={exportCsv}>Export CSV</button>
          <button className="ec-btn-primary" onClick={onStartOver}>Start over</button>
        </div>
      </div>

      {/* Totals panel */}
      <div className="grid gap-px bg-ink border border-ink md:grid-cols-3">
        <Total label="Scope 1" value={agg.scope1} />
        <Total label="Scope 2 (location-based)" value={agg.scope2} flag={agg.provisional} />
        <Total label="Total" value={agg.total} />
      </div>

      {agg.r22 > 0 && (
        <p className="ec-memo mt-3">
          Fugitive &mdash; Montreal Protocol substances (reported separately):{' '}
          <strong>{fmt(agg.r22)} tCO2e</strong>. Not included in the Scope 1 total.
        </p>
      )}
      {agg.provisional && (
        <p className="mt-3 text-sm">
          <span className="ec-tag">Provisional EF</span>{' '}
          District heating (FAC-004) uses a provisional emission factor &mdash; see register.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2 mt-10">
        <Panel title="Emissions by scope">
          <BarChart data={scopeData} />
        </Panel>
        <Panel title="Emissions by quarter (Scope 1 + Scope 2 LB)">
          <LineChart data={quarterData} />
        </Panel>
        <Panel title="Emissions by fuel / substance (year)" full>
          <BarChart data={fuelData} />
          <p className="text-xs text-ink/60 mt-3">
            R-22 (Montreal Protocol) is reported as a memo line only and is excluded from the charts and totals.
          </p>
        </Panel>
      </div>
    </section>
  )
}

function Total({ label, value, flag }) {
  return (
    <div className="bg-chalk p-5">
      <div className="text-xs uppercase tracking-wide text-ink/60 mb-2">
        {label} {flag && <span className="ec-flag align-middle">Provisional</span>}
      </div>
      <div className="font-display font-bold text-3xl tabular-nums">
        {fmt(value)} <span className="text-base font-body font-light">tCO2e</span>
      </div>
    </div>
  )
}

function Panel({ title, children, full }) {
  return (
    <div className={`border border-ink p-5 ${full ? 'md:col-span-2' : ''}`}>
      <h3 className="text-lg mb-4">{title}</h3>
      {children}
    </div>
  )
}
