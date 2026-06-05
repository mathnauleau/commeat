import { useId, type CSSProperties, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  dirty?: boolean
}

export function Textarea({ label, error, dirty, id: externalId, className = '', style, ...props }: TextareaProps) {
  const generatedId = useId()
  const id = externalId ?? (label ? generatedId : undefined)

  const borderStyle: CSSProperties = error
    ? { borderColor: 'var(--c-error)', borderWidth: '2px' }
    : dirty
    ? { borderColor: 'var(--c-forest)' }
    : {}

  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="label">{label}</label>
      )}
      <textarea
        id={id}
        className={['textarea', className].filter(Boolean).join(' ')}
        style={{ ...borderStyle, ...style }}
        {...props}
      />
      {error && (
        <span className="hint" style={{ color: 'var(--c-error)' }}>{error}</span>
      )}
    </div>
  )
}
