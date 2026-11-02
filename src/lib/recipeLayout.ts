import { marked, type Token, type Tokens } from 'marked'

export type IngredientBlock =
  | { kind: 'list'; items: string[] }
  | { kind: 'html'; html: string }

export interface IngredientSection {
  heading: string
  blocks: IngredientBlock[]
}

export interface RecipeSection {
  html: string
  isHistory: boolean
}

export interface RecipeLayout {
  title: string
  image: { src: string; alt: string } | null
  tags: string[]
  prepTime: string
  origin: string
  intro: string
  ingredients: IngredientSection[]
  steps: string
  sections: RecipeSection[]
}

interface RawSection {
  heading: Tokens.Heading
  body: Token[]
}

const METADATA_KEYS = new Set(['tags', 'origin', 'preptime', 'prep time'])
const HISTORY_HEADING = /version|commit|historique/i

export function extractHeading(markdown: string): string {
  return markdown.match(/^#\s+(.+)/m)?.[1] ?? ''
}

export function extractOrigin(markdown: string): string {
  return markdown.match(/\*\*Origin:\*\*\s*([^\n*]+)/)?.[1]?.trim() ?? ''
}

export function extractTags(markdown: string): string[] {
  const raw = markdown.match(/\*\*Tags:\*\*\s*([^\n*]+)/)?.[1]?.trim() ?? ''
  return raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : []
}

export function extractPrepTime(markdown: string): string {
  return (
    markdown.match(/\*\*Prep time:\*\*\s*([^·\n*]+)/i)?.[1]?.trim() ??
    markdown.match(/\*\*PrepTime:\*\*\s*([^·\n*]+)/)?.[1]?.trim() ??
    ''
  )
}

export function extractImage(markdown: string): string | null {
  const md = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)?.[1]
  const html = markdown.match(/<img[^>]+src="(https?:\/\/[^"]+)"/)?.[1]
  return md ?? html ?? null
}

function render(tokens: Token[]): string {
  return marked.parser(tokens)
}

function isMetadata(token: Token): boolean {
  if (token.type !== 'paragraph') return false
  const keys = [...token.raw.matchAll(/\*\*([^*\n]+):\*\*/g)].map((m) => m[1].toLowerCase())
  return keys.length > 0 && keys.every((key) => METADATA_KEYS.has(key))
}

function parseImage(token: Token): RecipeLayout['image'] {
  const raw = token.raw.trim()
  const md = raw.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
  if (md) return { alt: md[1], src: md[2] }
  if (!/^<img\b[^>]*>$/.test(raw)) return null
  const src = raw.match(/src="([^"]+)"/)?.[1]
  return src ? { src, alt: raw.match(/alt="([^"]*)"/)?.[1] ?? '' } : null
}

function lists(section: RawSection): Tokens.List[] {
  return section.body.filter((t): t is Tokens.List => t.type === 'list')
}

function hasSteps(section: RawSection): boolean {
  return lists(section).some((list) => list.ordered)
}

function hasBullets(section: RawSection): boolean {
  return lists(section).length > 0 && !hasSteps(section) && !section.body.some((t) => t.type === 'table')
}

function toIngredients(section: RawSection): IngredientSection {
  return {
    heading: section.heading.text,
    blocks: section.body
      .filter((t) => t.type !== 'space')
      .map((t) =>
        t.type === 'list'
          ? { kind: 'list', items: (t as Tokens.List).items.map((item) => render(item.tokens)) }
          : { kind: 'html', html: render([t]) },
      ),
  }
}

// A lone bold line or a lone link is a label or a source button, not body copy
function renderNoteBlock(token: Token): string {
  const html = render([token])
  if (token.type !== 'paragraph') return html
  const inline = (token as Tokens.Paragraph).tokens ?? []
  if (inline.length !== 1) return html
  if (inline[0].type === 'strong') return html.replace('<p>', '<p class="prose-label">')
  if (inline[0].type === 'link') return html.replace('<p>', '<p class="prose-link">')
  return html
}

function toSection(section: RawSection): RecipeSection {
  return {
    html: [section.heading, ...section.body].map(renderNoteBlock).join(''),
    isHistory: HISTORY_HEADING.test(section.heading.text) && section.body.some((t) => t.type === 'table'),
  }
}

/**
 * Splits a recipe by structure, never by heading wording, because the shelf
 * mixes languages: bulleted ## sections before the steps become the ingredients,
 * the numbered ## sections become the steps, the rest stays in order below.
 */
export function layoutRecipe(markdown: string): RecipeLayout {
  const preamble: Token[] = []
  const raw: RawSection[] = []
  let title = ''

  for (const token of marked.lexer(markdown)) {
    if (token.type === 'heading' && token.depth === 1 && !title) {
      title = token.text
    } else if (token.type === 'heading' && token.depth === 2) {
      raw.push({ heading: token as Tokens.Heading, body: [] })
    } else if (raw.length > 0) {
      raw[raw.length - 1].body.push(token)
    } else {
      preamble.push(token)
    }
  }

  let image: RecipeLayout['image'] = null
  let intro = ''
  for (const token of preamble) {
    const parsed: RecipeLayout['image'] = image ? null : parseImage(token)
    if (parsed) image = parsed
    else if (token.type === 'blockquote') intro += render((token as Tokens.Blockquote).tokens)
    else if (token.type !== 'space' && !isMetadata(token)) intro += render([token])
  }

  const firstSteps = raw.findIndex(hasSteps)
  let stepsEnd = firstSteps
  while (stepsEnd >= 0 && stepsEnd < raw.length && hasSteps(raw[stepsEnd])) stepsEnd++

  let leading = 0
  while (leading < raw.length && hasBullets(raw[leading])) leading++
  const isIngredients = (section: RawSection, i: number) =>
    firstSteps >= 0 ? i < firstSteps && hasBullets(section) : i < leading
  const isSteps = (i: number) => i >= firstSteps && i < stepsEnd

  return {
    title,
    image,
    tags: extractTags(markdown),
    prepTime: extractPrepTime(markdown),
    origin: extractOrigin(markdown),
    intro,
    ingredients: raw.filter(isIngredients).map(toIngredients),
    steps: raw
      .filter((_, i) => isSteps(i))
      .flatMap((section) => [section.heading, ...section.body])
      .map(renderNoteBlock)
      .join(''),
    sections: raw.filter((s, i) => !isIngredients(s, i) && !isSteps(i)).map(toSection),
  }
}
