# Smart Kitchen 项目指南

## 项目概述

Smart Kitchen 是一个**全栈智能厨房管理平台**，采用 Monorepo + 多语言微服务架构。这是一个学习型项目，旨在展示现代化全栈开发的最佳实践。

**核心功能：**
- 食谱管理与协作编辑（基于 Loro CRDT）
- 冰箱食材追踪与过期提醒
- AI 智能推荐食谱（基于现有食材）
- 跨平台支持（Web + iOS/Android）

## 架构概览

### Monorepo 结构
```
smart-kitchen/
├── apps/              # 前端应用
│   ├── web/          # Vite + React 19 + TanStack Router (端口 5173)
│   ├── gateway/      # Hono API 网关 + Better Auth (端口 3000)
│   └── mobile/       # Expo + React Native (iOS/Android)
├── packages/          # 共享库
│   ├── shared-types/ # TypeScript 类型定义
│   ├── api-client/   # 类型安全的 API 客户端
│   └── ui/           # 共享 UI 组件
├── services/          # 后端微服务
│   ├── core-java/    # Java 21 + Spring Boot (端口 8080)
│   ├── realtime-go/  # Go 1.22 + Gin + WebSocket (端口 8081)
│   └── ai-agent/     # Python 3.11 + FastAPI + Google ADK (端口 8000)
└── infra/            # 基础设施配置
    └── postgres/     # PostgreSQL 初始化脚本
```

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| **前端框架** | React 19, TanStack Router, TanStack Query, Vite |
| **UI 组件** | Shadcn/ui (Radix UI), Tailwind CSS v4 |
| **实时协作** | Loro CRDT, WebSocket |
| **移动端** | Expo, React Native 0.76 |
| **API 网关** | Hono (TypeScript), Better Auth |
| **核心服务** | Spring Boot 3 (Java 21), Spring Data JPA |
| **实时服务** | Gin (Go 1.22), Gorilla WebSocket |
| **AI 服务** | FastAPI (Python 3.11), Google ADK, Gemini 2.0 Flash |
| **数据库** | PostgreSQL 16 + pgvector, Redis |
| **构建工具** | pnpm workspaces, Turborepo 2.3 |
| **容器化** | Docker Compose |

## 关键文件路径

### 配置文件
- `/package.json` - Workspace 根配置
- `/pnpm-workspace.yaml` - pnpm 工作区定义
- `/turbo.json` - Turborepo 构建配置
- `/docker-compose.yml` - 服务编排
- `/.env.example` - 环境变量模板

### Web 应用
- `/apps/web/src/main.tsx` - 应用入口
- `/apps/web/src/routes/` - 路由定义（TanStack Router）
- `/apps/web/src/components/` - React 组件
- `/apps/web/src/lib/` - 工具函数
- `/apps/web/vite.config.ts` - Vite 配置
- `/apps/web/components.json` - Shadcn/ui 配置

### Gateway
- `/apps/gateway/src/index.ts` - Hono 服务器入口
- `/apps/gateway/src/lib/auth.ts` - Better Auth 配置
- `/apps/gateway/drizzle.config.ts` - Drizzle ORM 配置
- `/apps/gateway/src/db/schema.ts` - 数据库 Schema

### 微服务
- `/services/ai-agent/main.py` - FastAPI 入口
- `/services/ai-agent/adk.yaml` - Google ADK Agent 配置
- `/services/realtime-go/main.go` - Go WebSocket 服务器
- `/services/core-java/pom.xml` - Maven 依赖配置

### 文档
- `/README.md` - 快速开始指南
- `/docs/fullstack-architecture-plan.md` - 完整架构设计文档
- `/docs/monorepo-guide.md` - Monorepo 开发指南
- `/docs/shadcn-dialog-keyboard.md` - 移动端键盘适配指南

## 开发工作流

### 启动开发环境

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 Docker 基础设施 (PostgreSQL, Redis)
pnpm docker:up

# 3. 启动所有应用
pnpm dev

# 或分别启动
pnpm dev:web       # 仅启动 Web 应用
pnpm dev:gateway   # 仅启动 API 网关
```

### 常用命令

```bash
# 构建
pnpm build              # 构建所有包和应用
pnpm build:web          # 仅构建 Web 应用

# 代码质量
pnpm lint               # 运行 ESLint
pnpm typecheck          # TypeScript 类型检查
pnpm format             # 格式化代码 (Prettier)

# 数据库 (在 apps/gateway 目录下)
cd apps/gateway
pnpm db:generate        # 生成 Drizzle 迁移
pnpm db:migrate         # 运行迁移
pnpm db:studio          # 打开 Drizzle Studio

# Docker
pnpm docker:build       # 构建镜像
pnpm docker:logs        # 查看日志
pnpm docker:down        # 停止所有服务

# 清理
pnpm clean              # 删除构建产物
```

### Turborepo 过滤器

```bash
# 仅构建特定应用及其依赖
turbo build --filter=web
turbo build --filter=gateway

