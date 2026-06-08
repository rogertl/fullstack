# 契约优先开发流程门控清单

> **文档版本**: v6.4.0
> **最后更新**: 2026-06-08
> **适用范围**: 所有采用契约优先开发方法论的项目

---

## 📋 目录

1. [技术栈定义](#技术栈定义)
2. [核心原则](#核心原则)
3. [阶段概览](#阶段概览)
4. [详细门控清单](#详细门控清单)
5. [代码质量要求](#代码质量要求)
6. [自动化工具配置](#自动化工具配置)

---

## 技术栈定义

### 固定技术栈（不可变更）

| 层级             | 技术选型              | 版本要求     | 说明                                   |
| ---------------- | --------------------- | ------------ | -------------------------------------- |
| **语言**         | TypeScript            | >= 5.7.2     | 严格模式，no implicit any              |
| 后端框架         | NestJS                | >= 10.0      | 装饰器模式，模块化架构                 |
| 前端框架         | React                 | >= 18.3      | 函数组件 + Hooks                       |
| 状态管理         | @tanstack/react-query | >= 5.60      | 服务端状态管理                         |
| 路由             | react-router-dom      | >= 6.30      | 声明式路由                             |
| ORM              | Prisma                | >= 6.0       | 类型安全的数据库客户端                 |
| 数据库-开发      | SQLite                | 3.x          | 本地开发，文件数据库                   |
| 数据库-生产      | PostgreSQL            | >= 14        | 生产环境，高性能                       |
| 契约规范         | OpenAPI               | 3.1.0        | API 契约定义                           |
| Schema 验证      | Zod                   | **>= 4.0.0** | 运行时类型验证（必须 v4，见下方说明）  |
| HTTP 客户端      | axios                 | >= 1.17      | 统一拦截器配置                         |
| 后端 Zod 集成    | nestjs-zod            | >= 5.4.0     | Zod → NestJS DTO 自动化（支持 Zod v4） |
| 契约生成-前端    | orval                 | >= 7.0       | OpenAPI → TypeScript API 客户端        |
| 契约生成-OpenAPI | zod-openapi           | >= 5.4.0     | Zod → OpenAPI 自动化（支持 Zod v4）    |

### 开发工具链

| 工具类型       | 工具名称            | 用途                |
| -------------- | ------------------- | ------------------- |
| **代码格式化** | Prettier            | 代码风格统一        |
| **代码检查**   | ESLint              | 代码质量检查        |
| **类型检查**   | TypeScript          | 静态类型检查        |
| **契约检查**   | Spectral            | OpenAPI 规范检查    |
| **契约 Mock**  | Prism               | OpenAPI Mock 服务器 |
| **测试框架**   | Vitest              | 单元测试 + 集成测试 |
| **Git Hooks**  | Husky + lint-staged | 提交前自动化检查    |

---

### 为什么选择 Zod v4？

**核心原因**：Zod v4 相比 v3 有**质的飞跃**，解决了长期存在的设计限制，并提供**显著的性能提升**。

#### 关键改进

| 方面                | Zod v3         | Zod v4               | 提升               |
| ------------------- | -------------- | -------------------- | ------------------ |
| **数组解析性能**    | 147 µs/iter    | 19.8 µs/iter         | **7.43x 更快**     |
| **对象解析性能**    | 805 µs/iter    | 124 µs/iter          | **6.5x 更快**      |
| **设计限制**        | 已达开发天花板 | 可扩展基础           | 解决 9/10 高优问题 |
| **TypeScript 编译** | 较慢           | 优化后更快的编译时间 | 开发体验提升       |
| **Bundle 大小**     | 标准版本       | 提供 Zod Mini 变体   | 减小包体积         |

#### 必须使用 v4 的原因

1. **性能要求**：本项目涉及大量复杂对象验证（合同、用户、部门等），v4 的性能提升直接影响 API 响应时间和用户体验。

2. **类型安全**：v4 修复了 v3 在 optional 字段 default 值处理上的不一致问题，避免运行时类型错误。

3. **生态兼容**：
   - `nestjs-zod` >= 5.4.0 依赖 Zod v4
   - `zod-openapi` >= 5.4.0 依赖 Zod v4
   - 使用 v3 会导致集成失败

4. **长期支持**：Zod v4 是官方推荐的稳定版本，v3 已停止新特性开发。

#### 升级影响

如果当前项目使用 Zod v3，必须升级到 v4：

```bash
# 卸载旧版本
npm uninstall zod

# 安装 v4
npm install zod@^4.4.3

# 同时更新相关依赖
npm install nestjs-zod@^5.4.0 zod-openapi@^5.4.6
```

**注意**：升级后可能需要调整部分 Schema 定义（主要是 optional 字段的 default 值处理），但这是必要的。

---

---

## 核心原则

### 1. 唯一真相来源（Single Source of Truth）

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源
```

**关键约束**：

- Zod Schema 是所有后续工作的唯一来源
- 禁止脱离 Zod Schema 进行 OpenAPI、Prisma、后端、前端的任何实现
- 任何变更必须从 Zod Schema 开始，逐级向下同步

### 2. 4 个并行独立轨道

```
Zod Schema（唯一真相来源）
  ├── 轨道1：OpenAPI 契约
  │   └── 用途：API 文档、Mock 测试
  ├── 轨道2：Prisma → 数据库
  │   └── 用途：数据持久化
  ├── 轨道3：后端 API
  │   └── 用途：业务逻辑实现
  ├── 轨道4：前端 UI
  │   └── 用途：用户界面
  └── 轨道5：集成测试（依赖前4个轨道完成）
      └── 用途：验证全栈集成

轨道特性：
  - 轨道1-4：完全独立，可并行开发
  - 每个轨道有独立的测试用例
  - 轨道5必须在轨道1-4全部完成后才能开始
```

**关键约束**：

- 前 4 个轨道**完全独立**，可以并行开发
- 每个轨道有**独立的测试用例**
- 只有前 4 个轨道全部完成后，才能开始轨道 5（集成测试）

### 3. 门控机制

每个阶段结束必须通过门控清单验证，才能进入下一阶段。

---

## 阶段概览

| 阶段 | 中文名称 | 名称          | 输入            | 输出                                   | 门控点                                                                          |
| ---- | -------- | ------------- | --------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| 0    | 契约阶段 | Schema        | 业务需求        | Zod Schema 文件                        | ✅ 所有 Schema 定义完整<br>✅ 类型推导正确<br>✅ 验证规则清晰                   |
| 1    | 文档阶段 | Documentation | Zod Schema      | OpenAPI spec.yaml                      | ✅ Schema 一致性<br>✅ Spectral lint 通过<br>✅ Prism Mock 启动成功             |
| 2    | 数据阶段 | Database      | Zod Schema      | Prisma schema.prisma<br>+ 初始化数据库 | ✅ Schema 一致性<br>✅ 数据库结构验证<br>✅ Seed 数据验证                       |
| 3    | 后端阶段 | Backend       | Zod Schema      | NestJS API 实现                        | ✅ 所有端点实现<br>✅ 请求/响应符合 Zod<br>✅ 单元测试覆盖<br>✅ API 层独立测试 |
| 4    | 前端阶段 | Frontend      | Zod Schema      | React + TanStack 实现                  | ✅ API 客户端生成<br>✅ 类型安全<br>✅ 组件独立测试<br>✅ 错误处理完整          |
| 5    | 验证阶段 | Integration   | 前 4 个轨道完成 | 端到端测试通过                         | ✅ E2E 测试<br>✅ 性能测试<br>✅ 安全测试                                       |

---

## 详细门控清单

### 阶段 0：用户故事 + Zod Schema（唯一真相来源）

#### 输入产物

- [ ] 用户故事文档（Given-When-Then 格式）
- [ ] 核心领域模型识别

#### 输出产物

- [ ] `src/shared/schemas/*.ts` - 所有 Zod Schema 定义
- [ ] `src/shared/schemas/index.ts` - 统一导出

#### Zod v4 Schema 编写规范（强制要求）

**必须使用 `.meta()` 而非 `.describe()`**：

```typescript
// ✅ 正确（Zod v4 推荐方式）
const UserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .meta({
      description: '登录用户名',
      examples: ['admin', 'john_doe'],
      title: 'username',
    }),
  email: z
    .string()
    .email('邮箱格式不正确')
    .meta({
      description: '用户邮箱地址',
      examples: ['user@example.com'],
      title: 'email',
    }),
});

// ❌ 错误（Zod v3 风格，已弃用）
const BadSchema = z.object({
  username: z
    .string()
    .describe('登录用户名') // 不要使用
    .min(3),
});
```

**字段验证规则必须明确**：

- 字符串字段：必须使用 `.regex()` 明确可接受的字符范围
- 数值字段：必须使用 `.min()` / `.max()` 限制范围
- 日期字段：必须使用 `.coerce.date()` 并说明格式要求
- 枚举字段：必须使用 `z.enum()` 而非 TypeScript enum
- 可选字段：必须明确 `.optional()` 或 `.nullable()`
- 默认值：必须使用 `.default()` 设置

#### 门控清单

**Schema 定义完整性**：

- [ ] 所有实体都有对应的 Zod Schema 定义
- [ ] 所有枚举使用 `z.enum()` 定义，不使用 TypeScript enum
- [ ] 所有字段使用 `.meta()` 而非 `.describe()`（Zod v4 规范）
- [ ] 所有字符串字段使用 `.regex()` 明确可接受字符范围
- [ ] 所有验证规则都有明确的错误消息
- [ ] `.meta()` 中包含 `description` 和 `examples`（可选）

**类型推导正确性**：

- [ ] 所有类型都通过 `z.infer<>` 推导，禁止手动定义
- [ ] Request/Response 类型明确分离
- [ ] Partial/Required/Omit 使用正确

**验证规则完整性**：

- [ ] 字符串字段：min/max/regex 验证
- [ ] 数值字段：min/max/int/positive 验证
- [ ] 日期字段：使用 `z.coerce.date()`
- [ ] 可选字段：明确标记 `.nullable()` 或 `.optional()`
- [ ] 默认值：使用 `.default()` 设置

**Schema 复用性**：

- [ ] 通用结构提取为独立 Schema（SuccessResponse、ProblemDetail、PaginationMeta）
- [ ] 复杂嵌套结构拆分为多个 Schema
- [ ] 相似字段使用 `.pick()` / `.omit()` 复用

**代码质量**：

- [ ] 文件头部有清晰的注释说明
- [ ] 每个导出的 Schema 都有 JSDoc 注释
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过

---

### 阶段 1：Zod → OpenAPI 契约

#### 输入产物

- [ ] Zod Schema 文件（阶段 0 输出）

#### 输出产物

- [ ] `openapi/spec.yaml` - OpenAPI 3.1 规范文件
- [ ] `openapi/.spectral.yaml` - Spectral 规则配置
- [ ] `package.json` - 包含 orval 生成脚本

#### 门控清单

**OpenAPI 结构正确性**：

- [ ] 版本声明为 `openapi: 3.1.0`
- [ ] 包含 info、servers、tags、components、paths
- [ ] 安全方案使用 Bearer Token
- [ ] 所有 Schema 在 `components.schemas` 中定义（不内联）

**与 Zod Schema 一致性**：

- [ ] 所有枚举值与 Zod 完全一致（包括大小写）
- [ ] 所有字段类型与 Zod 完全一致
- [ ] 所有验证约束与 Zod 完全一致（min/max/regex）
- [ ] 所有必填字段在 `required` 数组中列出
- [ ] 响应结构与 Zod 定义的 Schema 完全一致

**OpenAPI 最佳实践**：

- [ ] 所有操作有 `summary` 和 `description`
- [ ] 所有请求/响应有 `example`
- [ ] 错误响应引用 `ProblemDetail` Schema
- [ ] 使用标签（tags）分组操作
- [ ] 路径参数使用 `{param}` 格式

**Spectral Lint 通过**：

- [ ] 运行 `npm run lint:openapi` 无错误
- [ ] 所有路径使用 `snake_case`
- [ ] 所有属性名使用 `camelCase`
- [ ] 所有操作声明安全方案
- [ ] 所有 Schema 可复用

**Prism Mock 验证**：

- [ ] 运行 `npm run prism` 启动成功
- [ ] GET 请求返回 example 中定义的数据
- [ ] POST 请求返回 201 状态码和 example 数据
- [ ] 错误场景通过测试覆盖（Prism 无法模拟）

**代码生成验证**（前端）：

- [ ] orval 配置文件 `orval.config.ts` 存在
- [ ] 运行 `npm run generate:client` 生成成功
- [ ] 生成的 TypeScript API 客户端无类型错误
- [ ] 生成的 API 客户端包含所有端点

---

### 阶段 2：Zod → Prisma Schema → 数据库

#### 输入产物

- [ ] Zod Schema 文件（阶段 0 输出）

#### 输出产物

- [ ] `prisma/schema.prisma` - Prisma Schema 定义
- [ ] `prisma/seed.ts` - 数据库填充脚本
- [ ] `prisma/migrations/` - 数据库迁移文件（可选，使用 `prisma db push` 时不需要）

#### 门控清单

**Prisma Schema 结构正确性**：

- [ ] 包含 generator、datasource、所有 model 定义
- [ ] 所有字段使用 `@map()` 指定数据库列名（snake_case）
- [ ] 所有表使用 `@@map()` 指定表名（snake_case，复数）
- [ ] 开发环境使用 SQLite，生产环境使用 PostgreSQL

**与 Zod Schema 一致性**：

- [ ] 所有枚举与 Zod 完全一致
- [ ] 所有字段类型与 Zod 完全一致（String/Int/DateTime/Boolean）
- [ ] 所有关系定义符合业务逻辑
- [ ] 外键约束正确设置（onDelete 策略）

**数据库约束完整性**：

- [ ] 唯一约束：`@unique` 标记
- [ ] 默认值：`@default()` 设置
- [ ] 索引：`@@index()` 优化查询
- [ ] 级联删除：外键 `onDelete` 策略明确

**数据库初始化验证**：

- [ ] 运行 `npm run db:generate` 生成 Prisma Client
- [ ] 运行 `npm run db:push` 同步数据库结构
- [ ] 运行 `npm run db:seed` 填充测试数据
- [ ] 所有表、字段、索引在数据库中存在

**Seed 数据验证**：

- [ ] admin 用户创建成功（username: admin, role: ADMIN）
- [ ] manager 用户创建成功（username: manager, role: MANAGER）
- [ ] employee 用户创建成功（username: employee, role: EMPLOYEE）
- [ ] 至少 2 个部门创建成功
- [ ] 密码使用 bcrypt hash（salt rounds >= 10）

**Prisma 类型安全**：

- [ ] 禁止使用 `prisma.$queryRaw`（除非必要）
- [ ] 禁止使用 `any` 类型
- [ ] 所有查询返回类型明确
- [ ] TypeScript 编译无错误

---

### 阶段 3：Zod → 后端 API（NestJS）

#### 输入产物

- [ ] Zod Schema 文件（阶段 0 输出）
- [ ] OpenAPI spec.yaml（阶段 1 输出）

#### 输出产物

- [ ] `src/backend/` - NestJS 完整实现
- [ ] `src/backend/*.module.ts` - 模块定义
- [ ] `src/backend/*.controller.ts` - 控制器
- [ ] `src/backend/*.service.ts` - 服务层
- [ ] `src/backend/*.dto.ts` - DTO 定义（或使用 Zod）
- [ ] `src/backend/*.guard.ts` - 守卫
- [ ] `src/backend/lib/` - 工具函数
- [ ] `tests/unit/backend/` - 后端单元测试
- [ ] `tests/integration/backend/` - 后端集成测试（Mock 数据库）

#### 门控清单

**NestJS 架构完整性**：

- [ ] 项目使用标准 NestJS 结构（modules/controllers/services）
- [ ] 每个模块独立（auth.module, users.module, departments.module）
- [ ] 全局模块正确配置（prisma.module, config.module）
- [ ] 依赖注入使用正确

**Zod Schema 使用（nestjs-zod）**：

- [ ] 所有 DTO 使用 `createZodDto` 从 Zod Schema 生成
- [ ] 禁止手动定义 DTO（必须从 Zod 推导）
- [ ] DTO 直接导入 Zod Schema（`import { LoginSchema } from '@/shared/schemas'`）
- [ ] 响应类型也使用 Zod Schema（通过 `@ZodResponse` 装饰器）

**全局验证配置**：

- [ ] 全局配置 `ZodValidationPipe`（在 `app.module.ts` 中）
- [ ] 所有请求自动使用 Zod Schema 验证
- [ ] 验证失败返回标准 400 错误
- [ ] 错误消息清晰（包含字段名和错误原因）

**认证授权机制**：

- [ ] JWT 认证实现（Access Token + Refresh Token）
- [ ] JwtAuthGuard 守卫保护需要认证的端点
- [ ] RolesGuard 守卫保护需要权限控制的端点
- [ ] Token 刷新机制实现
- [ ] 密码使用 bcrypt hash（salt rounds >= 10）

**API 完整性**：

- [ ] 所有 OpenAPI 定义的端点都已实现
- [ ] GET /api/health - 健康检查
- [ ] POST /api/auth/login - 登录
- [ ] POST /api/auth/refresh - 刷新 Token
- [ ] GET /api/auth/me - 获取当前用户
- [ ] POST /api/auth/logout - 登出
- [ ] POST /api/auth/change-password - 修改密码
- [ ] CRUD /api/users - 用户管理
- [ ] CRUD /api/departments - 部门管理
- [ ] CRUD /api/sessions - 会话管理
- [ ] GET /api/logs/\* - 日志查询

**OpenAPI 文档自动生成**：

- [ ] 使用 `@ZodResponse` 装饰器定义响应类型
- [ ] 访问 `/api` 可以查看 Swagger UI
- [ ] Swagger UI 显示所有端点和 Schema
- [ ] 可以直接在 Swagger UI 中测试 API
- [ ] OpenAPI 文档可以导出（通过 `npm run generate:openapi`）

**输入验证**：

- [ ] 所有请求体使用 `createZodDto` 生成的 DTO
- [ ] 验证失败返回 400 状态码
- [ ] 验证错误消息清晰（包含字段名和错误原因）
- [ ] 查询参数使用 ParseIntPipe、ValidationPipe

**错误处理**：

- [ ] 统一错误处理过滤器（HttpExceptionFilter）
- [ ] 错误响应符合 ProblemDetail Schema
- [ ] 401 Unauthorized - 未认证
- [ ] 403 Forbidden - 无权限
- [ ] 404 Not Found - 资源不存在
- [ ] 500 Internal Server Error - 服务器错误

**日志记录**：

- [ ] 登录日志记录（成功/失败）
- [ ] 操作日志记录（CREATE/UPDATE/DELETE）
- [ ] 数据变更日志记录
- [ ] 使用日志库（不使用 console.log）

**单元测试覆盖**：

- [ ] 所有 Service 方法有单元测试
- [ ] 所有 Guard 有单元测试
- [ ] 所有工具函数有单元测试
- [ ] 测试覆盖率 >= 80%
- [ ] Mock 所有外部依赖（Prisma、JWT）

**API 层独立测试**：

- [ ] Mock Prisma Client
- [ ] Mock JWT 验证
- [ ] 测试所有端点的请求/响应
- [ ] 测试所有错误场景
- [ ] 测试与 Zod Schema 的一致性

**代码质量**：

- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] Prettier 格式化通过
- [ ] 无 console.log 语句
- [ ] 无硬编码密钥/配置

---

### 阶段 4：Zod → 前端（React + TanStack）

#### 输入产物

- [ ] Zod Schema 文件（阶段 0 输出）
- [ ] OpenAPI spec.yaml（阶段 1 输出）

#### 输出产物

- [ ] `src/frontend/api/` - orval 生成的 API 客户端
- [ ] `src/frontend/lib/axios.ts` - 统一 axios 配置
- [ ] `src/frontend/hooks/` - 自定义 Hooks（useAuth、useUsers、useDepartments）
- [ ] `src/frontend/pages/` - 页面组件
- [ ] `src/frontend/layouts/` - 布局组件
- [ ] `tests/unit/frontend/` - 前端单元测试
- [ ] `tests/integration/frontend/` - 前端集成测试（Mock API）

#### 门控清单

**orval 配置正确性**：

- [ ] `orval.config.ts` 配置文件存在
- [ ] OpenAPI spec.yaml 路径正确
- [ ] 输出路径为 `src/frontend/api/`
- [ ] 生成模式为 `react-query`
- [ ] 运行 `npm run generate:client` 生成成功

**生成的 API 客户端验证**：

- [ ] 所有端点都有对应的 API 函数
- [ ] 所有 API 函数有正确的类型定义
- [ ] 请求参数类型符合 Zod Schema
- [ ] 响应类型符合 Zod Schema
- [ ] 错误类型符合 ProblemDetail Schema

**axios 配置完整性**：

- [ ] baseURL 从环境变量读取
- [ ] 请求拦截器添加 Authorization Token
- [ ] 响应拦截器统一处理错误
- [ ] 401 自动刷新 Token
- [ ] 超时时间配置（30s）

**TanStack Query 集成**：

- [ ] QueryClient 配置正确
- [ ] 使用 `useQuery` 获取数据
- [ ] 使用 `useMutation` 修改数据
- [ ] 缓存策略配置（staleTime、cacheTime）
- [ ] 失败重试配置

**自定义 Hooks 完整性**：

- [ ] `useAuth` - 认证状态管理
- [ ] `useUsers` - 用户数据管理
- [ ] `useDepartments` - 部门数据管理
- [ ] 所有 Hooks 有错误处理
- [ ] 所有 Hooks 有加载状态

**路由配置**：

- [ ] react-router-dom 配置正确
- [ ] 私有路由需要认证
- [ ] 公共路由（登录页）无需认证
- [ ] 404 页面配置
- [ ] 重定向配置

**页面组件完整性**：

- [ ] LoginPage - 登录页
- [ ] DashboardPage - 仪表盘
- [ ] UsersPage - 用户管理
- [ ] DepartmentsPage - 部门管理
- [ ] 所有组件使用 TypeScript

**错误处理**：

- [ ] 全局错误边界
- [ ] API 错误统一显示
- [ ] 表单验证错误显示
- [ ] 网络错误提示

**单元测试覆盖**：

- [ ] 所有自定义 Hooks 有单元测试
- [ ] 所有工具函数有单元测试
- [ ] 所有页面组件有快照测试
- [ ] 测试覆盖率 >= 80%

**前端独立测试**：

- [ ] Mock API 响应（MSW）
- [ ] 测试 API 客户端类型安全
- [ ] 测试请求构造符合 Zod
- [ ] 测试响应处理符合 Zod
- [ ] 测试错误处理流程

**代码质量**：

- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] Prettier 格式化通过
- [ ] 无 console.log 语句
- [ ] 组件符合 React 最佳实践

---

### 阶段 5：真正的集成测试

#### 输入产物

- [ ] 前 4 个轨道全部完成并验证通过

#### 输出产物

- [ ] `tests/e2e/` - 端到端测试
- [ ] 性能测试报告
- [ ] 安全测试报告

#### 门控清单

**E2E 测试覆盖**：

- [ ] 登录流程（输入正确凭据 → 成功登录 → 跳转仪表盘）
- [ ] 登录失败流程（输入错误凭据 → 显示错误消息）
- [ ] 用户 CRUD 流程（创建 → 读取 → 更新 → 删除）
- [ ] 部门 CRUD 流程
- [ ] 权限控制流程（无权限访问 → 跳转 403）
- [ ] Token 刷新流程（Access Token 过期 → 自动刷新）

**性能测试**：

- [ ] API 响应时间 < 500ms（P95）
- [ ] 页面加载时间 < 2s（P95）
- [ ] 数据库查询时间 < 100ms（P95）
- [ ] 并发用户测试（100 用户）

**安全测试**：

- [ ] SQL 注入测试
- [ ] XSS 攻击测试
- [ ] CSRF 保护测试
- [ ] 权限绕过测试
- [ ] 敏感数据泄露测试

**集成测试覆盖率**：

- [ ] 所有核心用户流程覆盖
- [ ] 所有 API 端点覆盖
- [ ] 所有错误场景覆盖
- [ ] 测试稳定性 >= 95%

---

## 代码质量要求

### Prettier 配置规范

**配置文件**：`.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**检查命令**：

```bash
npm run format:check    # 检查格式
npm run format          # 自动格式化
```

**门控要求**：

- [ ] 所有文件符合 Prettier 格式
- [ ] 提交前自动格式化（lint-staged）
- [ ] 行末使用 LF（不是 CRLF）

---

### ESLint 配置规范

**配置文件**：`eslint.config.js`

**核心规则**：

- 禁止使用 `any` 类型
- 禁止未使用的变量
- 强制显式返回类型
- 强制函数参数类型
- 禁止 console.log（生产代码）
- React Hooks 规则
- TypeScript 规则

**检查命令**：

```bash
npm run lint           # 检查
npm run lint:fix       # 自动修复
```

**门控要求**：

- [ ] 代码无 ESLint 错误
- [ ] 提交前自动检查（lint-staged）
- [ ] 错误级别必须为 0 才能提交

---

### TypeScript 配置规范

**配置文件**：`tsconfig.json`

**严格模式**：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**检查命令**：

```bash
npm run typecheck      # 类型检查
```

**门控要求**：

- [ ] TypeScript 编译无错误
- [ ] 无 `any` 类型
- [ ] 所有类型明确
- [ ] 提交前自动检查（lint-staged）

---

### Git Hooks 配置

**配置工具**：Husky + lint-staged

**触发时机**：pre-commit

**执行流程**：

1. Prettier 格式化
2. ESLint 检查
3. TypeScript 类型检查
4. 运行相关测试

**配置文件**：`.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 运行 lint-staged
npx lint-staged

# 类型检查
npm run typecheck

# 运行测试
npm run test:unit
```

**门控要求**：

- [ ] 提交前自动运行所有检查
- [ ] 任何检查失败都阻止提交
- [ ] 开发者不能跳过 hooks

---

## 自动化工具配置

### orval（前端 API 客户端生成）

**配置文件**：`orval.config.ts`

```typescript
import { defineConfig } from 'orval';

export default defineConfig({
  input: './openapi/spec.yaml',
  output: {
    mode: 'tags-split',
    target: 'src/frontend/api',
    client: 'react-query',
    schemas: {
      output: 'src/frontend/api/models',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write "src/frontend/api/**/*.{ts,tsx}"',
    },
  },
});
```

**生成命令**：

```bash
npm run generate:client    # 生成前端 API 客户端
```

---

### zod-openapi（Zod → OpenAPI 文档生成）

**配置文件**：`scripts/generate-openapi.ts`

```typescript
import { createDocument } from 'zod-openapi';
import { writeFile } from 'fs/promises';
import YAML from 'yaml';
import * as fs from 'fs';

// 导入所有 Zod Schema
import { LoginSchema, LoginResponseSchema } from '@/shared/schemas/auth.schema';
import { UserSchema, CreateUserSchema } from '@/shared/schemas/user.schema';
// ... 其他 Schema

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: '华道管理系统 API',
    version: '1.0.0',
    description: '基于 Zod Schema 自动生成的 OpenAPI 文档',
  },
  servers: [
    { url: 'http://localhost:4010', description: 'Prism Mock 服务器' },
    { url: 'http://localhost:3000/api', description: '本地开发服务器' },
    { url: 'https://api.example.com', description: '生产环境' },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '用户登录',
        requestBody: {
          content: {
            'application/json': { schema: LoginSchema },
          },
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': { schema: LoginResponseSchema },
            },
          },
        },
      },
    },
    // ... 其他路径
  },
});

