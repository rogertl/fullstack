#!/bin/bash
# 端口管理脚本 - 快速诊断和释放端口

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 固定端口配置
BACKEND_PORT=3001
FRONTEND_PORT=3000
DATABASE_PORT=5432

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    local service_name=$2

    echo -e "\n${BLUE}检查 $service_name 端口 $port...${NC}"

    local pid=$(lsof -ti :$port 2>/dev/null || true)

    if [ -z "$pid" ]; then
        print_success "$service_name 端口 $port 可用"
        return 0
    else
        print_error "$service_name 端口 $port 被占用"
        print_info "进程 PID: $pid"

        # 显示进程详情（兼容 macOS 和 Linux）
        if [[ "$OSTYPE" == "darwin"* ]]; then
            ps -p $pid -o pid,ppid,comm 2>/dev/null || true
        else
            ps -p $pid -o pid,ppid,cmd 2>/dev/null || true
        fi

        return 1
    fi
}

# 释放端口
free_port() {
    local port=$1
    local service_name=$2

    echo -e "\n${BLUE}正在释放 $service_name 端口 $port...${NC}"

    local pid=$(lsof -ti :$port 2>/dev/null || true)

    if [ -z "$pid" ]; then
        print_success "$service_name 端口 $port 已经可用"
        return 0
    fi

    # 尝试正常结束
    print_info "尝试正常结束进程 $pid..."
    kill $pid 2>/dev/null || true

    sleep 2

    # 检查是否还在运行
    if lsof -ti :$port >/dev/null 2>&1; then
        print_warning "进程仍在运行，强制结束..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi

    # 最终验证
    if lsof -ti :$port >/dev/null 2>&1; then
        print_error "无法释放端口 $port"
        return 1
    else
        print_success "$service_name 端口 $port 已释放"
        return 0
    fi
}

# 诊断所有服务端口
diagnose() {
    echo -e "${BLUE}=== 端口诊断 ===${NC}"
    echo -e "${BLUE}检查所有服务端口状态...${NC}\n"

    check_port $BACKEND_PORT "后端" || true
    check_port $FRONTEND_PORT "前端" || true
    check_port $DATABASE_PORT "数据库" || true

    echo -e "\n${BLUE}=== 诊断完成 ===${NC}"
}

# 释放所有端口
free_all() {
    echo -e "${YELLOW}=== 释放所有端口 ===${NC}"
    echo -e "${YELLOW}这将结束所有占用服务端口的进程${NC}\n"

    local freed_count=0

    if free_port $BACKEND_PORT "后端"; then
        ((freed_count++))
    fi

    if free_port $FRONTEND_PORT "前端"; then
        ((freed_count++))
    fi

    if free_port $DATABASE_PORT "数据库"; then
        ((freed_count++))
    fi

    echo -e "\n${GREEN}=== 完成：释放了 $freed_count 个端口 ===${NC}"
}

# 释放特定端口
free_specific() {
    local port=$1

    case $port in
        3001)
            free_port $BACKEND_PORT "后端"
            ;;
        3000)
            free_port $FRONTEND_PORT "前端"
            ;;
        5432)
            free_port $DATABASE_PORT "数据库"
            ;;
        *)
            print_error "未知端口: $port"
            print_info "支持的端口: 3001(后端), 3000(前端), 5432(数据库)"
            exit 1
            ;;
    esac
}

# 显示帮助信息
show_help() {
    cat << EOF
${BLUE}端口管理脚本${NC}

用法:
    $0 [command] [options]

命令:
    check           检查所有端口状态（默认）
    free            释放所有端口
    free-backend    仅释放后端端口 (3001)
    free-frontend   仅释放前端端口 (3000)
    free-db         仅释放数据库端口 (5432)
    help            显示此帮助信息

示例:
    $0 check                    # 检查所有端口
    $0 free                     # 释放所有端口
    $0 free-backend             # 仅释放后端端口

${YELLOW}注意:${NC} 固定端口配置：后端=3001, 前端=3000, 数据库=5432

EOF
}

# 主函数
main() {
    local command=${1:-check}

    case $command in
        check)
            diagnose
            ;;
        free)
            free_all
            ;;
        free-backend)
            free_port $BACKEND_PORT "后端"
            ;;
        free-frontend)
            free_port $FRONTEND_PORT "前端"
            ;;
        free-db)
            free_port $DATABASE_PORT "数据库"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
