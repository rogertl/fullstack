import { z } from 'zod/v4';

/**
 * Zod Schema 统一导出
 * 契约优先：所有 Schema 将在契约阶段（Stage 0）定义
 *
 * 定义规则：
 * - 所有实体使用 z.object() 定义
 * - 所有枚举使用 z.enum() 定义（不使用 TypeScript enum）
 * - 所有字段必须有 .meta() 注释
 * - 关系使用外键 ID（number）表达
 * - 状态使用 z.enum() 定义
 * - 验证规则：min/max/regex
 * - 可选字段明确标记 .nullable() 或 .optional()
 * - 默认值使用 .default()
 */

// ============================================================================
// 通用 Schema（Common Schemas）
// ============================================================================

/**
 * 成功响应包装器
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true).meta({ description: '操作成功标识' }),
    data: data.meta({ description: '响应数据' }),
    timestamp: z.coerce.date().meta({ description: '响应时间戳' }),
  });

/**
 * 问题详情（RFC 7807 Problem Details）
 */
export const ProblemDetailSchema = z
  .object({
    type: z.string().url().optional().meta({ description: '问题类型 URL' }),
    title: z.string().meta({ description: '问题标题' }),
    status: z.number().int().positive().meta({ description: 'HTTP 状态码' }),
    detail: z.string().optional().meta({ description: '问题详细描述' }),
    instance: z.string().url().optional().meta({ description: '发生问题的实例 URL' }),
    errors: z
      .array(
        z.object({
          field: z.string().meta({ description: '错误字段路径' }),
          message: z.string().meta({ description: '错误消息' }),
        }),
      )
      .optional()
      .meta({ description: '字段级错误列表' }),
  })
  .meta({ description: '问题详情' });

/**
 * 分页元数据
 */
export const PaginationMetaSchema = z
  .object({
    page: z.number().int().positive().meta({ description: '当前页码' }),
    limit: z.number().int().positive().meta({ description: '每页数量' }),
    total: z.number().int().nonnegative().meta({ description: '总记录数' }),
    totalPages: z.number().int().nonnegative().meta({ description: '总页数' }),
  })
  .meta({ description: '分页元数据' });

/**
 * 分页响应包装器
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true).meta({ description: '操作成功标识' }),
    data: z.array(data).meta({ description: '数据列表' }),
    meta: PaginationMetaSchema.meta({ description: '分页元数据' }),
    timestamp: z.coerce.date().meta({ description: '响应时间戳' }),
  });

// ============================================================================
// 实体 Schema（Entity Schemas）
// ============================================================================

// 用户实体（包含认证相关）
export * from './entities/user.schema';

// 部门实体
export * from './entities/department.schema';

// 菜单实体
export * from './entities/menu.schema';

// 合同实体（Phase 2 使用）
export * from './entities/contract.schema';

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

/**
 * 通用类型推导
 *
 * 注意：SuccessResponse 和 PaginatedResponse 是泛型函数，
 * 使用时需要直接调用函数并传入 Zod Schema：
 *
 * @example
 * const MyResponseSchema = SuccessResponseSchema(UserSchema);
 * type MyResponse = z.infer<typeof MyResponseSchema>;
 */
export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
