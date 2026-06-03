import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import type { Recipe } from '../../types'

interface RecipeEditorProps {
  draft: Recipe
  onUpdate: (updates: Partial<Recipe>) => void
  isDirty: (key: keyof Recipe) => boolean
}

export function RecipeEditor({ draft, onUpdate, isDirty }: RecipeEditorProps) {
  return (
    <div className="flex flex-col gap-6">

      <Input
        label="Title"
        value={draft.title}
        dirty={isDirty('title')}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Origin"
          value={draft.origin}
          dirty={isDirty('origin')}
          placeholder="e.g. Grandma Marie"
          onChange={(e) => onUpdate({ origin: e.target.value })}
        />
        <Input
          label="Tags (comma-separated)"
          value={draft.tags.join(', ')}
          dirty={isDirty('tags')}
          placeholder="italian, family, quick"
          onChange={(e) =>
            onUpdate({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Prep time"
          value={draft.prepTime}
          dirty={isDirty('prepTime')}
          placeholder="15 min"
          onChange={(e) => onUpdate({ prepTime: e.target.value })}
        />
        <Input
          label="Cook time"
          value={draft.cookTime}
          dirty={isDirty('cookTime')}
          placeholder="45 min"
          onChange={(e) => onUpdate({ cookTime: e.target.value })}
        />
        <Input
          label="Servings"
          type="number"
          min={1}
          value={String(draft.servings)}
          dirty={isDirty('servings')}
          onChange={(e) => onUpdate({ servings: Number(e.target.value) || 1 })}
        />
      </div>

      <Input
        label="Quote (optional)"
        value={draft.quote ?? ''}
        dirty={isDirty('quote')}
        placeholder="Something wise someone said about this dish…"
        onChange={(e) => onUpdate({ quote: e.target.value || undefined })}
      />

      <Textarea
        label="Ingredients (one per line)"
        value={draft.ingredients.join('\n')}
        dirty={isDirty('ingredients')}
        rows={draft.ingredients.length + 2}
        placeholder="800g San Marzano tomatoes"
        onChange={(e) => onUpdate({ ingredients: e.target.value.split('\n') })}
      />

      <Textarea
        label="Steps (one per line)"
        value={draft.steps.join('\n')}
        dirty={isDirty('steps')}
        rows={draft.steps.length + 2}
        placeholder="Warm olive oil in a wide pan over medium heat."
        onChange={(e) => onUpdate({ steps: e.target.value.split('\n') })}
      />

      <Textarea
        label="Notes (optional)"
        value={draft.notes ?? ''}
        dirty={isDirty('notes')}
        rows={3}
        placeholder="Anything worth remembering for next time…"
        onChange={(e) => onUpdate({ notes: e.target.value || undefined })}
      />

    </div>
  )
}
