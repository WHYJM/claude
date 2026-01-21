// [IN]: Hono framework / Hono 框架
// [OUT]: healthRoutes - Hono routes for /health, /health/ready, /health/live / healthRoutes - 健康检查路由
// [POS]: Health check endpoints for container orchestration (K8s/Docker) / 容器编排健康检查端点
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

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
