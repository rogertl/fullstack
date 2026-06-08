# Zod Schema 门控清单（架构师版本）

> **契约阶段（Stage 0）验证标准**
>
> **文档版本**: v2.0.0
> **最后更新**: 2026-06-08
> **适用范围**: 所有采用契约优先开发方法论的项目

本清单确保 Zod Schema 作为唯一真相来源的质量和一致性，包含**语法正确性**、**语义正确性**、**实用性验证**和**非功能性验证**四个层次。

---

## 使用说明

- ✅ 通过：该项符合标准
- ❌ 未通过：该项需要修复
- 🔄 不适用：该项不适用于当前 Schema
- 🔴 高优先级：必须通过才能进入下一阶段
- 🟡 中优先级：应该通过，特殊情况可豁免
- 🟢 低优先级：建议通过

**通过条件**：所有 🔴 高优先级项必须 ✅ 通过才能进入下一阶段。

---

## 第1部分：语法正确性（基础门控）

## 1. 基础结构

### 1.1 文件结构

- [ ] 🔴 文件路径正确：`src/schemas/entities/{entity}.schema.ts`
- [ ] 🔴 文件名使用小写+连字符：`user.schema.ts`
- [ ] 🔴 文件头部有清晰的注释说明

### 1.2 导入规范

- [ ] 🔴 使用 `'zod/v4'` 导入 Zod
- [ ] 🔴 相关实体 Schema 使用相对路径导入
- [ ] 🔴 导入顺序：Zod → 相关实体 → 本文件

### 1.3 代码组织

- [ ] 🔴 按分区组织：枚举 → 主实体 → 请求/响应 → 类型
- [ ] 🔴 每个分区有明确的分隔注释
- [ ] 🔴 导出类型在文件末尾统一推导

---

## 2. 枚举定义（Status Enums）

### 2.1 枚举格式

- [ ] 🔴 使用 `z.enum()` 定义（不使用 TypeScript enum）
- [ ] 🔴 枚举值使用全大写+下划线：`'ACTIVE'`, `'IN_PROGRESS'`
- [ ] 🔴 枚举有对应的类型推导：`export type X = z.infer<typeof XEnum>`

### 2.2 枚举元数据

- [ ] 🔴 枚举有 `.meta({ description: '...' })` 描述
- [ ] 🔴 描述清晰说明枚举用途
- [ ] 🔴 枚举值有注释说明（在上方）

---

## 3. 主实体 Schema（Entity Schema）

### 3.1 基础字段

- [ ] 🔴 `id`: `z.number().int().positive()`
- [ ] 🔴 有描述：`.meta({ description: '实体 ID' })`

### 3.2 字段类型映射

| 业务类型   | Zod 类型                                 | 验证规则 |
| ---------- | ---------------------------------------- | -------- |
| 字符串必填 | `z.string().min(1).max(n)`               | ✅       |
| 字符串可选 | `z.string().max(n).nullable()`           | ✅       |
| 整数       | `z.number().int()`                       | ✅       |
| 正整数     | `z.number().int().positive()`            | ✅       |
| 非负整数   | `z.number().int().nonnegative()`         | ✅       |
| 日期       | `z.coerce.date()`                        | ✅       |
| 日期可选   | `z.coerce.date().nullable()`             | ✅       |
| 枚举       | `z.enum([...])`                          | ✅       |
| 外键ID     | `z.number().int().positive().nullable()` | ✅       |

### 3.3 字段验证规则

- [ ] 🔴 所有字符串字段有 `.min()` 和 `.max()` 验证
- [ ] 🔴 编码类字段使用 `.regex()` + 自定义错误提示
- [ ] 🔴 邮箱使用 `.email()` 验证
- [ ] 🔴 手机号使用 `.regex()` 验证（格式：`/^1[3-9]\d{9}$/`）
- [ ] 🔴 URL 使用 `.url()` 验证

### 3.4 正则表达式错误提示

```typescript
// ✅ 正确：有自定义错误提示
.regex(/^[A-Z0-9_]+$/, {
  message: '编码只能包含大写字母、数字和下划线',
})

// ❌ 错误：没有错误提示
.regex(/^[A-Z0-9_]+$/)
```

