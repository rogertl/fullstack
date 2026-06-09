# 合同管理独立模块

## 📦 模块说明

这是合同管理功能的**完全独立模块**，遵循契约优先方法论。

### 🎯 设计原则

1. **✅ 完全独立**: 不依赖其他业务模块（用户、部门等）
2. **✅ 契约优先**: Zod Schema 是唯一真相来源
3. **✅ 类型安全**: 完整的 TypeScript 类型推导
4. **✅ 解耦设计**: 仅通过 ID 引用其他模块实体

### 📁 模块结构

```
packages/contracts/
├── src/
│   ├── schemas/              # Zod Schema 定义
│   │   ├── contract.schema.ts   # 合同实体
│   │   └── index.ts            # 导出接口
│   ├── types/                # TypeScript 类型（预留）
│   ├── api/                  # API 工具函数（预留）
│   └── index.ts              # 主入口
├── package.json              # 模块配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 本文档
```

### 🔌 与其他模块的关系

**仅通过 ID 引用**（松耦合）：

- `createdById: number` → 引用用户模块的 User.id
- `approverId: number` → 引用用户模块的 User.id
- `departmentId: number` → 引用部门模块的 Department.id

**不直接依赖**：

- ❌ 不导入用户 Schema
- ❌ 不导入部门 Schema
- ❌ 不共享业务逻辑

### 📦 使用方式

```typescript
// 在其他模块中导入
import {
  ContractSchema,
  CreateContractRequestSchema,
  ContractTypeEnum,
} from '@contract-management/contracts';

// 使用 Zod 验证
const result = CreateContractRequestSchema.parse(contractData);

// TypeScript 类型推导
type Contract = z.infer<typeof ContractSchema>;
```

### 🚀 开发流程

1. **Stage 0（契约阶段）**: 完善 Zod Schema ✅
2. **Stage 1（文档）**: 生成 OpenAPI 文档
3. **Stage 2（数据）**: 同步 Prisma Schema
4. **Stage 3（后端）**: 实现 NestJS API
5. **Stage 4（前端）**: 实现 React UI
6. **Stage 5（验证）**: E2E 测试验证

### 📝 当前状态

- ✅ Zod Schema 已定义
- ✅ 独立包结构已建立
- ✅ TypeScript 构建正常
- ⏳ OpenAPI 文档待生成
- ⏳ Prisma Schema 待同步
- ⏳ API 待实现

---

**田总，这是一个完全独立的合同模块，不会与现有代码混在一起！**
