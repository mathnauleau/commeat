import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'
import CookingPotIcon from '../../assets/icons/cooking-pot-l.svg?react'

export interface RecipeCardProps {
  title: string
  origin: string
  tags?: string[]
  image?: string | null
  to: string
}

export function RecipeCard({ title, origin, tags = [], image, to }: RecipeCardProps) {
  return (
    <Link
      to={to}
      className="card card-hover block overflow-hidden focus:outline-none"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: '9rem', background: 'var(--bg-surface)' }}
      >
        {image
          ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <CookingPotIcon width={40} height={40} aria-hidden />
        }
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="t-h3" style={{ fontSize: 'var(--t-small)', fontWeight: 600, lineHeight: 'var(--lh-small)' }}>
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {origin && (
            <Tag style={{ fontSize: '11px', padding: '3px 8px' }}>{origin}</Tag>
          )}
          {tags.map((tag) => (
            <Tag key={tag} style={{ fontSize: '11px', padding: '3px 8px' }}>{tag}</Tag>
          ))}
        </div>
      </div>
    </Link>
  )
}
