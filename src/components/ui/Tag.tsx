import type { HTMLAttributes, ReactNode } from 'react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function Tag({ className = '', children, ...props }: TagProps) {
  return (
    <span className={['tag', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  )
}
