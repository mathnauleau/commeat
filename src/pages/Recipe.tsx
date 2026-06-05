import { useParams, Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { RecipeView } from '../components/recipes/RecipeView'
import { RecipeEditor } from '../components/recipes/RecipeEditor'
import { CommitBar } from '../components/recipes/CommitBar'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { useRecipeEditor } from '../hooks/useRecipeEditor'
import BackIcon from '../assets/icons/back.svg?react'
import EditIcon from '../assets/icons/edit.svg?react'
import TrashIcon from '../assets/icons/trash.svg?react'

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: 'var(--t-small)',
  color: 'var(--c-ink-soft)',
  textDecoration: 'none',
  minHeight: '44px',
  padding: '0 4px',
  transition: 'color var(--t-fast) var(--ease)',
}

export function Recipe() {
  const { slug = '' } = useParams()
  const {
    recipe, draft, editing, confirming, confirmingDelete,
    commitMessage, enterEdit, cancelEdit,
    updateDraft, beginCommit, cancelCommit,
    setCommitMessage, confirmCommit, isDirty,
    beginDelete, cancelDelete, confirmDelete,
  } = useRecipeEditor(slug)

  if (!recipe) {
    return (
      <Shell>
        <Header
          left={
            <Link to="/" style={backLinkStyle}>
              <BackIcon />Shelf
            </Link>
          }
        />
        <main className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center gap-5 text-center">
          <h1 className="t-h2">Recipe not found.</h1>
          <p className="t-lead" style={{ fontSize: 'var(--t-body)' }}>This recipe may have been moved or deleted.</p>
          <Button variant="secondary" onClick={() => window.history.back()}>Back to shelf</Button>
        </main>
      </Shell>
    )
  }

  return (
    <Shell>
      <Header
        left={
          <Link to="/" style={backLinkStyle}>
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
            <div className="flex items-center gap-1">
              <IconButton label="Delete recipe" variant="ghost" onClick={beginDelete}>
                <TrashIcon />
              </IconButton>
              <IconButton label="Edit recipe" variant="ghost" onClick={enterEdit}>
                <EditIcon />
              </IconButton>
            </div>
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

      <Dialog open={confirmingDelete} onClose={cancelDelete} title="Delete recipe">
        <p className="t-body" style={{ marginBottom: '1.5rem' }}>
          <strong>{recipe?.title}</strong> will be permanently removed from your cookbook. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={cancelDelete}>Keep it</Button>
          <Button variant="primary" size="sm" onClick={confirmDelete}>Delete recipe</Button>
        </div>
      </Dialog>

      <main className="max-w-2xl mx-auto px-4 py-8" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {editing && draft ? (
          <RecipeEditor draft={draft} onUpdate={updateDraft} isDirty={isDirty} />
        ) : (
          <RecipeView recipe={recipe} />
        )}
      </main>
    </Shell>
  )
}
