# 契约优先开发 - 快速启动

> **完整文档**：[ARCHITECTURE.md](ARCHITECTURE.md) （方法论级别架构设计）
> **门控清单**：[CONTRACT_DEV_PROCESS.md](CONTRACT_DEV_PROCESS.md) （详细流程和检查项）

---

## ⚠️ 核心约束（必须遵守）

### 唯一真相来源原则

**Zod Schema 是所有后续工作的唯一来源，禁止任何偏离。**

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源（不可偏离）
```

### 绝对禁止的行为

❌ **禁止脱离 Zod Schema 进行任何实现**：
- 禁止在后端添加 Zod 中未定义的字段
- 禁止在前端请求 Zod 中未定义的字段
- 禁止在数据库添加 Zod 中未定义的列
- 禁止在 OpenAPI 添加 Zod 中未定义的属性

❌ **禁止绕过 Zod Schema 修改**：
- 任何变更必须从修改 Zod Schema 开始
- 禁止直接修改 Prisma Schema 后再补 Zod
- 禁止直接修改后端 DTO 后再补 Zod
- 禁止直接修改前端接口后再补 Zod

❌ **禁止各轨道不一致**：
- OpenAPI 必须与 Zod 完全一致（字段名、类型、验证规则）
- Prisma 必须与 Zod 完全一致（枚举、字段、关系）
- 后端 DTO 必须从 Zod 生成（禁止手动定义）
- 前端 API 调用必须符合 Zod（禁止随意添加字段）

### 强制验证流程

每个轨道完成后，必须验证与 Zod Schema 的一致性：

```bash
# Stage 1: 验证 OpenAPI 与 Zod 一致性
npm run lint:openapi
# 手动检查：每个 Schema 的字段、类型、枚举是否与 Zod 完全一致

# Stage 2: 验证 Prisma 与 Zod 一致性
# 手动检查：每个 model 的字段、类型、枚举是否与 Zod 完全一致

# Stage 3: 验证后端 DTO 从 Zod 生成
# 检查 source: 是否使用 createZodDto(ZodSchema)

# Stage 4: 验证前端 API 符合 Zod
# 检查 API 调用：请求/响应是否与 Zod 一致
```

### 违规后果

如果发现偏离 Zod Schema 的情况：
1. 立即停止该轨道的开发
2. 回滚到 Zod Schema 定义
3. 修正 Zod Schema（如果业务确实需要该字段）
4. 重新同步所有轨道

**核心原则**：Zod Schema 是唯一真相来源，任何轨道不得偏离。

---

## 阶段提示与确认机制

### 完整阶段列表

当您需要切换阶段时，可以参考以下列表：

| 阶段编号 | 中文名称 | 英文名称 | 一句话说明 | 上一阶段 |
|---------|---------|----------|-----------|---------|
| **-1** | 场景阶段 | Scenario | 理解业务场景，识别核心功能 | 无 |
| **0** | 契约阶段 | Schema | 定义 Zod Schema（唯一真相来源） | 场景阶段 |
| **1** | 文档阶段 | Documentation | 生成 OpenAPI 文档和 Mock 服务器 | 契约阶段 |
| **2** | 数据阶段 | Database | 建立数据库结构 | 契约阶段 |
| **3** | 后端阶段 | Backend | 实现 NestJS API | 契约阶段 |
| **4** | 前端阶段 | Frontend | 实现 React UI | 契约阶段 |
| **5** | 验证阶段 | Integration | 集成测试验证 | 所有轨道完成 |

### 切换阶段的方式

**方式1：使用中文名称（推荐）**
```
您："进入契约阶段"
我：确认您指的是 Stage 0（契约阶段），然后指导您执行
```

**方式2：使用英文名称**
```
您："进入 Schema"
我：确认您指的是 Stage 0（契约阶段），然后指导您执行
```

**方式3：使用阶段编号**
```
您："进入 Stage 0"
我：直接指导您执行 Stage 0
```

### 模糊阶段的确认机制

如果您说的阶段名称可能有歧义，我会主动询问：

```
您："进入文档阶段"
我：您是指 Stage 1（文档阶段）吗？该阶段负责生成 OpenAPI 文档。
    选项：
    A) 是的，进入文档阶段
    B) 不是，我想进入其他阶段
    
