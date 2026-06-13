export default function Header({ plant, year }) {
  return (
    <header className="bg-ink text-chalk">
      <div className="mx-auto w-full max-w-5xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="border border-chalk px-2 py-1 font-display font-bold leading-none text-lg">TC</span>
          <span className="font-display font-bold text-lg tracking-tight">The Corporate</span>
        </div>
        {plant && (
          <div className="text-right text-sm leading-tight">
            <div className="font-medium">{plant.plant_name}</div>
            <div className="text-chalk/70">FY {year}</div>
          </div>
        )}
      </div>
    </header>
  )
}
