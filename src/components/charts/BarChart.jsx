// Dependency-free, brand-compliant SVG bar chart.
// No border-radius, no gradients, no shadows. Provisional bars carry the Acid Lime accent.
export default function BarChart({ data, unit = 'tCO2e' }) {
  const W = 640
  const H = 320
  const padL = 16
  const padR = 16
  const padT = 28
  const padB = 56
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const max = Math.max(0, ...data.map((d) => d.value))
  const scaleMax = max === 0 ? 1 : max
  const n = data.length
  const slot = n > 0 ? plotW / n : plotW
  const barW = Math.min(slot * 0.55, 90)
  const baseline = padT + plotH
  const yOf = (v) => baseline - (v / scaleMax) * plotH

  if (n === 0) {
    return <p className="text-sm text-ink/60">No data to chart yet.</p>
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Bar chart">
      <text x={padL} y={padT - 12} fontSize="12" fontFamily="DM Sans, sans-serif" fill="#000">{unit}</text>
      <line x1={padL} y1={baseline} x2={padL + plotW} y2={baseline} stroke="#000" strokeWidth="1" />
      {data.map((d, i) => {
        const cx = padL + slot * i + slot / 2
        const top = yOf(d.value)
        const h = baseline - top
        const fill = d.provisional ? '#C8F135' : '#000000'
        return (
          <g key={d.label}>
            <rect x={cx - barW / 2} y={top} width={barW} height={h} fill={fill} />
            <text x={cx} y={top - 7} textAnchor="middle" fontSize="12" fontFamily="DM Sans, sans-serif" fill="#000">
              {d.value.toFixed(2)}
            </text>
            <text x={cx} y={baseline + 18} textAnchor="middle" fontSize="11" fontFamily="DM Sans, sans-serif" fill="#000">
              {d.label}
            </text>
            {d.provisional && (
              <text x={cx} y={baseline + 33} textAnchor="middle" fontSize="9" fontFamily="DM Sans, sans-serif" fill="#000">
                [PROVISIONAL]
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
