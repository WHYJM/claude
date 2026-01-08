# Smart Kitchen

> 智能厨房管理平台 - 一个用于学习全栈架构的 Monorepo 项目

## 项目简介

Smart Kitchen 是一个集成了现代 Web 开发最佳实践的全栈项目，采用 Polyglot 微服务架构。项目主要目的是学习和实践：

- **Monorepo 管理** - pnpm workspace + Turborepo
- **多语言微服务** - TypeScript, Java, Go, Python
- **现代前端技术** - TanStack Router/Query, React 19
- **容器化部署** - Docker Compose

## 技术栈

### 前端

| 应用 | 技术 | 端口 |
|------|------|------|
| Web | Vite + React + TanStack Router | 5173 |
| Mobile | Expo + React Native | - |
| Gateway | Hono + Node.js | 3000 |

### 后端

| 服务 | 技术 | 端口 |
|------|------|------|
| Core | Java 21 + Spring Boot 3 | 8080 |
| Realtime | Go 1.22 + Gin | 8081 |
| AI Agent | Python 3.11 + FastAPI | 8000 |

### 基础设施

| 组件 | 技术 | 端口 |
|------|------|------|
| Database | PostgreSQL 16 + pgvector | 5432 |
| Cache | Redis | 6379 |

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动基础设施
docker compose up postgres redis -d

# 启动 Web 开发服务器
pnpm dev:web
```

### 启动所有后端服务

```bash
docker compose up -d
```

## 项目结构

```
smart-kitchen/
├── apps/
│   ├── web/              # Web 前端
│   ├── mobile/           # 移动端 (Expo)
│   └── gateway/          # API 网关 (Hono)
├── packages/
│   ├── shared-types/     # 共享类型
│   ├── ui/               # 共享 UI 组件
│   └── api-client/       # API 客户端
├── services/
│   ├── core-java/        # 核心业务服务
│   ├── realtime-go/      # 实时服务
│   └── ai-agent/         # AI 服务
└── infra/
    └── postgres/         # 数据库初始化
```

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有应用
pnpm dev:web          # 仅启动 Web
pnpm dev:gateway      # 仅启动 Gateway

# 构建
pnpm build            # 构建所有
pnpm typecheck        # 类型检查
pnpm lint             # 代码检查

# Docker
pnpm docker:up        # 启动 Docker 服务
pnpm docker:down      # 停止 Docker 服务
pnpm docker:logs      # 查看日志
```

## 文档

- [完整架构设计](./docs/fullstack-architecture-plan.md)
- [Monorepo 开发指南](./docs/monorepo-guide.md)

## 功能特性

- 食谱管理 (CRUD)
- 冰箱食材管理
- AI 智能推荐
- 多人实时协作
- 跨平台支持 (Web/Mobile)

## 许可证

MIT
