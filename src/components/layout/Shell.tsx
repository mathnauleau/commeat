import type { ReactNode } from 'react'
import { ParallaxBackground } from './ParallaxBackground'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-dvh font-body">
      <ParallaxBackground />
      {children}
    </div>
  )
}
