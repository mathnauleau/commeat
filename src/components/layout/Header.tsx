import type { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  right?: ReactNode
}

export function Header({ left, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-surface border-b border-border-strong">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  )
}