// 生成 YAML 文件
await writeFile('openapi/spec.yaml', YAML.stringify(document));
console.log('OpenAPI 文档生成成功：openapi/spec.yaml');
```

**生成命令**：

```bash
npm run generate:openapi   # 从 Zod 生成 OpenAPI 文档
```

**门控要求**：

- [ ] OpenAPI 文档成功生成
- [ ] 生成的文档符合 OpenAPI 3.1.x 规范
- [ ] Spectral lint 通过
- [ ] orval 可以使用生成的文档

---

### 后端代码生成工具

**推荐方案**: **nestjs-zod** + **zod-openapi**

#### nestjs-zod（Zod → NestJS DTO）

**核心功能**:

- 从 Zod Schema 自动生成 NestJS DTO
- 自动运行时验证（ZodValidationPipe）
- 自动生成 OpenAPI 文档（集成 @nestjs/swagger）
- 类型安全（编译时推断）

**安装**:

```bash
npm install nestjs-zod @nestjs/swagger
```

**使用示例**:

```typescript
// 1. 定义 Zod Schema（唯一真相来源）
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  password: z.string().min(1, '请输入密码'),
});

// 2. 自动生成 NestJS DTO
import { createZodDto } from 'nestjs-zod';

class LoginDto extends createZodDto(LoginSchema) {}

