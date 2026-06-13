import { useState } from 'react'
import Header from './components/Header.jsx'
import Setup from './components/Setup.jsx'
import Entry from './components/Entry.jsx'
import Review from './components/Review.jsx'
import Dashboard from './components/Dashboard.jsx'
import { plantById } from './data/registers.js'

export default function App() {
  const [view, setView] = useState('setup') // setup → entry → review → dashboard
  const [plantId, setPlantId] = useState('')
  const [year, setYear] = useState(null)
  const [lines, setLines] = useState([])

  const plant = plantId ? plantById(plantId) : null

  function continueSetup(pid, yr) {
    setPlantId(pid)
    setYear(yr)
    setView('entry')
  }

  function addLine(line) {
    setLines((ls) => [...ls, line])
  }

  function updateLine(id, line) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...line, id } : l)))
  }

  function deleteLine(id) {
    setLines((ls) => ls.filter((l) => l.id !== id))
  }

  function startOver() {
    setView('setup')
    setPlantId('')
    setYear(null)
    setLines([])
  }

  return (
    <div className="min-h-full flex flex-col">
      <Header plant={plant} year={year} />
      <main className="flex-1 mx-auto w-full max-w-5xl">
        {view === 'setup' && <Setup onContinue={continueSetup} />}
        {view === 'entry' && (
          <Entry
            plant={plant}
            year={year}
            lines={lines}
            onAdd={addLine}
            onUpdate={updateLine}
            onDelete={deleteLine}
            onReview={() => setView('review')}
          />
        )}
        {view === 'review' && (
          <Review lines={lines} onBack={() => setView('entry')} onConfirm={() => setView('dashboard')} />
        )}
        {view === 'dashboard' && (
          <Dashboard plant={plant} year={year} lines={lines} onStartOver={startOver} />
        )}
      </main>
      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-ink/60">
        EF Register v1.0 &middot; DEFRA 2025 &middot; GWP IPCC AR5 &middot; Scope 2 location-based only &middot; Session-only, no data stored.
      </footer>
    </div>
  )
}
