import { afterEach, describe, expect, it, vi } from 'vitest'
import { GitHubError, RateLimitError, listRecipes, readFile, readImageUrl, toReadProblem } from './github'

const SIGNED_OUT = { username: 'cook', repoName: 'recipes' }
const SIGNED_IN = { ...SIGNED_OUT, token: 'ghp_test' }

function apiFile(text: string): Response {
  return Response.json({ content: btoa(text) })
}

function mockFetch(respond: (url: string) => Response | Promise<Response>) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(respond(String(input))))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('readFile', () => {
  it('reads raw files without touching the API when signed out', async () => {
    const fetchMock = mockFetch(() => new Response('# Scones'))
    await expect(readFile(SIGNED_OUT, 'recipes/classic scones.md')).resolves.toBe('# Scones')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('https://raw.githubusercontent.com/cook/recipes/HEAD/recipes/classic%20scones.md')
  })

  it('falls back to the API when the raw file fails', async () => {
    mockFetch((url) => url.includes('raw.') ? new Response('', { status: 500 }) : apiFile('# From API'))
    await expect(readFile(SIGNED_OUT, 'recipes/a.md')).resolves.toBe('# From API')
  })

  it('falls back to the API when the raw request never lands', async () => {
    mockFetch((url) => {
      if (url.includes('raw.')) throw new TypeError('Failed to fetch')
      return apiFile('# From API')
    })
    await expect(readFile(SIGNED_OUT, 'recipes/a.md')).resolves.toBe('# From API')
  })

  it('stays on the API when signed in, so a commit shows up at once', async () => {
    const fetchMock = mockFetch(() => apiFile('# Fresh'))
    await readFile(SIGNED_IN, 'recipes/a.md')
    expect(fetchMock.mock.calls[0][0]).toContain('api.github.com')
  })
})

describe('readImageUrl', () => {
  it('hands signed-out readers a raw URL without fetching', async () => {
    const fetchMock = mockFetch(() => new Response())
    await expect(readImageUrl(SIGNED_OUT, 'images/a.jpg')).resolves.toBe('https://raw.githubusercontent.com/cook/recipes/HEAD/images/a.jpg')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('rate limits', () => {
  function limited(status: number, headers: Record<string, string>, message = 'API rate limit exceeded') {
    return () => Response.json({ message }, { status, headers })
  }

  it('reads the reset time from a spent allowance', async () => {
    mockFetch(limited(403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000000' }))
    const err = await listRecipes(SIGNED_OUT).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(RateLimitError)
    expect((err as RateLimitError).resetAt).toEqual(new Date(1800000000 * 1000))
  })

  it('recognises a 429 and uses Retry-After when that is all it gets', async () => {
    vi.setSystemTime(new Date('2026-11-02T10:00:00Z'))
    mockFetch(limited(429, { 'retry-after': '60' }))
    const err = await listRecipes(SIGNED_OUT).catch((e: unknown) => e) as RateLimitError
    expect(err.resetAt).toEqual(new Date('2026-11-02T10:01:00Z'))
    vi.useRealTimers()
  })

  it('catches a secondary limit, which keeps requests remaining', async () => {
    mockFetch(limited(403, { 'x-ratelimit-remaining': '12' }, 'You have exceeded a secondary rate limit'))
    await expect(listRecipes(SIGNED_OUT)).rejects.toBeInstanceOf(RateLimitError)
  })

  it('does not mistake a permissions error for a rate limit', async () => {
    mockFetch(limited(403, { 'x-ratelimit-remaining': '42' }, 'Resource not accessible'))
    const err = await listRecipes(SIGNED_OUT).catch((e: unknown) => e)
    expect(err).not.toBeInstanceOf(RateLimitError)
    expect(err).toBeInstanceOf(GitHubError)
  })

  it('treats a missing recipes folder as an empty shelf', async () => {
    mockFetch(() => new Response('', { status: 404 }))
    await expect(listRecipes(SIGNED_OUT)).resolves.toEqual([])
  })
})

describe('toReadProblem', () => {
  it('sorts failures by what the reader can do about them', () => {
    const resetAt = new Date(0)
    expect(toReadProblem(new RateLimitError(resetAt))).toEqual({ kind: 'rate-limit', resetAt })
    expect(toReadProblem(new GitHubError('gone', 404))).toEqual({ kind: 'not-found' })
    expect(toReadProblem(new GitHubError('boom', 500))).toEqual({ kind: 'unreachable' })
    expect(toReadProblem(new TypeError('Failed to fetch'))).toEqual({ kind: 'unreachable' })
  })
})
