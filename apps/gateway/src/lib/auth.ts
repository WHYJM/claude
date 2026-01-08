/**
 * Better Auth 配置
 * https://www.better-auth.com/docs
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  // 数据库适配器
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // 邮箱密码认证
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 开发阶段关闭
  },

  // Session 配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 1 天更新一次
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟缓存
    },
  },

  // 用户配置
  user: {
    additionalFields: {
      avatarUrl: {
        type: 'string',
        required: false,
      },
    },
  },

  // 高级配置
  advanced: {
    cookiePrefix: 'smart-kitchen',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  // 可选: 社交登录
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },
});

// 导出类型
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
