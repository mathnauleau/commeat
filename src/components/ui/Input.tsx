import { useId, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  dirty?: boolean
}

export function Input({ label, error, dirty, id: externalId, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const id = externalId ?? (label ? generatedId : undefined)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-content-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full bg-surface-raised rounded-lg px-3 py-3 text-sm font-body text-content-primary',
          'placeholder:text-content-muted transition-colors min-h-11',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          error
            ? 'border-2 border-error'
            : dirty
            ? 'border border-accent'
            : 'border border-border focus:border-accent',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <span className="text-xs font-body text-error">{error}</span>
      )}
    </div>
  )
}
