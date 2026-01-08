import { Hono } from 'hono';

export const healthRoutes = new Hono();

// 健康检查
healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      gateway: 'up',
      // TODO: 检查其他服务状态
      // coreJava: await checkService(process.env.CORE_JAVA_URL),
      // realtimeGo: await checkService(process.env.REALTIME_GO_URL),
      // aiAgent: await checkService(process.env.AI_AGENT_URL),
    },
  });
});

// 就绪检查 (用于 K8s/Docker)
healthRoutes.get('/ready', (c) => {
  return c.json({ ready: true });
});

// 存活检查 (用于 K8s/Docker)
healthRoutes.get('/live', (c) => {
  return c.json({ alive: true });
});
