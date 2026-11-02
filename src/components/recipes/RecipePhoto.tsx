import { useState } from 'react'
import { recipeArt } from '../../lib/recipeArt'

interface RecipePhotoProps {
  src?: string | null
  alt?: string
  slug: string
  className: string
}

// A missing photo and a dead link look the same to the reader: felt art instead
export function RecipePhoto({ src, alt = '', slug, className }: RecipePhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const art = recipeArt(slug)
  const photo = src && src !== failedSrc ? src : null

  return (
    <div className={className} style={{ background: photo ? 'var(--bg-surface)' : art.tint }}>
      {photo
        ? <img className="washed" src={photo} alt={alt} loading="lazy" onError={() => setFailedSrc(photo)} />
        : <img className="card-art" src={art.src} alt="" style={{ transform: `rotate(${art.rotate}deg)` }} />
      }
    </div>
  )
}
