import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-surface-raised hover:opacity-90',
  secondary: 'bg-surface-sunken text-content-primary border border-border hover:bg-surface-raised',
  ghost: 'text-content-secondary hover:bg-surface-sunken hover:text-content-primary',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 text-sm',
  md: 'px-5 text-sm',
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
      className={[
        'inline-flex items-center justify-center gap-2 font-body font-medium rounded-lg min-h-11 transition-colors cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
