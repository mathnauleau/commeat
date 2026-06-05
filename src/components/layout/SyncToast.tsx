import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGitHub } from '../../hooks/useGitHub'
import { IconButton } from '../ui/IconButton'
import CloseIcon from '../../assets/icons/close.svg?react'

export function SyncToast() {
  const { syncError, clearSyncError, isConnected } = useGitHub()

  useEffect(() => {
    if (!syncError || !isConnected) return
    const timer = setTimeout(clearSyncError, 6000)
    return () => clearTimeout(timer)
  }, [syncError, isConnected, clearSyncError])

  if (!syncError || !isConnected) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'var(--sp-6)',
        right: 'var(--sp-6)',
        zIndex: 50,
        maxWidth: '360px',
        background: 'var(--c-paper)',
        border: '1px solid rgba(160,82,45,0.3)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--e-3)',
        padding: 'var(--sp-4) var(--sp-3) var(--sp-4) var(--sp-5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--sp-3)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
        <p className="t-small" style={{ color: 'var(--c-error)', margin: 0, fontWeight: 500 }}>
          Sync failed — check your GitHub connection in Settings.
        </p>
        <Link
          to="/settings"
          onClick={clearSyncError}
          className="t-caption"
          style={{ color: 'var(--c-forest)', textDecoration: 'underline' }}
        >
          Go to Settings
        </Link>
      </div>
      <IconButton label="Dismiss sync error" onClick={clearSyncError}>
        <CloseIcon width={14} height={14} />
      </IconButton>
    </div>
  )
}