### 3.5 字段元数据

- [ ] 🔴 每个字段都有 `.meta({ description: '...' })`
- [ ] 🔴 描述清晰、简洁、准确
- [ ] 🔴 特殊字段有额外说明（如"仅创建时需要"）

### 3.6 可选字段处理

```typescript
// ✅ 正确：可以为 null
nullableField: z.string().max(100).nullable();

// ✅ 正确：可以不存在
optionalField: z.string().max(100).optional();

// ❌ 错误：顺序错误
nullableField: z.string().nullable().max(100);
```

### 3.7 默认值

```typescript
// ✅ 正确：有默认值
status: UserStatusEnum.default('ACTIVE');
isActive: z.boolean().default(true);
```

### 3.8 实体元数据

- [ ] 🔴 主 Schema 有 `.meta({ description: '实体名称' })`

### 3.9 关系字段

- [ ] 🔴 一对一：外键 ID `z.number().int().positive().nullable()`
- [ ] 🔴 一对多：外键 ID（在"多"的一方）
- [ ] 🔴 多对多：暂不支持（使用中间表）

### 3.10 时间戳字段

- [ ] 🔴 `createdAt`: `z.coerce.date()`
- [ ] 🔴 `updatedAt`: `z.coerce.date()`
- [ ] 🔴 都有 `.meta({ description: '...' })`

---

## 4. 请求/响应 Schema

### 4.1 创建请求（Create）

```typescript
// ✅ 正确格式
export const CreateXRequestSchema = XSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .required({
    name: true,
    code: true,
  })
  .meta({ description: '创建X请求' });
```

### 4.2 更新请求（Update）

```typescript
// ✅ 正确格式
export const UpdateXRequestSchema = XSchema.partial({
  name: true,
  description: true,
  status: true,
}).meta({ description: '更新X请求' });
```

### 4.3 响应（Response）

```typescript
// ✅ 正确格式
export const XResponseSchema = XSchema.meta({
  description: 'X响应',
});

// 特殊情况：排除敏感字段
export const UserResponseSchema = UserSchema.omit({ password: true }).meta({
  description: '用户响应',
});
```

### 4.4 命名规范

- [ ] 🔴 创建：`Create{Entity}RequestSchema`
- [ ] 🔴 更新：`Update{Entity}RequestSchema`
- [ ] 🔴 响应：`{Entity}ResponseSchema`
- [ ] 🔴 查询：`Get{Entity}Request` / `List{Entity}Request`

---

## 5. 类型推导

### 5.1 推导格式

```typescript
export type Entity = z.infer<typeof EntitySchema>;
export type CreateEntityRequest = z.infer<typeof CreateEntityRequestSchema>;
export type UpdateEntityRequest = z.infer<typeof UpdateEntityRequestSchema>;
export type EntityResponse = z.infer<typeof EntityResponseSchema>;
```

### 5.2 命名一致性

- [ ] 🔴 实体类型：`{Entity}`（单数）
- [ ] 🔴 请求类型：`{Entity}Request`（带操作前缀）
- [ ] 🔴 响应类型：`{Entity}Response`

---

## 6. 格式规范

### 6.1 链式调用格式

```typescript
// ✅ 正确：多行格式，每个方法一行
export const UserSchema = z
  .object({
    id: z.number().int().positive().meta({ description: '用户 ID' }),
    username: z.string().min(3).max(50).meta({ description: '用户名' }),
  })
  .meta({ description: '用户实体' });

// ❌ 错误：单行格式，难以阅读
export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50),
});
```

### 6.2 注释规范

- [ ] 🔴 分区注释使用 `// ==== ... ====`
- [ ] 🔴 实体/Schema 有 JSDoc 注释
- [ ] 🔴 复杂业务规则有行内注释

### 6.3 缩进和对齐

- [ ] 🔴 使用 2 空格缩进
- [ ] 🔴 链式调用对齐：点号在同一列
- [ ] 🔴 字段定义对齐

---

## 7. 业务规则验证

### 7.1 字段完整性

