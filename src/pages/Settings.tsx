import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useGitHub } from '../hooks/useGitHub'
import shelfConfig from '../shelf.json'
import BackIcon from '../assets/icons/back.svg?react'
import GitHubIcon from '../assets/icons/github.svg?react'

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
          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
        />
        <div className="flex flex-col gap-1 min-w-0">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--t-body)' }}
          >
            @{username}
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="t-caption"
            style={{ color: 'var(--text-link)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            commeat-{username} ↗
          </a>
        </div>
        <span className="hash" style={{ marginLeft: 'auto', flexShrink: 0 }}>Connected</span>
      </div>
      <div>
        <Button variant="destructive" size="sm" onClick={onDisconnect}>Disconnect</Button>
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
      <p style={{ fontSize: 'var(--t-body)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)', margin: 0 }}>
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
        <p className="hint">
          Needs <code style={{ fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '1px 5px', borderRadius: 'var(--r-sm)' }}>repo</code> scope.
          GitHub → Settings → Developer settings → Personal access tokens.
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="t-h3">{children}</h2>
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="overline">{label}</span>
      <span style={{ fontSize: 'var(--t-body)', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: 'var(--t-small)',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  minHeight: '44px',
  padding: '0 4px',
  transition: 'color var(--t-fast) var(--ease)',
}

export function Settings() {
  const { isConnected, username, disconnect } = useGitHub()

  return (
    <Shell>
      <Header
        left={
          <Link to="/" style={backLinkStyle}>
            <BackIcon />Shelf
          </Link>
        }
      />

      <main className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-10" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

        {/* GitHub */}
        <section className="flex flex-col gap-4">
          <SectionHeading>GitHub</SectionHeading>
          <Card className="p-6">
            {isConnected && username ? (
              <ConnectedSection username={username} onDisconnect={disconnect} />
            ) : (
              <DisconnectedSection />
            )}
          </Card>
          <Card className="p-6">
            <ReadOnlyField label="Cookbook repo" value={shelfConfig.repoName} />
          </Card>
        </section>

        {/* Shelf configuration */}
        <section className="flex flex-col gap-4">
          <SectionHeading>Shelf</SectionHeading>
          <Card className="p-6 flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <span className="label">Theme</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed="true"
                  className="btn btn-primary btn-sm"
                  style={{ cursor: 'default', borderRadius: 'var(--r-md)' }}
                >
                  Botanical
                </button>
                <button
                  type="button"
                  disabled
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--r-md)', gap: '6px' }}
                >
                  Linen
                  <span className="t-caption" style={{ color: 'var(--text-muted)' }}>Coming soon</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--r-md)', gap: '6px' }}
                >
                  Dusk
                  <span className="t-caption" style={{ color: 'var(--text-muted)' }}>Coming soon</span>
                </button>
              </div>
            </div>

            <div className="flex gap-8" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--sp-5)' }}>
              <ReadOnlyField label="Card layout" value="Portrait" />
              <ReadOnlyField label="Print format" value="A5" />
            </div>

          </Card>
        </section>

      </main>
    </Shell>
  )
}
