#!/bin/bash
# 契约开发架构 - 项目启动问卷脚本
# 用途：交互式收集项目配置，生成定制化初始化脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置存储目录
CONFIG_DIR=".contract-config"
CONFIG_FILE="$CONFIG_DIR/answers.json"

echo -e "${BLUE}🚀 契约开发架构 - 项目启动向导${NC}"
echo ""
echo "我将问你一些问题来生成最适合的项目配置。"
echo "你可以随时按 Ctrl+C 退出。"
echo ""

# 创建配置目录
mkdir -p "$CONFIG_DIR"

# ===== 第一部分：项目基础信息 =====
echo -e "${GREEN}📋 第一部分：项目基础信息${NC}"

# Q1: 项目名称
read -p "Q1. 项目名称？: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-"未命名项目"}

# Q2: 项目描述（可选）
read -p "Q2. 项目描述（可选，Enter跳过）: " PROJECT_DESC

# Q3: 项目类型
echo ""
echo "Q3. 项目类型？"
echo "  A. 完整全栈项目（前端+后端）"
echo "  B. 纯后端API"
echo "  C. 纯前端项目（调用外部API）"
echo "  D. 验证/测试项目（学习架构）"
read -p "选择（默认A）: " PROJECT_TYPE
PROJECT_TYPE=${PROJECT_TYPE:-"A"}

# ===== 第二部分：技术栈选择 =====
echo ""
echo -e "${GREEN}🔧 第二部分：技术栈选择${NC}"

# Q4: 后端框架（仅A/B时）
if [[ "$PROJECT_TYPE" == "A" ]] || [[ "$PROJECT_TYPE" == "B" ]]; then
    echo "Q4. 后端框架？"
    echo "  A. Express（推荐，生态成熟）"
    echo "  B. Fastify（性能优先）"
    echo "  C. Koa（轻量简洁）"
    echo "  D. NestJS（企业级，TypeScript原生）"
    read -p "选择（默认A）: " BACKEND_FRAMEWORK
    BACKEND_FRAMEWORK=${BACKEND_FRAMEWORK:-"A"}
else
    BACKEND_FRAMEWORK="NONE"
fi

# Q5: 前端框架（仅A时）
if [[ "$PROJECT_TYPE" == "A" ]]; then
    echo "Q5. 前端框架？"
    echo "  A. React + Vite（推荐，快速开发）"
    echo "  B. Vue 3 + Vite"
    echo "  C. Next.js（SSR需求）"
    echo "  D. Svelte（性能优先）"
    read -p "选择（默认A）: " FRONTEND_FRAMEWORK
    FRONTEND_FRAMEWORK=${FRONTEND_FRAMEWORK:-"A"}
else
    FRONTEND_FRAMEWORK="NONE"
fi

# Q6: 数据库
echo "Q6. 数据库？"
echo "  A. SQLite（开发环境，快速启动）"
echo "  B. PostgreSQL（生产推荐）"
echo "  C. MySQL"
echo "  D. MongoDB（文档型）"
echo "  E. 无数据库（纯计算/代理）"
read -p "选择（默认A）: " DATABASE
DATABASE=${DATABASE:-"A"}

# Q7: ORM（仅A/B/C时）
if [[ "$DATABASE" != "E" ]]; then
    echo "Q7. ORM选择？"
    echo "  A. Prisma（推荐，类型安全）"
    echo "  B. Drizzle（轻量，类似SQL）"
    echo "  C. TypeORM（类似Java Hibernate）"
    echo "  D. MikroORM（DCO友好）"
    echo "  E. 纯SQL（无ORM）"
    read -p "选择（默认A）: " ORM
    ORM=${ORM:-"A"}
else
    ORM="NONE"
fi

# ===== 第三部分：架构约束 =====
echo ""
echo -e "${GREEN}🏗️ 第三部分：架构约束${NC}"

# Q9: CQRS/ES
echo "Q9. 是否需要CQRS/ES？"
echo "  A. 完整CQRS + Event Sourcing（复杂领域）"
echo "  B. 仅CQRS（读写分离）"
echo "  C. 传统架构（不分离）"
echo "  D. 不确定，帮我判断"
read -p "选择（默认D）: " CQRS_ES
CQRS_ES=${CQRS_ES:-"D"}

# Q10: DDD
echo "Q10. 是否需要领域驱动设计（DDD）？"
echo "  A. 是（完整DDD）"
echo "  B. 轻量DDD（推荐）"
echo "  C. 否（传统分层）"
read -p "选择（默认B）: " DDD_LEVEL
DDD_LEVEL=${DDD_LEVEL:-"B"}

# Q11: 认证
echo "Q11. 认证方式？"
echo "  A. JWT（推荐，无状态）"
echo "  B. Session（传统）"
echo "  C. OAuth 2.0"
echo "  D. 不需要认证"
read -p "选择（默认A）: " AUTH_TYPE
AUTH_TYPE=${AUTH_TYPE:-"A"}

