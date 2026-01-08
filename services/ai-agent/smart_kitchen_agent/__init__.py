"""
Smart Kitchen AI Agent Package
==============================

基于 Google ADK 构建的智能厨房助手。

使用方式:
  from smart_kitchen_agent import root_agent, get_agent_info

ADK 运行:
  adk run
  adk web
"""

from .agent import root_agent, get_agent_info, ADK_AVAILABLE

__version__ = "0.0.1"
__all__ = ["root_agent", "get_agent_info", "ADK_AVAILABLE"]
