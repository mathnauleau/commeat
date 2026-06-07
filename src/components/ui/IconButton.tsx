import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'secondary' | 'ghost' | 'destructive'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  default:     'btn btn-primary btn-icon',
  secondary:   'btn btn-secondary btn-icon',
  ghost:       'btn btn-ghost btn-icon',
  destructive: 'btn btn-clay btn-icon',
}

export function IconButton({
  label,
  variant = 'ghost',
  type = 'button',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[variantClasses[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
