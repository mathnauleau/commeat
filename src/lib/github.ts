export class GitHubError extends Error {
  readonly status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
  }
}

export interface GitHubAuth {
  token: string
  username: string
  repoName: string
}

function encodeToBase64(content: string): string {
  const bytes = new TextEncoder().encode(content)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function decodeFromBase64(base64: string): string {
  const clean = base64.replace(/\n/g, '')
  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

async function apiFetch(
  auth: GitHubAuth,
  method: string,
  path: string,
  body?: object,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `https://api.github.com${path}`
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

function repoPath(auth: GitHubAuth, filePath: string): string {
  return `/repos/${auth.username}/${auth.repoName}/contents/${filePath}`
}

export async function validateToken(token: string): Promise<{ username: string }> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (res.status === 401 || res.status === 403) {
    throw new GitHubError('Invalid token. Check your GitHub Personal Access Token and try again.', res.status)
  }
  if (!res.ok) throw new GitHubError(`GitHub API error: ${res.status}`, res.status)
  const { login } = await res.json()
  return { username: login }
}

export async function initRepo(auth: GitHubAuth): Promise<void> {
  const check = await apiFetch(auth, 'GET', `/repos/${auth.username}/${auth.repoName}`)
  if (check.ok) return

  if (check.status !== 404) {
    throw new GitHubError(`Could not access GitHub repository: ${check.status}`, check.status)
  }

  const create = await apiFetch(auth, 'POST', '/user/repos', {
    name: auth.repoName,
    description: 'My personal cookbook, managed by Commeat — your recipes, committed.',
    private: true,
    auto_init: true,
  })

  if (!create.ok) {
    const err = await create.json().catch(() => ({})) as Record<string, string>
    throw new GitHubError(err.message ?? `Could not create repository: ${create.status}`, create.status)
  }

  // Give GitHub a moment for the initial commit to settle before writing files
  await new Promise((r) => setTimeout(r, 1000))
}

export async function commitFile(
  auth: GitHubAuth,
  filePath: string,
  content: string,
  message: string,
): Promise<void> {
  const path = repoPath(auth, filePath)

  let sha: string | undefined
  const existing = await apiFetch(auth, 'GET', path)
  if (existing.ok) {
    const data = await existing.json() as { sha: string }
    sha = data.sha
  } else if (existing.status !== 404) {
    throw new GitHubError(`Could not check file status: ${existing.status}`, existing.status)
  }

  const res = await apiFetch(auth, 'PUT', path, {
    message,
    content: encodeToBase64(content),
    ...(sha ? { sha } : {}),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>
    throw new GitHubError(err.message ?? `Could not write file: ${res.status}`, res.status)
  }
}

export async function deleteFile(
  auth: GitHubAuth,
  filePath: string,
  message = `Remove ${filePath}`,
): Promise<void> {
  const path = repoPath(auth, filePath)
  const existing = await apiFetch(auth, 'GET', path)
  if (existing.status === 404) return
  if (!existing.ok) throw new GitHubError(`Could not check file: ${existing.status}`, existing.status)

  const { sha } = await existing.json() as { sha: string }

  const res = await apiFetch(auth, 'DELETE', path, { message, sha })

  if (!res.ok && res.status !== 404) {
    throw new GitHubError(`Could not delete file: ${res.status}`, res.status)
  }
}

export async function readFile(auth: GitHubAuth, filePath: string): Promise<string> {
  const res = await apiFetch(auth, 'GET', repoPath(auth, filePath))
  if (!res.ok) throw new GitHubError(`Could not read file: ${res.status}`, res.status)
  const { content } = await res.json() as { content: string }
  return decodeFromBase64(content)
}

const IMAGE_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
}

export async function readImageAsDataUrl(auth: GitHubAuth, filePath: string): Promise<string> {
  const res = await apiFetch(auth, 'GET', repoPath(auth, filePath))
  if (!res.ok) throw new GitHubError(`Could not read image: ${res.status}`, res.status)
  const { content } = await res.json() as { content: string }
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const mime = IMAGE_MIME[ext] ?? 'image/jpeg'
  return `data:${mime};base64,${content.replace(/\n/g, '')}`
}

export async function listRecipes(auth: GitHubAuth): Promise<string[]> {
  const res = await apiFetch(
    auth,
    'GET',
    `/repos/${auth.username}/${auth.repoName}/contents/recipes`,
  )
  if (res.status === 404) return []
  if (!res.ok) throw new GitHubError(`Could not list recipes: ${res.status}`, res.status)

  const items = await res.json() as Array<{ type: string; name: string; path: string }>
  return items
    .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
    .map((f) => f.path)
}
