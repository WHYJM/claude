// [IN]: Hono framework, routes/*, middleware/*, CORS, logger / Hono 框架、路由、中间件、CORS、日志
// [OUT]: HTTP server on port 3001, exports Hono app / HTTP 服务器（端口 3001），导出 Hono 应用
// [POS]: Gateway entry point, orchestrates all routes and middleware / 网关入口，编排所有路由和中间件
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

/**
 * Smart Kitchen Gateway
 * ======================
 *
 * BFF (Backend for Frontend) 网关服务
 * - Better Auth 认证
 * - 请求路由和转发
 * - 数据聚合
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { healthRoutes } from './routes/health';
import { recipeRoutes } from './routes/recipes';
import { authRoutes } from './routes/auth';
import { authMiddleware } from './middleware/auth';

// 创建 Hono 应用
const app = new Hono();

// ============================================
// 全局中间件
// ============================================

// 日志
app.use('*', logger());

// JSON 美化 (开发环境)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', prettyJSON());
}

// CORS (必须在 secureHeaders 之前，以正确处理 OPTIONS 预检请求)
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',  // Web dev
      'http://localhost:3001',  // Gateway
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Set-Cookie'],
  })
);

// 安全头 (放在 CORS 之后)
app.use('*', secureHeaders());

// 认证中间件 (所有请求都会解析用户信息)
app.use('*', authMiddleware);

// ============================================
// 路由挂载
// ============================================

// 健康检查
app.route('/health', healthRoutes);

// 认证 (Better Auth)
app.route('/api/auth', authRoutes);

// 食谱 API
app.route('/api/recipes', recipeRoutes);

// 根路由
app.get('/', (c) => {
  const user = c.get('user');

  return c.json({
    name: 'Smart Kitchen Gateway',
    version: '0.0.1',
    authenticated: !!user,
    user: user ? { id: user.id, name: user.name } : null,
    endpoints: {
      health: '/health',
      auth: {
        signUp: 'POST /api/auth/sign-up/email',
        signIn: 'POST /api/auth/sign-in/email',
        signOut: 'POST /api/auth/sign-out',
        session: 'GET /api/auth/session',
        me: 'GET /api/auth/me',
      },
      recipes: '/api/recipes',
    },
  });
});

// ============================================
// 错误处理
// ============================================

// 404
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `路径 ${c.req.path} 不存在`,
  }, 404);
});

// 500
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message,
  }, 500);
});

// ============================================
// 启动服务器
// ============================================

const port = Number(process.env.GATEWAY_PORT) || Number(process.env.PORT) || 3001;

console.log('🚀 Smart Kitchen Gateway');
console.log('========================');
console.log(`📍 http://localhost:${port}`);
console.log(`🔐 Auth: Better Auth`);
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
