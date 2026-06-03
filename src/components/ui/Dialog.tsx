import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './IconButton'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'md' | 'lg'
  children: ReactNode
}

const sizeClasses = { md: 'max-w-lg', lg: 'max-w-2xl' }

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Dialog({ open, onClose, title, size = 'md', children }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-4">
      <div className="absolute inset-0 bg-content-primary/40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={[
          'relative w-full flex flex-col bg-surface-raised rounded-xl border border-border shadow-lg',
          'max-h-[90vh]',
          sizeClasses[size],
        ].join(' ')}
      >
        {title && (
          <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 id="dialog-title" className="font-display text-lg font-medium text-content-primary">
              {title}
            </h2>
            <IconButton label="Close" variant="ghost" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
