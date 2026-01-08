/**
 * 认证中间件
 */

import { Context, Next } from 'hono';
import { auth, type Session, type User } from '../lib/auth';

// 扩展 Context 类型
declare module 'hono' {
  interface ContextVariableMap {
    user: User | null;
    session: Session | null;
  }
}

/**
 * 认证中间件 - 验证用户身份
 * 如果用户已登录，将 user 和 session 添加到 context
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set('user', session.user as User);
      c.set('session', session.session as unknown as Session);
    } else {
      c.set('user', null);
      c.set('session', null);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    c.set('user', null);
    c.set('session', null);
  }

  await next();
}

/**
 * 要求认证中间件 - 未登录返回 401
 */
export async function requireAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: 'Unauthorized', message: '请先登录' }, 401);
    }

    c.set('user', session.user as User);
    c.set('session', session.session as unknown as Session);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized', message: '认证失败' }, 401);
  }
}

/**
 * 获取当前用户 (从 context)
 */
export function getUser(c: Context): User | null {
  return c.get('user');
}

/**
 * 获取当前会话 (从 context)
 */
export function getSession(c: Context): Session | null {
  return c.get('session');
}
