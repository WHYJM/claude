import type { FridgeItem, FridgeCategory } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'family-fridge';

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
  // 获取所有食材
  getAllItems(): FridgeItem[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 获取单个食材
  getItemById(id: string): FridgeItem | undefined {
    const items = this.getAllItems();
    return items.find(item => item.id === id);
  },

  // 添加食材
  addItem(item: Omit<FridgeItem, 'id' | 'addedAt' | 'updatedAt'>): FridgeItem {
    const items = this.getAllItems();
    const newItem: FridgeItem = {
      ...item,
      id: uuidv4(),
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  // 更新食材
  updateItem(id: string, updates: Partial<Omit<FridgeItem, 'id' | 'addedAt'>>): FridgeItem | null {
    const items = this.getAllItems();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    const updatedItem: FridgeItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return updatedItem;
  },

  // 删除食材
  deleteItem(id: string): boolean {
    const items = this.getAllItems();
    const filteredItems = items.filter(item => item.id !== id);

    if (filteredItems.length === items.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
    return true;
  },

  // 按分类获取食材
  getItemsByCategory(category: FridgeCategory): FridgeItem[] {
    return this.getAllItems().filter(item => item.category === category);
  },

  // 获取快过期的食材（3天内）
  getExpiringItems(daysThreshold: number = 3): FridgeItem[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return this.getAllItems().filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= threshold && expiryDate >= now;
    });
  },

  // 获取已过期的食材
  getExpiredItems(): FridgeItem[] {
    const now = new Date();

    return this.getAllItems().filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < now;
    });
  },

  // 获取食材名称列表（用于 AI）
  getIngredientNames(): string[] {
    return this.getAllItems().map(item => `${item.name} ${item.amount}${item.unit}`);
  },

  // 导出食材
  exportItems(): string {
    return JSON.stringify(this.getAllItems(), null, 2);
  },

  // 导入食材
  importItems(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const importedItems = JSON.parse(jsonString);

      if (!Array.isArray(importedItems)) {
        return { success: false, count: 0, error: '无效的数据格式' };
      }

      const existingItems = this.getAllItems();
      let importCount = 0;

      importedItems.forEach(item => {
        const existingIndex = existingItems.findIndex(i => i.id === item.id);
        if (existingIndex === -1) {
          existingItems.push(item);
          importCount++;
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingItems));
      return { success: true, count: importCount };
    } catch {
      return { success: false, count: 0, error: '解析 JSON 失败' };
    }
  },

  // 清空冰箱
  clearAll(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },
};
