import { useMemo, useState } from 'react'
import { categoriesForPlant, fuelsForPlantCategory, efRow } from '../data/registers.js'
import { makeLine, sortByQuarter, QUARTERS } from '../lib/calc.js'

export default function Entry({ plant, year, lines, onAdd, onUpdate, onDelete, onReview }) {
  const categories = useMemo(() => categoriesForPlant(plant.plant_id), [plant.plant_id])

  const [quarter, setQuarter] = useState('Q1')
  const [category, setCategory] = useState('')
  const [fuel, setFuel] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  const fuels = useMemo(
    () => (category ? fuelsForPlantCategory(plant.plant_id, category) : []),
    [plant.plant_id, category],
  )
  const unit = category && fuel ? (efRow(plant.plant_id, category, fuel)?.unit ?? '') : ''

  function resetForm() {
    setQuarter('Q1')
    setCategory('')
    setFuel('')
    setQuantity('')
    setError('')
    setEditingId(null)
  }

  function onCategoryChange(value) {
    setCategory(value)
    setFuel('') // dependent field resets when the category changes
    setError('')
  }

  function submit() {
    setError('')
    if (!category || !fuel) {
      setError('Select a category and a fuel/substance.')
      return
    }
    const q = Number(quantity)
    if (quantity === '' || !Number.isFinite(q) || q <= 0) {
      setError('Quantity must be a number greater than zero.')
      return
    }
    const duplicate = lines.some(
      (l) => l.id !== editingId && l.quarter === quarter && l.category === category && l.fuel === fuel,
    )
    if (duplicate) {
      setError('A line for this quarter, category and fuel/substance already exists.')
      return
    }
    const line = makeLine({ quarter, category, fuel, quantity: q, plantId: plant.plant_id })
    if (!line) {
      setError('That combination is not valid for this plant.')
      return
    }
    if (editingId) onUpdate(editingId, line)
    else onAdd(line)
    resetForm()
  }

  function startEdit(l) {
    setEditingId(l.id)
    setQuarter(l.quarter)
    setCategory(l.category)
    setFuel(l.fuel)
    setQuantity(String(l.quantity))
    setError('')
  }

  const rows = sortByQuarter(lines)

  return (
    <section className="px-6 py-10">
      <h2 className="text-2xl mb-1">Energy entry</h2>
      <p className="text-ink/70 mb-6">
        Build line items through the cascade. Categories, fuels and units are constrained by the
        emission-factor register, so an invalid combination cannot be entered.
      </p>

      <div className="border border-ink p-6 mb-8">
        <h3 className="text-lg mb-4">{editingId ? 'Edit line item' : 'Add a line item'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="block text-sm uppercase tracking-wide mb-2">Quarter</span>
            <select className="ec-select" value={quarter} onChange={(e) => setQuarter(e.target.value)}>
              {QUARTERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm uppercase tracking-wide mb-2">Category</span>
            <select className="ec-select" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">Select a category&hellip;</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm uppercase tracking-wide mb-2">Fuel / Substance</span>
            <select
              className="ec-select"
              value={fuel}
              disabled={!category}
              onChange={(e) => {
                setFuel(e.target.value)
                setError('')
              }}
            >
              <option value="">{category ? 'Select a fuel/substance…' : 'Select a category first'}</option>
              {fuels.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm uppercase tracking-wide mb-2">Unit (auto-set)</span>
            <input className="ec-input" value={unit} readOnly placeholder="—" />
          </label>

          <label className="block md:max-w-xs">
            <span className="block text-sm uppercase tracking-wide mb-2">Quantity</span>
            <input
              className="ec-input"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </label>
        </div>

        {error && <p className="ec-error mt-4">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button className="ec-btn-primary" onClick={submit}>
            {editingId ? 'Save changes' : 'Add line'}
          </button>
          {editingId && (
            <button className="ec-btn" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      <h3 className="text-lg mb-3">Line items ({rows.length})</h3>
      {rows.length === 0 ? (
        <p className="text-ink/60 mb-8">No line items yet. Add at least one to continue.</p>
      ) : (
        <div className="overflow-x-auto border border-ink mb-8">
          <table className="w-full text-sm">
            <thead className="bg-ink text-chalk">
              <tr>
                <th className="text-left px-3 py-2">Quarter</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">Fuel / Substance</th>
                <th className="text-left px-3 py-2">Unit</th>
                <th className="text-right px-3 py-2">Quantity</th>
                <th className="text-left px-3 py-2">Flag</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-ink/20 align-middle">
                  <td className="px-3 py-2">{l.quarter}</td>
                  <td className="px-3 py-2">{l.category}</td>
                  <td className="px-3 py-2">{l.fuel}</td>
                  <td className="px-3 py-2">{l.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.quantity}</td>
                  <td className="px-3 py-2">
                    {l.montrealProtocol && <span className="ec-tag">Memo &mdash; excl. Scope 1</span>}
                    {l.status === 'PROVISIONAL' && <span className="ec-tag">Provisional EF</span>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button className="underline mr-3" onClick={() => startEdit(l)}>Edit</button>
                    <button className="underline" onClick={() => onDelete(l.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="ec-btn-primary" disabled={rows.length === 0} onClick={onReview}>
        Review &amp; calculate
      </button>
    </section>
  )
}
