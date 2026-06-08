import { z } from 'zod';

/**
 * Zod Schema 统一导出
 * 契约优先：所有 Schema 将在契约阶段（Stage 0）定义
 *
 * 定义规则：
 * - 所有实体使用 z.object() 定义
 * - 所有枚举使用 z.enum() 定义（不使用 TypeScript enum）
 * - 所有字段必须有 .describe() 注释
 * - 关系使用 z.ref() / z.array(z.ref())
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
    success: z.literal(true).describe('操作成功标识'),
    data: data.describe('响应数据'),
    timestamp: z.coerce.date().describe('响应时间戳'),
  });

/**
 * 问题详情（RFC 7807 Problem Details）
 */
export const ProblemDetailSchema = z.object({
  type: z.string().url().optional().describe('问题类型 URL'),
  title: z.string().describe('问题标题'),
  status: z.number().int().positive().describe('HTTP 状态码'),
  detail: z.string().optional().describe('问题详细描述'),
  instance: z.string().url().optional().describe('发生问题的实例 URL'),
  errors: z
    .array(
      z.object({
        field: z.string().describe('错误字段路径'),
        message: z.string().describe('错误消息'),
      }),
    )
    .optional()
    .describe('字段级错误列表'),
});

/**
 * 分页元数据
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive().describe('当前页码'),
  limit: z.number().int().positive().describe('每页数量'),
  total: z.number().int().nonnegative().describe('总记录数'),
  totalPages: z.number().int().nonnegative().describe('总页数'),
});

/**
 * 分页响应包装器
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true).describe('操作成功标识'),
    data: z.array(data).describe('数据列表'),
    meta: PaginationMetaSchema.describe('分页元数据'),
    timestamp: z.coerce.date().describe('响应时间戳'),
  });

// ============================================================================
// 实体 Schema（Entity Schemas）
// ============================================================================

// 合同实体
export * from './entities/contract.schema';

// 用户实体
export * from './entities/user.schema';

// TODO: 在 Stage 0 根据领域模型添加更多实体
// Department, ContractType, ApprovalFlow 等

// ============================================================================
// 请求/响应 Schema（API Schemas）
// ============================================================================
// TODO: 在 Stage 0 定义 API 端点的请求/响应 Schema
// 示例：CreateContractRequest, UpdateContractRequest, ContractResponse 等

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

/**
 * 通用类型推导
 */
export type SuccessResponse<T> = z.infer<ReturnType<typeof SuccessResponseSchema<T>>;
export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<T>>>;
