import { Badge } from '../ui/Badge'
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
  if (commits.length <= 1) return null

  const sorted = [...commits].sort((a, b) => b.version - a.version)

  return (
    <section className="border-t border-border pt-8 flex flex-col gap-4">
      <h2 className="font-display text-lg font-medium text-content-primary">
        Commit history
      </h2>

      <div className="flex flex-col">
        {sorted.map((commit, i) => (
          <div
            key={commit.version}
            className={[
              'flex items-start gap-4 py-3',
              i < sorted.length - 1 ? 'border-b border-border' : '',
            ].join(' ')}
          >
            <Badge className="shrink-0 mt-0.5">v{commit.version}</Badge>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-body text-content-primary leading-snug">
                {commit.message}
              </span>
              <span className="text-xs font-body text-content-muted">
                {formatDate(commit.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
