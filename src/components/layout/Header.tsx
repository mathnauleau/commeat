import type { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export function Header({ left, center, right }: HeaderProps) {
  return (
    <header className="w-full max-w-6xl mx-auto px-5 sm:px-10 pt-5 pb-2 flex flex-col gap-3">
      {/* Top row: logo + actions (always). min-w-0 lets the left slot shrink instead of overflowing */}
      <div className="min-h-11 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">{left}</div>
        {center && <div className="hidden sm:flex flex-1 mx-auto max-w-100">{center}</div>}
        <div className="relative ml-auto flex items-center gap-1 shrink-0">{right}</div>
      </div>
      {/* Bottom row: search on mobile only */}
      {center && <div className="sm:hidden">{center}</div>}
    </header>
  )
}