- [ ] 🔴 所有业务必需字段都在 Schema 中
- [ ] 🔴 字段命名符合业务术语
- [ ] 🔴 字段类型正确反映业务需求

### 7.2 验证规则合理性

- [ ] 🔴 字符串长度限制合理（min/max 值）
- [ ] 🔴 正则表达式准确反映业务规则
- [ ] 🔴 默认值符合业务需求

### 7.3 状态定义

- [ ] 🔴 状态枚举覆盖完整生命周期
- [ ] 🔴 状态转换在业务逻辑层实现
- [ ] 🔴 状态有清晰的注释说明

### 7.4 权限字段

- [ ] 🔴 权限相关字段正确定义
- [ ] 🔴 数据权限字段存在（如 `createdById`）
- [ ] 🔴 功能权限字段正确（如 `roleCodes`）

---

## 8. 与场景文档一致性

### 8.1 实体覆盖

- [ ] 🔴 场景文档中的核心实体都有 Schema
- [ ] 🔴 实体属性与场景描述一致
- [ ] 🔴 实体关系与场景描述一致

### 8.2 权限设计

- [ ] 🔴 权限方案与场景文档一致
  - [ ] 方案 A：角色枚举 + 菜单 roleCodes
  - [ ] 方案 B：RBAC（Role + Permission + 关联表）
- [ ] 🔴 数据权限控制字段存在

### 8.3 菜单结构

- [ ] 🔴 菜单实体支持树形结构
- [ ] 🔴 菜单权限控制正确
- [ ] 🔴 菜单字段与场景文档一致

---

## 9. 编译验证

### 9.1 TypeScript 编译

- [ ] 🔴 `npm run build` 无错误
- [ ] 🔴 无隐式 any 类型
- [ ] 🔴 无类型推导错误

### 9.2 导入导出

- [ ] 🔴 所有 Schema 在 `index.ts` 中导出
- [ ] 🔴 导入路径正确
- [ ] 🔴 无循环依赖

---

## 10. 文档验证

### 10.1 Schema 文档

- [ ] 🔴 文件头部有契约优先声明
- [ ] 🔴 复杂业务逻辑有注释说明
- [ ] 🔴 示例用法清晰

### 10.2 元数据完整性

- [ ] 🔴 所有字段有描述
- [ ] 🔴 描述语言统一（简体中文）
- [ ] 🔴 特殊字段有额外说明

---

## 第2部分：语义正确性（架构门控）

## 11. Schema 间关系一致性（🆕 新增）

### 11.1 外键引用一致性（🔴 高优先级）

- [ ] 🔴 所有外键 ID 字段在关联 Schema 中存在
- [ ] 🔴 外键字段类型一致（都是 `z.number().int().positive()`）
- [ ] 🔴 外键可空性一致（都是 `.nullable()` 或都不是）
- [ ] 🔴 外键命名规范一致（如 `{Entity}Id`）

### 11.2 枚举值一致性（🔴 高优先级）

- [ ] 🔴 跨 Schema 引用的枚举定义一致
- [ ] 🔴 枚举值大小写一致（都是大写或都是小写）
- [ ] 🔴 枚举值顺序一致（用于 UI 显示时）
- [ ] 🔴 枚举值含义一致（无歧义）

### 11.3 关系完整性（🔴 高优先级）

- [ ] 🔴 一对一关系：双方都有外键字段
- [ ] 🔴 一对多关系："多"的一方有外键字段
- [ ] 🔴 必需关系：外键字段不为 `.nullable()`
- [ ] 🔴 可选关系：外键字段为 `.nullable()`
- [ ] 🔴 级联删除规则在数据库层定义（Prisma）

### 11.4 循环引用检测（🔴 高优先级）

- [ ] 🔴 无直接循环引用（A → B → A）
- [ ] 🔴 无间接循环引用（A → B → C → A）
- [ ] 🔴 使用 `.refine()` 时避免循环依赖

### 11.5 关系验证示例

```typescript
// ✅ 正确：外键引用一致
// User Schema
departmentId: z.number().int().positive().nullable()
  .meta({ description: '所属部门 ID' }),

// Department Schema
id: z.number().int().positive()
  .meta({ description: '部门 ID' }),

// ❌ 错误：类型不一致
// User Schema
departmentId: z.string()  // 应该是 number
  .meta({ description: '所属部门 ID' }),
```

