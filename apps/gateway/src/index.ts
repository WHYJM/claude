import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { healthRoutes } from './routes/health';
import { recipeRoutes } from './routes/recipes';
import { authRoutes } from './routes/auth';

// 创建 Hono 应用
const app = new Hono();

// 全局中间件
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  })
);

// 路由挂载
app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/recipes', recipeRoutes);

// 根路由
app.get('/', (c) => {
  return c.json({
    name: 'Smart Kitchen Gateway',
    version: '0.0.1',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      recipes: '/api/recipes',
    },
  });
});

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// 启动服务器
const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Gateway starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
