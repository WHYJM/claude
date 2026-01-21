# CLAUDE.MD - AI 助手项目上下文

> 本文件为 Claude Code 等 AI 助手提供 Smart Kitchen 项目的核心上下文信息。

## 项目概述

**Smart Kitchen** 是一个基于 Polyglot 微服务架构的 Monorepo 全栈项目，用于食谱管理和智能厨房管理。这是一个学习型项目，旨在探索跨多种语言和框架的现代 Web 开发实践。

### 核心特征

- **架构模式**: Monorepo 中的 Polyglot 微服务
- **项目目标**: 学习全栈架构和现代 Web 开发
- **开发阶段**: 活跃开发中
- **编程语言**: 多语言 (TypeScript, Java, Go, Python)

## 技术栈总览

### 前端应用 (Turborepo 管理)

| 应用 | 技术栈 | 端口 | 用途 |
|-----|--------|------|------|
| **Web** | Vite + React 19 + TanStack Router/Query | 5173 | Web 主界面 |
| **Mobile** | Expo + React Native | - | iOS/Android 原生应用 |
| **Gateway** | Hono + Node.js + Better Auth | 3001 | BFF API 网关 + 认证 |

### 后端服务 (Docker 管理)

| 服务 | 技术栈 | 端口 | 用途 |
|------|--------|------|------|
| **Core** | Java 21 + Spring Boot 3 | 8080 | 核心业务逻辑、库存、营养分析 |
| **Realtime** | Go 1.22 + Gin | 8081 | WebSocket 长连接、实时协作 |
| **AI Agent** | Python 3.11 + FastAPI + Google ADK | 8000 | AI 代理 (Gemini 2.0)、图像识别、RAG |

### 基础设施

| 组件 | 技术 | 端口 | 说明 |
|------|------|------|------|
| **数据库** | PostgreSQL 16 + pgvector | 5432 | 关系数据 + 向量存储 |
| **缓存** | Redis | 6379 | Session 存储、消息队列 |

## 项目结构

```
smart-kitchen/
├── apps/                    # 前端应用 (TypeScript/Node.js)
│   ├── web/                # Vite + React Web 应用
│   ├── mobile/             # Expo React Native 应用
│   └── gateway/            # Hono BFF 网关 (集成 Better Auth)
│
├── packages/               # 共享库
│   ├── api-client/        # 类型安全的 API 客户端
│   ├── shared-types/      # 共享 TypeScript 类型定义
│   └── ui/                # 共享 UI 组件
│
├── services/              # 后端微服务 (Polyglot)
│   ├── core-java/        # Spring Boot 核心业务服务
│   ├── realtime-go/      # Go WebSocket 实时服务
│   └── ai-agent/         # Python FastAPI AI 服务 (Google ADK)
│
├── infra/                # 基础设施配置
│   └── postgres/         # 数据库初始化
│
└── docs/                 # 文档
    ├── fullstack-architecture-plan.md
    └── monorepo-guide.md
```

## 最近更新

基于最近的提交记录:

1. **Better Auth 集成** - 在网关中添加了认证系统
2. **Google ADK 框架** - 将 AI Agent 与 Google Agent Development Kit 集成
3. **Monorepo 迁移** - 重构为全栈 Monorepo 架构
4. **登录功能实现** - 添加了登录 UI 和认证服务

## 开发工作流

### 环境要求

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- Java 21 (用于 core-java 服务)
- Go 1.22 (用于 realtime-go 服务)
- Python 3.11 (用于 ai-agent 服务)

### 常用命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev              # 启动所有应用 (使用 Turborepo)
pnpm dev:web          # 仅启动 Web 应用
pnpm dev:gateway      # 仅启动网关

# 构建和质量检查
pnpm build            # 构建所有应用
pnpm typecheck        # TypeScript 类型检查
pnpm lint             # 代码检查
pnpm format           # 使用 Prettier 格式化代码

# Docker 服务
pnpm docker:up        # 启动所有 Docker 服务
pnpm docker:down      # 停止所有 Docker 服务
pnpm docker:build     # 重新构建 Docker 镜像
pnpm docker:logs      # 查看服务日志

