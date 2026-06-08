#!/bin/bash

# 开发状态检查脚本
# 用于快速恢复开发状态

echo "=== 🚀 合同管理系统 - 开发状态检查 ==="
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

# 1. 检查当前阶段
echo "📍 当前开发阶段："
if [ -f ".contract-state.json" ]; then
  CURRENT_STAGE=$(jq -r '.currentStage' .contract-state.json)
  STAGE_NAME=$(jq -r '.stageName' .contract-state.json)
  echo "  阶段: Stage $CURRENT_STAGE ($STAGE_NAME)"
  echo "  最后更新: $(jq -r '.lastUpdated' .contract-state.json)"
else
  echo "  ⚠️  未找到状态文件"
fi

echo ""

# 2. 检查Schema同步状态
echo "🔄 Schema同步状态："
if [ -f ".contract-state.json" ]; then
  jq -r '.schemaSyncStatus' .contract-state.json | jq -r 'to_entries[] | "  \(.key): \(.value)"' 2>/dev/null || echo "  ⚠️  无法读取同步状态"
else
  echo "  ⚠️  未找到状态信息"
fi

echo ""

# 3. 检查待处理的Schema更新
echo "⏳ 待处理的Schema更新："
if [ -f ".contract-state.json" ]; then
  PENDING_UPDATES=$(jq -r '.pendingSchemaUpdates[]?' .contract-state.json 2>/dev/null)
  if [ -n "$PENDING_UPDATES" ] && [ "$PENDING_UPDATES" != "null" ]; then
    echo "$PENDING_UPDATES" | sed 's/^/  - /'
  else
    echo "  ✅ 无待处理更新"
  fi
else
  echo "  ⚠️  未找到状态信息"
fi

echo ""

# 4. 检查Schema变更
echo "📝 Schema文件变更："
if git diff --quiet packages/shared/src/schemas/ 2>/dev/null; then
  echo "  ✅ 无未提交的Schema变更"
else
  echo "  ⚠️  检测到未提交的Schema变更："
  git diff --name-only -- packages/shared/src/schemas/ 2>/dev/null | sed 's/^/    /' || echo "    无法读取Git状态"
fi

echo ""

# 5. 检查最近的问题
echo "🔧 最近问题记录："
if [ -f ".contract-state.json" ]; then
  ISSUES=$(jq -r '.backendGate.issues[]? | select(.status == "PENDING") | "\(.title): \(.description)"' .contract-state.json 2>/dev/null)
  if [ -n "$ISSUES" ]; then
    echo "$ISSUES" | sed 's/^/  - /'
  else
    echo "  ✅ 无待处理问题"
  fi
fi

echo ""

# 6. Git状态
echo "📂 Git状态："
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  COMMITS=$(git log --oneline -3 2>/dev/null || echo "无提交记录")
  echo "  当前分支: $BRANCH"
  echo "  最近提交:"
  echo "$COMMITS" | sed 's/^/    /'
else
  echo "  ⚠️  非Git仓库"
fi

echo ""

# 7. 快速操作建议
echo "💡 快速恢复建议："
echo "  1. 查看详细变更记录: cat SCHEMA_CHANGES.md"
echo "  2. 查看快速恢复指南: cat QUICK_RECOVERY.md"
echo "  3. 继续当前阶段: 说'继续[当前阶段名称]'"
echo "  4. 开发新功能: 说'进入契约阶段'"
echo ""

echo "=== 状态检查完成 ==="
