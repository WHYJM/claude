// [IN]: None (pure type definitions) / 无（纯类型定义）
// [OUT]: All shared domain types (Recipe, FridgeItem, User, Project, etc.) / 所有共享领域类型
// [POS]: Type foundation layer, consumed by all apps and packages / 类型基础层，被所有应用和包消费
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

// ============================================
// Smart Kitchen - 共享类型定义
// ============================================

// --------------------------------------------
// 食材相关
// --------------------------------------------

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
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
  expiryDate?: string;
  addedAt: string;
  updatedAt: string;
}

// --------------------------------------------
// 食谱相关
// --------------------------------------------

export interface Recipe {
  id: string;
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

// 食材匹配结果
export interface IngredientMatch {
  name: string;
  required: string;
  available?: string;
  status: 'available' | 'insufficient' | 'missing';
}

// 食谱匹配结果
export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
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

// --------------------------------------------
// 项目相关
// --------------------------------------------

export type ProjectType = 'local' | 'collaborative';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------
// 用户与认证
// --------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
}

// --------------------------------------------
// 设置
// --------------------------------------------

export interface AppSettings {
  geminiApiKey?: string;
  userName?: string;
  theme?: 'light' | 'dark' | 'system';
}

// --------------------------------------------
// API 响应
// --------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
