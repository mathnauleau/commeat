import { useGitHub } from '../../hooks/useGitHub'

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

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
        <XIcon />
      </button>
    </div>
  )
}
