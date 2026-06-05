import type { CSSProperties, ReactNode } from 'react'

type Variant = 'default' | 'accent' | 'muted'

export interface BadgeProps {
  variant?: Variant
  className?: string
  children: ReactNode
}

const variantStyles: Record<Variant, CSSProperties> = {
  default: {},
  accent:  { background: 'var(--c-forest)', color: 'var(--c-paper)', borderColor: 'transparent' },
  muted:   { background: 'var(--c-forest-tint)', color: 'var(--c-ink-faint)', borderColor: 'transparent' },
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
