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
        bottom: 'var(--spacing-6)',
        right: 'var(--spacing-6)',
        zIndex: 50,
        maxWidth: '360px',
        background: 'var(--background-base)',
        border: '1px solid var(--feedback-error-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--elevation-3)',
        padding: 'var(--spacing-4) var(--spacing-3) var(--spacing-4) var(--spacing-5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-3)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
        <p className="t-small" style={{ color: 'var(--feedback-error-text)', margin: 0, fontWeight: 500 }}>
          Sync failed — check your GitHub connection in Settings.
        </p>
        <Link
          to="/settings"
          onClick={clearSyncError}
          className="t-caption"
          style={{ color: 'var(--text-link)', textDecoration: 'underline' }}
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
