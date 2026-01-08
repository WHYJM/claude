# ============================================
# Smart Kitchen AI Agent (Google ADK)
# ============================================
#
# 构建: docker build -t smart-kitchen-ai .
# 运行: docker run -p 8000:8000 -e GEMINI_API_KEY=xxx smart-kitchen-ai
#
# 支持两种运行模式:
#   1. FastAPI: uvicorn main:app (默认)
#   2. ADK:     adk web
#
# ============================================

FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制 Agent 代码
COPY smart_kitchen_agent/ ./smart_kitchen_agent/
COPY main.py .
COPY adk.yaml .

# 创建非 root 用户
RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# 端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 默认使用 FastAPI 启动 (可通过 CMD 覆盖为 adk web)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
