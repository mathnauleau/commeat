import type { ReactNode } from 'react'

interface HeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export function Header({ left, center, right }: HeaderProps) {
  return (
    <header
      className="sticky z-10"
      style={{
        top: '16px',
        margin: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: center ? 'clamp(24px, 5vw, 9999px)' : '9999px',
        padding: '4px',
      }}
    >
      {/* Top row: logo + buttons (always) */}
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">{left}</div>
        {center && <div className="hidden sm:flex flex-1 justify-center" style={{ maxWidth: '24rem', margin: '0 auto' }}>{center}</div>}
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      </div>
      {/* Bottom row: search on mobile only */}
      {center && (
        <div className="sm:hidden px-4 pb-3">
          {center}
        </div>
      )}
    </header>
  )
}
