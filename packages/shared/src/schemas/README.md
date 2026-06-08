# Zod Schemas

本目录包含所有 Zod Schema 定义，作为契约优先开发的唯一真相来源。

## 📁 目录结构

```
schemas/
├── index.ts              # 统一导出
├── entities/             # 实体 Schema
│   ├── contract.schema.ts    # 合同实体
│   ├── user.schema.ts        # 用户实体
│   └── ...                   # 其他实体
├── api/                   # API 请求/响应 Schema（待创建）
└── README.md              # 本文件
```

## 🎯 定义规则

### 1. 所有 Schema 必须有 `.describe()` 注释

```typescript
// ✅ 正确
const name = z.string().describe('用户名');

// ❌ 错误
const name = z.string();
```

### 2. 枚举使用 `z.enum()`，不使用 TypeScript enum

```typescript
// ✅ 正确
export const StatusEnum = z.enum(['DRAFT', 'PUBLISHED']);

// ❌ 错误
export enum Status {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}
```

### 3. 可选字段明确标记

```typescript
// ✅ 正确
const schema = z.object({
  optionalField: z.string().optional(),
  nullableField: z.string().nullable(),
});

// ❌ 错误（使用 undefined）
const schema = z.object({
  optionalField: z.string().or(z.undefined()),
});
```

### 4. 日期使用 `z.coerce.date()`

```typescript
// ✅ 正确
const schema = z.object({
  createdAt: z.coerce.date(),
});

// ❌ 错误
const schema = z.object({
  createdAt: z.date(),
});
```

### 5. 验证规则明确

```typescript
// ✅ 正确
const username = z.string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9_]+$/);

// ❌ 错误（没有验证）
const username = z.string();
```

## 📋 实体 Schema 模板

每个实体 Schema 应包含：

```typescript
import { z } from 'zod';

// 1. 状态枚举（如果有状态）
export const StatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'], {
  description: '实体状态',
});

// 2. 主实体 Schema
export const EntitySchema = z.object({
  id: z.number().int().positive().describe('实体 ID'),
  name: z.string().min(1).max(200).describe('名称'),
  status: StatusEnum.optional().describe('状态'),
  createdAt: z.coerce.date().describe('创建时间'),
  updatedAt: z.coerce.date().describe('更新时间'),
}).describe('实体名称');

// 3. 创建请求 Schema
export const CreateEntityRequestSchema = EntitySchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
}).required({
  name: true,
});

// 4. 更新请求 Schema
export const UpdateEntityRequestSchema = EntitySchema.partial({
  name: true,
  status: true,
});

// 5. 类型推导
export type Entity = z.infer<typeof EntitySchema>;
export type CreateEntityRequest = z.infer<typeof CreateEntityRequestSchema>;
export type UpdateEntityRequest = z.infer<typeof UpdateEntityRequestSchema>;
```

## 🔗 关系定义

### 一对一关系

```typescript
export const UserSchema = z.object({
  id: z.number().int().positive(),
  profile: z.ref('ProfileSchema').optional(),
});
```

### 一对多关系

```typescript
export const DepartmentSchema = z.object({
  id: z.number().int().positive(),
  users: z.array(z.ref('UserSchema')).describe('部门用户'),
});
```

### 多对多关系

```typescript
export const UserSchema = z.object({
  id: z.number().int().positive(),
  roles: z.array(z.ref('RoleSchema')).describe('用户角色'),
});
```

## ✅ 验证清单

添加新 Schema 时，确保：

- [ ] 所有字段都有 `.describe()` 注释
- [ ] 枚举使用 `z.enum()` 定义
- [ ] 字符串字段有 `min/max` 验证
- [ ] 日期字段使用 `z.coerce.date()`
- [ ] 可选字段明确标记 `.optional()` 或 `.nullable()`
- [ ] 数字字段有 `int/positive` 约束
- [ ] 导出了所有类型推导
- [ ] 在 `index.ts` 中导出

## 🚀 使用示例

```typescript
import { ContractSchema, CreateContractRequestSchema } from '@contract-management/shared/schemas';

// 验证数据
const contract = ContractSchema.parse({
  id: 1,
  contractNo: 'CT2025001',
  title: '技术服务合同',
  amount: 100000,
  status: 'DRAFT',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 类型推导
type Contract = z.infer<typeof ContractSchema>;
```
