# 合同管理系统

用来管理华道的业务合同

---

## 📁 项目结构

```
合同管理系统/
├── apps/
│   ├── backend/       # NestJS 后端
│   └── frontend/      # Next.js 前端
├── packages/
│   ├── database/      # Prisma Schema（共享）
│   └── shared/        # 共享类型和工具
├── START_HERE.md      # 快速启动指南
├── ARCHITECTURE.md    # 架构文档
├── CONTRACT_DEV_PROCESS.md # 流程门控清单
└── .contract-state.json # 开发阶段状态
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
# 安装 pnpm（如果没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 同步数据库结构
pnpm db:push
```

### 启动开发服务器

```bash
# 同时启动后端和前端
pnpm dev

# 或单独启动
pnpm dev:backend  # http://localhost:3001
pnpm dev:frontend # http://localhost:3000
```

---

## 📊 开发阶段

| 阶段 | 名称 | 状态 | 说明 |
|------|------|------|------|
| -1 | 场景阶段 | ⏳ 当前 | 理解业务场景 |
| 0 | 契约阶段 | ⏸️ | 定义 Zod Schema（唯一真相来源） |
| 1 | 文档阶段 | ⏸️ | 生成 OpenAPI 文档 |
| 2 | 数据阶段 | ⏸️ | 建立数据库结构 |
| 3 | 后端阶段 | ⏸️ | 实现 NestJS API |
| 4 | 前端阶段 | ⏸️ | 实现 React UI |
| 5 | 验证阶段 | ⏸️ | 集成测试 |

当前阶段：**场景阶段（Stage -1）**

---

## 🛠️ 常用命令

```bash
# 开发
pnpm dev              # 启动后端 + 前端
pnpm dev:backend      # 仅启动后端
pnpm dev:frontend     # 仅启动前端

# 数据库
pnpm db:generate      # 生成 Prisma Client
pnpm db:push          # 同步数据库结构
pnpm db:seed          # 填充测试数据
pnpm db:studio        # 打开 Prisma Studio

# 测试
pnpm test             # 运行所有测试
pnpm test:unit        # 单元测试
pnpm test:integration # 集成测试

# 代码质量
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
pnpm typecheck        # TypeScript 类型检查
```

---

## 📚 技术栈

| 层级 | 技术选型 |
|------|---------|
| **架构** | Monorepo + 轻量 DDD |
| **后端** | NestJS + Prisma |
| **前端** | Next.js + TanStack Query |
| **数据库** | SQLite（开发）/ PostgreSQL（生产） |
| **认证** | JWT 双 token 模式 |
| **契约** | Zod Schema（唯一真相来源） |

---

## 📖 开发流程

1. **阅读 START_HERE.md**（5分钟）
   → 理解核心约束和开发流程

2. **告诉 AI："进入场景阶段"或"进入 Stage -1"**
   → AI 会指导你完成场景描述

3. **按阶段推进**
   → 每个阶段完成后，对照门控清单验证

---

## ⚠️ 核心约束

**Zod Schema 是唯一真相来源，禁止任何偏离。**

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源（不可偏离）
```

---

## 📞 支持

详细文档请查看：
- [快速启动](./START_HERE.md)
- [架构设计](./ARCHITECTURE.md)
- [流程门控](./CONTRACT_DEV_PROCESS.md)
