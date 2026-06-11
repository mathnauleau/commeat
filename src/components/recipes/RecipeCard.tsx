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
        style={{ height: '10rem', background: 'var(--bg-surface-raised)' }}
      >
        {image
          ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '8px solid white', borderRadius: '16px' }} />
          : <CookingPotIcon width={40} height={40} aria-hidden />
        }
      </div>

      {/* Card body */}
      <div className="px-4 pt-2 flex flex-col gap-1" style={{ paddingBottom: '16px' }}>
        <h3 className="t-h3" style={{ fontSize: 'var(--t-small)', fontWeight: 600, lineHeight: 'var(--lh-small)' }}>
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {origin && (
            <Tag style={{ fontSize: '12px', padding: '4px 8px' }}>{origin}</Tag>
          )}
          {tags.map((tag) => (
            <Tag key={tag} style={{ fontSize: '12px', padding: '4px 8px' }}>{tag}</Tag>
          ))}
        </div>
      </div>
    </Link>
  )
}
