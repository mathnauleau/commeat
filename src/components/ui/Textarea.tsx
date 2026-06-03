import { useId, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  dirty?: boolean
}

export function Textarea({ label, error, dirty, id: externalId, className = '', ...props }: TextareaProps) {
  const generatedId = useId()
  const id = externalId ?? (label ? generatedId : undefined)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-content-primary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[
          'w-full bg-surface-raised rounded-lg px-3 py-3 text-sm font-body text-content-primary',
          'placeholder:text-content-muted transition-colors resize-y min-h-24',
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
