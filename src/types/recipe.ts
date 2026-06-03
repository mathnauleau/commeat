export interface CommitEntry {
  version: number
  date: string
  message: string
}

export interface Recipe {
  title: string
  origin: string
  importedFrom: string
  committedAt: string
  version: number
  forkOf: string | null
  tags: string[]
  prepTime: string
  cookTime: string
  servings: number
  quote?: string
  ingredients: string[]
  steps: string[]
  notes?: string
  commits: CommitEntry[]
}

export interface ShelfConfig {
  theme: string
  cardLayout: 'portrait'
  printFormat: 'A5'
}
