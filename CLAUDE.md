# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目性质

这是一个**契约优先全栈开发架构**方法论框架，用于指导其他项目的开发。本项目本身不包含应用程序代码，而是提供：

1. **开发方法论**：契约优先（Contract-First）开发流程
2. **架构文档**：ARCHITECTURE.md（方法论级别架构设计）
3. **门控清单**：CONTRACT_DEV_PROCESS.md（详细流程和检查项）
4. **启动脚本**：scripts/questionnaire.sh 和 scripts/generate-init.sh

## 核心原则

### 唯一真相来源（Single Source of Truth）

**Zod Schema 是所有后续工作的唯一来源，禁止任何偏离。**

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源（不可偏离）
```

### 绝对禁止的行为

❌ **禁止脱离 Zod Schema 进行任何实现**
❌ **禁止绕过 Zod Schema 修改**
❌ **禁止各轨道不一致**

### 4 个并行独立轨道

```
Zod Schema（唯一真相来源）
  ├── 轨道1：OpenAPI 契约
  ├── 轨道2：Prisma → 数据库
  ├── 轨道3：后端 API（NestJS）
  ├── 轨道4：前端 UI（React + TanStack）
  └── 轨道5：集成测试（必须等待1-4全部完成）
```

## 开发阶段

| 阶段 | 中文名称 | 英文名称 | 核心任务 | 行号范围（ARCHITECTURE.md） |
|------|---------|----------|---------|---------------------------|
| -1 | 场景阶段 | Scenario | 理解业务场景，识别核心功能 | 73-112 |
| 0 | 契约阶段 | Schema | **定义 Zod Schema**（唯一真相来源） | 115-366 |
| 1 | 文档阶段 | Documentation | 生成 OpenAPI 文档和 Mock 服务器 | 578-593 |
| 2 | 数据阶段 | Database | 建立数据库结构（Prisma） | 597-617 |
| 3 | 后端阶段 | Backend | 实现 NestJS API | 620-642 |
| 4 | 前端阶段 | Frontend | 实现 React UI | 646-668 |
| 5 | 验证阶段 | Integration | 集成测试验证 | 671-694 |

## 上下文管理策略

**START_HERE.md（7.6KB）是唯一需要常驻上下文的文件**

当用户说"进入 [阶段名称]"或"进入 Stage X"时：
1. 确认用户所指的阶段（使用中文名称/英文名称/编号）
2. **精确读取 ARCHITECTURE.md 对应行号范围**（而非全文）
3. 指导用户完成该阶段的任务

示例：
```
用户："进入契约阶段"
AI：确认您指的是 Stage 0（契约阶段），该阶段负责定义 Zod Schema。
     正在读取 ARCHITECTURE.md 115-366 行...
```

## 技术栈（固定版本）

| 层级 | 技术选型 | 版本要求 |
|------|---------|---------|
| 语言 | TypeScript | >= 5.7.2 |
| 后端框架 | NestJS | >= 10.0 |
| 前端框架 | React | >= 18.3 |
| 状态管理 | @tanstack/react-query | >= 5.60 |
| ORM | Prisma | >= 6.0 |
| 数据库-开发 | SQLite | 3.x |
| 数据库-生产 | PostgreSQL | >= 14 |
| Schema 验证 | Zod | >= 3.23 |
| 后端 Zod 集成 | nestjs-zod | >= 3.0 |
| 契约生成 | zod-openapi | >= 2.0 |
| 契约生成-前端 | orval | >= 7.0 |

## 项目初始化

### 方式 1：交互式配置（推荐）

```bash
mkdir your-project && cd your-project
cp -r ~/projects/合同管理系统/scripts .
./scripts/questionnaire.sh
./scripts/generate-init.sh
npm install
```

### 方式 2：手动配置

```bash
mkdir your-project && cd your-project
cp ~/projects/合同管理系统/START_HERE.md .
cp ~/projects/合同管理系统/ARCHITECTURE.md .
cp ~/projects/合同管理系统/CONTRACT_DEV_PROCESS.md .
# 手动配置 package.json、tsconfig.json 等
```

## 常用命令（参考）

以下命令是生成的项目会包含的命令，本项目本身不包含：

```bash
# 开发环境
npm run dev              # 启动后端 + 前端

# 数据库
npm run db:generate      # 生成 Prisma Client
npm run db:push          # 同步数据库结构
npm run db:seed          # 填充测试数据

# 契约
npm run generate:openapi # 从 Zod 生成 OpenAPI
npm run lint:openapi     # Spectral lint
npm run prism            # 启动 Mock 服务器

# 测试
npm run test             # 运行所有测试
npm run test:unit        # 单元测试
npm run test:integration # 集成测试
npm run test:e2e         # E2E 测试

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run typecheck        # TypeScript 类型检查
```

## 适用场景

✅ **适合**：
- CRUD 为主的管理系统
- RESTful API 风格
- 关系型数据模型
- 需要前后端契约的项目

❌ **不适合**：
- 需要事件溯源的业务（建议使用专门的 CQRS/ES 架构）
- 需要复杂 saga 编排的流程
- 需要读写分离的高并发场景

## 项目状态跟踪

生成的项目会包含 `.contract-state.json` 文件用于跟踪当前阶段：

```json
{
  "currentStage": 0,
  "stageName": "Schema",
  "lastUpdated": "2026-06-08T13:00:00Z",
  "completedStages": []
}
```

## 验证规则

每个轨道完成后，必须验证与 Zod Schema 的一致性：

```bash
# Stage 1: 验证 OpenAPI 与 Zod 一致性
npm run lint:openapi

# Stage 2: 验证 Prisma 与 Zod 一致性
# 手动检查：每个 model 的字段、类型、枚举是否与 Zod 完全一致

# Stage 3: 验证后端 DTO 从 Zod 生成
# 检查 source: 是否使用 createZodDto(ZodSchema)

# Stage 4: 验证前端 API 符合 Zod
# 检查 API 调用：请求/响应是否与 Zod 一致
```

## 阶段切换确认机制

当用户说"进入 [阶段名称]"时：

1. **如果有歧义**：询问用户确认，提供选项
2. **如果明确**：直接进入该阶段，读取 ARCHITECTURE.md 对应行号

示例：
```
用户："进入文档阶段"
AI：您是指 Stage 1（文档阶段）吗？该阶段负责生成 OpenAPI 文档。
    A) 是的，进入文档阶段
    B) 不是，我想进入其他阶段
```

## 文档阅读优先级

1. **START_HERE.md**（优先级最高）- 核心约束和快速启动
2. **ARCHITECTURE.md**（按需精确定位读取）- 各阶段详细指导
3. **CONTRACT_DEV_PROCESS.md**（门控验证时）- 验证清单
