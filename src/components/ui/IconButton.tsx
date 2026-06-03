import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'ghost'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-accent text-surface-raised hover:opacity-90',
  ghost: 'text-content-secondary hover:bg-surface-sunken hover:text-content-primary',
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
      className={[
        'inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
