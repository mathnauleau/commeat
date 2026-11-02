import { Link } from 'react-router-dom'
import { RecipePhoto } from './RecipePhoto'
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
  const meta = [origin, ...tags].filter(Boolean).join(' · ')

  return (
    <Link to={to} className="card card-recipe card-hover">
      <RecipePhoto className="card-media" src={image} slug={to} />

      <div className="flex flex-col gap-1 px-2">
        <h3>{title}</h3>
        <div className="card-meta">
          {prepTime && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon width={14} height={14} aria-hidden />
              {prepTime}
            </span>
          )}
          {meta && <span>{meta}</span>}
        </div>
      </div>
    </Link>
  )
}
