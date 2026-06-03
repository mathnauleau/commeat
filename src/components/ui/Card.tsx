import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={['bg-surface-raised border border-border rounded-lg', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
