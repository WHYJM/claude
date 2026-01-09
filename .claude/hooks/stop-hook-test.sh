#!/bin/bash
# Stop Hook: 在 Claude Code 尝试停止前运行最终验证
# 这个脚本确保代码在任务完成前通过所有检查

echo "==========================================="
echo "Stop Hook: 执行最终验证"
echo "==========================================="

cd "$CLAUDE_PROJECT_DIR"

# 记录是否有错误
HAS_ERRORS=0

# 1. 运行 TypeScript 类型检查
echo ""
echo "[1/4] TypeScript 类型检查..."
if ! pnpm typecheck 2>&1 | tee /tmp/typecheck-output.txt | tail -30; then
  if grep -q "error TS" /tmp/typecheck-output.txt 2>/dev/null; then
    echo "TypeScript 存在类型错误!"
    HAS_ERRORS=1
  fi
fi

# 2. 运行 Lint 检查
echo ""
echo "[2/4] ESLint 检查..."
if ! pnpm lint 2>&1 | tee /tmp/lint-output.txt | tail -30; then
  if grep -qE "(error|Error)" /tmp/lint-output.txt 2>/dev/null; then
    echo "存在 Lint 错误!"
    HAS_ERRORS=1
  fi
fi

# 3. 检查 git 状态
echo ""
echo "[3/4] Git 状态检查..."
git status --short

# 检查是否有未暂存的更改
UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l)

if [ "$UNSTAGED" -gt 0 ]; then
  echo "有 $UNSTAGED 个文件未暂存"
fi

if [ "$UNTRACKED" -gt 0 ]; then
  echo "有 $UNTRACKED 个未跟踪的文件"
fi

# 4. 尝试构建（可选，取消注释启用）
# echo ""
# echo "[4/4] 尝试构建..."
# if ! pnpm build 2>&1 | tail -20; then
#   echo "构建失败!"
#   HAS_ERRORS=1
# fi

echo ""
echo "==========================================="

# 如果有错误，可以选择阻止 Claude 停止
# 返回 exit code 2 会阻止 Claude 停止并显示错误信息
# 取消下面的注释以启用此功能
#
# if [ "$HAS_ERRORS" -eq 1 ]; then
#   echo "发现错误! 请修复后再停止。"
#   exit 2
# fi

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo "所有检查通过!"
else
  echo "注意: 存在一些问题需要关注"
fi

echo "==========================================="

exit 0
