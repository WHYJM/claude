import type { AppSettings } from '../types/recipe';

const STORAGE_KEY = 'family-recipe-settings';

export const settingsService = {
  // 获取所有设置
  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // 保存设置
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  // 获取 Gemini API Key
  getGeminiApiKey(): string | undefined {
    return this.getSettings().geminiApiKey;
  },

  // 保存 Gemini API Key
  saveGeminiApiKey(apiKey: string): void {
    const settings = this.getSettings();
    settings.geminiApiKey = apiKey;
    this.saveSettings(settings);
  },

  // 获取用户名
  getUserName(): string | undefined {
    return this.getSettings().userName;
  },

  // 保存用户名
  saveUserName(userName: string): void {
    const settings = this.getSettings();
    settings.userName = userName;
    this.saveSettings(settings);
  },

  // 检查是否配置了 API Key
  hasApiKey(): boolean {
    const apiKey = this.getGeminiApiKey();
    return !!apiKey && apiKey.trim().length > 0;
  },

  // 清除所有设置
  clearSettings(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
