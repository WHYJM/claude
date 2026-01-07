"""
Smart Kitchen AI Agent Service
FastAPI + AI capabilities
"""

from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(
    title="Smart Kitchen AI Agent",
    description="AI-powered recipe recommendations and assistance",
    version="0.0.1",
)

# CORS 配置
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


# ============================================
# API 端点
# ============================================


@app.get("/")
async def root():
    return {
        "name": "Smart Kitchen AI Agent",
        "version": "0.0.1",
        "description": "AI service for recipe recommendations and generation",
        "endpoints": {
            "health": "/health",
            "recommend": "/api/recommend",
            "generate": "/api/generate",
        },
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-agent",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/api/recommend", response_model=List[GeneratedRecipe])
async def recommend_recipes(request: RecommendRequest):
    """
    根据冰箱食材推荐食谱

    TODO: 实现真实的 AI 推荐逻辑
    - 连接 OpenAI/Gemini API
    - 实现 RAG (检索增强生成)
    - 考虑食材过期时间
    """

    # 占位响应
    ingredient_names = [item.name for item in request.ingredients]

    return [
        GeneratedRecipe(
            name="AI 推荐菜品 (占位)",
            description=f"根据您的食材 ({', '.join(ingredient_names[:3])}...) 推荐的菜品",
            ingredients=[
                RecipeIngredient(name=item.name, amount=str(item.amount), unit=item.unit)
                for item in request.ingredients[:5]
            ],
            steps=[
                "步骤 1: TODO - 实现 AI 推荐逻辑",
                "步骤 2: 连接 OpenAI/Gemini API",
                "步骤 3: 返回真实推荐结果",
            ],
            tips="这是一个占位响应，请配置 AI API Key 以获得真实推荐",
            estimated_time=30,
        )
    ]


@app.post("/api/generate", response_model=GeneratedRecipe)
async def generate_recipe(request: GenerateRequest):
    """
    根据菜名生成食谱

    TODO: 实现真实的 AI 生成逻辑
    """

    return GeneratedRecipe(
        name=request.dish_name,
        description=f"{request.dish_name} 的详细做法 (AI 生成占位)",
        ingredients=[
            RecipeIngredient(name="食材 1", amount="适量", unit=""),
            RecipeIngredient(name="食材 2", amount="适量", unit=""),
        ],
        steps=[
            f"步骤 1: 准备制作 {request.dish_name} 的食材",
            "步骤 2: TODO - 实现 AI 生成逻辑",
            "步骤 3: 完成烹饪",
        ],
        tips="这是一个占位响应，请配置 AI API Key 以获得真实食谱",
        estimated_time=45,
    )


# ============================================
# 启动
# ============================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
