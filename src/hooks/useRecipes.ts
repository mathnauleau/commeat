import { useRecipeStore } from '../store/recipes'
import { toSlug } from '../lib/slug'
import type { Recipe } from '../types'

export function useRecipes() {
  const recipes = useRecipeStore((s) => s.recipes)
  const addRecipe = useRecipeStore((s) => s.addRecipe)
  const updateRecipe = useRecipeStore((s) => s.updateRecipe)
  const setRecipes = useRecipeStore((s) => s.setRecipes)
  return { recipes, addRecipe, updateRecipe, setRecipes }
}
// updateRecipe(originalTitle, updatedRecipe) — use originalTitle to match
// when the title itself may have been changed during editing

export function useRecipe(slug: string): Recipe | undefined {
  return useRecipeStore((s) => s.recipes.find((r) => toSlug(r.title) === slug))
}
