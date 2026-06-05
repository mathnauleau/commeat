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
