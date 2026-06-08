# 契约优先全栈架构

> **文档版本**: v6.4.0
> **最后更新**: 2026-06-08
> **文档类型**: 标准化架构文档
> **适用范围**: 任何采用契约优先开发方法论的项目

---

## 文档说明

### 文档定位

本文档是**方法论级别的架构文档**，适用于任何采用契约优先开发方法论的项目。文档描述的是：
- **架构原则**：唯一真相来源、并行轨道、门控推进
- **架构模式**：层次划分、职责定义
- **技术选型**：推荐的技术栈和工具
- **设计约束**：必须遵守的规则和边界

### 示例标注说明

文档中使用 `[]` 和 `例如：` 标注的内容均为**示例**，用于说明架构模式的应用：

```
[认证模块] (例如：AuthModule)
```

**含义**：
- **`[]` 内的名称**：该层级的通用职责描述
- **`例如：` 后的内容**：华道管理系统项目中的具体实现示例

**使用方式**：
- 不同项目可以有不同的模块名称（如：CustomerModule 替代 UsersModule）
- 但必须遵守相同的架构模式和层次职责

### 与代码示例文档的关系

- **本文档**：架构设计、原则、模式（通用）
- **代码示例文档**：具体实现、代码参考（项目特定）

---

## 📋 目录

