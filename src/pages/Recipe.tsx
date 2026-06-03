import { useParams, Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { RecipeView } from '../components/recipes/RecipeView'
import { RecipeEditor } from '../components/recipes/RecipeEditor'
import { CommitBar } from '../components/recipes/CommitBar'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { useRecipeEditor } from '../hooks/useRecipeEditor'

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Recipe() {
  const { slug = '' } = useParams()
  const {
    recipe, draft, editing, confirming,
    commitMessage, enterEdit, cancelEdit,
    updateDraft, beginCommit, cancelCommit,
    setCommitMessage, confirmCommit, isDirty,
  } = useRecipeEditor(slug)

  if (!recipe) {
    return (
      <Shell>
        <Header
          left={
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-body text-content-secondary hover:text-content-primary transition-colors min-h-11 px-1">
              <BackIcon />Shelf
            </Link>
          }
        />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center gap-5 text-center">
          <h1 className="font-display text-2xl font-medium text-content-primary">Recipe not found.</h1>
          <p className="text-content-muted font-body">This recipe may have been moved or deleted.</p>
          <Button variant="secondary" onClick={() => window.history.back()}>Back to shelf</Button>
        </main>
      </Shell>
    )
  }

  return (
    <Shell>
      <Header
        left={
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-content-secondary hover:text-content-primary transition-colors min-h-11 px-1"
          >
            <BackIcon />Shelf
          </Link>
        }
        right={
          editing ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={beginCommit}>Commit changes</Button>
            </div>
          ) : (
            <IconButton label="Edit recipe" variant="ghost" onClick={enterEdit}>
              <EditIcon />
            </IconButton>
          )
        }
      />

      {confirming && (
        <CommitBar
          message={commitMessage}
          onChange={setCommitMessage}
          onConfirm={confirmCommit}
          onCancel={cancelCommit}
        />
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {editing && draft ? (
          <RecipeEditor draft={draft} onUpdate={updateDraft} isDirty={isDirty} />
        ) : (
          <RecipeView recipe={recipe} />
        )}
      </main>
    </Shell>
  )
}
