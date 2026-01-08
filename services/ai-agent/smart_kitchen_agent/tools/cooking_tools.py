"""
烹饪相关工具 - Smart Kitchen Agent Tools
"""

from typing import List, Optional


def get_cooking_tips(
    dish_name: str,
    skill_level: str = "beginner",
) -> dict:
    """
    获取特定菜品的烹饪技巧。

    Args:
        dish_name: 菜品名称
        skill_level: 厨艺水平 ("beginner", "intermediate", "advanced")

    Returns:
        烹饪技巧和注意事项
    """
    return {
        "dish_name": dish_name,
        "skill_level": skill_level,
        "instruction": f"请提供制作 {dish_name} 的实用技巧，针对{skill_level}水平的厨师",
    }


def analyze_nutrition(
    ingredients: List[dict],
    servings: int = 2,
) -> dict:
    """
    分析食谱的营养成分。

    Args:
        ingredients: 食材列表，包含名称和用量
        servings: 份数

    Returns:
        营养分析结果
    """
    return {
        "ingredients": ingredients,
        "servings": servings,
        "instruction": "请估算这些食材的大致营养成分（热量、蛋白质、碳水、脂肪）",
    }
