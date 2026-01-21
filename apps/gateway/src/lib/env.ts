// [IN]: zod, process.env / zod 验证库、环境变量
// [OUT]: env object (validated), Env type / env 对象（已验证）、Env 类型
// [POS]: Environment configuration, validates env vars at startup / 环境配置，启动时验证环境变量
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import { z } from 'zod';

// 环境变量 Schema
const envSchema = z.object({
  // 服务配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // 数据库
  DATABASE_URL: z.string().default('postgresql://admin:password@localhost:5432/kitchen_db'),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().default('dev-secret-change-in-production'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3001'),

  // 后端服务地址
  CORE_JAVA_URL: z.string().default('http://localhost:8080'),
  REALTIME_GO_URL: z.string().default('http://localhost:8081'),
  AI_AGENT_URL: z.string().default('http://localhost:8000'),
});

export type Env = z.infer<typeof envSchema>;

// 解析并验证环境变量
export const env = envSchema.parse(process.env);