### 11.6 检查方法

```bash
npm run check:schema-relations  # 自动化检查脚本
```

---

## 12. 向后兼容性验证（🆕 新增）

### 12.1 变更分类（🔴 高优先级）

- [ ] 🔴 **ADDITIVE**（新增字段）：向后兼容 ✅
- [ ] 🔴 **MODIFY_TYPE**（修改类型）：破坏性变更 ❌
- [ ] 🔴 **MODIFY_CONSTRAINT**（修改约束）：可能破坏性 ⚠️
- [ ] 🔴 **REMOVE_FIELD**（删除字段）：破坏性变更 ❌
- [ ] 🔴 **RENAME_FIELD**（重命名字段）：破坏性变更 ❌

### 12.2 破坏性变更处理（🔴 高优先级）

- [ ] 🔴 更新主版本号（v1 → v2）
- [ ] 🔴 通知前后端团队
- [ ] 🔴 提供迁移指南
- [ ] 🔴 保留旧版本至少 2 个版本周期
- [ ] 🔴 记录变更日志（CHANGELOG.md）

### 12.3 兼容性检查（🟡 中优先级）

```bash
npm run check:schema-compat  # 对比新旧版本差异
```

### 12.4 兼容性验证示例

```typescript
// ✅ ADDITIVE 变更（向后兼容）
// v1
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

// v2 - 新增字段
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(), // 新增，向后兼容
});

// ❌ 破坏性变更
// v1
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

// v2 - 删除字段
const UserSchema = z.object({
  id: z.number(),
  // username 被删除 - 破坏性变更
});
```

---

## 第3部分：实用性验证（工程门控）

## 13. Schema 覆盖率检查（🆕 新增）

### 13.1 数据库覆盖率（🔴 高优先级）

- [ ] 🔴 所有 Prisma Model 都有对应的 Zod Schema
- [ ] 🔴 所有字段都有对应的 Zod 字段定义
- [ ] 🔴 字段类型映射正确（见 3.2 表格）
- [ ] 🔴 关系字段映射正确
- [ ] 🔴 **Prisma @map() 映射完整性**（新增）
  - [ ] 所有字段都有 `@map()` 指定数据库列名（snake_case）
  - [ ] 所有表都有 `@@map()` 指定表名（snake_case，复数）
  - [ ] 映射的列名符合 snake_case 约定
  - [ ] 映射的表名符合 snake_case + 复数约定
  - [ ] 枚举值使用 `@map()` 指定数据库值（snake_case）
  - [ ] 无遗漏的映射字段

### 13.2 API 端点覆盖率（🔴 高优先级）

- [ ] 🔴 所有 API 端点都有对应的 Request Schema
- [ ] 🔴 所有 API 端点都有对应的 Response Schema
- [ ] 🔴 错误响应使用 `ProblemDetail` Schema
- [ ] 🔴 分页响应使用 `PaginationMeta` Schema

### 13.3 业务实体覆盖率（🟡 中优先级）

- [ ] 🔴 场景文档中的所有实体都有 Schema
- [ ] 🔴 所有枚举都有对应的 Schema
- [ ] 🔴 所有 DTO 都有对应的 Schema

### 13.4 覆盖率检查

```bash
npm run check:schema-coverage  # 生成覆盖率报告
```

**通过标准：覆盖率 >= 95%**

### 13.5 覆盖率报告示例

```bash
$ npm run check:schema-coverage

Schema Coverage Report:
✅ Database Models: 8/8 (100%)
⚠️  API Endpoints: 12/15 (80%) - Missing: /api/auth/logout, /api/sessions/*
✅ Business Entities: 10/10 (100%)

Total: 30/33 (91%) - BELOW THRESHOLD (95%)
```

---

## 14. 文档化完整性（🆕 新增）

### 14.1 Schema 文档（🟡 中优先级）

