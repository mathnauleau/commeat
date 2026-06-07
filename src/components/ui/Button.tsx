import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:     'btn btn-primary',
  secondary:   'btn btn-secondary',
  ghost:       'btn btn-ghost',
  destructive: 'btn btn-clay',
}

const sizeClasses: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
