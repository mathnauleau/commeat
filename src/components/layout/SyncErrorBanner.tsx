import { useGitHub } from '../../hooks/useGitHub'
import CloseIcon from '../../assets/icons/close.svg?react'

export function SyncErrorBanner() {
  const { syncError, clearSyncError } = useGitHub()
  if (!syncError) return null

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 px-4 py-2"
      style={{
        background: 'rgba(160,82,45,0.08)',
        borderBottom: '1px solid rgba(160,82,45,0.2)',
      }}
    >
      <p className="t-small" style={{ color: 'var(--c-error)' }}>{syncError}</p>
      <button
        type="button"
        aria-label="Dismiss sync error"
        onClick={clearSyncError}
        className="btn btn-ghost btn-icon"
        style={{ minWidth: '32px', minHeight: '32px', color: 'var(--c-error)' }}
      >
        <CloseIcon width={14} height={14} />
      </button>
    </div>
  )
}