- [ ] 🔴 文件头部有契约优先声明
- [ ] 🔴 复杂业务逻辑有注释说明
- [ ] 🔴 示例用法清晰
- [ ] 🔴 变更历史记录

### 14.2 元数据完整性（🟡 中优先级）

- [ ] 🔴 所有字段有描述
- [ ] 🔴 描述语言统一（简体中文）
- [ ] 🔴 特殊字段有额外说明
- [ ] 🔴 业务规则有说明

### 14.3 测试用例（🟢 低优先级）

- [ ] 🔴 每个 Schema 有 examples
- [ ] 🔴 examples 包含边界值
- [ ] 🔴 examples 包含错误用例

### 14.4 文档化示例

```typescript
// ✅ 正确：完整的元数据
export const UserSchema = z
  .object({
    id: z
      .number()
      .int()
      .positive()
      .meta({
        description: '用户 ID',
        examples: [1, 2, 3],
      }),
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .max(50, '用户名最多50个字符')
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: '用户名只能包含字母、数字和下划线',
      })
      .meta({
        description: '登录用户名（3-50个字符）',
        examples: ['admin', 'john_doe'],
      }),
  })
  .meta({
    description: '用户实体',
    title: 'User',
  });
```

---

## 第4部分：非功能性验证（质量门控）

## 15. 性能影响评估（🆕 新增）

### 15.1 嵌套深度检查（🟡 中优先级）

- [ ] 🔴 Schema 嵌套深度 <= 4 层
- [ ] 🔴 避免 `z.object().refine()` 循环引用
- [ ] 🔴 大数组字段使用 `.array().max(n)` 限制
- [ ] 🔴 深层嵌套对象拆分为独立 Schema

### 15.2 验证复杂度（🟡 中优先级）

- [ ] 🔴 避免过复杂的正则表达式（ReDoS 风险）
- [ ] 🔴 避免嵌套 `.refine()` 回调
- [ ] 🔴 使用 `.transform()` 提前转换数据
- [ ] 🔴 避免在 `.refine()` 中进行异步操作

### 15.3 性能基准（🟢 低优先级）

```bash
npm run bench:schema  # 性能基准测试
npm run check:schema-perf  # 性能问题扫描
```

### 15.4 性能检查示例

```typescript
// ✅ 正确：控制嵌套深度
export const OrderSchema = z.object({
  id: z.number(),
  user: z.object({
    // 第1层嵌套
    id: z.number(),
    name: z.string(),
  }),
  items: z.array(
    z.object({
      // 第2层嵌套
      id: z.number(),
      product: z.object({
        // 第3层嵌套
        id: z.number(),
        name: z.string(),
      }),
    }),
  ),
}); // 总嵌套深度：3层 ✅

// ❌ 错误：嵌套过深
export const OrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.object({
        category: z.object({
          parent: z.object({
            // 第4层嵌套，超标
            id: z.number(),
          }),
        }),
      }),
    }),
  ),
});
```

---

## 16. 安全性审查（🆕 新增）

### 16.1 敏感字段标记（🔴 高优先级）

- [ ] 🔴 密码字段在 Response Schema 中排除
- [ ] 🔴 Token 字段有特殊标记
- [ ] 🔴 个人信息字段有数据分级标记
- [ ] 🔴 内部字段不在公开 API 中暴露

### 16.2 输入验证安全（🔴 高优先级）

- [ ] 🔴 正则表达式防止 ReDoS 攻击
- [ ] 🔴 文件上传字段有大小限制
- [ ] 🔴 URL 字段使用 `.url()` 防止协议混淆
- [ ] 🔴 HTML 字段防止 XSS 攻击

### 16.3 安全检查

```bash
npm run check:schema-security  # 安全扫描
```

### 16.4 安全示例

```typescript
// ✅ 正确：密码在响应中排除
export const UserResponseSchema = UserSchema.omit({
  password: true,
  securityAnswer: true,
  resetToken: true,
}).meta({ description: '用户响应（不包含敏感信息）' });

// ✅ 正确：文件上传有大小限制
avatarFile: z.instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: '文件大小不能超过 5MB',
  })
  .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
    message: '只支持 JPG 和 PNG 格式',
  })
  .meta({ description: '头像文件（最大5MB，JPG/PNG）' });

// ❌ 错误：无大小限制
avatarFile: z.instanceof(File); // 可以上传任意大小的文件
```

