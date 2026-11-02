import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { ReadProblem } from '../../lib/github'
import GitHubIcon from '../../assets/icons/github.svg?react'

interface ReadProblemNoticeProps {
  problem: ReadProblem
  signedIn: boolean
  onRetry: () => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ReadProblemNotice({ problem, signedIn, onRetry }: ReadProblemNoticeProps) {
  let title: string
  let body: string
  let action: ReactNode = <Button variant="primary" onClick={onRetry}>Try again</Button>

  if (problem.kind === 'rate-limit') {
    title = 'GitHub needs a breather.'
    body = problem.resetAt
      ? `Too many requests from this connection for now. Back around ${formatTime(problem.resetAt)}.`
      : 'Too many requests from this connection for now. Give it a little while.'
  } else if (problem.kind === 'not-found') {
    title = 'Recipe not found.'
    body = 'It may have been renamed or taken off the shelf.'
    action = <Link to="/" className="btn btn-secondary min-h-11 no-underline">Back to shelf</Link>
  } else {
    title = 'Couldn’t reach your cookbook.'
    body = 'GitHub didn’t answer. Check your connection and try again.'
  }

  return (
    <div className="empty" role="alert">
      <div className="empty-mark" style={{ background: 'var(--clay-100)', color: 'var(--orange-700)' }}>
        <GitHubIcon />
      </div>
      <h2 className="t-h3">{title}</h2>
      <p>{body}</p>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {action}
        {signedIn && problem.kind === 'unreachable' && (
          <Link to="/settings" className="btn btn-secondary min-h-11 no-underline">Go to Settings</Link>
        )}
      </div>
    </div>
  )
}
