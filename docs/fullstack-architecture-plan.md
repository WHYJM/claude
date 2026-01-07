# Smart Kitchen - 终极全栈架构方案

> 本文档记录了 Smart Kitchen 项目的完整技术架构设计，集成了 Web 开发领域最前沿的前端技术（TanStack）和最扎实的后端微服务模式（Polyglot）。

---

## 1. 技术栈清单 (The Ultimate Stack)

### 🏛️ 前端层 (The Universal Frontend)

| 组件 | 技术 | 职责 |
|------|------|------|
| Web 框架 | **TanStack Start** (基于 TanStack Router + Vite) | SSR 渲染、管理后台、大屏展示 |
| Mobile 框架 | **Expo (React Native)** | iOS/Android 原生体验、扫码、离线能力 |
| 路由/数据 | **TanStack Router** + **TanStack Query** | Web/App 逻辑 100% 复用 |
| UI 组件 | **Tamagui** 或 **NativeWind** | 共享一套 UI 代码 |

### 🚪 网关层 (The Gateway)

| 组件 | 技术 | 职责 |
|------|------|------|
| BFF | **Hono (Node.js)** | 流量入口、**Better-Auth** 鉴权、请求转发、数据聚合 |

> 网关是前端唯一需要知道的 API 地址。

### ⚡ 实时层 (The Realtime Engine)

| 组件 | 技术 | 职责 |
|------|------|------|
| 服务 | **Go (Gin 或 Echo)** | 维持 WebSocket 长连接、处理协同编辑 (Yjs/CRDT)、实时消息推送 |

### 🧠 核心业务层 (The Core)

| 组件 | 技术 | 职责 |
|------|------|------|
| 服务 | **Java (Spring Boot 3.x)** | 库存管理、家庭关系、营养分析、事务一致性、定时任务 |

### 🤖 AI 大脑 (The Brain)

| 组件 | 技术 | 职责 |
|------|------|------|
| 服务 | **Python (FastAPI)** + **ADK** | 运行 AI Agent、图像识别、RAG (向量检索)、流式对话生成 |

### 🧱 基础设施 (The Infra)

| 组件 | 技术 | 说明 |
|------|------|------|
| 数据库 | **PostgreSQL** + **pgvector** | 关系数据 + 向量存储 |
| 缓存/消息 | **Redis** | Session 存储、Pub/Sub 消息总线 |
| 包管理 | **pnpm** + **Turborepo** | 依赖管理 + 构建加速 |

---

## 2. 项目目录结构 (The Monorepo Map)

```
/smart-kitchen
├── package.json             # pnpm workspace
├── pnpm-workspace.yaml      # workspace 配置
├── turbo.json               # Turborepo 任务编排
├── docker-compose.yml       # 核心编排文件
├── .env.example             # 环境变量模板
│
├── apps/                    # [TS 生态圈 - Turbo 管理]
│   ├── web/                 # TanStack Start (SSR Web 应用)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   ├── mobile/              # Expo (React Native 应用)
│   │   ├── package.json
│   │   ├── app.json
│   │   └── src/
│   └── gateway/             # Hono BFF (API 网关)
│       ├── package.json
│       ├── Dockerfile
│       └── src/
│
├── packages/                # [共享库]
│   ├── api-client/          # 类型安全的 API 客户端
│   │   └── package.json
│   ├── shared-types/        # 共享 TypeScript 类型定义
│   │   └── package.json
│   └── ui/                  # 共享 UI 组件 (Tamagui/NativeWind)
│       └── package.json
│
├── services/                # [异构后端 - Docker 管理]
│   ├── core-java/           # Spring Boot 核心业务服务
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/
│   ├── realtime-go/         # Go WebSocket 实时服务
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── main.go
│   └── ai-agent/            # Python FastAPI AI 服务
│       ├── Dockerfile
│       ├── requirements.txt
│       └── main.py
│
└── infra/                   # [基础设施配置]
    ├── postgres/
    │   └── init.sql         # 数据库初始化脚本
    └── nginx/
        └── nginx.conf       # (可选) 生产环境反向代理
```

---

## 3. Docker Compose 编排 (The Orchestration)

