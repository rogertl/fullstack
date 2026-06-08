#!/bin/bash
# 快捷恢复开发命令
# 使用方法: ./scripts/dev-continue.sh [任务描述]

TASK=${1:-"继续开发"}

echo "🚀 正在恢复开发状态..."
echo ""

# 运行状态检查
bash scripts/check-status.sh

echo ""
echo "📋 你的任务: $TASK"
echo ""
echo "💡 现在你可以告诉我具体要做什么，比如："
echo "   - '继续后端API开发'"
echo "   - '处理前端同步问题'"
echo "   - '进入契约阶段，开发XX功能'"
echo "   - '修复登出功能'"
echo ""
