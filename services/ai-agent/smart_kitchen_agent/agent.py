"""
Smart Kitchen AI Agent - Google ADK
====================================

使用 Google ADK 构建的智能厨房助手 Agent。
负责食谱推荐、食材分析、烹饪指导等功能。

运行方式:
  - ADK CLI: adk run (在 services/ai-agent 目录下)
  - ADK Web: adk web
  - Python:  python -m smart_kitchen_agent
"""

import os

# 尝试导入 ADK，如果未安装则使用 Mock
try:
    from google.adk import Agent
    from google.adk.tools import FunctionTool
    ADK_AVAILABLE = True
except ImportError:
    ADK_AVAILABLE = False
    # Mock classes for when ADK is not installed
    class Agent:
        def __init__(self, **kwargs):
            self.name = kwargs.get('name', 'mock_agent')
            self.model = kwargs.get('model', 'gemini-2.0-flash')
            self.description = kwargs.get('description', '')
            self.instruction = kwargs.get('instruction', '')
            self.tools = kwargs.get('tools', [])

    class FunctionTool:
        def __init__(self, func):
            self.func = func
            self.name = func.__name__


from .tools import (
    recommend_recipes,
    generate_recipe,
    check_ingredients,
    get_cooking_tips,
    analyze_nutrition,
)


# ============================================
# Agent 配置
# ============================================

AGENT_NAME = "smart_kitchen_agent"
AGENT_MODEL = os.getenv("ADK_MODEL", "gemini-2.0-flash-exp")
AGENT_DESCRIPTION = "智能厨房助手，帮助用户管理食材、推荐食谱、提供烹饪指导"

AGENT_INSTRUCTION = """你是 Smart Kitchen 的 AI 助手，一个专业的家庭厨房管理专家。

## 你的主要职责

1. **食谱推荐** - 根据用户冰箱里的食材推荐合适的食谱
2. **食谱生成** - 根据菜名生成详细的烹饪步骤
3. **食材检查** - 检查用户是否有足够的食材来做某道菜
4. **烹饪技巧** - 提供烹饪技巧和建议
5. **营养分析** - 分析食谱的营养成分

## 回复规则

- 使用中文回复
- 推荐食谱时优先考虑即将过期的食材
- 步骤要详细清晰，适合厨房新手
- 提供实用的烹饪小贴士
- 如果缺少食材，建议替代方案
- 回复要简洁实用，避免冗长

## 示例交互

用户: 冰箱里有鸡蛋、西红柿、青椒，能做什么菜？
助手: 根据您的食材，我推荐：
1. **番茄炒蛋** - 经典家常菜，15分钟完成
2. **青椒炒蛋** - 清爽可口
3. **番茄青椒炒蛋** - 三种食材全用上

需要我提供哪道菜的详细做法吗？
"""


# ============================================
# 创建 Root Agent
# ============================================

root_agent = Agent(
    name=AGENT_NAME,
    model=AGENT_MODEL,
    description=AGENT_DESCRIPTION,
    instruction=AGENT_INSTRUCTION,
    tools=[
        FunctionTool(recommend_recipes),
        FunctionTool(generate_recipe),
        FunctionTool(check_ingredients),
        FunctionTool(get_cooking_tips),
        FunctionTool(analyze_nutrition),
    ],
)


# ============================================
# Agent 信息
# ============================================

def get_agent_info() -> dict:
    """获取 Agent 信息"""
    return {
        "name": AGENT_NAME,
        "model": AGENT_MODEL,
        "description": AGENT_DESCRIPTION,
        "adk_available": ADK_AVAILABLE,
        "tools": [
            {"name": "recommend_recipes", "description": "根据食材推荐食谱"},
            {"name": "generate_recipe", "description": "生成详细食谱"},
            {"name": "check_ingredients", "description": "检查食材是否足够"},
            {"name": "get_cooking_tips", "description": "获取烹饪技巧"},
            {"name": "analyze_nutrition", "description": "分析营养成分"},
        ],
    }
