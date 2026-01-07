"""
食谱相关工具 - Smart Kitchen Agent Tools
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class Ingredient(BaseModel):
    """食材"""
    name: str = Field(description="食材名称")
    amount: float = Field(description="数量")
    unit: str = Field(description="单位")
    expiry_date: Optional[str] = Field(default=None, description="过期日期 (ISO 格式)")


class RecipeIngredient(BaseModel):
    """食谱食材"""
    name: str
    amount: str
    unit: str


class GeneratedRecipe(BaseModel):
    """生成的食谱"""
    name: str
    description: str
    ingredients: List[RecipeIngredient]
    steps: List[str]
    tips: Optional[str] = None
    estimated_time: Optional[int] = None  # 分钟


def recommend_recipes(
    ingredients: List[dict],
    preferences: Optional[str] = None,
    max_results: int = 3,
) -> List[dict]:
    """
    根据冰箱里的食材推荐食谱。

    Args:
        ingredients: 冰箱里的食材列表，每个食材包含 name, amount, unit, expiry_date
        preferences: 用户偏好（如"清淡"、"快手菜"、"适合新手"）
        max_results: 返回的最大食谱数量

    Returns:
        推荐的食谱列表
    """
    # 这是工具的"骨架"实现
    # 实际推荐逻辑由 Agent 的 LLM 能力完成

    ingredient_names = [ing.get("name", "") for ing in ingredients]
    expiring_soon = [
        ing.get("name") for ing in ingredients
        if ing.get("expiry_date")  # 有过期日期的优先
    ]

    # 返回上下文信息，Agent 会基于此生成推荐
    return {
        "available_ingredients": ingredient_names,
        "expiring_soon": expiring_soon,
        "preferences": preferences,
        "max_results": max_results,
        "instruction": "请根据这些食材推荐合适的家常菜食谱",
    }


def generate_recipe(dish_name: str) -> dict:
    """
    根据菜名生成详细的食谱。

    Args:
        dish_name: 菜品名称（如"红烧肉"、"番茄炒蛋"）

    Returns:
        包含食材、步骤、技巧的完整食谱
    """
    return {
        "dish_name": dish_name,
        "instruction": f"请生成 {dish_name} 的详细食谱，包括食材用量、步骤和烹饪技巧",
    }


def check_ingredients(
    recipe_name: str,
    recipe_ingredients: List[str],
    fridge_items: List[dict],
) -> dict:
    """
    检查冰箱食材是否足够制作某道菜。

    Args:
        recipe_name: 食谱名称
        recipe_ingredients: 食谱需要的食材列表
        fridge_items: 冰箱里现有的食材

    Returns:
        匹配结果，包括已有、缺少的食材和建议
    """
    fridge_names = [item.get("name", "") for item in fridge_items]

    return {
        "recipe_name": recipe_name,
        "required": recipe_ingredients,
        "available_in_fridge": fridge_names,
        "instruction": "请分析哪些食材已有、哪些缺少，并提供替代建议",
    }
