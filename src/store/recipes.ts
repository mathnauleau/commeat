import { create } from 'zustand'
import type { Recipe } from '../types'
import { mockRecipes } from '../lib/mockData'

interface RecipeStore {
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (originalTitle: string, updated: Recipe) => void
  deleteRecipe: (title: string) => void
  setRecipes: (recipes: Recipe[]) => void
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [...mockRecipes],

  addRecipe: (recipe) =>
    set((state) => ({ recipes: [...state.recipes, recipe] })),

  updateRecipe: (originalTitle, updated) =>
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.title === originalTitle ? updated : r,
      ),
    })),

  deleteRecipe: (title) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.title !== title),
    })),

  setRecipes: (recipes) => set({ recipes }),
}))