// 3. 在 Controller 中使用
@Controller('auth')
export class AuthController {
  @Post('login')
  @ZodResponse({ type: LoginResponseSchema, description: '用户登录' })
  async login(@Body() loginDto: LoginDto) {
    // loginDto 自动验证，类型安全
    return this.authService.login(loginDto);
  }
}

// 4. 全局配置验证管道
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
```

**生成命令**:

```bash
npm run generate:backend    # 生成后端 DTO（如果有需要）
```

**门控要求**:

- [ ] 所有 DTO 从 Zod Schema 生成（使用 `createZodDto`）
- [ ] 全局配置 `ZodValidationPipe`
- [ ] 生成的 DTO 无 TypeScript 错误
- [ ] 运行时验证正确（测试无效输入）
- [ ] OpenAPI 文档自动生成（访问 `/api`）

---

#### zod-openapi（Zod → OpenAPI 文档）

**核心功能**:

- 从 Zod Schema 生成 OpenAPI 3.1.x 文档
- 自动注册 Schema 为可复用组件
- 支持完整的 OpenAPI 特性

**安装**:

```bash
npm install zod-openapi
```

**使用示例**:

```typescript
// 生成 OpenAPI 文档
import { createDocument } from 'zod-openapi';
import { z } from 'zod';

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: '华道管理系统 API',
    version: '1.0.0',
  },
  paths: {
    '/auth/login': {
      post: {
        requestBody: {
          content: {
            'application/json': { schema: LoginRequestSchema },
          },
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': { schema: LoginResponseSchema },
            },
          },
        },
      },
    },
  },
});