您："A"
我：好的，进入文档阶段...
```

### 何时提示阶段列表

在以下情况下，我会主动提示完整阶段列表：
1. **项目启动时**：提示从场景阶段（Stage -1）开始
2. **阶段完成时**：提示当前阶段的下一阶段选项
3. **您询问时**：当您问"接下来做什么"或"有哪些阶段"时
4. **发现歧义时**：当您说的阶段名称不明确时

### 阶段依赖关系

```
场景阶段 (-1)
    ↓
契约阶段 (0) ← 【关键阶段：所有后续阶段依赖此阶段】
    ↓
并行开发（可同时进行）
    ├── 文档阶段 (1)
    ├── 数据阶段 (2)
    ├── 后端阶段 (3)
    └── 前端阶段 (4)
    ↓
验证阶段 (5) ← 【必须等待1-4全部完成】
```

**注意**：
- 契约阶段（Stage 0）是核心，所有后续阶段都依赖 Zod Schema 定义
- 文档、数据、后端、前端阶段可以并行开发
- 验证阶段必须在1-4全部完成后才能开始

---

## 第一步：确认当前阶段

**新项目** → 从 Stage -1 开始
**已有项目** → 检查 `.contract-state.json` 确认阶段

---

## 第二步：按阶段阅读（精确定位到行号）

| 阶段 | 中文名称 | 名称 | 阅读范围 | 核心任务 | Zod 约束检查 |
|------|---------|------|---------|---------|-------------|
| -1 | 场景阶段 | Scenario | ARCHITECTURE.md 73-112 行 | 理解业务场景，识别核心功能 | N/A |
| 0 | 契约阶段 | Schema | ARCHITECTURE.md 115-366 行 | **定义 Zod Schema**（唯一真相来源） | ✅ Schema 定义完整 |
| 1 | 文档阶段 | Documentation | ARCHITECTURE.md 578-593 行 | 生成 API 文档和 Mock 服务器 | ✅ 每个字段与 Zod 一致 |
| 2 | 数据阶段 | Database | ARCHITECTURE.md 597-617 行 | 建立数据库结构 | ✅ 每个字段与 Zod 一致 |
| 3 | 后端阶段 | Backend | ARCHITECTURE.md 620-642 行 | 实现后端 API | ✅ DTO 从 Zod 生成 |
| 4 | 前端阶段 | Frontend | ARCHITECTURE.md 646-668 行 | 实现前端 UI | ✅ API 调用符合 Zod |
| 5 | 验证阶段 | Integration | ARCHITECTURE.md 671-694 行 | 验证全栈集成 | ✅ 端到端数据流符合 Zod |

**使用方式**：
```
您："进入契约阶段"（或"进入 Stage 0"）
我：自动读取 ARCHITECTURE.md 115-366 行，指导您完成用户故事和 Zod Schema 定义
```

---

## 第三步：执行门控清单

每个阶段完成后，对照 [CONTRACT_DEV_PROCESS.md](CONTRACT_DEV_PROCESS.md) 的门控清单验证：

### 通用门控项（所有阶段）

- [ ] **Zod 一致性验证**：输出产物是否与 Zod Schema 完全一致
  - 字段名一致（包括命名风格：camelCase / snake_case）
  - 字段类型一致（string / number / date / enum）
  - 验证规则一致（min / max / regex）
  - 枚举值一致（包括大小写）
  - 必填/可选一致（required / nullable）

- [ ] **无偏离检查**：是否添加了 Zod 未定义的字段
  - OpenAPI: 检查 `components.schemas`
  - Prisma: 检查 `schema.prisma`
  - 后端: 检查 DTO 定义是否使用 `createZodDto`
  - 前端: 检查 API 请求/响应

- [ ] **类型安全验证**：TypeScript 编译无错误
  - 无 `any` 类型
  - 所有类型明确
  - 无类型断言

### 阶段特定门控项

详见 [CONTRACT_DEV_PROCESS.md](CONTRACT_DEV_PROCESS.md) 的各阶段门控清单。

---

## 项目初始化脚本

```bash
# 1. 创建项目目录
mkdir your-project && cd your-project

