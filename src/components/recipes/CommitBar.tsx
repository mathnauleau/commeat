import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface CommitBarProps {
  message: string
  onChange: (msg: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function CommitBar({ message, onChange, onConfirm, onCancel }: CommitBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div
      className="sticky z-10"
      style={{
        top: '4rem',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-frosted)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-3">
        <div className="flex-1">
          <Input
            placeholder="What changed? (optional)"
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <Button variant="primary" size="sm" onClick={onConfirm}>Commit</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Back</Button>
      </div>
    </div>
  )
}
