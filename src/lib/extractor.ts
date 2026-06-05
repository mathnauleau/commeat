import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Extract this recipe and return it as clean Markdown only.
Use this structure:

# [Recipe title]

**Origin:** [where it came from]
**Prep time:** [time] · **Cook time:** [time] · **Serves:** [number]

## Ingredients
- [ingredient]

## Steps
1. [step]

## Notes
[any notes]

Return only the Markdown. No preamble, no explanation, no code fences.`

function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'No API key found. Add VITE_ANTHROPIC_API_KEY to your .env.local file and restart the dev server.',
    )
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function callClaude(userContent: string): Promise<string> {
  const client = getClient()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })
  return msg.content[0].type === 'text' ? msg.content[0].text : ''
}

async function fetchPageText(url: string): Promise<string> {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  const res = await fetch(proxy, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) return ''
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style,noscript,nav,footer,header,aside').forEach((el) => el.remove())
  return (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 8000)
}

export async function extractFromUrl(url: string): Promise<string> {
  let pageText = ''
  try {
    pageText = await fetchPageText(url)
  } catch {
    // CORS or network failure — fall back to URL-only context
  }

  const content = pageText
    ? `URL: ${url}\n\nPage content:\n${pageText}`
    : `URL: ${url}\n\n(Page content could not be fetched. Extract what you can from the URL.)`

  return callClaude(content)
}

export async function extractFromText(text: string): Promise<string> {
  return callClaude(text)
}

export async function extractFromImage(file: File): Promise<string> {
  const client = getClient()
  const buffer = await file.arrayBuffer()
  const base64 = arrayBufferToBase64(buffer)
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: 'Extract the recipe from this image.' },
      ],
    }],
  })

  return msg.content[0].type === 'text' ? msg.content[0].text : ''
}
