// [IN]: types/recipe, settingsService, Gemini API / 食谱类型、设置服务、Gemini API
// [OUT]: aiService object - callGemini, recommendRecipes, generateRecipe, checkIngredients / aiService 对象 - AI 推荐方法
// [POS]: Service layer, handles AI-powered recipe recommendations via Gemini 2.0 / 服务层，通过 Gemini 2.0 处理 AI 食谱推荐
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import type { AIGeneratedRecipe, FridgeItem } from '../types/recipe';
import { settingsService } from './settingsService';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export const aiService = {
  // 调用 Gemini API
  async callGemini(prompt: string): Promise<string> {
    const apiKey = settingsService.getGeminiApiKey();

    if (!apiKey) {
      throw new Error('请先在设置中配置 Gemini API Key');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '调用 AI 失败');
    }

    const data: GeminiResponse = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('AI 返回了空响应');
    }

    return text;
  },

  // 根据食材推荐菜品
  async recommendRecipes(
    ingredients: FridgeItem[],
    expiringItems: FridgeItem[] = []
  ): Promise<AIGeneratedRecipe[]> {
    const ingredientList = ingredients
      .map(i => `${i.name} ${i.amount}${i.unit}`)
      .join('、');

    const expiringList =
      expiringItems.length > 0
        ? `\n\n注意：以下食材即将过期，请优先使用：${expiringItems.map(i => i.name).join('、')}`
        : '';

    const prompt = `你是一个专业的家庭厨师。根据以下冰箱里的食材，推荐3道可以做的家常菜。

现有食材：${ingredientList}${expiringList}

请按以下 JSON 格式返回（只返回 JSON，不要其他文字）：
[
  {
    "name": "菜名",
    "description": "简短描述",
    "ingredients": [
      {"name": "食材名", "amount": "用量", "unit": "单位"}
    ],
    "steps": ["步骤1", "步骤2", "步骤3"],
    "tips": "烹饪小贴士",
    "estimatedTime": 30
  }
]

要求：
1. 尽量只使用现有食材
2. 如果缺少必要调料（盐、油、酱油等常见调料），可以假设用户有
3. 菜品要适合家庭烹饪，步骤清晰易懂
4. 优先推荐能消耗快过期食材的菜品`;

    const response = await this.callGemini(prompt);

    try {
      // 尝试提取 JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应');
      }
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('AI 响应格式错误，请重试');
    }
  },

  // 根据菜名生成食谱
  async generateRecipe(dishName: string): Promise<AIGeneratedRecipe> {
    const prompt = `你是一个专业的家庭厨师。请为"${dishName}"生成一份详细的家常菜食谱。

请按以下 JSON 格式返回（只返回 JSON，不要其他文字）：
{
  "name": "${dishName}",
  "description": "简短描述这道菜",
  "ingredients": [
    {"name": "食材名", "amount": "用量", "unit": "单位"}
  ],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "tips": "烹饪小贴士",
  "estimatedTime": 30
}

要求：
1. 食材用量要具体明确
2. 步骤要详细清晰，适合新手
3. 提供实用的烹饪技巧`;

    const response = await this.callGemini(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应');
      }
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('AI 响应格式错误，请重试');
    }
  },

  // 检查食材匹配
  async checkIngredients(
    recipeName: string,
    recipeIngredients: string[],
    fridgeItems: FridgeItem[]
  ): Promise<{
    canMake: boolean;
    available: string[];
    missing: string[];
    suggestions: string;
  }> {
    const fridgeList = fridgeItems.map(i => `${i.name} ${i.amount}${i.unit}`).join('、');
    const recipeList = recipeIngredients.join('、');

    const prompt = `你是一个厨房助手。请帮我检查做"${recipeName}"需要的食材是否足够。

食谱需要：${recipeList}

冰箱里有：${fridgeList}

请按以下 JSON 格式返回（只返回 JSON，不要其他文字）：
{
  "canMake": true或false,
  "available": ["已有的食材1", "已有的食材2"],
  "missing": ["缺少的食材1", "缺少的食材2"],
  "suggestions": "建议和替代方案"
}

注意：
1. 常见调料（盐、糖、油、酱油、醋等）可以假设用户有，不算缺少
2. 相似食材可以视为匹配（如"土鸡蛋"可以匹配"鸡蛋"）
3. 如果缺少食材，请在 suggestions 中提供替代方案`;

    const response = await this.callGemini(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应');
      }
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('AI 响应格式错误，请重试');
    }
  },

  // 验证 API Key 是否有效
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: '你好' }],
            },
          ],
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  },
};
