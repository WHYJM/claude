"""
Smart Kitchen AI Agent - Google ADK
====================================

使用 Google ADK 构建的智能厨房助手 Agent。
负责食谱推荐、食材分析、烹饪指导等功能。
"""

from google.adk import Agent
from google.adk.tools import FunctionTool

from .tools import (
    recommend_recipes,
    generate_recipe,
    check_ingredients,
    get_cooking_tips,
    analyze_nutrition,
)

# ============================================
# Smart Kitchen Root Agent
# ============================================

root_agent = Agent(
    name="smart_kitchen_agent",
    model="gemini-2.0-flash",  # 使用 Gemini 模型
    description="智能厨房助手，帮助用户管理食材、推荐食谱、提供烹饪指导",
    instruction="""你是 Smart Kitchen 的 AI 助手，一个专业的家庭厨房管理专家。

你的主要职责：
1. 根据用户冰箱里的食材推荐合适的食谱
2. 根据菜名生成详细的烹饪步骤
3. 检查用户是否有足够的食材来做某道菜
4. 提供烹饪技巧和建议
5. 分析食谱的营养成分

回复规则：
- 使用中文回复
- 推荐食谱时优先考虑即将过期的食材
- 步骤要详细清晰，适合厨房新手
- 提供实用的烹饪小贴士
- 如果缺少食材，建议替代方案
""",
    tools=[
        FunctionTool(recommend_recipes),
        FunctionTool(generate_recipe),
        FunctionTool(check_ingredients),
        FunctionTool(get_cooking_tips),
        FunctionTool(analyze_nutrition),
    ],
)
