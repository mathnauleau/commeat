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
      className="bg-error/10 border-b border-error/30 px-4 py-2.5 flex items-center justify-between gap-4"
    >
      <p className="text-sm font-body text-error leading-snug">{syncError}</p>
      <button
        type="button"
        aria-label="Dismiss sync error"
        onClick={clearSyncError}
        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded text-error hover:bg-error/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
      >
        <XIcon />
      </button>
    </div>
  )
}
