import { marked } from 'marked'

interface RecipeViewProps {
  markdown: string
}

export function RecipeView({ markdown }: RecipeViewProps) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: marked.parse(markdown) as string }}
    />
  )
}
