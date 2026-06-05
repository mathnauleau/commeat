import type { CommitEntry } from '../../types'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${iso}T00:00:00`))
}

interface CommitHistoryProps {
  commits: CommitEntry[]
}

export function CommitHistory({ commits }: CommitHistoryProps) {
  if (commits.length === 0) return null

  if (commits.length === 1) {
    return (
      <section style={{ borderTop: '1px solid var(--c-line)', paddingTop: '1.5rem' }}>
        <p className="t-caption">
          First version — {formatDate(commits[0].date)}
        </p>
      </section>
    )
  }

  const sorted = [...commits].sort((a, b) => b.version - a.version)

  return (
    <section style={{ borderTop: '1px solid var(--c-line)', paddingTop: '2rem' }}>
      <h2 className="t-h3" style={{ marginBottom: 'var(--sp-5)' }}>
        Commit history
      </h2>

      <div className="timeline">
        {sorted.map((commit, i) => (
          <div
            key={commit.version}
            className={['commit', i === 0 ? 'is-current' : ''].filter(Boolean).join(' ')}
          >
            <div className="commit-msg">{commit.message}</div>
            <div className="commit-meta">
              <span className="hash">v{commit.version}</span>
              {formatDate(commit.date)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
