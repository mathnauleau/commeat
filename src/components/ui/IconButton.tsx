import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'ghost'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  default: 'btn btn-primary btn-icon',
  ghost:   'btn btn-ghost btn-icon',
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
