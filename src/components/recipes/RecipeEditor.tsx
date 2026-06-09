import { Textarea } from '../ui/Textarea'

interface RecipeEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RecipeEditor({ value, onChange }: RecipeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={Math.max(20, value.split('\n').length + 4)}
      style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6 }}
    />
  )
}
