import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useGitHub } from '../hooks/useGitHub'

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-medium text-content-primary">{children}</h2>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-body font-medium text-content-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm font-body text-content-primary">{value}</span>
    </div>
  )
}

function ConnectedSection({ username, onDisconnect }: { username: string; onDisconnect: () => void }) {
  const repoUrl = `https://github.com/${username}/commeat-${username}`
  const profileUrl = `https://github.com/${username}`
  const avatarUrl = `https://github.com/${username}.png`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={`${username}'s GitHub avatar`}
          className="w-12 h-12 rounded-full border border-border bg-surface-sunken"
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body font-medium text-content-primary hover:text-accent transition-colors"
          >
            @{username}
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-body text-content-secondary hover:text-accent transition-colors truncate"
          >
            commeat-{username} ↗
          </a>
        </div>
        <Badge variant="accent">Connected</Badge>
      </div>

      <div>
        <Button variant="ghost" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    </div>
  )
}

function DisconnectedSection() {
  const { connect } = useGitHub()
  const [token, setToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    const trimmed = token.trim()
    if (!trimmed) return
    setConnecting(true)
    setError(null)
    try {
      await connect(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Check your token and try again.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-body text-content-secondary leading-relaxed">
        Connect a GitHub account to sync your recipes as Markdown files in a private repo.
        Your recipes live in your account — Commeat just commits them.
      </p>

      <div className="flex flex-col gap-3">
        <Input
          label="GitHub Personal Access Token"
          type="password"
          placeholder="ghp_…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConnect() }}
          error={error ?? undefined}
          autoComplete="off"
        />
        <p className="text-xs font-body text-content-muted">
          Needs <code className="bg-surface-sunken px-1 py-0.5 rounded text-content-secondary">repo</code> scope.
          Generate one in GitHub → Settings → Developer settings → Personal access tokens.
        </p>
      </div>

      <Button
        variant="primary"
        onClick={handleConnect}
        disabled={!token.trim() || connecting}
      >
        <GitHubIcon />
        {connecting ? 'Connecting…' : 'Connect GitHub'}
      </Button>
    </div>
  )
}

export function Settings() {
  const { isConnected, username, disconnect } = useGitHub()

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
      />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">

        {/* GitHub */}
        <section className="flex flex-col gap-5">
          <SectionHeading>GitHub</SectionHeading>
          <Card className="p-6">
            {isConnected && username ? (
              <ConnectedSection username={username} onDisconnect={disconnect} />
            ) : (
              <DisconnectedSection />
            )}
          </Card>
        </section>

        {/* Shelf configuration */}
        <section className="flex flex-col gap-5">
          <SectionHeading>Shelf</SectionHeading>
          <Card className="p-6 flex flex-col gap-6">

            {/* Theme */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-body font-medium text-content-primary">Theme</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed="true"
                  className="px-4 py-2 rounded-lg text-sm font-body font-medium border-2 border-accent bg-accent text-surface-raised cursor-default min-h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Botanical
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg text-sm font-body border border-border text-content-muted cursor-not-allowed min-h-11 flex items-center gap-2"
                >
                  Linen
                  <span className="text-xs text-content-muted">Coming soon</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg text-sm font-body border border-border text-content-muted cursor-not-allowed min-h-11 flex items-center gap-2"
                >
                  Dusk
                  <span className="text-xs text-content-muted">Coming soon</span>
                </button>
              </div>
            </div>

            <div className="flex gap-8 border-t border-border pt-5">
              <ReadOnlyField label="Card layout" value="Portrait" />
              <ReadOnlyField label="Print format" value="A5" />
            </div>

          </Card>
        </section>

      </main>
    </Shell>
  )
}
