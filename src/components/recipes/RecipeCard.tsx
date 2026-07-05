import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'
import CookingPotIcon from '../../assets/icons/cooking-pot-l.svg?react'
import ClockIcon from '../../assets/icons/clock.svg?react'

export interface RecipeCardProps {
  title: string
  origin: string
  tags?: string[]
  prepTime?: string
  image?: string | null
  to: string
}

export function RecipeCard({ title, origin, tags = [], prepTime, image, to }: RecipeCardProps) {
  return (
    <Link
      to={to}
      className="card card-hover block overflow-hidden focus:outline-none"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: '10rem', background: 'var(--background-surface-raised)' }}
      >
        {image
          ? <img src={image} />
          : <CookingPotIcon width={40} height={40} aria-hidden />
        }
      </div>

      {/* Card body */}
      <div className="px-4 pt-2 flex flex-col gap-1" style={{ paddingBottom: '16px' }}>
        <h3>
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {origin && (
            <Tag>{origin}</Tag>
          )}
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {prepTime && (
            <Tag>
              <ClockIcon style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />
              {prepTime}
            </Tag>
          )}
        </div>
      </div>
    </Link>
  )
}
