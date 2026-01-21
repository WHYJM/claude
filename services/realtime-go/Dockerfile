# ============================================
# Smart Kitchen Realtime Service (Go)
# ============================================

# Stage 1: 构建
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 复制源代码和依赖文件
COPY go.mod go.sum* ./
COPY . .

# 下载依赖（如果没有 go.sum 则自动生成）
RUN go mod tidy

# 构建
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 2: 运行 (极小镜像)
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8081/health || exit 1

CMD ["./main"]
