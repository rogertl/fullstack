# 契约优先全栈开发架构

> **版本**: v7.0.0 | **最后更新**: 2026-06-08

契约优先开发方法论框架，基于 Zod v4 作为唯一真相来源，实现前后端类型安全的全栈开发。

---

## 🚀 快速开始

```bash
# 1. 创建新项目
mkdir your-project && cd your-project

# 2. 复制方法论文件
cp -r ~/projects/契约开发架构/*.md .

# 3. 开始开发
# 阅读 START_HERE.md → 告诉 AI "进入 Stage 0"
```

---

## ⚠️ 核心原则

**Zod Schema 是唯一真相来源，禁止任何偏离。**

```
用户故事 → Zod Schema → [4个并行轨道] → 集成测试
                     ↑
              唯一真相来源
```

**绝对禁止**：

- ❌ 脱离 Zod Schema 进行任何实现
- ❌ 绕过 Zod Schema 修改
- ❌ 各轨道不一致

---

## 📊 开发阶段

| 阶段 | 名称          | 输出              | 验证标准                                           |
| ---- | ------------- | ----------------- | -------------------------------------------------- |
| 0    | Schema        | Zod Schema        | [ZOD_SCHEMA_CHECKLIST.md](ZOD_SCHEMA_CHECKLIST.md) |
| 1    | Documentation | OpenAPI spec.yaml | Spectral lint + Prism mock                         |
| 2    | Database      | Prisma schema     | 数据库结构验证                                     |
| 3    | Backend       | NestJS API        | 单元测试 + 类型检查                                |
| 4    | Frontend      | React UI          | API 客户端 + 组件测试                              |
| 5    | Integration   | E2E tests         | 端到端测试通过                                     |

---

## 🔧 技术栈（固定）

| 层级            | 技术选型                          | 版本              |
| --------------- | --------------------------------- | ----------------- |
| 后端            | NestJS                            | >= 10.0           |
| 前端            | React / Next.js                   | >= 18.3 / >= 15.0 |
| 状态管理        | @tanstack/react-query             | >= 5.60           |
| ORM             | Prisma                            | >= 6.0            |
| 数据库          | SQLite (开发) / PostgreSQL (生产) | 3.x / >= 14       |
| **Schema 验证** | **Zod**                           | **>= 4.0.0**      |
| 后端集成        | nestjs-zod                        | >= 5.4.0          |
| 前端集成        | zod-openapi                       | >= 5.4.0          |
| HTTP 客户端     | axios                             | >= 1.17           |

> **关键依赖**：必须使用 Zod v4，nestjs-zod >= 5.4.0，zod-openapi >= 5.4.0

---

## 📁 核心文档

| 文件                        | 用途                | 阅读时机          |
| --------------------------- | ------------------- | ----------------- |
| **START_HERE.md**           | 核心约束和开发流程  | 项目开始必读      |
| **ARCHITECTURE.md**         | 架构设计和方法论    | 深入理解架构      |
| **CONTRACT_DEV_PROCESS.md** | 详细流程和门控清单  | 每个阶段验证标准  |
| **ZOD_SCHEMA_CHECKLIST.md** | Schema 质量保障清单 | Schema 开发和评审 |
| **QUESTIONNAIRE.md**        | 项目启动问卷        | 新项目初始化      |

---

## 💡 使用方式

### 告诉 AI 进入对应阶段：

```
"进入 Stage 0"    → 定义 Zod Schema
"进入 Stage 1"    → 生成 OpenAPI 文档
"进入 Stage 2"    → 建立数据库
"进入 Stage 3"    → 实现后端 API
"进入 Stage 4"    → 实现前端 UI
"进入 Stage 5"    → 集成测试
```

### 验证标准：

- **Stage 0**: 通过 [ZOD_SCHEMA_CHECKLIST.md](ZOD_SCHEMA_CHECKLIST.md) 所有 🔴 高优先级项
- **Stage 1-4**: 通过 [CONTRACT_DEV_PROCESS.md](CONTRACT_DEV_PROCESS.md) 对应章节门控清单
- **Stage 5**: E2E 测试全部通过

---

## 🎯 适用场景

✅ **适合**：

- CRUD 为主的管理系统
- RESTful API 风格
- 需要前后端契约的项目

❌ **不适合**：

- 事件溯源（需要专门的 CQRS/ES 架构）
- 复杂 saga 编排
- 读写分离的高并发场景

---

## 📖 为什么选择 Zod v4？

| 方面     | Zod v3     | Zod v4     | 提升               |
| -------- | ---------- | ---------- | ------------------ |
| 数组解析 | 147 µs     | 19.8 µs    | **7.43x**          |
| 对象解析 | 805 µs     | 124 µs     | **6.5x**           |
| 设计限制 | 已达天花板 | 可扩展基础 | 解决 9/10 高优问题 |

**关键原因**：性能提升、类型安全修复、生态兼容（nestjs-zod、zod-openapi）、长期支持。

详见 [CONTRACT_DEV_PROCESS.md](CONTRACT_DEV_PROCESS.md#为什么选择-zod-v4)。

---

## 🔄 版本历史

- **v7.0.0** (2026-06-08)
  - 明确约定使用 Zod v4
  - 新增 ZOD_SCHEMA_CHECKLIST.md（架构师版本）
  - 更新技术栈版本要求
- **v6.4.0** (2026-06-08)
  - 补充场景阶段和实体状态机
  - 添加强约束说明

---

**下一步**：复制文档到项目 → 阅读 START_HERE.md → 告诉 AI "进入 Stage 0"
