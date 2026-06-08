import { z } from 'zod';

/**
 * 合同实体 Schema
 *
 * 契约优先：此 Schema 将在 Stage 0 根据用户故事和领域模型正式定义
 *
 * 当前状态：模板占位，等待 Stage 0 定义
 *
 * 定义要素：
 * - 所有字段必须有 .describe() 注释
 * - 状态使用 z.enum() 定义
 * - 关系使用 z.ref() / z.array(z.ref())
 * - 验证规则：min/max/regex
 * - 可选字段明确标记 .nullable() 或 .optional()
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 合同状态
 *
 * 状态机设计（将在 Stage 0 详细定义）：
 * 草稿 → 待审批 → 已批准 → 已归档
 *         ↓        ↓
 *       撤回      拒绝
 *         ↓        ↓
 *       草稿      草稿
 */
export const ContractStatusEnum = z.enum(
  ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ARCHIVED'],
  {
    description: '合同状态',
    errorMap: () => ({ message: '合同状态无效' }),
  },
);

export type ContractStatus = z.infer<typeof ContractStatusEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 合同实体
 */
export const ContractSchema = z
  .object({
    // 基础字段
    id: z.number().int().positive().describe('合同 ID'),
    contractNo: z.string().min(1).max(50).describe('合同编号'),
    title: z.string().min(1).max(200).describe('合同标题'),
    amount: z.number().positive().describe('合同金额'),
    signDate: z.coerce.date().nullable().describe('签署日期'),

    // 状态字段
    status: ContractStatusEnum.describe('合同状态'),

    // 关系字段（将在 Stage 0 定义完整关系）
    // createdById: z.number().int().positive().describe('创建人 ID'),
    // createdBy: z.ref('UserSchema').optional().describe('创建人'),

    // 时间戳
    createdAt: z.coerce.date().describe('创建时间'),
    updatedAt: z.coerce.date().describe('更新时间'),
  })
  .describe('合同实体');

/**
 * 创建合同请求
 */
export const CreateContractRequestSchema = ContractSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  // createdById: true,
}).required({
  contractNo: true,
  title: true,
  amount: true,
});

/**
 * 更新合同请求
 */
export const UpdateContractRequestSchema = ContractSchema.partial({
  contractNo: true,
  title: true,
  amount: true,
  signDate: true,
  status: true,
}).describe('更新合同请求');

/**
 * 合同响应
 */
export const ContractResponseSchema = ContractSchema.describe('合同响应');

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type Contract = z.infer<typeof ContractSchema>;
export type CreateContractRequest = z.infer<typeof CreateContractRequestSchema>;
export type UpdateContractRequest = z.infer<typeof UpdateContractRequestSchema>;
export type ContractResponse = z.infer<typeof ContractResponseSchema>;
