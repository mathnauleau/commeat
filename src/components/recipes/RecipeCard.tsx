import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'

export interface RecipeCardProps {
  title: string
  origin: string
  to: string
}

export function RecipeCard({ title, origin, to }: RecipeCardProps) {
  return (
    <Link
      to={to}
      className="card card-hover block overflow-hidden focus:outline-none"
      style={{ textDecoration: 'none' }}
    >
      {/* Illustration placeholder */}
      <div
        className="flex items-center justify-center"
        style={{ height: '9rem', background: 'var(--c-forest-tint)' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M20 6 C14 6 8 8 8 12 L8 32 C8 34 10 35 12 35 L20 35 L28 35 C30 35 32 34 32 32 L32 12 C32 8 26 6 20 6 Z"
            stroke="var(--c-line-sage)"
            strokeWidth="1"
          />
          <line x1="20" y1="6" x2="20" y2="35" stroke="var(--c-line-sage)" strokeWidth="1" />
          <line x1="11" y1="17" x2="18" y2="17" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
          <line x1="11" y1="21" x2="18" y2="21" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
          <line x1="11" y1="25" x2="16" y2="25" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="17" x2="29" y2="17" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="21" x2="29" y2="21" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="25" x2="27" y2="25" stroke="var(--c-line-sage)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="t-h3" style={{ fontSize: 'var(--t-small)', fontWeight: 600, lineHeight: 'var(--lh-small)' }}>
          {title}
        </h3>
        {origin && (
          <Tag style={{ fontSize: '11px', padding: '3px 8px' }}>{origin}</Tag>
        )}
      </div>
    </Link>
  )
}