# 2. 复制本文档到项目目录
cp -r /path/to/华道管理系统/START_HERE.md .
cp -r /path/to/华道管理系统/docs/architecture/ARCHITECTURE.md .
cp -r /path/to/华道管理系统/docs/CONTRACT_DEV_PROCESS.md .

# 3. 初始化项目（根据需要选择脚手架）
npm init -y
npm install --save-dev typescript @types/node
# ... 其他依赖
```

---

## 常用命令速查

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

---

## 适用场景

✅ **适合**：
- CRUD 为主的管理系统
- RESTful API 风格
- 关系型数据模型
- 需要前后端契约的项目
- 需要严格类型安全的项目

❌ **不适合**：
- 需要事件溯源的业务（建议使用专门的 CQRS/ES 架构）
- 需要复杂 saga 编排的流程
- 需要读写分离的高并发场景

---

## 技术栈固定版本

| 层级 | 技术选型 | 版本要求 | 用途 |
|------|---------|---------|------|
| 后端框架 | NestJS | >= 10.0 | 后端应用框架 |
| 前端框架 | React | >= 18.3 | UI 框架 |
| 状态管理 | @tanstack/react-query | >= 5.60 | 服务端状态管理 |
| ORM | Prisma | >= 6.0 | 数据库访问层 |
| 数据库-开发 | SQLite | 3.x | 本地开发数据库 |
| 数据库-生产 | PostgreSQL | >= 14 | 生产数据库 |
| Schema 验证 | Zod | >= 3.23 | 运行时类型验证 |
| 后端 Zod 集成 | nestjs-zod | >= 3.0 | Zod → DTO 自动化 |

---

## 开发流程图

```
场景阶段 (Stage -1): 场景描述
  ↓
契约阶段 (Stage 0): 用户故事 + Zod Schema（唯一真相来源）
  ↓
并行开发（4个独立轨道，必须与 Zod 一致）
  ├── 文档阶段 (Stage 1): Zod → OpenAPI（验证：每个字段与 Zod 一致）
  ├── 数据阶段 (Stage 2): Zod → Prisma（验证：每个字段与 Zod 一致）
  ├── 后端阶段 (Stage 3): Zod → NestJS（验证：DTO 从 Zod 生成）
  └── 前端阶段 (Stage 4): Zod → React（验证：API 调用符合 Zod）
  ↓
验证阶段 (Stage 5): 集成测试（验证：端到端数据流符合 Zod）
```

---

## 关键原则总结

1. **Zod Schema 是唯一真相来源** - 禁止任何偏离
2. **4 个轨道完全独立** - 可以并行开发
3. **门控推进机制** - 每阶段必须验证通过
4. **类型安全贯穿始终** - TypeScript + Zod + Prisma
5. **验证层层把关** - 前端、后端、数据库三层验证

---

**下一步**：告诉我"进入 [阶段名称]"或"进入 Stage X"，我会精确加载对应章节并指导您执行。

**阶段名称速查**：
- 场景阶段 (Stage -1) - 理解业务场景
- 契约阶段 (Stage 0) - 定义 Zod Schema
- 文档阶段 (Stage 1) - 生成 OpenAPI 文档
- 数据阶段 (Stage 2) - 建立数据库结构
- 后端阶段 (Stage 3) - 实现 NestJS API
- 前端阶段 (Stage 4) - 实现 React UI
- 验证阶段 (Stage 5) - 集成测试

**重要提醒**：任何轨道的开发都必须严格按照 Zod Schema 执行，不允许随意添加、减少字段。如果发现偏离，立即停止并修正。