---

## 17. 可测试性评估（🆕 新增）

### 17.1 验证逻辑可测试性（🟡 中优先级）

- [ ] 🔴 验证逻辑可独立测试
- [ ] 🔴 不依赖外部状态（如数据库）
- [ ] 🔴 纯函数实现（无副作用）
- [ ] 🔴 错误消息可预测

### 17.2 测试用例完整性（🟡 中优先级）

- [ ] 🔴 每个 Schema 有单元测试
- [ ] 🔴 测试覆盖边界值
- [ ] 🔴 测试覆盖错误用例
- [ ] 🔴 测试覆盖业务规则

### 17.3 测试示例

```typescript
// ✅ 正确：可测试的验证逻辑
describe('UserSchema', () => {
  it('应该接受有效的用户数据', () => {
    const result = UserSchema.safeParse({
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      // ...
    });
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的用户名', () => {
    const result = UserSchema.safeParse({
      id: 1,
      username: 'ab', // 少于3个字符
      email: 'john@example.com',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('至少3个字符');
  });
});
```

---

## 第5部分：自动化工具支持（工程门控）

## 18. 自动化工具配置（🆕 新增）

### 18.1 必需的 npm scripts（🔴 高优先级）

```json
{
  "scripts": {
    "check:schema": "npm run check:schema-relations && npm run check:schema-coverage && npm run check:schema-security",
    "check:schema-relations": "ts-node scripts/check-schema-relations.ts",
    "check:schema-coverage": "ts-node scripts/check-schema-coverage.ts",
    "check:schema-compat": "ts-node scripts/check-schema-compat.ts",
    "check:schema-perf": "ts-node scripts/check-schema-perf.ts",
    "check:schema-security": "ts-node scripts/check-schema-security.ts",
    "bench:schema": "ts-node scripts/bench-schema.ts"
  }
}
```

### 18.2 Git Hook 集成（🔴 高优先级）

```bash
# .husky/pre-commit
npm run check:schema  # 提交前自动检查
```

### 18.3 CI/CD 集成（🟡 中优先级）

```yaml
# .github/workflows/schema-check.yml
name: Schema Quality Check

on: [pull_request, push]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Check Schema Quality
        run: npm run check:schema
```

---

## 19. 工具脚本示例（🆕 新增）

### 19.1 关系一致性检查脚本

```typescript
// scripts/check-schema-relations.ts
import * as fs from 'fs';
import * as path from 'path';

interface SchemaInfo {
  name: string;
  fields: Map<string, string>; // fieldName -> fieldType
  enums: Set<string>;
}

function extractSchemaInfo(filePath: string): SchemaInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  // 解析 Zod Schema 定义
  // 提取字段名和类型
  // 检查外键引用一致性
  // ...
}

function checkRelations() {
  const schemasDir = 'src/schemas/entities';
  const schemas: SchemaInfo[] = [];

  fs.readdirSync(schemasDir).forEach((file) => {
    if (file.endsWith('.schema.ts')) {
      const schema = extractSchemaInfo(path.join(schemasDir, file));
      schemas.push(schema);
    }
  });

  // 检查外键引用一致性
  schemas.forEach((schema) => {
    schema.fields.forEach((type, fieldName) => {
      if (fieldName.endsWith('Id')) {
        // 检查对应的 Schema 是否存在
        const entityName = fieldName.replace('Id', '');
        const targetSchema = schemas.find((s) => s.name.toLowerCase() === entityName.toLowerCase());

        if (!targetSchema) {
          console.error(`❌ 外键引用错误：${schema.name}.${fieldName} -> ${entityName} 不存在`);
        } else {
          console.log(`✅ 外键引用正确：${schema.name}.${fieldName} -> ${entityName}`);
        }
      }
    });
  });
}

checkRelations();
```

### 19.2 覆盖率检查脚本

```typescript
// scripts/check-schema-coverage.ts
function checkCoverage() {
  // 读取所有 Prisma Models
  // 读取所有 Zod Schemas
  // 对比并生成覆盖率报告
  // 检查是否 >= 95%
}
```

