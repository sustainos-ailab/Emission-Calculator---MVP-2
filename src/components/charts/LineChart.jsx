// Dependency-free, brand-compliant SVG line chart for quarter-over-quarter totals.
// A single entered quarter renders as a single point.
export default function LineChart({ data, unit = 'tCO2e' }) {
  const W = 640
  const H = 320
  const padL = 16
  const padR = 24
  const padT = 28
  const padB = 48
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const max = Math.max(0, ...data.map((d) => d.value))
  const scaleMax = max === 0 ? 1 : max
  const n = data.length
  const baseline = padT + plotH
  const xOf = (i) => (n === 1 ? padL + plotW / 2 : padL + (plotW * i) / (n - 1))
  const yOf = (v) => baseline - (v / scaleMax) * plotH

  if (n === 0) {
    return <p className="text-sm text-ink/60">No data to chart yet.</p>
  }

  const points = data.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Line chart">
      <text x={padL} y={padT - 12} fontSize="12" fontFamily="DM Sans, sans-serif" fill="#000">{unit}</text>
      <line x1={padL} y1={baseline} x2={padL + plotW} y2={baseline} stroke="#000" strokeWidth="1" />
      {n > 1 && <polyline points={points} fill="none" stroke="#000" strokeWidth="2" />}
      {data.map((d, i) => (
        <g key={d.label}>
          <rect x={xOf(i) - 3} y={yOf(d.value) - 3} width="6" height="6" fill="#000" />
          <text x={xOf(i)} y={yOf(d.value) - 11} textAnchor="middle" fontSize="12" fontFamily="DM Sans, sans-serif" fill="#000">
            {d.value.toFixed(2)}
          </text>
          <text x={xOf(i)} y={baseline + 18} textAnchor="middle" fontSize="12" fontFamily="DM Sans, sans-serif" fill="#000">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
