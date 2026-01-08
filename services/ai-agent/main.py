"""
Smart Kitchen AI Agent Service
==============================

基于 Google ADK (Agent Development Kit) 构建的 AI 服务。
提供 REST API 接口供 Gateway 调用。

运行方式：
- 开发: uvicorn main:app --reload --port 8000
- 生产: uvicorn main:app --host 0.0.0.0 --port 8000
- ADK CLI: adk run smart_kitchen_agent
"""

import os
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai

# ADK Agent (当 ADK 可用时启用)
# from google.adk.runners import Runner
# from smart_kitchen_agent import root_agent


# ============================================
# 配置
# ============================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ============================================
# 应用生命周期
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    print("🤖 Smart Kitchen AI Agent starting...")
    if GEMINI_API_KEY:
        print("✅ Gemini API configured")
    else:
        print("⚠️  GEMINI_API_KEY not set - AI features limited")
    yield
    # 关闭时
    print("👋 AI Agent shutting down...")


app = FastAPI(
    title="Smart Kitchen AI Agent",
    description="基于 Google ADK 的智能厨房 AI 服务",
    version="0.0.1",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# 数据模型
# ============================================

class FridgeItem(BaseModel):
    name: str
    amount: float
    unit: str
    category: Optional[str] = None
    expiry_date: Optional[str] = None


class RecipeIngredient(BaseModel):
    name: str
    amount: str
    unit: str


class GeneratedRecipe(BaseModel):
    name: str
    description: str
    ingredients: List[RecipeIngredient]
    steps: List[str]
    tips: Optional[str] = None
    estimated_time: Optional[int] = None


class RecommendRequest(BaseModel):
    ingredients: List[FridgeItem]
    preferences: Optional[str] = None


class GenerateRequest(BaseModel):
    dish_name: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None


# ============================================
# Gemini 调用封装
# ============================================

async def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """调用 Gemini API"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured")

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            system_instruction=system_instruction or "你是一个专业的家庭厨师助手。",
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


# ============================================
# API 端点
# ============================================

@app.get("/")
async def root():
    from smart_kitchen_agent import ADK_AVAILABLE
    return {
        "name": "Smart Kitchen AI Agent",
        "version": "0.0.1",
        "framework": "Google ADK + FastAPI",
        "model": "Gemini 2.0 Flash",
        "adk_available": ADK_AVAILABLE,
        "endpoints": {
            "health": "/health",
            "agent": "/api/agent",
            "recommend": "POST /api/recommend",
            "generate": "POST /api/generate",
            "chat": "POST /api/chat",
            "chat_stream": "POST /api/chat/stream",
        },
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-agent",
        "gemini_configured": bool(GEMINI_API_KEY),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/agent")
async def agent_info():
    """获取 ADK Agent 信息"""
    from smart_kitchen_agent import get_agent_info, ADK_AVAILABLE
    info = get_agent_info()
    info["gemini_configured"] = bool(GEMINI_API_KEY)
    return info


@app.post("/api/recommend", response_model=List[GeneratedRecipe])
async def recommend_recipes(request: RecommendRequest):
    """根据冰箱食材推荐食谱"""

    ingredients_text = "\n".join([
        f"- {item.name}: {item.amount}{item.unit}"
        + (f" (过期日期: {item.expiry_date})" if item.expiry_date else "")
        for item in request.ingredients
    ])

    prompt = f"""根据以下冰箱里的食材，推荐3道可以做的家常菜。

现有食材：
{ingredients_text}

{f"用户偏好：{request.preferences}" if request.preferences else ""}

请按以下 JSON 格式返回（只返回 JSON 数组，不要其他文字）：
[
  {{
    "name": "菜名",
    "description": "简短描述",
    "ingredients": [{{"name": "食材名", "amount": "用量", "unit": "单位"}}],
    "steps": ["步骤1", "步骤2", "步骤3"],
    "tips": "烹饪小贴士",
    "estimated_time": 30
  }}
]

要求：
1. 尽量只使用现有食材
2. 优先使用即将过期的食材
3. 步骤要详细清晰，适合新手"""

    response_text = await call_gemini(prompt)

    # 解析 JSON
    import json
    import re

    try:
        json_match = re.search(r'\[[\s\S]*\]', response_text)
        if json_match:
            recipes = json.loads(json_match.group())
            return [GeneratedRecipe(**r) for r in recipes]
        raise ValueError("No JSON array found")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


@app.post("/api/generate", response_model=GeneratedRecipe)
async def generate_recipe(request: GenerateRequest):
    """根据菜名生成详细食谱"""

    prompt = f"""请为"{request.dish_name}"生成一份详细的家常菜食谱。

请按以下 JSON 格式返回（只返回 JSON 对象，不要其他文字）：
{{
  "name": "{request.dish_name}",
  "description": "简短描述这道菜",
  "ingredients": [{{"name": "食材名", "amount": "用量", "unit": "单位"}}],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "tips": "烹饪小贴士",
  "estimated_time": 30
}}

要求：
1. 食材用量要具体明确
2. 步骤要详细清晰，适合新手
3. 提供实用的烹饪技巧"""

    response_text = await call_gemini(prompt)

    import json
    import re

    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            recipe = json.loads(json_match.group())
            return GeneratedRecipe(**recipe)
        raise ValueError("No JSON object found")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """与 AI 助手对话"""

    system_instruction = """你是 Smart Kitchen 的 AI 助手，一个专业的家庭厨房管理专家。

你可以帮助用户：
- 推荐适合的食谱
- 提供烹饪技巧和建议
- 分析食材搭配
- 解答烹饪相关问题

回复要简洁实用，使用中文。"""

    context_text = ""
    if request.context:
        if request.context.get("fridge_items"):
            items = request.context["fridge_items"]
            context_text = f"\n\n用户冰箱里有：{', '.join([i['name'] for i in items])}"

    prompt = request.message + context_text

    reply = await call_gemini(prompt, system_instruction)

    return ChatResponse(
        reply=reply,
        suggestions=["推荐食谱", "今天吃什么", "食材快过期了怎么办"],
    )


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """流式对话（SSE）"""

    async def generate():
        if not GEMINI_API_KEY:
            yield f"data: {{'error': 'Gemini API not configured'}}\n\n"
            return

        try:
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-exp",
                system_instruction="你是 Smart Kitchen 的 AI 助手。",
            )
            response = model.generate_content(request.message, stream=True)

            for chunk in response:
                if chunk.text:
                    # SSE 格式
                    yield f"data: {chunk.text}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {{'error': '{str(e)}'}}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
    )


# ============================================
# ADK Agent 端点 (当 ADK 完全集成时启用)
# ============================================

# @app.post("/api/agent/run")
# async def run_agent(request: ChatRequest):
#     """运行 ADK Agent"""
#     runner = Runner(agent=root_agent)
#     result = await runner.run(request.message)
#     return {"result": result}


# ============================================
# 启动
# ============================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
