function App() {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-display text-4xl font-semibold text-content-primary tracking-tight">
        Commeat
      </h1>
      <p className="font-body text-content-secondary text-lg">
        Your recipes, committed.
      </p>
      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-md bg-accent text-surface-raised font-body text-sm">
          accent
        </span>
        <span className="px-3 py-1 rounded-md bg-surface-sunken text-content-muted font-body text-sm border border-border">
          surface-sunken
        </span>
        <span className="px-3 py-1 rounded-md bg-surface-raised text-content-secondary font-body text-sm border border-border-strong">
          surface-raised
        </span>
      </div>
    </div>
  )
}

export default App