1. [开发流程](#开发流程)
2. [架构原则](#架构原则)
3. [技术栈定义](#技术栈定义)
4. [系统架构](#系统架构)
5. [轨道设计](#轨道设计)
6. [数据流](#数据流)
7. [验证策略](#验证策略)
8. [质量保证](#质量保证)

---

## 开发流程

### 完整开发阶段

```
开发流程/
  ├── 阶段 -1：场景描述（场景阶段）
  ├── 阶段 0：用户故事 + Zod Schema（契约阶段，唯一真相来源）
  ├── 并行开发阶段（4个独立轨道）
  │   ├── 阶段 1：Zod → OpenAPI（文档阶段）
  │   ├── 阶段 2：Zod → Prisma（数据阶段）
  │   ├── 阶段 3：Zod → NestJS（后端阶段）
  │   └── 阶段 4：Zod → React + TanStack（前端阶段）
  └── 阶段 5：集成测试（验证阶段）
```

---

### 阶段 -1：场景描述（场景阶段）

**目标**：理解业务场景，明确项目要解决什么问题

**输入产物**：
- 业务需求描述
- 利益相关者访谈
- 竞品分析（如有）

**输出产物**：
- 场景描述文档
- 核心问题识别
- 项目边界定义

**关键问题**：
1. 谁是目标用户？
2. 主要功能是什么？（列出前 3 个核心功能）
3. 有哪些非功能性需求？（性能、安全、可维护性）

**示例场景**（仅供参考）：
```
目标用户：中小企业主
核心功能：
  1. 用户管理（创建、分配权限）
  2. 部门管理（组织架构）
  3. 操作日志（审计追踪）
非功能性需求：
  - 数据安全（企业数据敏感）
  - 操作可追溯（合规要求）
  - 权限严格（不同角色不同权限）
```

**门控清单**：
- [ ] 场景描述清晰
- [ ] 目标用户明确
- [ ] 核心功能识别
- [ ] 项目边界定义
- [ ] 非功能性需求明确

---

### 阶段 0：用户故事 + Zod Schema（契约阶段 - 唯一真相来源）

**目标**：将场景转化为可测试的用户故事，建立领域模型，并定义 Zod Schema 作为唯一真相来源

**输入产物**：
- 场景描述文档（阶段 -1 输出）

**输出产物**：
- 用户故事文档（Given-When-Then 格式）
- 领域模型清单（核心实体、值对象、聚合根）
- 实体关系图
- `src/shared/schemas/*.ts` - Zod Schema 定义
- `src/shared/schemas/index.ts` - 统一导出

**内部流程**：
```
阶段 0 执行步骤/
  ├── 步骤1：用户故事编写
  │   └── 提取功能需求
  ├── 步骤2：领域建模
  │   ├── 从用户故事识别实体
  │   ├── 定义实体属性和关系
  │   ├── 识别值对象和聚合根
  │   └── [有状态流转的实体]设计状态机
  ├── 步骤3：Zod Schema 定义
  │   ├── 实体 → z.object()
  │   ├── 关系 → z.ref() / z.array()
  │   ├── 状态 → z.enum()
  │   └── 验证规则 → z.min() / z.max()
  └── 步骤4：类型推导
      └── 通过 z.infer<> 推导 TypeScript 类型
```

**用户故事格式**：
```
作为 [角色]
我想要 [功能]
以便 [价值]

验收标准：
  - Given [前置条件]
  - When [操作]
  - Then [结果]
```

**领域建模原则**：

从用户故事中提取名词，识别三类实体：

```
领域模型分类/
  ├── 核心实体（Core Entities）
  │   ├── 有独立生命周期的对象
  │   ├── 例如：User, Contract, Order
  │   └── 特点：有唯一标识符
  ├── 值对象（Value Objects）
  │   ├── 不可变的属性集合
  │   ├── 例如：Email, Money, Address
  │   └── 特点：由属性值决定相等性
  └── 聚合根（Aggregates）
      ├── 数据一致性的边界
      ├── 例如：Order（包含 OrderItem）
      └── 特点：通过根对象访问内部实体
```

**实体关系建模**：

```
关系类型/
  ├── 一对一（1:1）
  │   ├── User → Profile（has one）
  │   └── Prisma：@relation()
  ├── 一对多（1:N）
  │   ├── Department → Users（has many）
  │   └── Prisma：@relation() + 外键
  └── 多对多（N:M）
      ├── User ↔ Roles（many to many）
      └── Prisma：@relation() + 隐式中间表
```

**建模原则**：
- 关系方向：根据业务查询需求确定方向
- 级联删除：明确外键的 `onDelete` 策略
- 必要性：只定义业务必需的关系

**实体状态机设计**（仅适用于有状态流转的实体）：

```
状态机设计要素/
  ├── 状态定义（States）
  │   ├── 初始状态
  │   ├── 中间状态
  │   ├── 终态（成功/失败）
  │   └── 例如：草稿 → 待审批 → 已批准 / 已拒绝
  ├── 转换条件（Transitions）
  │   ├── 触发事件
  │   ├── 前置条件
  │   ├── 后置条件
  │   └── 权限检查
  ├── 副作用（Side Effects）
  │   ├── 状态变更时执行的操作
  │   ├── 例如：发送通知、记录日志
  │   └── 数据一致性保证
  └── 防护规则（Guards）
      ├── 禁止非法转换
      ├── 权限验证
      └── 业务规则检查
```

**状态机示例**：

```
示例：[合同实体]状态机

  状态定义：
    ├─ 草稿（Draft）：初始状态，可编辑
    ├─ 待审批（PendingApproval）：已提交，等待审核
    ├─ 已批准（Approved）：审核通过，可执行
    ├─ 已拒绝（Rejected）：审核不通过，需修改
    └─ 已归档（Archived）：执行完成，只读

  转换规则：
    草稿 ──提交──→ 待审批 ──批准──→ 已批准 ──完成──→ 已归档
             │              │
           撤回            拒绝
             │              │
           草稿           草稿

  副作用：
    ├── 提交时：发送审批通知
    ├── 审批通过：发送签署通知
    ├── 审批拒绝：发送拒绝通知
    └── 归档时：生成执行报告

  防护规则：
    ├── 只有提交人可以撤回草稿
    ├── 只有审批人可以批准/拒绝
    ├── 已批准的合同不能修改
    └── 已归档的合同不能删除
```

**Zod Schema 映射规则**：

```
实体 → Zod Schema 映射/
  ├── 属性映射
  │   ├── 字符串 → z.string()
  │   ├── 数字 → z.number()
  │   ├── 日期 → z.coerce.date()
  │   └── 枚举 → z.enum()
  ├── 关系映射
  │   ├── 一对一 → z.ref(TargetSchema)
  │   ├── 一对多 → z.array(z.ref(TargetSchema))
  │   └── 多对多 → z.array(z.ref(TargetSchema))
  ├── 状态映射
  │   └── 状态 → z.enum([状态列表])
  └── 验证映射
      ├── min/max → z.string().min()
      ├── pattern → z.string().regex()
      └── required → 必填字段
```

**示例完整流程**：

```
示例：用户管理实体建模
  
  1. 用户故事：
     "作为管理员，我想要创建新用户，以便分配系统访问权限"
  
  2. 实体识别：
     - 用户（User）- 核心实体
     - 角色（Role）- 核心实体
     - 部门（Department）- 核心实体
     - 邮箱（Email）- 值对象
  
  3. 实体关系：
     - User 所属 Department（1:N）
     - User 承担 Role（N:M）
  
  4. Zod Schema 定义：
     const UserSchema = z.object({
       id: z.number().int().positive(),
       username: z.string().min(3).max(50),
       email: z.string().email(),
       role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
       departmentId: z.number().int().nullable(),
       createdAt: z.coerce.date(),
     })
  
  5. 类型推导：
     type User = z.infer<typeof UserSchema>
```

**Zod Schema 原则**：
- 所有实体都有对应的 Zod Schema 定义
- 所有枚举使用 `z.enum()` 定义，不使用 TypeScript enum
- 所有字段都有 `.describe()` 注释
- 类型通过 `z.infer<>` 推导，禁止手动定义
- 关系通过 `z.ref()` 或 `z.array(z.ref())` 表达
- 实体状态通过 `z.enum([状态列表])` 定义，状态机约束在业务逻辑层实现

**示例用户故事**（仅供参考）：
```
作为 管理员
我想要 创建新用户
以便 分配系统访问权限

验收标准：
  - Given 我已登录为管理员
  - When 我填写用户信息并点击保存
  - Then 用户创建成功并显示在列表中
```

**门控清单**：

**用户故事完整性**：
- [ ] 至少 3 个用户故事已编写
- [ ] 验收标准使用 Given-When-Then 格式
- [ ] 角色和期望值清晰

**领域建模完整性**：
- [ ] 核心实体已识别（至少 3 个）
- [ ] 实体分类正确（核心实体/值对象/聚合根）
- [ ] 实体关系已定义（1:1, 1:N, N:M）
- [ ] 实体属性和状态已识别

**状态机完整性**（仅适用于有状态流转的实体）：
- [ ] 所有状态已明确枚举
- [ ] 状态转换规则已定义
- [ ] 转换条件和权限已明确
- [ ] 副作用已识别
- [ ] 防护规则已定义
- [ ] 状态映射到 z.enum()

**Zod Schema 完整性**：
- [ ] 所有实体都有对应的 Zod Schema 定义
- [ ] 所有枚举使用 `z.enum()` 定义
- [ ] 所有字段都有 `.describe()` 注释
- [ ] 所有验证规则都有明确的错误消息

**类型推导正确性**：
- [ ] 所有类型都通过 `z.infer<>` 推导
- [ ] Request/Response 类型明确分离
- [ ] Partial/Required/Omit 使用正确

**代码质量**：
- [ ] 文件头部有清晰的注释说明
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过

---

### 阶段 1-5：详见轨道设计章节

---

## 架构原则

### 唯一真相来源（Single Source of Truth）

**核心原则**：Zod Schema 是所有后续工作的唯一来源

```
数据流向/
  用户故事（业务需求）
    → Zod Schema（唯一真相来源，定义所有实体和验证规则）
    → [4个并行轨道，同时启动]
      ├── 轨道1：Zod → OpenAPI 契约（用于文档和 Mock）
      ├── 轨道2：Zod → Prisma → 数据库（映射规则）
      ├── 轨道3：Zod → [后端框架] 后端（例如：NestJS）
      └── 轨道4：Zod → [前端框架] 前端（例如：React + TanStack）
    → 集成测试（验证全栈集成）
```

**关键约束**：
- 禁止脱离 Zod Schema 进行任何实现
- 任何变更必须从 Zod Schema 开始，逐级向下同步
- 所有轨道必须保持与 Zod Schema 的一致性
- 前端直接使用 Zod Schema，不通过 OpenAPI 生成

### 4 个并行独立轨道

**核心原则**：前 4 个轨道完全独立，可以并行开发

```
Zod Schema（唯一真相来源）
  ├── 轨道1：OpenAPI 契约（独立测试）
  │   └── 用途：API 文档、Mock 测试
  ├── 轨道2：Prisma → 数据库（独立测试）
  │   └── 用途：数据持久化
  ├── 轨道3：[后端框架] 后端（独立测试）
  │   ├── 例如：NestJS + TypeScript
  │   └── 用途：API 实现
  ├── 轨道4：[前端框架] 前端（独立测试）
  │   ├── 例如：React + TanStack Query
  │   └── 用途：UI 实现
  └── 轨道5：集成测试（依赖前4个轨道完成）
      └── 用途：验证全栈集成
```

**并行开发约束**：
- 前 4 个轨道可以同时启动
- 每个轨道有独立的验证标准
- 轨道之间通过 Zod Schema 保持契约一致
- 只有前 4 个轨道全部完成后才能开始轨道 5

**技术选型灵活性**：
- 轨道 3 的后端框架可以根据项目选择（如：NestJS、Express）
- 轨道 4 的前端框架可以根据项目选择（如：React、Vue）
- 无论选择何种框架，都必须从 Zod Schema 开始

### 门控推进机制

**核心原则**：每个阶段结束必须通过门控清单验证

```
门控流程/
  阶段 N 完成
    → 门控清单验证
      → ✅ 通过 → 进入阶段 N+1
      → ❌ 不通过 → 修复 → 重新验证
```

---

## 技术栈定义

### 后端技术栈

| 组件 | 技术选型 | 版本要求 | 用途 |
|------|---------|---------|------|
| **运行时** | Node.js | >= 20 | JavaScript 运行环境 |
| **语言** | TypeScript | >= 5.7.2 | 类型安全开发 |
| **框架** | NestJS | >= 10.0 | 后端应用框架 |
| **ORM** | Prisma | >= 6.0 | 数据库访问层 |
| **验证** | nestjs-zod | >= 3.0 | Zod → DTO 自动化 |
| **认证** | @nestjs/jwt | >= 10.0 | JWT 认证 |
| **文档** | @nestjs/swagger | >= 7.0 | OpenAPI 文档生成 |

### 前端技术栈

| 组件 | 技术选型 | 版本要求 | 用途 |
|------|---------|---------|------|
| **运行时** | Browser | Modern ES6+ | 浏览器环境 |
| **语言** | TypeScript | >= 5.7.2 | 类型安全开发 |
| **框架** | React | >= 18.3 | UI 框架 |
| **状态管理** | @tanstack/react-query | >= 5.60 | 服务端状态管理 |
| **路由** | react-router-dom | >= 6.30 | 客户端路由 |
| **HTTP** | axios | >= 1.17 | HTTP 客户端 |
| **构建** | Vite | >= 5.0 | 前端构建工具 |

### 数据库技术栈

| 环境 | 技术选型 | 版本要求 | 用途 |
|------|---------|---------|------|
| **开发** | SQLite | 3.x | 本地文件数据库 |
| **生产** | PostgreSQL | >= 14 | 生产关系型数据库 |

### 开发工具链

| 类别 | 工具名称 | 用途 |
|------|---------|------|
| **代码格式化** | Prettier | 代码风格统一 |
| **代码检查** | ESLint | 代码质量检查 |
| **类型检查** | TypeScript | 静态类型检查 |
| **契约检查** | Spectral | OpenAPI 规范检查 |
| **契约 Mock** | Prism | OpenAPI Mock 服务器 |
| **测试框架** | Vitest | 单元测试 + 集成测试 |
| **Git Hooks** | Husky + lint-staged | 提交前自动化检查 |

---

## 系统架构

### 整体架构

```
系统架构/
  ├── 前端层 (Frontend)
  │   ├── [UI 框架] (例如：React Components)
  │   ├── [状态管理] (例如：TanStack Query)
  │   ├── [路由框架] (例如：React Router)
  │   └── [HTTP 客户端] (例如：axios)
  ├── 后端层 (Backend)
  │   ├── [后端框架] (例如：NestJS Modules)
  │   ├── [验证层] (例如：nestjs-zod Validation)
  │   ├── [ORM 层] (例如：Prisma)
  │   └── [认证层] (例如：JWT Auth)
  └── 数据层 (Database)
      ├── [关系型数据库] (例如：PostgreSQL)
      ├── [开发数据库] (例如：SQLite)
      ├── [表结构] (按业务模型设计)
      ├── [索引] (查询优化)
      └── [测试数据] (用于开发测试)
```

### 后端架构

```
NestJS 应用/
  ├── AppModule (根模块)
  │   ├── ConfigModule (配置管理)
  │   ├── PrismaModule (数据库)
  │   └── ValidationPipe (全局验证)
  └── 功能模块（按业务领域划分）
      ├── [认证模块] (例如：AuthModule)
      │   ├── Controller (路由处理)
      │   ├── Service (业务逻辑)
      │   ├── Guards (认证授权)
      │   └── DTO (Zod 自动生成)
      ├── [用户管理模块] (例如：UsersModule)
      │   ├── Controller
      │   ├── Service
      │   ├── Guards
      │   └── DTO
      └── [其他业务模块]...
```

**层次职责**：
- **Controller 层**：处理 HTTP 请求/响应、路由定义、参数验证（自动通过 Zod DTO）
- **Service 层**：业务逻辑实现、数据转换、外部服务调用
- **Guard 层**：认证检查（JWT）、授权检查（RBAC）
- **DTO 层**：从 Zod Schema 自动生成、请求/响应类型定义

**设计原则**：
- 模块按业务领域划分（如认证、用户管理、部门管理等）
- 每个模块独立，包含 Controller、Service、Guards、DTO
- 模块名称应反映业务功能，而非技术实现

### 前端架构

```
React 应用/
  ├── TanStack Query Client
  │   ├── Cache（内存，staleTime: 5min, cacheTime: 10min）
  │   ├── Query Key（标识，如 ['auth', 'me']）
  │   └── Invalidation（失效策略）
  ├── Custom Hooks（API 调用封装）
  │   ├── [认证相关 Hooks] (例如：useAuth, useLogout)
  │   ├── [实体管理 Hooks] (例如：useUsers, useDepartments)
  │   └── [其他业务 Hooks]...
  └── Pages（UI 组件）
      ├── [登录页] (例如：LoginPage)
      ├── [仪表盘] (例如：DashboardPage)
      ├── [实体列表页] (例如：UsersPage)
      └── [其他页面]...
```

**层次职责**：
- **Query Client 层**：全局状态管理、缓存策略、失败重试
- **Custom Hooks 层**：API 调用封装、Zod 验证集成、错误处理
- **Pages 层**：UI 组件、用户交互、表单验证

**设计原则**：
- Custom Hooks 按业务功能封装（如认证、用户管理、部门管理等）
- Hook 命名应以 `use` 开头，后跟业务实体名称（如 `useUsers`）
- 页面组件按功能划分，每个页面使用对应的 Hooks

---

## 轨道设计

### 轨道 1：Zod → OpenAPI 契约（文档阶段）

**目标**：生成 API 文档和 Mock 服务器

**输入**：Zod Schema  
**输出**：OpenAPI spec.yaml  
**工具**：zod-openapi  
**用途**：文档、Mock 测试  
**不用于**：前端代码生成

**验证标准**：
- OpenAPI 3.1 规范符合
- Spectral lint 通过
- Prism Mock 启动成功

**代码示例**：见 `OPENAPI_PATTERNS.md`

---

### 轨道 2：Zod → Prisma → 数据库（数据阶段）

**目标**：建立数据库结构

**输入**：Zod Schema  
**输出**：Prisma Schema + 数据库  
**工具**：手动映射 + Prisma CLI  
**关键**：字段映射关系

**映射规则**：
- Zod 类型 → Prisma 类型
- Zod 验证规则 → 数据库约束
- Zod 枚举 → Prisma enum

**验证标准**：
- Schema 一致性
- 数据库结构验证
- Seed 数据验证

**代码示例**：见 `PRISMA_PATTERNS.md`

---

### 轨道 3：Zod → NestJS 后端（后端阶段）

**目标**：实现后端 API

**输入**：Zod Schema  
**输出**：NestJS 完整实现  
**工具**：nestjs-zod  
**关键**：DTO 自动生成

**架构层次**：
- Module（模块组织）
- Controller（路由处理）
- Service（业务逻辑）
- Guard（认证授权）
- DTO（类型定义）

**验证标准**：
- DTO 从 Zod 生成
- 全局验证管道
- 单元测试覆盖
- API 独立测试

**代码示例**：见 `BACKEND_PATTERNS.md`

---

### 轨道 4：Zod → React + TanStack 前端（前端阶段）

**目标**：实现前端 UI

**输入**：Zod Schema  
**输出**：React 完整实现  
**工具**：React、TanStack Query、axios  
**关键**：直接使用 Zod

**架构层次**：
- Axios Config（HTTP 客户端）
- TanStack Query（状态管理）
- Custom Hooks（API 封装）
- Pages（UI 组件）

**验证标准**：
- TanStack Query 配置
- Zod 验证集成
- 单元测试覆盖
- 前端独立测试

**代码示例**：见 `FRONTEND_PATTERNS.md`

---

### 轨道 5：集成测试（验证阶段）

**目标**：验证全栈集成

**输入**：前 4 个轨道完成  
**输出**：E2E 测试通过  
**工具**：Vitest E2E  
**关键**：真实环境测试

**测试范围**：
- 用户完整流程
- API 端点覆盖
- 错误场景覆盖
- 性能测试
- 安全测试

**验证标准**：
- 核心流程覆盖
- 测试稳定性
- 性能达标
- 安全合规

**代码示例**：见 `TESTING_PATTERNS.md`

---

## 数据流

### 请求数据流

```
请求数据流/
  用户输入
    → React 组件
    → Custom Hook (useMutation)
    → Zod Schema 验证（输入）
    → axios 发送请求
    → NestJS Controller
    → Zod DTO 验证（自动）
    → NestJS Service
    → Prisma ORM
    → 数据库
```

### 响应数据流

```
响应数据流/
  数据库
    → Prisma ORM
    → NestJS Service
    → Zod Schema 构造响应
    → NestJS Controller
    → HTTP 响应
    → axios 接收
    → Zod Schema 验证（响应）
    → TanStack Query 缓存
    → React 组件渲染
```

### 状态管理流

```
TanStack Query State/
  ├── Cache（内存）
  │   ├── staleTime: 5min
  │   └── cacheTime: 10min
  ├── Query Key（标识）
  │   ├── ['auth', 'me']
  │   └── ['users', page, limit]
  └── Invalidation（失效策略）
      ├── mutation 成功后触发
      ├── 手动触发
      └── 时间过期后触发
```

---

## 验证策略

### 三层验证

```
验证层级/
  ├── 层级 1: 前端验证（用户体验）
  │   ├── Zod Schema 实时验证
  │   ├── 表单即时反馈
  │   └── 防止无效请求发送
  ├── 层级 2: 后端验证（数据完整性）
  │   ├── nestjs-zod 自动验证
  │   ├── DTO 类型安全
  │   └── 请求拦截
  └── 层级 3: 数据库验证（数据约束）
      ├── Prisma Schema 约束
      ├── 数据库规则
      └── 事务一致性
```

### 验证时机

| 时机 | 验证层 | 工具 | 失败处理 |
|------|--------|------|---------|
| 用户输入 | 前端 Zod | z.parse() | 表单错误提示 |
| API 请求 | 后端 Zod DTO | ZodValidationPipe | 400 错误 |
| 数据库写入 | Prisma 约束 | Prisma | 500 错误 |
| API 响应 | 前端 Zod | z.parse() | 数据异常处理 |

---

## 质量保证

### 测试金字塔

```
测试金字塔/
  ├── E2E 测试（10%）
  │   ├── 核心用户流程
  │   └── 关键业务场景
  ├── 集成测试（30%）
  │   ├── API 层测试
  │   └── Mock 数据库
  └── 单元测试（60%）
      ├── Service 方法
      ├── Hook 逻辑
      └── 工具函数
```

### 门控清单

每个阶段结束必须通过验证：

**阶段 -1（场景描述）**：
- 场景描述清晰
- 目标用户明确
- 核心功能识别

**阶段 0（用户故事 + Zod Schema）**：
- 用户故事完整
- Zod Schema 定义完整
- 类型推导正确
- 验证规则清晰

**阶段 1（OpenAPI）**：
- Spectral lint 通过
- Prism Mock 可用

**阶段 2（Prisma）**：
- Schema 一致性
- 数据库验证
- Seed 数据

**阶段 3（NestJS）**：
- DTO 从 Zod 生成
- 单元测试覆盖
- API 独立测试

**阶段 4（React）**：
- TanStack Query 配置
- Zod 验证集成
- 单元测试覆盖

**阶段 5（集成测试）**：
- E2E 测试通过
- 性能达标
- 安全合规

### 代码质量标准

**TypeScript 严格模式**：
- noImplicitAny
- strictNullChecks
- strictFunctionTypes
- noImplicitReturns

**ESLint 规则**：
- 禁止 `any` 类型
- 强制显式返回类型
- 禁止未使用变量
- React Hooks 规则

**Prettier 格式**：
- 统一代码风格
- 自动格式化
- 提交前检查

---

## 总结

本架构的核心思想：

1. **场景先行** - 从理解业务场景开始
2. **用户故事驱动** - 将场景转化为可测试的用户故事
3. **Zod Schema 是唯一真相来源** - 所有工作从 Zod 开始
4. **4 个轨道完全独立** - 可以并行开发，提高效率
5. **验证层层把关** - 前端、后端、数据库三层验证
6. **类型安全贯穿始终** - TypeScript + Zod + Prisma
7. **门控推进机制** - 每个阶段必须验证通过才能继续

### 架构的通用性

本架构文档适用于**任何**采用契约优先开发方法论的项目：

**可变的部分**（根据项目调整）：
- **模块命名**：不同项目可以有不同的模块名称（如 CustomerModule 替代 UsersModule）
- **技术选型**：轨道 3/4 可以选择不同的框架（如 Vue 替代 React，Express 替代 NestJS）
- **业务领域**：适用于任何需要 API 契约的全栈项目

**不变的原则**（必须遵守）：
- Zod Schema 必须是唯一真相来源
- 4 个轨道必须完全独立
- 所有层次必须保持一致的架构模式
- 必须使用示例标注区分通用模式和具体实现

---

## 配套文档说明

### 代码模式文档

这些文档包含**华道管理系统的具体实现**作为参考，其他项目可以参考但不需要照搬：

- **BACKEND_PATTERNS.md** - NestJS 后端代码模式（含具体模块示例）
- **FRONTEND_PATTERNS.md** - React + TanStack 前端代码模式（含具体 Hook 示例）
- **PRISMA_PATTERNS.md** - Prisma 数据库代码模式
- **OPENAPI_PATTERNS.md** - OpenAPI 契约代码模式
- **TESTING_PATTERNS.md** - 测试代码模式
- **ZOD_SCHEMAS.md** - Zod Schema 定义示例

**使用建议**：
- 学习架构模式：参考代码组织方式、层次划分
- 理解实现细节：查看具体代码示例
- 适配新项目：保留架构模式，调整具体实现

### 开发流程文档

- **CONTRACT_DEV_PROCESS.md** - 详细的开发流程门控清单（通用）

---

本文档是契约优先开发方法论的权威标准，所有采用此方法论的项目都必须严格遵循核心原则，但可以根据项目特点调整具体实现。
