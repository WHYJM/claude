import type { Recipe, RecipeFormData } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'family-recipes';

export const recipeService = {
  // Get all recipes
  getAllRecipes(): Recipe[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get single recipe by ID
  getRecipeById(id: string): Recipe | undefined {
    const recipes = this.getAllRecipes();
    return recipes.find(recipe => recipe.id === id);
  },

  // Create new recipe
  createRecipe(formData: RecipeFormData, createdBy: string): Recipe {
    const recipes = this.getAllRecipes();
    const newRecipe: Recipe = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };
    recipes.push(newRecipe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return newRecipe;
  },

  // Update existing recipe
  updateRecipe(id: string, formData: RecipeFormData): Recipe | null {
    const recipes = this.getAllRecipes();
    const index = recipes.findIndex(recipe => recipe.id === id);

    if (index === -1) return null;

    const updatedRecipe: Recipe = {
      ...recipes[index],
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    recipes[index] = updatedRecipe;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return updatedRecipe;
  },

  // Delete recipe
  deleteRecipe(id: string): boolean {
    const recipes = this.getAllRecipes();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);

    if (filteredRecipes.length === recipes.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecipes));
    return true;
  },

  // Export recipes as JSON
  exportRecipes(): string {
    const recipes = this.getAllRecipes();
    return JSON.stringify(recipes, null, 2);
  },

  // Import recipes from JSON
  importRecipes(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const importedRecipes = JSON.parse(jsonString);

      if (!Array.isArray(importedRecipes)) {
        return { success: false, count: 0, error: '无效的数据格式' };
      }

      const existingRecipes = this.getAllRecipes();
      const mergedRecipes = [...existingRecipes];
      let importCount = 0;

      importedRecipes.forEach(recipe => {
        // Check if recipe already exists by ID
        const existingIndex = mergedRecipes.findIndex(r => r.id === recipe.id);
        if (existingIndex === -1) {
          // New recipe
          mergedRecipes.push(recipe);
          importCount++;
        } else {
          // Update existing recipe if imported one is newer
          const imported = new Date(recipe.updatedAt).getTime();
          const existing = new Date(mergedRecipes[existingIndex].updatedAt).getTime();
          if (imported > existing) {
            mergedRecipes[existingIndex] = recipe;
            importCount++;
          }
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRecipes));
      return { success: true, count: importCount };
    } catch (error) {
      return { success: false, count: 0, error: '解析 JSON 失败' };
    }
  },

  // Search recipes
  searchRecipes(query: string): Recipe[] {
    const recipes = this.getAllRecipes();
    const lowerQuery = query.toLowerCase();

    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      recipe.category.toLowerCase().includes(lowerQuery)
    );
  },
};
