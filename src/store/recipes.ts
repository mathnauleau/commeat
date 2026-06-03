import { create } from 'zustand'
import type { Recipe } from '../types'
import { mockRecipes } from '../lib/mockData'

interface RecipeStore {
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (recipe: Recipe) => void
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [...mockRecipes],

  addRecipe: (recipe) =>
    set((state) => ({ recipes: [...state.recipes, recipe] })),

  updateRecipe: (updated) =>
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.title === updated.title ? updated : r,
      ),
    })),
}))
