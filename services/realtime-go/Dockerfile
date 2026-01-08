# ============================================
# Smart Kitchen Realtime Service (Go)
# ============================================

# Stage 1: 构建
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 安装依赖
COPY go.mod go.sum* ./
RUN go mod download

# 构建
COPY . .
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
