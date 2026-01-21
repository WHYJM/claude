// ============================================
// Smart Kitchen - 认证服务
// ============================================

import type {
  SignInRequest,
  SignUpRequest,
  AuthMeResponse,
  User,
} from '../types/auth';

const API_BASE = 'http://localhost:3001';

export const authService = {
  // 注册
  async signUp(data: SignUpRequest): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || '注册失败');
    }

    return response.json();
  },

  // 登录
  async signIn(data: SignInRequest): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || '邮箱或密码错误');
    }

    return response.json();
  },

  // 登出
  async signOut(): Promise<void> {
    await fetch(`${API_BASE}/api/auth/sign-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
  },

  // 获取当前用户
  async getMe(): Promise<AuthMeResponse> {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    return response.json();
  },
};
