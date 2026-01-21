// [IN]: drizzle-orm, postgres.js, db/schema / drizzle-orm、postgres.js、db/schema
// [OUT]: db instance (Drizzle client), Database type / db 实例（Drizzle 客户端）、Database 类型
// [POS]: Database connection layer, provides typed query interface / 数据库连接层，提供类型化查询接口
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

/**
 * 数据库连接
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 数据库连接字符串
const connectionString = process.env.DATABASE_URL ||
  'postgresql://admin:password@localhost:5432/kitchen_db';

// 创建 postgres 客户端
const client = postgres(connectionString);

// 创建 drizzle 实例
export const db = drizzle(client, { schema });

// 导出类型
export type Database = typeof db;
