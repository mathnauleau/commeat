import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './IconButton'
import CloseIcon from '../../assets/icons/close.svg?react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'md' | 'lg'
  children: ReactNode
}

const sizeStyles = {
  md: { maxWidth: '32rem' },
  lg: { maxWidth: '42rem' },
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
      <div
        className="absolute inset-0"
        style={{ background: 'var(--overlay-bg)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className="card relative w-full flex flex-col max-h-[80vh]"
        style={{ ...sizeStyles[size], boxShadow: 'var(--e-3)' }}
      >
        {title && (
          <div
            className="flex-none flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <h2
              id="dialog-title"
              className="t-h3"
              style={{ margin: 0 }}
            >
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
