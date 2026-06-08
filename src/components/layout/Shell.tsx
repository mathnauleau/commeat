import type { ReactNode } from 'react'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return <div className="min-h-dvh font-body">{children}</div>
}
