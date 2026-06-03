import type { ReactNode } from 'react'

type Variant = 'default' | 'accent' | 'muted'

export interface BadgeProps {
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-sunken text-content-secondary border border-border',
  accent: 'bg-accent text-surface-raised',
  muted: 'bg-accent-soft text-content-muted',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
