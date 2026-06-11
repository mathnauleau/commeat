import type { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export function Header({ left, center, right }: HeaderProps) {
  return (
    <header className="sticky z-10" style={{ top: '16px', margin: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '9999px', padding: '4px' }}>
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">{left}</div>
        {center && <div className="flex-1 flex justify-center">{center}</div>}
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      </div>
    </header>
  )
}
