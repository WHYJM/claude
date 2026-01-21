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
