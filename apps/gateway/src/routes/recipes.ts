import { Hono } from 'hono';

export const recipeRoutes = new Hono();

// TODO: 连接到 Core Java 服务
// const CORE_JAVA_URL = process.env.CORE_JAVA_URL || 'http://localhost:8080';

// 获取所有食谱
recipeRoutes.get('/', async (c) => {
  const projectId = c.req.query('projectId');

  // TODO: 转发到 Core Java 服务
  // const response = await fetch(`${CORE_JAVA_URL}/api/recipes?projectId=${projectId}`);

  return c.json({
    message: 'Get all recipes - forwarding to core-java service',
    projectId,
    recipes: [],
  });
});

// 获取单个食谱
recipeRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: 转发到 Core Java 服务
  return c.json({
    message: 'Get recipe by id - forwarding to core-java service',
    id,
    recipe: null,
  });
});

// 创建食谱
recipeRoutes.post('/', async (c) => {
  const body = await c.req.json();

  // TODO: 转发到 Core Java 服务
  return c.json({
    message: 'Create recipe - forwarding to core-java service',
    received: body,
  });
});

// 更新食谱
recipeRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  // TODO: 转发到 Core Java 服务
  return c.json({
    message: 'Update recipe - forwarding to core-java service',
    id,
    received: body,
  });
});

// 删除食谱
recipeRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: 转发到 Core Java 服务
  return c.json({
    message: 'Delete recipe - forwarding to core-java service',
    id,
  });
});

// AI 推荐食谱 (转发到 AI Agent)
recipeRoutes.post('/ai/recommend', async (c) => {
  const body = await c.req.json();

  // TODO: 转发到 AI Agent 服务
  // const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8000';
  // const response = await fetch(`${AI_AGENT_URL}/api/recommend`, { ... });

  return c.json({
    message: 'AI recommend - forwarding to ai-agent service',
    ingredients: body.ingredients,
  });
});
