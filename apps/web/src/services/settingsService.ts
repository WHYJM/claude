// [IN]: types/recipe (AppSettings), localStorage / 应用设置类型、本地存储
// [OUT]: settingsService object - get/save settings, API key management / settingsService 对象 - 设置管理、API Key 管理
// [POS]: Service layer, manages user settings persistence in localStorage / 服务层，管理用户设置在本地存储中的持久化
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

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