> **开发模式建议：** Frontend (Web/Mobile) 直接在宿主机运行 (`pnpm dev`) 以享受热更新 (HMR)，Backend 服务跑在 Docker 里。

```yaml
networks:
  kitchen-net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:

services:
  # ============================================================
  # 1. 基础设施 (Infrastructure)
  # ============================================================

  # 数据库 (Postgres + pgvector)
  postgres:
    image: pgvector/pgvector:pg16
    container_name: kitchen-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: kitchen_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - kitchen-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d kitchen_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 缓存与消息总线 (Redis)
  redis:
    image: redis:alpine
    container_name: kitchen-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - kitchen-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ============================================================
  # 2. 异构后端服务 (Backend Services)
  # ============================================================

  # 核心业务 (Java Spring Boot)
  core-java:
    build:
      context: ./services/core-java
      dockerfile: Dockerfile
    container_name: svc-core
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/kitchen_db
      - SPRING_DATASOURCE_USERNAME=admin
      - SPRING_DATASOURCE_PASSWORD=password
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - kitchen-net

  # 实时服务 (Go)
  realtime-go:
    build:
      context: ./services/realtime-go
      dockerfile: Dockerfile
    container_name: svc-realtime
    environment:
      - REDIS_ADDR=redis:6379
      - PORT=8081
    ports:
      - "8081:8081"
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - kitchen-net

  # AI 大脑 (Python Agent)
  ai-agent:
    build:
      context: ./services/ai-agent
      dockerfile: Dockerfile
    container_name: svc-ai
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/kitchen_db
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - kitchen-net

  # ============================================================
  # 3. 网关入口 (Gateway)
  # ============================================================

  # BFF 网关 (Hono Node.js)
  gateway:
    build:
      context: .
      dockerfile: ./apps/gateway/Dockerfile
    container_name: svc-gateway
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://admin:password@postgres:5432/kitchen_db
      - REDIS_URL=redis://redis:6379
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      # 服务间通信地址
      - CORE_JAVA_URL=http://core-java:8080
      - REALTIME_GO_URL=http://realtime-go:8081
      - AI_AGENT_URL=http://ai-agent:8000
    ports:
      - "3000:3000"
    depends_on:
      - core-java
      - realtime-go
      - ai-agent
    networks:
      - kitchen-net
```

---

## 4. 各服务 Dockerfile

### A. Hono Gateway (`apps/gateway/Dockerfile`)

> 使用 Turborepo 的 `turbo prune` 精简构建上下文

```dockerfile
FROM node:20-alpine AS base

# Stage 1: 使用 turbo prune 提取依赖
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune --scope=gateway --docker

# Stage 2: 安装依赖并构建
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=gateway...

# Stage 3: 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=installer /app/apps/gateway/dist ./dist
COPY --from=installer /app/apps/gateway/package.json ./

CMD ["node", "dist/index.js"]
```

### B. Python AI Agent (`services/ai-agent/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制源码
COPY . .

# 使用 uvicorn 启动
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### C. Go Realtime (`services/realtime-go/Dockerfile`)

```dockerfile
# Stage 1: 构建
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: 运行 (极小镜像)
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

CMD ["./main"]
```

### D. Java Core (`services/core-java/Dockerfile`)

```dockerfile
# Stage 1: 构建
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: 运行
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

---

## 5. 环境变量模板 (`.env.example`)

```bash
# ===========================================
# Smart Kitchen 环境变量配置
# ===========================================

# 数据库
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=kitchen_db

# Redis
REDIS_URL=redis://localhost:6379

# 认证
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production

# AI 服务
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx

# 服务端口
GATEWAY_PORT=3000
CORE_JAVA_PORT=8080
REALTIME_GO_PORT=8081
AI_AGENT_PORT=8000
```

---

## 6. 启动流程 (The Launch Sequence)

### 开发环境

```bash
# 1. 克隆并安装依赖
git clone <repo>
cd smart-kitchen
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际值

# 3. 启动后端服务 (Docker)
docker compose up -d

