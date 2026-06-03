import matter from 'gray-matter'
import type { Recipe, CommitEntry } from '../types'

function yamlQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0]
  return String(value)
}

function extractSection(body: string, heading: string): string {
  const marker = `\n## ${heading}\n`
  const start = body.indexOf(marker)
  if (start === -1) return ''
  const contentStart = start + marker.length
  const nextSection = body.indexOf('\n## ', contentStart)
  const end = nextSection === -1 ? body.length : nextSection
  return body.slice(contentStart, end).trim()
}

function parseBulletList(text: string): string[] {
  return text
    .split('\n')
    .filter(line => /^- /.test(line))
    .map(line => line.slice(2).trim())
}

function parseNumberedList(text: string): string[] {
  return text
    .split('\n')
    .filter(line => /^\d+\. /.test(line))
    .map(line => line.replace(/^\d+\. /, '').trim())
}

function parseCommitTable(text: string): CommitEntry[] {
  const rows = text.split('\n').filter(line => /^\|/.test(line))
  return rows.slice(2).flatMap(row => {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 3) return []
    const version = parseInt(cells[0].replace(/^v/, ''), 10)
    if (isNaN(version)) return []
    return [{ version, date: cells[1], message: cells[2] }]
  })
}

export function parseRecipe(markdown: string): Recipe {
  const { data, content } = matter(markdown)

  const quoteMatch = content.match(/^> (.+)$/m)
  const notesText = extractSection(content, 'Notes')

  return {
    title: String(data.title),
    origin: String(data.origin),
    importedFrom: String(data.imported_from),
    committedAt: toIsoDate(data.committed_at),
    version: Number(data.version),
    forkOf: data.fork_of != null ? String(data.fork_of) : null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    prepTime: String(data.prep_time),
    cookTime: String(data.cook_time),
    servings: Number(data.servings),
    quote: quoteMatch ? quoteMatch[1].trim() : undefined,
    ingredients: parseBulletList(extractSection(content, 'Ingredients')),
    steps: parseNumberedList(extractSection(content, 'Steps')),
    notes: notesText || undefined,
    commits: parseCommitTable(extractSection(content, 'Commit History')),
  }
}

export function serializeRecipe(recipe: Recipe): string {
  const frontmatter = [
    `title: ${yamlQuote(recipe.title)}`,
    `origin: ${yamlQuote(recipe.origin)}`,
    `imported_from: ${yamlQuote(recipe.importedFrom)}`,
    `committed_at: '${recipe.committedAt}'`,
    `version: ${recipe.version}`,
    `fork_of: ${recipe.forkOf !== null ? yamlQuote(recipe.forkOf) : 'null'}`,
    `tags: [${recipe.tags.join(', ')}]`,
    `prep_time: ${yamlQuote(recipe.prepTime)}`,
    `cook_time: ${yamlQuote(recipe.cookTime)}`,
    `servings: ${recipe.servings}`,
  ].join('\n')

  const lines: string[] = []
  lines.push(`# ${recipe.title}`, '')

  if (recipe.quote) {
    lines.push(`> ${recipe.quote}`, '')
  }

  lines.push('## Ingredients', '')
  recipe.ingredients.forEach(i => lines.push(`- ${i}`))
  lines.push('')

  lines.push('## Steps', '')
  recipe.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('')

  if (recipe.notes) {
    lines.push('## Notes', '', recipe.notes, '')
  }

  lines.push('## Commit History', '')
  lines.push('| version | date | message |')
  lines.push('| --- | --- | --- |')
  recipe.commits.forEach(c => lines.push(`| v${c.version} | ${c.date} | ${c.message} |`))
  lines.push('')

  const body = lines.join('\n')
  return `---\n${frontmatter}\n---\n\n${body}`
}

export function appendCommit(recipe: Recipe, message: string): Recipe {
  const newVersion = recipe.version + 1
  const today = new Date().toISOString().split('T')[0]
  return {
    ...recipe,
    version: newVersion,
    committedAt: today,
    commits: [...recipe.commits, { version: newVersion, date: today, message }],
  }
}
