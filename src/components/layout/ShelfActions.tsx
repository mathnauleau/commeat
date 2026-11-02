import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconButton } from '../ui/IconButton'
import shelfConfig from '../../shelf.json'
import PlusIcon from '../../assets/icons/plus.svg?react'
import SettingsIcon from '../../assets/icons/settings.svg?react'
import GitHubIcon from '../../assets/icons/github.svg?react'
import MenuIcon from '../../assets/icons/menu.svg?react'

const SUGGEST_URL = `https://github.com/${shelfConfig.repoOwner}/${shelfConfig.repoName}/issues/new?title=Recipe+suggestion&body=I%27d+like+to+suggest+a+recipe+for+the+cookbook.`

interface ShelfActionsProps {
  signedIn: boolean
  onAdd: () => void
}

export function ShelfActions({ signedIn, onAdd }: ShelfActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <div ref={rootRef} className="flex items-center gap-1">
      {/* Tablet / desktop: inline actions */}
      <div className="hidden sm:flex items-center gap-1">
        {!signedIn && (
          <a href={SUGGEST_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-11 no-underline">
            <GitHubIcon width={20} height={20} className="shrink-0" />
            Suggest a recipe
          </a>
        )}
        <Link to="/settings" aria-label="Settings" className="btn btn-ghost btn-icon no-underline">
          <SettingsIcon width={22} height={22} />
        </Link>
      </div>
      {signedIn && (
        <IconButton label="Commit a recipe" variant="default" onClick={onAdd}>
          <PlusIcon width={22} height={22} />
        </IconButton>
      )}
      {/* Phone: everything else lives in a menu so the header never overflows.
          sm:hidden sits on a wrapper because .btn outranks Tailwind's layered utilities */}
      <div className="sm:hidden">
        <IconButton label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <MenuIcon width={22} height={22} />
        </IconButton>
        {menuOpen && (
          <div className="menu-panel">
            {!signedIn && (
              <a href={SUGGEST_URL} target="_blank" rel="noopener noreferrer" className="menu-item" onClick={() => setMenuOpen(false)}>
                <GitHubIcon />
                Suggest a recipe
              </a>
            )}
            <Link to="/settings" className="menu-item" onClick={() => setMenuOpen(false)}>
              <SettingsIcon />
              Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
