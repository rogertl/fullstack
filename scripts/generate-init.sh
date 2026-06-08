#!/bin/bash
# 契约开发架构 - 配置生成脚本
# 用途：基于问卷答案生成项目初始化文件

set -e

CONFIG_FILE=".contract-config/answers.json"
PROJECT_ROOT=$(pwd)

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误：未找到配置文件${NC}"
    echo "请先运行 ./scripts/questionnaire.sh"
    exit 1
fi

# 读取配置
source <(jq -r 'to_entries | .[] | "export \(.key)=\(.value)"' "$CONFIG_FILE")

echo -e "${BLUE}🔧 生成项目配置${NC}"
echo ""

# ===== 生成 package.json =====
echo "生成 package.json..."

cat > package.json <<EOF
{
  "name": "$(echo $projectName | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')",
  "version": "0.1.0",
  "description": "$projectDesc",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "tsx watch src/backend/index.ts",
    "dev:frontend": "vite",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "tsc",
    "test": "vitest",
    "test:unit": "vitest --run src/**/*.test.ts",
    "test:integration": "vitest --run tests/integration",
    "test:e2e": "playwright test",
    "test:contract": "npm run validate:api",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "validate:api": "spectral lint openapi/spec.yaml",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "generate:types": "openapi-typescript openapi/spec.yaml -o src/shared/types/api.ts",
    "generate:schemas": "tsx scripts/generate-zod.ts",
    "prepare": "husky install"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.4",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "concurrently": "^8.2.2",
    "tsx": "^4.6.2",
    "openapi-typescript-cli": "^0.0.4",
    "@stoplight/spectral-cli": "^6.11.0",
    "prisma": "^5.7.0",
    "playwright": "^1.40.0"
  }
}
EOF

# ===== 生成 tsconfig.json =====
echo "生成 tsconfig.json..."

TS_STRICT_FLAG="true"
if [ "$tsStrict" != "y" ]; then
    TS_STRICT_FLAG="false"
fi

cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "rootDir": "src",
    "outDir": "dist",
    "strict": $TS_STRICT_FLAG,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# ===== 生成 Prisma Schema =====
echo "生成 prisma/schema.prisma..."

mkdir -p prisma

DB_PROVIDER="sqlite"
if [ "$database" == "B" ]; then
    DB_PROVIDER="postgresql"
elif [ "$database" == "C" ]; then
    DB_PROVIDER="mysql"
elif [ "$database" == "D" ]; then
    DB_PROVIDER="mongodb"
fi

cat > prisma/schema.prisma <<EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "$DB_PROVIDER"
  url      = env("DATABASE_URL")
}

// TODO: 添加你的模型定义
// 示例：
// model User {
//   id        String   @id @default(cuid())
//   email     String   @unique
//   name      String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
EOF

# ===== 生成环境变量模板 =====
echo "生成 .env.example..."

cat > .env.example <<EOF
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=development

# API
API_BASE_URL=http://localhost:3000
EOF

cp .env.example .env

# ===== 生成 Spectral 配置 =====
echo "生成 openapi/.spectral.yaml..."

mkdir -p openapi

cat > openapi/.spectral.yaml <<EOF
extends: spectral:oas
rules:
  operation-operation-id: warn
  operation-tag-defined: warn
  operation-description: warn
  info-description: warn
  no-eval-in-markdown: off
  typed-enum: off
EOF

# ===== 生成 Vite 配置 =====
echo "生成 vite.config.ts..."

cat > vite.config.ts <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/frontend',
  },
})
EOF

# ===== 生成 Vitest 配置 =====
echo "生成 vitest.config.ts..."

cat > vitest.config.ts <<EOF
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
EOF

# ===== 生成 ESLint 配置 =====
echo "生成 eslint.config.js..."

cat > eslint.config.js <<EOF
export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
EOF

# ===== 创建目录结构 =====
echo "创建项目目录结构..."

mkdir -p src/backend
mkdir -p src/frontend
mkdir -p src/shared/types
mkdir -p src/shared/schemas
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p scripts

# ===== 生成初始 OpenAPI spec =====
echo "生成 openapi/spec.yaml..."

cat > openapi/spec.yaml <<EOF
openapi: 3.0.0
info:
  title: $projectName API
  version: 0.1.0
  description: $projectDesc
servers:
  - url: http://localhost:3000/api
    description: Development server

paths: {}
components:
  schemas: {}
EOF

# ===== 生成 .gitignore =====
echo "生成 .gitignore..."

cat > .gitignore <<EOF
# Dependencies
node_modules/

# Build output
dist/
*.log

# Environment
.env
.env.local

# Database
*.db
*.db-journal

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
playwright-report/
EOF

# ===== 生成状态文件 =====
echo "生成 .contract-state.json..."

cat > .contract-state.json <<EOF
{
  "stage": "1",
  "lastUpdate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "projectName": "$projectName",
  "projectType": "$projectType"
}
EOF

# ===== 完成提示 =====
echo ""
echo -e "${GREEN}✅ 项目配置生成完成！${NC}"
echo ""
echo "下一步："
echo "  1. 运行 npm install 安装依赖"
echo "  2. 运行 npm run db:generate 生成 Prisma 客户端"
echo "  3. 开始 Stage 1：设计 API 契约"
echo ""
echo "提示：运行 ./scripts/questionnaire.sh 可以重新配置"
