// [IN]: @smart-kitchen/shared-types, fetch API / 共享类型、fetch API
// [OUT]: createApiClient(), api instance, ApiClient type / API 客户端工厂和默认实例
// [POS]: API abstraction layer, provides type-safe HTTP client for apps / API 抽象层，为应用提供类型安全的 HTTP 客户端
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

// ============================================
// Smart Kitchen - API 客户端
// ============================================
//
// 类型安全的 API 客户端，供 Web 和 Mobile 共享
//
// ============================================

import type {
  Recipe,
  RecipeFormData,
  FridgeItem,
  User,
  ApiResponse,
  PaginatedResponse,
  AIGeneratedRecipe,
} from '@smart-kitchen/shared-types';

// API 配置
export interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

// 默认配置
const defaultConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
};

// 创建 API 客户端
export function createApiClient(config: Partial<ApiConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  // 通用请求方法
  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${finalConfig.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...finalConfig.headers,
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return {
    // ==========================================
    // 食谱 API
    // ==========================================
    recipes: {
      list: (projectId: string) =>
        request<Recipe[]>(`/recipes?projectId=${projectId}`),

      get: (id: string) =>
        request<Recipe>(`/recipes/${id}`),

      create: (projectId: string, data: RecipeFormData) =>
        request<Recipe>('/recipes', {
          method: 'POST',
          body: JSON.stringify({ projectId, ...data }),
        }),

      update: (id: string, data: Partial<RecipeFormData>) =>
        request<Recipe>(`/recipes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        request<void>(`/recipes/${id}`, { method: 'DELETE' }),

      search: (projectId: string, query: string) =>
        request<Recipe[]>(`/recipes?projectId=${projectId}&q=${query}`),
    },

    // ==========================================
    // 冰箱 API
    // ==========================================
    fridge: {
      list: () =>
        request<FridgeItem[]>('/fridge'),

      add: (item: Omit<FridgeItem, 'id' | 'addedAt' | 'updatedAt'>) =>
        request<FridgeItem>('/fridge', {
          method: 'POST',
          body: JSON.stringify(item),
        }),

      update: (id: string, data: Partial<FridgeItem>) =>
        request<FridgeItem>(`/fridge/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        request<void>(`/fridge/${id}`, { method: 'DELETE' }),
    },

    // ==========================================
    // AI API
    // ==========================================
    ai: {
      recommend: (ingredients: FridgeItem[]) =>
        request<AIGeneratedRecipe[]>('/recipes/ai/recommend', {
          method: 'POST',
          body: JSON.stringify({ ingredients }),
        }),

      generate: (dishName: string) =>
        request<AIGeneratedRecipe>('/recipes/ai/generate', {
          method: 'POST',
          body: JSON.stringify({ dishName }),
        }),
    },

    // ==========================================
    // 认证 API
    // ==========================================
    auth: {
      login: (email: string, password: string) =>
        request<{ user: User; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),

      register: (email: string, password: string, name: string) =>
        request<{ user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        }),

      logout: () =>
        request<void>('/auth/logout', { method: 'POST' }),

      me: () =>
        request<User>('/auth/me'),
    },
  };
}

// 默认客户端实例
export const api = createApiClient();

// 导出类型
export type ApiClient = ReturnType<typeof createApiClient>;
