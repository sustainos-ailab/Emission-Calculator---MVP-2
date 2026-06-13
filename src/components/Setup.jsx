import { useState } from 'react'
import { PLANTS, YEARS } from '../data/registers.js'

export default function Setup({ onContinue }) {
  const [plantId, setPlantId] = useState('')
  const [year, setYear] = useState('')
  const ready = plantId !== '' && year !== ''

  return (
    <section className="px-6 py-12 max-w-2xl">
      <h1 className="text-4xl mb-3">Emissions Calculator</h1>
      <p className="mb-10 text-ink/70 leading-relaxed">
        Enter one plant&rsquo;s energy data for a single year and see its Scope 1 and Scope 2
        (location-based) GHG emissions. Everything is entered through guided dropdowns. The
        session is held in your browser only &mdash; nothing is saved or uploaded.
      </p>

      <div className="space-y-6">
        <label className="block">
          <span className="block text-sm uppercase tracking-wide mb-2">Plant</span>
          <select className="ec-select" value={plantId} onChange={(e) => setPlantId(e.target.value)}>
            <option value="">Select a plant&hellip;</option>
            {PLANTS.map((p) => (
              <option key={p.plant_id} value={p.plant_id}>{p.plant_name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm uppercase tracking-wide mb-2">Year</span>
          <select className="ec-select" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select a year&hellip;</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <button className="ec-btn-primary" disabled={!ready} onClick={() => onContinue(plantId, Number(year))}>
          Continue
        </button>
      </div>
    </section>
  )
}
