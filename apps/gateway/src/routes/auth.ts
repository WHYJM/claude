import { Hono } from 'hono';

export const authRoutes = new Hono();

// TODO: 集成 Better-Auth
// import { auth } from '../lib/auth';

// 占位：登录
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();

  // TODO: 实现 Better-Auth 登录逻辑
  return c.json({
    message: 'Login endpoint - not implemented yet',
    received: { email: body.email },
  });
});

// 占位：注册
authRoutes.post('/register', async (c) => {
  const body = await c.req.json();

  // TODO: 实现 Better-Auth 注册逻辑
  return c.json({
    message: 'Register endpoint - not implemented yet',
    received: { email: body.email },
  });
});

// 占位：登出
authRoutes.post('/logout', (c) => {
  // TODO: 实现登出逻辑
  return c.json({ message: 'Logged out' });
});

// 占位：获取当前用户
authRoutes.get('/me', (c) => {
  // TODO: 从 session 获取用户信息
  return c.json({
    message: 'Get current user - not implemented yet',
    user: null,
  });
});