# 仅运行特定应用的脚本
turbo dev --filter=web
```

## 开发规范

### 代码组织

1. **共享类型**：所有 TypeScript 类型定义放在 `packages/shared-types`
2. **API 客户端**：API 调用逻辑放在 `packages/api-client`
3. **UI 组件**：跨应用的通用组件放在 `packages/ui`
4. **应用专属代码**：放在各自的 `apps/` 目录下

### 路由规范 (TanStack Router)

- 文件位置：`apps/web/src/routes/`
- 路由文件命名：`route.tsx` 或 `route.lazy.tsx`（懒加载）
- 动态路由：`$参数名` (例如：`$projectId`, `$recipeId`)

### 组件规范

1. **使用 Shadcn/ui**：优先使用 `apps/web/src/components/ui/` 中的组件
2. **Tailwind CSS v4**：使用 Tailwind 类名进行样式设计
3. **移动端适配**：Dialog 中的表单需要使用 `dvh` 单位（见 shadcn-dialog-keyboard.md）
4. **状态管理**：
   - 服务器状态：TanStack Query
   - 本地状态：React hooks
   - 实时协作：Loro CRDT

### API 设计规范

#### Gateway (Hono)
- 所有 API 路由前缀：`/api/`
- 认证路由：`/api/auth/*` (Better Auth)
- 业务路由：`/api/recipes`, `/api/projects` 等
- 健康检查：`/health`

#### AI Agent (FastAPI)
- `POST /api/recommend` - 基于食材推荐食谱
- `POST /api/generate` - 生成食谱
- `POST /api/chat` - AI 聊天
- `POST /api/chat/stream` - 流式聊天 (SSE)

#### Realtime (Go)
- WebSocket 端点：`ws://localhost:8081/ws`
- 房间机制：支持多用户实时协作

### 数据库规范

**主要表结构**（见 `infra/postgres/init.sql`）：
- `users` - 用户表
- `projects` - 项目表
- `recipes` - 食谱表（包含 CRDT 数据）
- `fridge_items` - 冰箱食材表
- `sessions` - 会话表（Better Auth）

**注意事项**：
- 使用 UUID 作为主键
- 所有表包含 `created_at` 和 `updated_at`
- 启用了 pgvector 扩展（用于 AI 向量搜索）

### Git 工作流

1. **开发分支**：从 `main` 创建功能分支
2. **分支命名**：`claude/功能描述-随机ID`（例如：`claude/create-project-docs-vtzEa`）
3. **提交规范**：
   ```
   feat(scope): 添加新功能
   fix(scope): 修复 bug
   docs(scope): 文档更新
   refactor(scope): 重构
   test(scope): 测试相关
   chore(scope): 构建/工具配置
   ```
4. **推送**：`git push -u origin <branch-name>`

## 项目当前状态

### ✅ 已完成
- Monorepo 架构搭建
- Web 前端基础框架（TanStack Router + Query）
- API Gateway + Better Auth 认证系统
- AI Agent 服务（Google ADK + Gemini 2.0）
- PostgreSQL 数据库设计
- Docker Compose 服务编排

### 🚧 进行中
- 实时协作功能（Loro CRDT 集成）
- WebSocket 实时通信优化
- 移动端应用开发
- Core Java 服务业务逻辑

### 📋 待开发
- 食谱详情页完整功能
- 冰箱食材管理 UI
- AI 推荐算法优化
- 用户通知系统
- 性能优化与监控

## 常见问题排查

### 端口占用
- Web: 5173
- Gateway: 3000
- AI Agent: 8000
- Core Java: 8080
- Realtime Go: 8081
- PostgreSQL: 5432
- Redis: 6379

### Turborepo 缓存问题
```bash
# 清除 Turborepo 缓存
rm -rf .turbo
rm -rf node_modules/.cache
```

### 依赖问题
```bash
# 清理并重新安装
pnpm clean
rm -rf node_modules
pnpm install
```

### Docker 问题
```bash
# 重建所有容器
pnpm docker:down
pnpm docker:build
pnpm docker:up

# 查看日志
pnpm docker:logs
```

## AI 开发助手指南

### 修改代码时的注意事项

1. **优先使用现有组件**：
   - 检查 `apps/web/src/components/ui/` 是否有可用组件
   - 使用 Shadcn/ui 的组件而非从头创建

2. **类型安全**：
   - 所有 API 调用必须使用 `packages/api-client`
   - 共享类型放在 `packages/shared-types`
   - 避免使用 `any` 类型

3. **响应式设计**：
   - 使用 Tailwind 的响应式前缀（`sm:`, `md:`, `lg:`）
   - 移动端优先设计

4. **性能考虑**：
   - 使用 TanStack Query 的缓存策略
   - 大列表使用虚拟滚动
   - 图片使用懒加载

5. **实时协作**：
   - 修改食谱编辑器时需考虑 Loro CRDT 同步
   - WebSocket 消息格式需与 Go 服务端保持一致

### 添加新功能的流程

1. **更新类型定义**：在 `packages/shared-types` 添加类型
2. **API 端点**：在 `apps/gateway` 添加路由和处理逻辑
3. **数据库**：如需新表，更新 `infra/postgres/init.sql` 和 Drizzle schema
4. **API 客户端**：在 `packages/api-client` 添加请求函数
5. **UI 实现**：在 `apps/web` 创建组件和路由
6. **测试**：确保所有功能正常运行

### 推荐的阅读顺序

新接触项目时，建议按以下顺序阅读代码：

1. `/README.md` - 快速了解项目
2. `/docs/fullstack-architecture-plan.md` - 理解架构设计
3. `/apps/web/src/routes/` - 了解应用路由结构
4. `/apps/gateway/src/index.ts` - 了解 API 设计
5. `/packages/shared-types/` - 熟悉数据模型
6. 特定功能的代码文件

## 环境变量

参考 `.env.example` 文件，必需的环境变量：

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_kitchen

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Google ADK (AI Agent)
GOOGLE_ADK_API_KEY=your-gemini-api-key

# Redis
REDIS_URL=redis://localhost:6379
```

## 有用的资源链接

- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Shadcn/ui 组件](https://ui.shadcn.com/)
- [Better Auth 文档](https://www.better-auth.com/)
- [Loro CRDT 文档](https://loro.dev/)
- [Google ADK 文档](https://ai.google.dev/adk)
- [Hono 文档](https://hono.dev/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

---

**最后更新：2026-01-08**