# 4. 启动前端开发服务器 (宿主机)
pnpm turbo dev --filter=web
# 或同时启动 web 和 mobile
pnpm turbo dev --filter=web --filter=mobile
```

### 生产环境

```bash
# 构建并启动所有服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 7. 服务通信架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  TanStack   │    │    Expo     │    │   Admin     │         │
│  │   Start     │    │   Mobile    │    │  Dashboard  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Gateway Layer (Port 3000)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Hono BFF                              │   │
│  │  • Better-Auth 认证                                      │   │
│  │  • 请求路由 & 聚合                                        │   │
│  │  • Rate Limiting                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐
│   Core Java     │ │  Realtime Go  │ │   AI Agent    │
│   (Port 8080)   │ │  (Port 8081)  │ │  (Port 8000)  │
│                 │ │               │ │               │
│ • 库存管理       │ │ • WebSocket   │ │ • LLM 调用    │
│ • 用户关系       │ │ • CRDT 同步   │ │ • RAG 检索    │
│ • 定时任务       │ │ • 实时推送    │ │ • 图像识别    │
└────────┬────────┘ └───────┬───────┘ └───────┬───────┘
         │                  │                 │
         └──────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │     PostgreSQL      │    │       Redis         │            │
│  │   + pgvector        │    │                     │            │
│  │   (Port 5432)       │    │   (Port 6379)       │            │
│  │                     │    │                     │            │
│  │ • 关系数据           │    │ • Session 存储      │            │
│  │ • 向量存储           │    │ • Pub/Sub 消息      │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 渐进式演进路线 (推荐)

考虑到项目当前是纯前端应用，建议分阶段演进：

### Phase 1: 基础后端 (MVP)

```
目标: 替换 localStorage，实现数据持久化

实现:
├── apps/gateway/          # Hono + Better-Auth
├── infra/postgres/        # PostgreSQL
└── infra/redis/           # Redis (Session)

工作量: 1-2 周
```

### Phase 2: 实时协同

```
目标: 真正的多人实时协作

新增:
└── services/realtime-go/  # WebSocket + CRDT

工作量: 1 周
```

### Phase 3: AI 能力增强

```
目标: 高级 AI 功能 (RAG, Agent, 图像识别)

新增:
└── services/ai-agent/     # FastAPI + ADK

工作量: 1-2 周
```

### Phase 4: 企业级功能

```
目标: 复杂业务逻辑、定时任务、数据分析

新增:
└── services/core-java/    # Spring Boot

工作量: 2-3 周
```

---

## 9. 技术决策记录 (ADR)

### ADR-001: 为什么选择 Polyglot 架构？

**背景:** 需要支持实时协同、AI 推理、复杂业务逻辑

**决策:** 采用多语言微服务架构

**理由:**
- Go: WebSocket 并发性能最优
- Python: AI/ML 生态最丰富
- Java: 企业级事务处理成熟
- TypeScript: 前后端类型共享

**风险:** 运维复杂度增加，需要 Docker 编排

### ADR-002: 为什么选择 Hono 作为 BFF？

**背景:** 需要一个轻量级的 API 网关

**决策:** 使用 Hono 而非 Express/Fastify

**理由:**
- 极致轻量 (~14KB)
- 原生支持 Edge Runtime
- 类型安全的路由
- 与 Better-Auth 无缝集成

### ADR-003: 为什么选择 pgvector？

**背景:** AI 功能需要向量相似度搜索

**决策:** 使用 PostgreSQL + pgvector 而非独立向量数据库

**理由:**
- 减少基础设施复杂度
- 关系数据和向量数据统一管理
- 对于中小规模足够高效

---

## 10. 待办事项

- [ ] 初始化 Monorepo 结构 (pnpm workspace + Turborepo)
- [ ] 实现 Hono Gateway 基础框架
- [ ] 配置 Better-Auth 认证
- [ ] 设计数据库 Schema (init.sql)
- [ ] 实现 Go WebSocket 服务
- [ ] 实现 Python AI Agent 服务
- [ ] 实现 Java Core 服务
- [ ] 编写 E2E 测试
- [ ] 配置 CI/CD Pipeline
- [ ] 编写部署文档

---

*文档版本: v1.0*
*创建日期: 2026-01-07*
*最后更新: 2026-01-07*
