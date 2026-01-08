"""
Smart Kitchen AI Agent - ADK 服务入口
=====================================

运行方式：
  1. ADK CLI:     adk run
  2. ADK Web:     adk web
  3. Python:      python -m smart_kitchen_agent
  4. FastAPI:     uvicorn main:app
"""

import os
import asyncio
from smart_kitchen_agent import root_agent


def main():
    """CLI 入口点"""
    print("🍳 Smart Kitchen AI Agent")
    print("=" * 40)
    print(f"Agent: {root_agent.name}")
    print(f"Model: {root_agent.model}")
    print("=" * 40)

    # 检查 API Key
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  警告: GEMINI_API_KEY 未设置")
        print("   请设置环境变量: export GEMINI_API_KEY=your-api-key")
    else:
        print("✅ Gemini API 已配置")

    print("\n可用命令:")
    print("  adk run              - 启动 Agent 服务")
    print("  adk web              - 启动 Web UI")
    print("  adk chat             - 命令行对话")
    print("  uvicorn main:app     - 启动 FastAPI 服务")


async def run_agent_loop():
    """交互式对话循环"""
    print("\n🤖 进入对话模式 (输入 'quit' 退出)")
    print("-" * 40)

    while True:
        try:
            user_input = input("\n你: ").strip()
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 再见!")
                break
            if not user_input:
                continue

            # TODO: 使用 ADK Runner 执行 agent
            # from google.adk.runners import Runner
            # runner = Runner(agent=root_agent)
            # response = await runner.run(user_input)
            # print(f"\n助手: {response}")

            print("\n助手: [ADK Runner 集成中...]")

        except KeyboardInterrupt:
            print("\n👋 再见!")
            break


if __name__ == "__main__":
    main()
