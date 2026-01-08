/**
 * 认证路由 - Better Auth
 * https://www.better-auth.com/docs
 *
 * Better Auth 自动提供以下端点:
 * - POST /api/auth/sign-up/email     - 邮箱注册
 * - POST /api/auth/sign-in/email     - 邮箱登录
 * - POST /api/auth/sign-out          - 登出
 * - GET  /api/auth/session           - 获取会话
 * - POST /api/auth/forget-password   - 忘记密码
 * - POST /api/auth/reset-password    - 重置密码
 */

import { Hono } from 'hono';
import { auth } from '../lib/auth';

export const authRoutes = new Hono();

// Better Auth 处理所有 /api/auth/* 请求
// 这会自动提供 sign-up, sign-in, sign-out, session 等端点
authRoutes.on(['GET', 'POST'], '/*', (c) => {
  return auth.handler(c.req.raw);
});

// ============================================
// 额外的辅助端点
// ============================================

// 获取当前用户信息 (前端友好的简化版)
authRoutes.get('/me', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({
        authenticated: false,
        user: null,
      }, 200);
    }

    return c.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
      expiresAt: session.session.expiresAt,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ authenticated: false, user: null }, 200);
  }
});
