import type { Recipe, RecipeFormData } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const getStorageKey = (projectId: string) => `project:${projectId}:recipes`;

export const recipeService = {
  // 获取项目的所有食谱
  getAllRecipes(projectId: string): Recipe[] {
    const data = localStorage.getItem(getStorageKey(projectId));
    return data ? JSON.parse(data) : [];
  },

  // 获取单个食谱
  getRecipeById(projectId: string, id: string): Recipe | undefined {
    const recipes = this.getAllRecipes(projectId);
    return recipes.find(recipe => recipe.id === id);
  },

  // 创建食谱
  createRecipe(projectId: string, formData: RecipeFormData, createdBy: string): Recipe {
    const recipes = this.getAllRecipes(projectId);
    const newRecipe: Recipe = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };
    recipes.push(newRecipe);
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(recipes));
    return newRecipe;
  },

  // 更新食谱
  updateRecipe(projectId: string, id: string, formData: RecipeFormData): Recipe | null {
    const recipes = this.getAllRecipes(projectId);
    const index = recipes.findIndex(recipe => recipe.id === id);

    if (index === -1) return null;

    const updatedRecipe: Recipe = {
      ...recipes[index],
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    recipes[index] = updatedRecipe;
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(recipes));
    return updatedRecipe;
  },

  // 删除食谱
  deleteRecipe(projectId: string, id: string): boolean {
    const recipes = this.getAllRecipes(projectId);
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);

    if (filteredRecipes.length === recipes.length) return false;

    localStorage.setItem(getStorageKey(projectId), JSON.stringify(filteredRecipes));
    return true;
  },

  // 导出食谱
  exportRecipes(projectId: string): string {
    const recipes = this.getAllRecipes(projectId);
    return JSON.stringify(recipes, null, 2);
  },

  // 导入食谱
  importRecipes(projectId: string, jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const importedRecipes = JSON.parse(jsonString);

      if (!Array.isArray(importedRecipes)) {
        return { success: false, count: 0, error: '无效的数据格式' };
      }

      const existingRecipes = this.getAllRecipes(projectId);
      const mergedRecipes = [...existingRecipes];
      let importCount = 0;

      importedRecipes.forEach(recipe => {
        const existingIndex = mergedRecipes.findIndex(r => r.id === recipe.id);
        if (existingIndex === -1) {
          mergedRecipes.push(recipe);
          importCount++;
        } else {
          const imported = new Date(recipe.updatedAt).getTime();
          const existing = new Date(mergedRecipes[existingIndex].updatedAt).getTime();
          if (imported > existing) {
            mergedRecipes[existingIndex] = recipe;
            importCount++;
          }
        }
      });

      localStorage.setItem(getStorageKey(projectId), JSON.stringify(mergedRecipes));
      return { success: true, count: importCount };
    } catch {
      return { success: false, count: 0, error: '解析 JSON 失败' };
    }
  },

  // 搜索食谱
  searchRecipes(projectId: string, query: string): Recipe[] {
    const recipes = this.getAllRecipes(projectId);
    const lowerQuery = query.toLowerCase();

    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      recipe.category.toLowerCase().includes(lowerQuery)
    );
  },

  // 从协同数据同步到本地（直接覆盖）
  syncFromCollab(projectId: string, recipes: Recipe[]): void {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(recipes));
  },
};
