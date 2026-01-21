// [IN]: clsx, tailwind-merge / clsx、tailwind-merge
// [OUT]: cn() - className merge utility / cn() - 类名合并工具函数
// [POS]: Utility layer, used by all UI components for conditional classNames / 工具层，被所有 UI 组件用于条件类名
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
