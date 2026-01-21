// [IN]: fetch API, types/auth, gateway API (localhost:3001) / fetch API、认证类型、gateway API
// [OUT]: authService object - signUp, signIn, signOut, getMe methods / authService 对象 - 认证方法
// [POS]: Service layer, handles HTTP communication with gateway auth endpoints / 服务层，处理与 gateway 认证端点的 HTTP 通信
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

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
