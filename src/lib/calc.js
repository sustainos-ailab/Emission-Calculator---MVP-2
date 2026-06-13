import { efRow } from '../data/registers.js'

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

// Build a session line item, snapshotting the matched EF register row.
// Returns null if the plant/category/fuel combination is not in the register.
export function makeLine({ quarter, category, fuel, quantity, plantId }) {
  const row = efRow(plantId, category, fuel)
  if (!row) return null
  return {
    id: crypto.randomUUID(),
    quarter,
    category,
    fuel,
    unit: row.unit,
    quantity,
    ef_id: row.ef_id,
    ef_kgco2e: row.ef_kgco2e,
    scope: row.scope,
    status: row.status,
    montrealProtocol: !!row.montrealProtocol,
  }
}

// Unrounded tCO2e for a line. Authoritative for all aggregation.
export function lineTco2e(line) {
  return (line.quantity * line.ef_kgco2e) / 1000
}

// Totals across all entered quarters. R-22 (Montreal Protocol) is held as a
// separate memo total and never folded into the Scope 1 figure.
export function aggregate(lines) {
  let scope1 = 0
  let scope2 = 0
  let r22 = 0
  let provisional = false
  for (const l of lines) {
    const t = lineTco2e(l)
    if (l.montrealProtocol) {
      r22 += t
      continue
    }
    if (l.scope === 'Scope 1') scope1 += t
    else scope2 += t
    if (l.status === 'PROVISIONAL') provisional = true
  }
  return { scope1, scope2, total: scope1 + scope2, r22, provisional }
}

// Per fuel/substance, summed across all entered quarters (R-22 excluded — memo only).
export function byFuel(lines) {
  const map = new Map()
  for (const l of lines) {
    if (l.montrealProtocol) continue
    const cur = map.get(l.fuel) || { label: l.fuel, value: 0, provisional: false }
    cur.value += lineTco2e(l)
    if (l.status === 'PROVISIONAL') cur.provisional = true
    map.set(l.fuel, cur)
  }
  return [...map.values()]
}

// Per entered quarter: Scope 1 (excl. R-22) + Scope 2 LB, in quarter order.
export function byQuarter(lines) {
  const sums = {}
  for (const l of lines) {
    if (l.montrealProtocol) continue
    sums[l.quarter] = (sums[l.quarter] || 0) + lineTco2e(l)
  }
  return QUARTERS.filter((q) => q in sums).map((q) => ({ label: q, value: sums[q] }))
}

export function sortByQuarter(lines) {
  return [...lines].sort((a, b) => QUARTERS.indexOf(a.quarter) - QUARTERS.indexOf(b.quarter))
}

// Display helper: 2 decimal places.
export function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function lineFlag(l) {
  if (l.montrealProtocol) return 'R-22 MEMO (excluded from Scope 1)'
  if (l.status === 'PROVISIONAL') return 'PROVISIONAL EF — see register'
  return ''
}

export function buildCsv({ lines, plant, year }) {
  const headers = [
    'plant_id', 'plant_name', 'year', 'quarter', 'category', 'fuel_or_substance',
    'unit', 'quantity', 'ef_id', 'ef_kgco2e', 'emissions_tco2e', 'scope', 'flag',
  ]
  const round6 = (n) => Number(n.toFixed(6))
  const rows = sortByQuarter(lines).map((l) => [
    plant.plant_id, plant.plant_name, year, l.quarter, l.category, l.fuel,
    l.unit, l.quantity, l.ef_id, l.ef_kgco2e, round6(lineTco2e(l)), l.scope, lineFlag(l),
  ])
  const esc = (v) => {
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
