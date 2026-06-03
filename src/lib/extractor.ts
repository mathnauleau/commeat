import Anthropic from '@anthropic-ai/sdk'
import type { Recipe } from '../types'

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided content and return it as a valid JSON object.

The JSON must match this exact structure:
{
  "title": "string — the recipe name",
  "origin": "string — who or where this recipe is from (e.g. 'Grandma Marie', 'The Guardian', 'nytimes.com')",
  "tags": ["array of 2–4 lowercase tags, e.g. italian, vegetarian, quick"],
  "prepTime": "string — e.g. '15 min'",
  "cookTime": "string — e.g. '45 min'",
  "servings": 4,
  "quote": "optional string — a memorable quote or tip about the dish, omit key if none",
  "ingredients": ["array — one ingredient per item with quantities"],
  "steps": ["array — one step per item, written as clear instructions starting with a verb"],
  "notes": "optional string — additional tips, omit key if none"
}

Rules:
- Return ONLY the JSON object. No markdown fences, no explanation, no preamble.
- ingredients and steps must be non-empty arrays.
- If a field cannot be determined, use an empty string or 0 for numbers.`

function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'No API key found. Add VITE_ANTHROPIC_API_KEY to your .env.local file and restart the dev server.',
    )
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

function parseResponse(text: string): Partial<Recipe> {
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean) as Partial<Recipe>
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function callClaude(userContent: string): Promise<Partial<Recipe>> {
  const client = getClient()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return parseResponse(text)
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

export async function extractFromUrl(url: string): Promise<Partial<Recipe>> {
  let pageText = ''
  try {
    pageText = await fetchPageText(url)
  } catch {
    // CORS or network failure — fall back to URL-only context
  }

  const hostname = new URL(url).hostname.replace(/^www\./, '')
  const content = pageText
    ? `URL: ${url}\n\nPage content:\n${pageText}`
    : `URL: ${url}\n\n(Page content could not be fetched. Extract what metadata you can from the URL, and use placeholder values for anything you cannot determine.)`

  const partial = await callClaude(content)
  return {
    ...partial,
    importedFrom: url,
    origin: partial.origin || `From ${hostname}`,
  }
}

export async function extractFromText(text: string): Promise<Partial<Recipe>> {
  const partial = await callClaude(text)
  return { ...partial, importedFrom: 'manual entry' }
}

export async function extractFromImage(file: File): Promise<Partial<Recipe>> {
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

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return { ...parseResponse(text), importedFrom: file.name }
}
