import type { HTMLAttributes, ReactNode } from 'react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function Tag({ className = '', children, ...props }: TagProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-md text-sm font-body',
        'bg-accent-soft text-content-secondary border border-border',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
