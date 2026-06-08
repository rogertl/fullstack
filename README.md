# 契约优先全栈开发架构

> **版本**: v6.4.0
> **创建日期**: 2026-06-08
> **适用范围**: 任何采用契约优先开发方法论的项目

---

## 📁 文件说明

| 文件 | 大小 | 用途 | 使用时机 |
|------|------|------|---------|
| **START_HERE.md** | 7.6KB | 快速启动入口，强约束说明 | 新项目开始时首先阅读 |
| **ARCHITECTURE.md** | 26KB | 方法论级别架构设计 | 理解整体架构和开发流程 |
| **CONTRACT_DEV_PROCESS.md** | 27KB | 详细流程和门控清单 | 每个阶段的验证标准 |
| **QUESTIONNAIRE.md** | 新增 | 项目启动问卷系统 | 新项目初始化时参考 |
| **scripts/questionnaire.sh** | 新增 | 交互式问卷脚本 | 生成定制化项目配置 |
| **scripts/generate-init.sh** | 新增 | 配置生成脚本 | 基于问卷答案生成项目文件 |

---

## 🚀 快速开始

### 方式 1：交互式配置（推荐）

```bash
# 在 projects 目录下创建新项目
mkdir your-project && cd your-project

# 复制契约开发架构的脚本目录
cp -r ~/projects/契约开发架构/scripts .

# 运行问卷，生成定制化配置
./scripts/questionnaire.sh

# 基于答案生成项目文件
./scripts/generate-init.sh

# 安装依赖
npm install

# 开始开发
```

### 方式 2：手动配置

```bash
# 在 projects 目录下创建新项目
mkdir your-project && cd your-project

# 复制核心文件到新项目
cp -r ~/projects/契约开发架构/START_HERE.md .
cp -r ~/projects/契约开发架构/ARCHITECTURE.md .
cp -r ~/projects/契约开发架构/CONTRACT_DEV_PROCESS.md .

# 手动配置 package.json、tsconfig.json 等
# （参考方式 1 自动生成的文件）
```

### 开始开发

```
1. 阅读 START_HERE.md（5分钟）
   → 理解核心约束和开发流程

2. 告诉 AI："进入 Stage 1"
   → AI 会精确读取 ARCHITECTURE.md 对应章节

3. 按阶段推进
   → 每个阶段完成后，对照 CONTRACT_DEV_PROCESS.md 验证
```

---

## ⚠️ 核心约束

**Zod Schema 是唯一真相来源，禁止任何偏离。**

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源（不可偏离）
```

**绝对禁止**：
- ❌ 禁止脱离 Zod Schema 进行任何实现
- ❌ 禁止绕过 Zod Schema 修改
- ❌ 禁止各轨道不一致

详见 START_HERE.md 的"核心约束"章节。

---

## 📊 开发阶段概览

| 阶段 | 中文名称 | 名称 | 输入 | 输出 |
|------|---------|------|------|------|
| -1 | 场景阶段 | Scenario | 业务需求 | 场景描述文档 |
| 0 | 契约阶段 | Schema | 场景描述 | Zod Schema（唯一真相来源） |
| 1 | 文档阶段 | Documentation | Zod Schema | OpenAPI spec.yaml |
| 2 | 数据阶段 | Database | Zod Schema | Prisma schema.prisma |
| 3 | 后端阶段 | Backend | Zod Schema | NestJS API 实现 |
| 4 | 前端阶段 | Frontend | Zod Schema | React + TanStack 实现 |
| 5 | 验证阶段 | Integration | 前 4 个轨道完成 | E2E 测试通过 |

---

## 🔧 技术栈（固定）

| 层级 | 技术选型 | 版本要求 |
|------|---------|---------|
| 后端框架 | NestJS | >= 10.0 |
| 前端框架 | React | >= 18.3 |
| 状态管理 | @tanstack/react-query | >= 5.60 |
| ORM | Prisma | >= 6.0 |
| 数据库-开发 | SQLite | 3.x |
| 数据库-生产 | PostgreSQL | >= 14 |
| Schema 验证 | Zod | >= 3.23 |
| 后端 Zod 集成 | nestjs-zod | >= 3.0 |

---

## 💡 使用建议

### 对于新项目
1. 从场景阶段 (Stage -1) 开始（场景描述）
2. 用一个最小场景验证整个流程（如：用户登录）
3. 确认流程顺畅后再扩展到完整业务

### 对于已有项目
1. 检查 `.contract-state.json` 确认当前阶段
2. 从对应阶段继续推进
3. 如果没有状态文件，从契约阶段 (Stage 0) 开始（补充 Zod Schema）

### 上下文管理
```
您："进入契约阶段"（或"进入 Stage 0"）
↓
AI：精确读取 ARCHITECTURE.md 第 115-366 行（而非全文）
↓
AI：指导您完成用户故事和 Zod Schema 定义
```

**核心优势**：START_HERE.md（7.6KB）是唯一需要常驻上下文的文件，ARCHITECTURE.md 按需精确读取。

---

## 🎯 适用场景

✅ **适合**：
- CRUD 为主的管理系统
- RESTful API 风格
- 关系型数据模型
- 需要前后端契约的项目

❌ **不适合**：
- 需要事件溯源的业务（建议使用专门的 CQRS/ES 架构）
- 需要复杂 saga 编排的流程
- 需要读写分离的高并发场景

---

## 📖 文档阅读顺序

### 快速上手（10分钟）
1. START_HERE.md - 理解核心约束和流程
2. ARCHITECTURE.md 第 1-3 章 - 理解架构原则

### 深入理解（1小时）
1. ARCHITECTURE.md 完整阅读
2. CONTRACT_DEV_PROCESS.md 完整阅读
3. 结合华道管理系统项目（如果有）

### 实际开发（按需）
```
开发阶段 X → 阅读 ARCHITECTURE.md 对应章节 → 执行 → 验证 CONTRACT_DEV_PROCESS.md
```

---

## 🔄 文档更新

- **版本**: v6.4.0
- **最后更新**: 2026-06-08
- **更新内容**:
  - 补充 Stage -1（场景描述）
  - 补充 Stage 0 完整流程（用户故事 + 领域建模 + Zod Schema）
  - 添加实体状态机设计
  - 添加强约束说明（Zod Schema 唯一真相来源）

---

## 📞 支持与反馈

如果在使用过程中发现问题或有改进建议，请记录并更新文档版本。

---

**下一步**：复制这三个文件到您的项目目录，然后告诉 AI "进入场景阶段" 或 "进入 Stage -1" 开始开发。

**阶段名称速查**：
- 场景阶段 (Stage -1) - 理解业务场景
- 契约阶段 (Stage 0) - 定义 Zod Schema
- 文档阶段 (Stage 1) - 生成 OpenAPI 文档
- 数据阶段 (Stage 2) - 建立数据库结构
- 后端阶段 (Stage 3) - 实现 NestJS API
- 前端阶段 (Stage 4) - 实现 React UI
- 验证阶段 (Stage 5) - 集成测试
