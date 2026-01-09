#!/bin/bash
# Post-Edit Hook: 每次文件编辑后自动运行检查
# 这个脚本会在 Claude Code 执行 Edit/Write/MultiEdit 后自动触发

set -e

# 从 stdin 读取 hook 数据
HOOK_INPUT=$(cat)

# 获取修改的文件路径
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

echo "-------------------------------------------"
echo "Post-Edit Hook: 检查文件 $FILE_PATH"
echo "-------------------------------------------"

cd "$CLAUDE_PROJECT_DIR"

# 确定受影响的包
FILTER=""
if [[ "$FILE_PATH" == apps/web/* ]] || [[ "$FILE_PATH" == */apps/web/* ]]; then
  FILTER="@smart-kitchen/web"
elif [[ "$FILE_PATH" == apps/gateway/* ]] || [[ "$FILE_PATH" == */apps/gateway/* ]]; then
  FILTER="@smart-kitchen/gateway"
elif [[ "$FILE_PATH" == apps/mobile/* ]] || [[ "$FILE_PATH" == */apps/mobile/* ]]; then
  FILTER="@smart-kitchen/mobile"
elif [[ "$FILE_PATH" == packages/ui/* ]] || [[ "$FILE_PATH" == */packages/ui/* ]]; then
  FILTER="@smart-kitchen/ui"
elif [[ "$FILE_PATH" == packages/shared-types/* ]] || [[ "$FILE_PATH" == */packages/shared-types/* ]]; then
  FILTER="@smart-kitchen/shared-types"
elif [[ "$FILE_PATH" == packages/api-client/* ]] || [[ "$FILE_PATH" == */packages/api-client/* ]]; then
  FILTER="@smart-kitchen/api-client"
fi

# TypeScript/JavaScript 文件检查
if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.js ]] || [[ "$FILE_PATH" == *.jsx ]]; then

  # 运行 TypeScript 类型检查
  if [ ! -z "$FILTER" ]; then
    echo "TypeCheck ($FILTER):"
    pnpm turbo run typecheck --filter="$FILTER" 2>&1 | tail -20 || true
  else
    echo "TypeCheck (all):"
    pnpm typecheck 2>&1 | tail -30 || true
  fi

  # 运行 Lint 检查
  if [ ! -z "$FILTER" ]; then
    echo ""
    echo "Lint ($FILTER):"
    pnpm turbo run lint --filter="$FILTER" 2>&1 | tail -20 || true
  fi
fi

# 如果修改了 package.json，验证 JSON 格式
if [[ "$FILE_PATH" == *"package.json" ]]; then
  echo "验证 package.json 格式..."
  jq . "$FILE_PATH" > /dev/null && echo "JSON 格式正确" || echo "JSON 格式错误!"
fi

echo "-------------------------------------------"
echo "Post-Edit Hook 完成"
echo "-------------------------------------------"

exit 0
