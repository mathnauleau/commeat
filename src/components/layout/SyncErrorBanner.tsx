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
        background: 'var(--feedback-error-bg-subtle)',
        borderBottom: '1px solid var(--feedback-error-border-subtle)',
      }}
    >
      <p className="t-small" style={{ color: 'var(--feedback-error-text)' }}>{syncError}</p>
      <button
        type="button"
        aria-label="Dismiss sync error"
        onClick={clearSyncError}
        className="btn btn-ghost btn-icon"
        style={{ minWidth: '32px', minHeight: '32px', color: 'var(--feedback-error-text)' }}
      >
        <CloseIcon width={14} height={14} />
      </button>
    </div>
  )
}
