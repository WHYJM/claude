# Smart Kitchen Monorepo 开发指南

本文档介绍 Smart Kitchen 项目的 Monorepo 架构、开发流程和最佳实践。

---

## 目录

1. [项目结构](#项目结构)
2. [技术栈](#技术栈)
3. [快速开始](#快速开始)
4. [开发工作流](#开发工作流)
5. [包管理](#包管理)
6. [构建系统](#构建系统)
7. [Docker 部署](#docker-部署)
8. [常见问题](#常见问题)

---

## 项目结构

```
smart-kitchen/
├── package.json              # 根 package.json (workspace 配置)
├── pnpm-workspace.yaml       # pnpm workspace 定义
├── turbo.json                # Turborepo 任务配置
├── docker-compose.yml        # Docker 编排
├── .env.example              # 环境变量模板
│
├── apps/                     # 应用程序
│   ├── web/                  # Web 前端 (TanStack Start/Vite)
│   ├── mobile/               # 移动端 (Expo/React Native)
│   └── gateway/              # API 网关 (Hono/Node.js)
│
├── packages/                 # 共享包
│   ├── shared-types/         # TypeScript 类型定义
│   ├── ui/                   # 共享 UI 组件
│   └── api-client/           # API 客户端
│
├── services/                 # 后端微服务 (Docker 管理)
│   ├── core-java/            # 核心业务 (Spring Boot)
│   ├── realtime-go/          # 实时服务 (Go/Gin)
│   └── ai-agent/             # AI 服务 (Python/FastAPI)
│
├── infra/                    # 基础设施配置
│   └── postgres/
│       └── init.sql          # 数据库初始化
│
└── docs/                     # 文档
    ├── fullstack-architecture-plan.md
    └── monorepo-guide.md     # 本文档
```

---

## 技术栈

### 前端 (TypeScript)

| 应用 | 框架 | 说明 |
|------|------|------|
| `apps/web` | Vite + React + TanStack Router | Web 应用，SSR 可选 |
| `apps/mobile` | Expo + React Native | iOS/Android 原生应用 |
| `apps/gateway` | Hono + Node.js | BFF API 网关 |

### 后端 (Polyglot)

| 服务 | 语言/框架 | 职责 |
|------|-----------|------|
| `services/core-java` | Java 21 / Spring Boot 3 | 核心业务逻辑、事务处理 |
| `services/realtime-go` | Go 1.22 / Gin | WebSocket、实时协同 |
| `services/ai-agent` | Python 3.11 / FastAPI | AI 推荐、RAG |

### 基础设施

| 组件 | 技术 | 用途 |
|------|------|------|
| 数据库 | PostgreSQL 16 + pgvector | 关系数据 + 向量搜索 |
| 缓存 | Redis | Session、Pub/Sub |
| 构建 | Turborepo | Monorepo 构建加速 |
| 包管理 | pnpm | 高效依赖管理 |

---

## 快速开始

### 环境要求

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** & Docker Compose
- (可选) Java 21, Go 1.22, Python 3.11

### 安装步骤

```bash
# 1. 克隆仓库
git clone <repo-url>
cd smart-kitchen

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际值

# 4. 启动基础设施 (PostgreSQL + Redis)
docker compose up postgres redis -d

# 5. 启动开发服务器
pnpm dev:web      # 仅 Web
# 或
pnpm dev          # 所有应用
```

### 启动后端服务

```bash
# 启动所有后端服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

---

## 开发工作流

### 常用命令

```bash
# 开发
pnpm dev                    # 启动所有应用
pnpm dev:web                # 仅启动 Web
pnpm dev:gateway            # 仅启动 Gateway

# 构建
pnpm build                  # 构建所有
pnpm build:web              # 仅构建 Web

# 代码质量
pnpm lint                   # 运行 ESLint
pnpm typecheck              # TypeScript 类型检查
pnpm format                 # Prettier 格式化

# 清理
pnpm clean                  # 清理构建产物
```

### Turborepo 过滤器

```bash
# 运行特定包的任务
pnpm turbo run build --filter=@smart-kitchen/web
pnpm turbo run dev --filter=@smart-kitchen/gateway

# 运行包及其依赖
pnpm turbo run build --filter=@smart-kitchen/web...

# 运行依赖于某包的所有包
pnpm turbo run build --filter=...@smart-kitchen/shared-types
```

---

## 包管理

### workspace 协议

在 `package.json` 中引用 workspace 包：

```json
{
  "dependencies": {
    "@smart-kitchen/shared-types": "workspace:*",
    "@smart-kitchen/api-client": "workspace:*"
  }
}
```

### 添加依赖

```bash
# 添加到根目录 (开发工具)
pnpm add -D -w prettier

# 添加到特定包
pnpm add react --filter=@smart-kitchen/web

# 添加到所有包
pnpm add -r typescript
```

### 包之间的依赖关系

```
apps/web
  └── @smart-kitchen/shared-types
  └── @smart-kitchen/api-client
        └── @smart-kitchen/shared-types

apps/gateway
  └── @smart-kitchen/shared-types

apps/mobile
  └── @smart-kitchen/shared-types
  └── @smart-kitchen/api-client
```

---

## 构建系统

### Turborepo 任务配置

`turbo.json` 定义了任务之间的依赖关系：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // 先构建依赖包
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,           // 开发模式不缓存
      "persistent": true        // 持续运行
    },
    "typecheck": {
      "dependsOn": ["^build"]   // 类型检查前先构建依赖
    }
  }
}
```

### 构建顺序

```
1. packages/shared-types (build)
2. packages/api-client (build)
3. packages/ui (build)
4. apps/web, apps/gateway (build) - 并行
```

### 缓存

Turborepo 自动缓存构建结果：

```bash
# 查看缓存状态
pnpm turbo run build --dry-run

# 强制重新构建
pnpm turbo run build --force
```

---

## Docker 部署

### 服务端口映射

| 服务 | 端口 | 说明 |
|------|------|------|
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |
| Core Java | 8080 | 核心业务 API |
| Realtime Go | 8081 | WebSocket |
| AI Agent | 8000 | AI API |
| Gateway | 3000 | BFF 入口 |
| Web | 5173 | 前端开发服务器 |

### 服务依赖关系

```
postgres ─┬─> core-java ─┐
          │              │
redis ────┼─> realtime-go ├─> gateway
          │              │
          └─> ai-agent ──┘
```

### 常用 Docker 命令

```bash
# 启动所有服务
docker compose up -d

# 启动特定服务
docker compose up postgres redis -d

# 重新构建
docker compose up --build -d

# 查看日志
docker compose logs -f core-java

# 进入容器
docker compose exec postgres psql -U admin -d kitchen_db

# 清理
docker compose down -v  # 包括数据卷
```

---

## 常见问题

### 1. pnpm install 失败

```bash
# 清理并重试
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 2. TypeScript 类型错误

```bash
# 先构建共享包
pnpm turbo run build --filter=@smart-kitchen/shared-types
pnpm turbo run build --filter=@smart-kitchen/api-client

# 然后重启 IDE 或运行
pnpm typecheck
```

### 3. Docker 构建失败

```bash
# 清理 Docker 缓存
docker compose down
docker system prune -f
docker compose build --no-cache
```

### 4. 端口冲突

```bash
# 检查端口占用
lsof -i :5432
lsof -i :3000

# 修改 docker-compose.yml 中的端口映射
```

### 5. 热更新不工作

确保在宿主机运行前端开发服务器，而不是在 Docker 中：

```bash
# 正确方式
docker compose up postgres redis -d  # 只启动基础设施
pnpm dev:web                         # 宿主机运行前端
```

---

## 下一步

1. 阅读 [fullstack-architecture-plan.md](./fullstack-architecture-plan.md) 了解完整架构设计
2. 实现 Gateway 的 Better-Auth 认证
3. 完善 Core Java 的业务逻辑
4. 实现 AI Agent 的真实推荐功能
5. 完成 Mobile 应用开发

---

*文档版本: v1.0*
*最后更新: 2026-01-07*
