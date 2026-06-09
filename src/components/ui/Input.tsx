import { useId, type CSSProperties, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  dirty?: boolean
}

export function Input({ label, error, dirty, id: externalId, className = '', style, ...props }: InputProps) {
  const generatedId = useId()
  const id = externalId ?? (label ? generatedId : undefined)

  const borderStyle: CSSProperties = error
    ? { borderColor: 'var(--feedback-error-text)', borderWidth: '2px' }
    : dirty
    ? { borderColor: 'var(--accent-primary)' }
    : {}

  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="label">{label}</label>
      )}
      <input
        id={id}
        className={['input', className].filter(Boolean).join(' ')}
        style={{ ...borderStyle, ...style }}
        {...props}
      />
      {error && (
        <span className="hint" style={{ color: 'var(--feedback-error-text)' }}>{error}</span>
      )}
    </div>
  )
}
