export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RecipeFormData {
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  tags: string[];
  imageUrl?: string;
}
