// [IN]: None (pure type definitions) / 无（纯类型定义）
// [OUT]: User, AuthState, SignInRequest, SignUpRequest, AuthMeResponse, AuthResult / 认证相关类型定义
// [POS]: Type layer, defines auth domain types used by hooks and services / 类型层，定义钩子和服务使用的认证领域类型
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

// ============================================
// Smart Kitchen - 认证相关类型定义
// ============================================

// 用户信息
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  expiresAt?: string;
}

// 登录请求
export interface SignInRequest {
  email: string;
  password: string;
}

// 注册请求
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

// /api/auth/me 响应
export interface AuthMeResponse {
  authenticated: boolean;
  user: User | null;
  expiresAt?: string;
}

// 认证操作结果
export interface AuthResult {
  success: boolean;
  error?: string;
}
