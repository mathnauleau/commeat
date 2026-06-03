import { useRecipeStore } from '../store/recipes'

export function useRecipes() {
  const recipes = useRecipeStore((s) => s.recipes)
  const addRecipe = useRecipeStore((s) => s.addRecipe)
  const updateRecipe = useRecipeStore((s) => s.updateRecipe)
  return { recipes, addRecipe, updateRecipe }
}