# 仅启动基础设施
docker compose up postgres redis -d
```

### 环境配置

1. 复制 `.env.example` 到 `.env`
2. 配置必要的环境变量
3. 启动基础设施: `docker compose up postgres redis -d`
4. 运行开发环境: `pnpm dev:web` 或 `pnpm dev:gateway`

## 核心功能

- 食谱管理 (CRUD 操作)
- 冰箱库存跟踪
- AI 智能食谱推荐
- 多用户实时协作
- 跨平台支持 (Web/Mobile)
- Better Auth 认证系统

## 架构模式

### API 网关模式

- 所有前端请求通过 Hono 网关 (`apps/gateway`)
- 网关处理认证 (Better Auth)
- 网关将请求路由到相应的后端服务
- 后端服务不直接暴露给前端

### Monorepo 组织

- **Turborepo** 管理 TypeScript/Node.js 应用和包
- **Docker Compose** 管理 Polyglot 后端服务
- **pnpm workspaces** 用于依赖管理
- 共享类型和工具函数在 `packages/` 中

### 认证流程

- Better Auth 集成在网关 (`apps/gateway/src/routes/auth`)
- 基于 Session 的认证
- Auth 中间件应用于所有网关路由
- 前端使用 `useAuth` Hook 管理认证状态

## 代码规范

### TypeScript/JavaScript

- 所有新代码使用 TypeScript
- 遵循相似文件中的现有模式
- 使用 `packages/shared-types` 中的共享类型
- 优先使用函数组件和 Hooks

### 后端服务

- **Java**: 遵循 Spring Boot 规范
- **Go**: 遵循标准 Go 项目布局
- **Python**: 使用 FastAPI 模式，添加类型提示

### 文件组织

- 保持相关代码在一起
- 使用桶导出 (`index.ts`) 实现清晰的导入
- 服务代码在 `src/services/`，路由在 `src/routes/`，类型在 `src/types/`

## 代码库使用指南

### 添加新功能时

1. 检查是否需要更新共享类型 (`packages/shared-types`)
2. 在相应服务中添加后端逻辑 (core-java/realtime-go/ai-agent)
3. 如需要，在网关添加路由 (`apps/gateway/src/routes`)
4. 更新前端组件和服务
5. 测试完整流程

### 修复 Bug 时

1. 识别问题所在层级 (前端/网关/服务)
2. 检查相关 TypeScript 类型是否匹配
3. 验证环境变量是否设置
4. 如涉及后端服务，检查 Docker 日志

### 重构代码时

1. 避免过度设计 - 保持简单
2. 不要添加请求之外的功能
3. 保持与现有模式的一致性
4. 如果数据结构改变，更新类型定义
5. 测试受影响的区域

## 重要说明

### 认证系统

- Better Auth 配置在 `apps/gateway`
- Session Cookie 管理认证状态
- Auth 中间件在所有请求上运行
- 登录/注册路由: `/api/auth/sign-in/email`, `/api/auth/sign-up/email`

### AI Agent (Google ADK)

- 配置为独立服务在 `services/ai-agent`
- 使用 Gemini 2.0 Flash 模型
- 支持基于 Agent 的工具交互
- 通过 pgvector 实现向量搜索能力

### 数据库

- PostgreSQL + pgvector 扩展
- Schema 初始化在 `infra/postgres/`
- 所有后端服务都可访问

### 实时功能

- WebSocket 连接由 Go 服务处理
- Redis Pub/Sub 用于消息分发
- 支持协作和实时更新

## 故障排除

### 端口冲突

- Web: 5173
- Gateway: 3001
- Core Java: 8080
- Realtime Go: 8081
- AI Agent: 8000
- PostgreSQL: 5432
- Redis: 6379

启动服务前检查端口是否被占用。

### Docker 问题

```bash
# 重启所有服务
pnpm docker:down && pnpm docker:up

# 查看特定服务日志
docker compose logs -f [service-name]

# 重新构建特定服务
docker compose build [service-name]
```

### TypeScript 错误

```bash
# 运行类型检查
pnpm typecheck

# 清理并重新安装
pnpm clean
pnpm install
```

## 参考资源

- [完整架构设计方案](./docs/fullstack-architecture-plan.md)
- [Monorepo 开发指南](./docs/monorepo-guide.md)
- [Better Auth 文档](https://www.better-auth.com)
- [TanStack Router 文档](https://tanstack.com/router)
- [Google ADK 文档](https://ai.google.dev/adk)

## 当前状态

- ✅ Monorepo 结构已建立
- ✅ Better Auth 集成完成
- ✅ Google ADK 框架已集成
- ✅ 登录 UI 已实现
- 🚧 核心功能开发中
- 🚧 AI Agent 能力扩展中

---

**最后更新**: 2026-01-21
**项目版本**: 0.0.1
**开源协议**: MIT
