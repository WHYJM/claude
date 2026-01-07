# ============================================
# Smart Kitchen Gateway - Dockerfile
# ============================================

FROM node:20-alpine AS base

# Stage 1: 安装 turbo 并 prune
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune --scope=@smart-kitchen/gateway --docker

# Stage 2: 安装依赖
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm

# 安装依赖
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@smart-kitchen/gateway...

# Stage 3: 运行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 只复制必要文件
COPY --from=installer /app/apps/gateway/dist ./dist
COPY --from=installer /app/apps/gateway/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