# ===== 第四部分：开发规范 =====
echo ""
echo -e "${GREEN}📐 第四部分：开发规范${NC}"

# Q12: TypeScript严格模式
read -p "Q12. TypeScript严格模式？（y/n，默认y）: " TS_STRICT
TS_STRICT=${TS_STRICT:-"y"}

# Q13: 测试框架
echo "Q13. 测试框架？"
echo "  A. Vitest（推荐）"
echo "  B. Jest"
echo "  C. 仅单元测试"
echo "  D. 暂不需要测试"
read -p "选择（默认A）: " TEST_FRAMEWORK
TEST_FRAMEWORK=${TEST_FRAMEWORK:-"A"}

# Q15: Git Hooks
read -p "Q15. Git Hooks自动化？（y/n，默认y）: " GIT_HOOKS
GIT_HOOKS=${GIT_HOOKS:-"y"}

# ===== 第五部分：CI/CD =====
echo ""
echo -e "${GREEN}🔄 第五部分：CI/CD${NC}"

# Q16: CI/CD平台
echo "Q16. CI/CD平台？"
echo "  A. GitHub Actions"
echo "  B. GitLab CI"
echo "  C. 暂不需要"
read -p "选择（默认A）: " CICD_PLATFORM
CICD_PLATFORM=${CICD_PLATFORM:-"A"}

# ===== 第六部分：团队与流程 =====
echo ""
echo -e "${GREEN}👥 第六部分：团队与流程${NC}"

# Q18: 团队规模
echo "Q18. 团队规模？"
echo "  A. 个人项目"
echo "  B. 2-5人小团队"
echo "  C. 5-10人团队"
echo "  D. 10人以上大团队"
read -p "选择（默认A）: " TEAM_SIZE
TEAM_SIZE=${TEAM_SIZE:-"A"}

# Q19: 开发模式
echo "Q19. 开发模式？"
echo "  A. 严格遵循7阶段流程"
echo "  B. 简化流程"
echo "  C. 快速原型"
read -p "选择（默认A）: " DEV_MODE
DEV_MODE=${DEV_MODE:-"A"}

# ===== 配置预览 =====
echo ""
echo -e "${YELLOW}📊 配置预览${NC}"
echo "================================"
echo "项目名称: $PROJECT_NAME"
echo "项目类型: $(type_desc $PROJECT_TYPE)"
[[ "$BACKEND_FRAMEWORK" != "NONE" ]] && echo "后端框架: $(backend_desc $BACKEND_FRAMEWORK)"
[[ "$FRONTEND_FRAMEWORK" != "NONE" ]] && echo "前端框架: $(frontend_desc $FRONTEND_FRAMEWORK)"
echo "数据库: $(db_desc $DATABASE)"
echo "团队规模: $(team_desc $TEAM_SIZE)"
echo "================================"
echo ""

# 辅助函数
type_desc() {
    case $1 in
        A) echo "全栈项目" ;;
        B) echo "纯后端API" ;;
        C) echo "纯前端项目" ;;
        D) echo "验证/测试项目" ;;
    esac
}

backend_desc() {
    case $1 in
        A) echo "Express" ;;
        B) echo "Fastify" ;;
        C) echo "Koa" ;;
        D) echo "NestJS" ;;
        NONE) echo "" ;;
    esac
}

frontend_desc() {
    case $1 in
        A) echo "React + Vite" ;;
        B) echo "Vue 3 + Vite" ;;
        C) echo "Next.js" ;;
        D) echo "Svelte" ;;
        NONE) echo "" ;;
    esac
}

db_desc() {
    case $1 in
        A) echo "SQLite" ;;
        B) echo "PostgreSQL" ;;
        C) echo "MySQL" ;;
        D) echo "MongoDB" ;;
        E) echo "无数据库" ;;
    esac
}

team_desc() {
    case $1 in
        A) echo "个人项目" ;;
        B) echo "2-5人小团队" ;;
        C) echo "5-10人团队" ;;
        D) echo "10人以上大团队" ;;
    esac
}

# 保存配置
cat > "$CONFIG_FILE" <<EOF
{
  "projectName": "$PROJECT_NAME",
  "projectDesc": "$PROJECT_DESC",
  "projectType": "$PROJECT_TYPE",
  "backendFramework": "$BACKEND_FRAMEWORK",
  "frontendFramework": "$FRONTEND_FRAMEWORK",
  "database": "$DATABASE",
  "orm": "$ORM",
  "cqrsEs": "$CQRS_ES",
  "dddLevel": "$DDD_LEVEL",
  "authType": "$AUTH_TYPE",
  "tsStrict": "$TS_STRICT",
  "testFramework": "$TEST_FRAMEWORK",
  "gitHooks": "$GIT_HOOKS",
  "cicdPlatform": "$CICD_PLATFORM",
  "teamSize": "$TEAM_SIZE",
  "devMode": "$DEV_MODE"
}
EOF

echo "配置已保存到 $CONFIG_FILE"
echo ""
echo "下一步：运行 ./scripts/generate-init.sh 来生成项目文件"
