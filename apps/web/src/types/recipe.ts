// [IN]: None (pure type definitions) / 无（纯类型定义）
// [OUT]: Recipe, Ingredient, FridgeItem, Project, and related domain types / 食谱、食材、冰箱物品、项目等领域类型
// [POS]: Type layer, defines core business domain types / 类型层，定义核心业务领域类型
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

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

// 冰箱食材分类
export type FridgeCategory =
  | '蔬菜'
  | '水果'
  | '肉类'
  | '海鲜'
  | '蛋奶'
  | '调料'
  | '主食'
  | '饮品'
  | '其他';

// 冰箱食材
export interface FridgeItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: FridgeCategory;
  expiryDate?: string;  // ISO 日期字符串
  addedAt: string;
  updatedAt: string;
}

// 食材匹配结果
export interface IngredientMatch {
  name: string;
  required: string;      // 食谱需要的量
  available?: string;    // 冰箱有的量
  status: 'available' | 'insufficient' | 'missing';
}

// 食谱匹配结果
export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;    // 0-100
  matchedIngredients: IngredientMatch[];
  missingIngredients: IngredientMatch[];
}

// AI 生成的食谱
export interface AIGeneratedRecipe {
  name: string;
  description: string;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: string[];
  tips?: string;
  estimatedTime?: number;
}

// 应用设置
export interface AppSettings {
  geminiApiKey?: string;
  userName?: string;
}

// 项目类型
export type ProjectType = 'local' | 'collaborative';

// 项目
export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  roomId?: string;        // 协同时的房间ID
  createdAt: string;
  updatedAt: string;
}
