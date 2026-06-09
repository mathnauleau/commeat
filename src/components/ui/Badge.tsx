import type { CSSProperties, ReactNode } from 'react'

type Variant = 'default' | 'accent' | 'muted'

export interface BadgeProps {
  variant?: Variant
  className?: string
  children: ReactNode
}

const variantStyles: Record<Variant, CSSProperties> = {
  default: {},
  accent:  { background: 'var(--accent-primary)', color: 'var(--text-inverse)', borderColor: 'transparent' },
  muted:   { background: 'var(--accent-primary-bg)', color: 'var(--text-muted)', borderColor: 'transparent' },
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  return (
    <span
      className={['chip', className].filter(Boolean).join(' ')}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}
