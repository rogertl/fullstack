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

## 状态管理（重要）

### 🎯 每次会话开始时必须执行

**第一步：检查开发状态**
```bash
bash scripts/check-status.sh
```

这个命令会显示：
- 当前开发阶段
- Schema同步状态
- 待处理的变更
- 最近的问题记录

### 📋 状态文件说明

| 文件 | 用途 | 谁应该更新 |
|------|------|------------|
| `.contract-state.json` | 当前开发状态、阶段信息、问题追踪 | Claude自动更新 |
| `SCHEMA_CHANGES.md` | Schema变更记录、影响范围追踪 | 修改Schema时立即更新 |
| `QUICK_RECOVERY.md` | 快速恢复指南、标准流程 | 只读，参考使用 |
| `scripts/check-status.sh` | 状态检查脚本 | Claude调用，用户也可调用 |

### 🔄 状态恢复流程

1. **用户说"继续开发"或类似指令**
2. **Claude立即运行** `bash scripts/check-status.sh`
3. **Claude根据状态报告**：
   - 确认当前阶段
   - 检查待处理事项
   - 提出下一步建议

### ⚠️ Schema变更强制要求

**当修改任何Schema文件时，必须立即：**

1. **更新SCHEMA_CHANGES.md**
   ```markdown
   ### YYYY-MM-DD SchemaName 变更
   **影响范围**:
   - ✅ Backend: ...
   - ⏳ Frontend: ...
   ```

2. **更新.contract-state.json**
   ```json
   {
   "schemaSyncStatus": {
     "backend": "SYNCED",
     "frontend": "PENDING"
   },
   "pendingSchemaUpdates": ["具体变更描述"]
   }
   ```

3. **验证受影响的轨道**
   - 后端：重新构建，测试API
   - 前端：检查API调用是否需要更新
   - 数据库：检查Prisma Schema是否同步

### 🚨 禁止的行为

❌ **禁止跳过状态检查直接开发**
❌ **禁止修改Schema不记录到SCHEMA_CHANGES.md**
❌ **禁止在状态不同步时开始新功能**

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

## 🤖 与Claude协作的关键指令

### 状态恢复指令（触发自动检查）
当用户说以下关键词时，Claude必须先运行状态检查：
- "继续开发"
- "恢复工作"
- "上次做到哪了"
- "检查状态"
- "开发进度"

**自动执行**：
```bash
bash scripts/check-status.sh
```

### 阶段切换指令（触发 ARCHITECTURE.md 读取）
当用户说"进入 [阶段名称]"或"进入 Stage X"时：
1. 确认用户所指的阶段
2. 读取 ARCHITECTURE.md 对应行号范围的详细指导
3. 引导用户完成该阶段任务

### 开发新功能指令（强制契约优先）
当用户要求开发新功能时：
1. 检查当前阶段是否为Stage 0（契约阶段）
2. 如果不是，引导用户："需要先进入契约阶段定义Schema"
3. 严格遵循：用户故事 → Zod Schema → 4个轨道

### 🚨 Claude必须遵守的记忆规则

**每次会话开始时的检查清单**：
- [ ] 用户说"继续"类指令 → 自动运行状态检查
- [ ] 用户说"开发XX功能" → 检查是否需要先定义Schema
- [ ] 修改Schema文件 → 立即更新SCHEMA_CHANGES.md
- [ ] 完成阶段任务 → 更新.contract-state.json

**禁止行为**：
- ❌ 跳过状态检查直接开发
- ❌ 绕过Schema定义修改实现
- ❌ 在状态不一致时开始新功能

## 🔧 自动执行协议

### 会话开始时的自动检查

**在响应任何用户请求之前，Claude必须先检查：**
1. 检查 `.contract-state.json` 是否存在
2. 如果存在，读取当前阶段和状态
3. 根据用户指令判断是否需要运行状态检查

### 触发条件（必须执行状态检查）

**必须执行状态检查的情况**：
- 用户说"继续"、"上次"、"恢复"等关键词
- 用户询问当前进度、状态
- 用户要求开发新功能
- 距离项目超过1小时后重新开始

**检查流程**：
```bash
bash scripts/check-status.sh || echo "状态检查脚本未找到"
```

### 状态报告格式

Claude在状态检查后必须向用户报告：
1. 当前开发阶段
2. Schema同步状态
3. 待处理事项（如有）
4. 建议的下一步行动

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
# Stage 0: Zod Schema 自检
# 参考 ZOD_SCHEMA_CHECKLIST.md 进行完整验证

# Stage 1: 验证 OpenAPI 与 Zod 一致性
npm run lint:openapi

# Stage 2: 验证 Prisma 与 Zod 一致性
# 手动检查：每个 model 的字段、类型、枚举是否与 Zod 完全一致

# Stage 3: 验证后端 DTO 从 Zod 生成
# 检查 source: 是否使用 createZodDto(ZodSchema)

# Stage 4: 验证前端 API 符合 Zod
# 检查 API 调用：请求/响应是否与 Zod 一致
```

### Stage 0 门控清单

**Zod Schema 是唯一真相来源，必须严格验证。**

完整门控清单参见：**`ZOD_SCHEMA_CHECKLIST.md`**

**快速检查（必检项）：**
1. ✅ 使用 `'zod/v4'` 导入
2. ✅ 枚举使用 `z.enum()`，不用 TS enum
3. ✅ 所有字段有 `.meta({ description: ... })`
4. ✅ 正则有错误提示：`.regex(..., { message: '...' })`
5. ✅ 多行链式格式
6. ✅ `.nullable()` 在验证方法之后
7. ✅ 类型使用 `z.infer<>` 推导
8. ✅ 编译通过

**通过标准：**
- 所有适用项通过
- TypeScript 编译无错误
- 与场景文档一致
- 业务规则完整实现

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