// 输出到文件
import { writeFile } from 'fs/promises';
import YAML from 'yaml';

await writeFile('openapi/spec.yaml', YAML.stringify(document));
```

**生成命令**:

```bash
npm run generate:openapi   # 从 Zod 生成 OpenAPI
```

**门控要求**:

- [ ] OpenAPI 文档成功生成
- [ ] 生成的文档符合 OpenAPI 3.1.x 规范
- [ ] Spectral lint 通过
- [ ] Prism Mock 可以使用生成的文档

---

**工作流程**：

```
Zod Schema（唯一真相来源）
  └── 并行生成
      ├── nestjs-zod
      │   └── DTO（用于后端）
      └── zod-openapi
          └── OpenAPI（用于前端）
```

---

### Prism（OpenAPI Mock 服务器）

**配置文件**：`openapi/spec.yaml`

**启动命令**：

```bash
npm run prism    # 启动 Mock 服务器（端口 4010）
```

**门控要求**：

- [ ] Mock 服务器成功启动
- [ ] GET 请求返回 example 数据
- [ ] POST 请求返回 201 状态码
- [ ] 错误场景由测试覆盖

---

### Spectral（OpenAPI Lint）

**配置文件**：`openapi/.spectral.yaml`

**检查命令**：

```bash
npm run lint:openapi
```

**门控要求**：

- [ ] 无 Spectral 错误
- [ ] 所有规则通过
- [ ] OpenAPI 文件符合最佳实践

---

## 附录

### 常见问题

**Q1: 可以跳过某个阶段吗？**  
A: 不可以。每个阶段都是独立的，必须完成并通过门控清单验证。

**Q2: 可以修改已经完成的阶段吗？**  
A: 可以，但必须从 Zod Schema 开始修改，逐级向下同步。

**Q3: 前后端可以并行开发吗？**  
A: 可以。轨道 3（后端）和轨道 4（前端）可以并行开发，因为它们都依赖 Zod Schema 和 OpenAPI。

**Q4: 什么时候开始集成测试？**  
A: 只有在前 4 个轨道全部完成并验证通过后，才能开始轨道 5（集成测试）。

**Q5: Zod Schema 变更怎么办？**  
A: 从 Zod Schema 开始修改，然后同步到所有轨道：OpenAPI → Prisma → 后端 → 前端 → 重新测试。

---

### 文档维护

**责任人**：架构师 / 技术负责人

**更新频率**：每个大版本更新一次

**变更流程**：

1. 提出变更建议
2. 团队讨论
3. 更新文档
4. 通知所有开发者

---

## 版本历史

| 版本   | 日期       | 变更内容                         | 责任人 |
| ------ | ---------- | -------------------------------- | ------ |
| v1.0.0 | 2026-06-08 | 初始版本，定义完整流程和门控清单 | Roger  |

---

**本文档是契约优先开发方法论的执行标准，所有开发活动必须严格遵循。**
