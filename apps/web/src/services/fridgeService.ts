// [IN]: types/recipe (FridgeItem), uuid, localStorage / 冰箱物品类型、uuid、本地存储
// [OUT]: fridgeService object - CRUD, filter, import/export, sync methods / fridgeService 对象 - 冰箱物品 CRUD、过滤、导入导出方法
// [POS]: Service layer, manages fridge inventory data persistence / 服务层，管理冰箱库存数据持久化
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import type { FridgeItem, FridgeCategory } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const getStorageKey = (projectId: string) => `project:${projectId}:fridge`;

export const FRIDGE_CATEGORIES: FridgeCategory[] = [
  '蔬菜',
  '水果',
  '肉类',
  '海鲜',
  '蛋奶',
  '调料',
  '主食',
  '饮品',
  '其他',
];

export const fridgeService = {
  // 获取项目的所有食材
  getAllItems(projectId: string): FridgeItem[] {
    const data = localStorage.getItem(getStorageKey(projectId));
    return data ? JSON.parse(data) : [];
  },

  // 获取单个食材
  getItemById(projectId: string, id: string): FridgeItem | undefined {
    const items = this.getAllItems(projectId);
    return items.find(item => item.id === id);
  },

  // 添加食材
  addItem(projectId: string, item: Omit<FridgeItem, 'id' | 'addedAt' | 'updatedAt'>): FridgeItem {
    const items = this.getAllItems(projectId);
    const newItem: FridgeItem = {
      ...item,
      id: uuidv4(),
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(items));
    return newItem;
  },

  // 更新食材
  updateItem(projectId: string, id: string, updates: Partial<Omit<FridgeItem, 'id' | 'addedAt'>>): FridgeItem | null {
    const items = this.getAllItems(projectId);
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    const updatedItem: FridgeItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(items));
    return updatedItem;
  },

  // 删除食材
  deleteItem(projectId: string, id: string): boolean {
    const items = this.getAllItems(projectId);
    const filteredItems = items.filter(item => item.id !== id);

    if (filteredItems.length === items.length) return false;

    localStorage.setItem(getStorageKey(projectId), JSON.stringify(filteredItems));
    return true;
  },

  // 按分类获取食材
  getItemsByCategory(projectId: string, category: FridgeCategory): FridgeItem[] {
    return this.getAllItems(projectId).filter(item => item.category === category);
  },

  // 获取快过期的食材（3天内）
  getExpiringItems(projectId: string, daysThreshold: number = 3): FridgeItem[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return this.getAllItems(projectId).filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= threshold && expiryDate >= now;
    });
  },

  // 获取已过期的食材
  getExpiredItems(projectId: string): FridgeItem[] {
    const now = new Date();

    return this.getAllItems(projectId).filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < now;
    });
  },

  // 获取食材名称列表（用于 AI）
  getIngredientNames(projectId: string): string[] {
    return this.getAllItems(projectId).map(item => `${item.name} ${item.amount}${item.unit}`);
  },

  // 导出食材
  exportItems(projectId: string): string {
    return JSON.stringify(this.getAllItems(projectId), null, 2);
  },

  // 导入食材
  importItems(projectId: string, jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const importedItems = JSON.parse(jsonString);

      if (!Array.isArray(importedItems)) {
        return { success: false, count: 0, error: '无效的数据格式' };
      }

      const existingItems = this.getAllItems(projectId);
      let importCount = 0;

      importedItems.forEach(item => {
        const existingIndex = existingItems.findIndex(i => i.id === item.id);
        if (existingIndex === -1) {
          existingItems.push(item);
          importCount++;
        }
      });

      localStorage.setItem(getStorageKey(projectId), JSON.stringify(existingItems));
      return { success: true, count: importCount };
    } catch {
      return { success: false, count: 0, error: '解析 JSON 失败' };
    }
  },

  // 清空冰箱
  clearAll(projectId: string): void {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify([]));
  },

  // 从协同数据同步到本地（直接覆盖）
  syncFromCollab(projectId: string, items: FridgeItem[]): void {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(items));
  },
};