---

## 快速检查清单

**新创建 Schema 必检项（P0）：**

1. [ ] 🔴 使用 `'zod/v4'` 导入
2. [ ] 🔴 枚举使用 `z.enum()`，不用 TS enum
3. [ ] 🔴 所有字段有 `.meta({ description: ... })`
4. [ ] 🔴 正则有错误提示：`.regex(..., { message: '...' })`
5. [ ] 🔴 多行链式格式
6. [ ] 🔴 `.nullable()` 在验证方法之后
7. [ ] 🔴 类型使用 `z.infer<>` 推导
8. [ ] 🔴 编译通过

**修改 Schema 必检项（P0）：**

1. [ ] 🔴 同步修改请求/响应 Schema
2. [ ] 🔴 更新类型推导
3. [ ] 🔴 更新 `index.ts` 导出（如有新增）
4. [ ] 🔴 重新编译验证
5. [ ] 🔴 运行 `npm run check:schema-relations`
6. [ ] 🔴 检查向后兼容性（如需要）

**架构审查必检项（P1）：**

1. [ ] 🔴 运行 `npm run check:schema`（完整检查）
2. [ ] 🔴 Schema 覆盖率 >= 95%
3. [ ] 🔴 外键引用一致性检查通过
4. [ ] 🔴 安全性审查通过
5. [ ] 🔴 性能影响评估通过

---

## 通过标准

**进入下一阶段的条件：**

- ✅ 所有 🔴 高优先级项通过
- ✅ TypeScript 编译无错误
- ✅ 与场景文档一致
- ✅ 业务规则完整实现
- ✅ 自动化检查脚本通过

**不符合标准的处理：**

- 🔄 修改 Schema 直到所有项通过
- 🔄 如设计问题，先更新场景文档
- 🔄 记录设计决策（供后续参考）
- 🔄 进行架构评审（对于重大变更）

---

## 实施建议

### 阶段1：立即实施（本周完成）

- ✅ 更新团队规范文档
- ✅ 创建基础自动化检查脚本
- ✅ 集成到 pre-commit hook

### 阶段2：短期实施（2周内）

- ✅ 完善自动化检查工具（覆盖率、兼容性）
- ✅ 建立性能基准测试
- ✅ 集成到 CI/CD 流程

### 阶段3：中期实施（1个月内）

- ✅ 建立向后兼容性监控
- ✅ 完善安全性审查流程
- ✅ 团队培训和规范推广

---

## 附录

### A. 常见错误模式

#### 错误1：外键引用不一致

```typescript
// User Schema
departmentId: z.string(); // ❌ 应该是 number

// Department Schema
id: z.number();
```

#### 错误2：正则表达式无错误提示

```typescript
username: z.string().regex(/^[a-zA-Z0-9_]+$/); // ❌ 无错误提示

// ✅ 正确
username: z.string().regex(/^[a-zA-Z0-9_]+$/, {
  message: '用户名只能包含字母、数字和下划线',
});
```

#### 错误3：破坏性变更未处理

```typescript
// v1
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

// v2 - 删除 username，破坏性变更
const UserSchema = z.object({
  id: z.number(),
  // username 被删除
});

// ✅ 应该保留旧字段并标记废弃
const UserSchema = z.object({
  id: z.number(),
  username: z.string().optional(), // 标记为可选
  usernameV2: z.string(), // 新字段
});
```

### B. 性能优化建议

1. **减少嵌套深度**：拆分复杂 Schema
2. **限制数组长度**：使用 `.array().max(n)`
3. **避免复杂正则**：简化表达式
4. **使用 `.transform()`**：提前转换数据

### C. 安全检查清单

1. **敏感字段**：密码、Token 等不在响应中暴露
2. **输入验证**：防止注入攻击（ReDoS、XSS）
3. **文件上传**：限制大小和类型
4. **URL 验证**：使用 `.url()` 防止协议混淆

---

**本文档是契约优先开发方法论的 Zod Schema 质量保障标准，所有开发活动必须严格遵循。**
