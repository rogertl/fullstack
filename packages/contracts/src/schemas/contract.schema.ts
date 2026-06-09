import { z } from 'zod/v4';

/**
 * 合同管理独立模块 - Zod Schema
 *
 * 这是合同管理功能的唯一真相来源
 * 所有后续开发（API、数据库、前端）都基于此契约
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 合同类型枚举
 */
export const ContractTypeEnum = z
  .enum(['SERVICE', 'SALES', 'PURCHASE', 'LEASE', 'LABOR', 'OTHER'])
  .meta({
    description:
      '合同类型（SERVICE=服务，SALES=销售，PURCHASE=采购，LEASE=租赁，LABOR=劳务，OTHER=其他）',
  });

/**
 * 合同状态枚举
 */
export const ContractStatusEnum = z
  .enum([
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'IN_EXECUTION',
    'COMPLETED',
    'REJECTED',
    'ARCHIVED',
  ])
  .meta({
    description:
      '合同状态（DRAFT=草稿，PENDING_APPROVAL=待审批，APPROVED=已批准，IN_EXECUTION=执行中，COMPLETED=已完成，REJECTED=已拒绝，ARCHIVED=已归档）',
  });

/**
 * 付款方式枚举
 */
export const PaymentMethodEnum = z.enum(['LUMP_SUM', 'INSTALLMENT', 'MILESTONE', 'PROGRESS']).meta({
  description: '付款方式（LUMP_SUM=一次性，INSTALLMENT=分期，MILESTONE=里程碑，PROGRESS=进度款）',
});

export type ContractType = z.infer<typeof ContractTypeEnum>;
export type ContractStatus = z.infer<typeof ContractStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 合同实体 Schema（完整定义）
 */
export const ContractSchema = z
  .object({
    // 基础字段
    id: z.number().int().positive().meta({ description: '合同 ID' }),
    contractNo: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9-]+$/, { message: '合同编号只能包含大写字母、数字和连字符' })
      .meta({ description: '合同编号（唯一）' }),
    title: z.string().min(1).max(200).meta({ description: '合同标题' }),
    contractType: ContractTypeEnum.meta({ description: '合同类型' }),
    amount: z.number().positive().meta({ description: '合同金额（元）' }),

    // 甲乙方信息
    partyA: z.string().min(1).max(200).meta({ description: '甲方名称' }),
    partyAContact: z.string().max(50).nullable().meta({ description: '甲方联系人' }),
    partyAPhone: z
      .string()
      .max(20)
      .regex(/^1[3-9]\d{9}$/, { message: '甲方手机号格式不正确' })
      .nullable()
      .meta({ description: '甲方联系电话' }),
    partyB: z.string().min(1).max(200).meta({ description: '乙方名称' }),
    partyBContact: z.string().max(50).nullable().meta({ description: '乙方联系人' }),
    partyBPhone: z
      .string()
      .max(20)
      .regex(/^1[3-9]\d{9}$/, { message: '乙方手机号格式不正确' })
      .nullable()
      .meta({ description: '乙方联系电话' }),

    // 合同期限
    startDate: z.coerce.date().nullable().meta({ description: '合同开始日期' }),
    endDate: z.coerce.date().nullable().meta({ description: '合同结束日期' }),
    signDate: z.coerce.date().nullable().meta({ description: '合同签订日期' }),

    // 付款条款
    paymentMethod: PaymentMethodEnum.nullable().meta({ description: '付款方式' }),
    paymentPeriods: z.number().int().nonnegative().nullable().meta({ description: '付款期数' }),
    paymentTerms: z.string().max(1000).nullable().meta({ description: '付款条款说明' }),

    // 合同内容
    content: z.string().max(10000).nullable().meta({ description: '合同内容描述' }),
    attachmentUrl: z.string().max(500).url().nullable().meta({ description: '合同附件 URL' }),
    remarks: z.string().max(1000).nullable().meta({ description: '备注信息' }),

    // 状态管理
    status: ContractStatusEnum.default('DRAFT').meta({ description: '合同状态' }),

    // 审批信息
    approverId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '审批人 ID（引用用户模块）' }),
    approvalTime: z.coerce.date().nullable().meta({ description: '审批时间' }),
    approvalComments: z.string().max(500).nullable().meta({ description: '审批意见' }),

    // 组织关系
    createdById: z.number().int().positive().meta({ description: '创建人 ID（引用用户模块）' }),
    departmentId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '所属部门 ID（引用部门模块）' }),

    // 时间戳
    createdAt: z.coerce.date().meta({ description: '创建时间' }),
    updatedAt: z.coerce.date().meta({ description: '更新时间' }),
  })
  .meta({ description: '合同实体' });

// ============================================================================
// 请求/响应 Schema（Request/Response Schemas）
// ============================================================================

/**
 * 创建合同请求 Schema
 */
export const CreateContractRequestSchema = ContractSchema.partial({
  id: true,
  status: true,
  approverId: true,
  approvalTime: true,
  approvalComments: true,
  createdAt: true,
  updatedAt: true,
})
  .required({
    contractNo: true,
    title: true,
    contractType: true,
    amount: true,
    partyA: true,
    partyB: true,
    createdById: true,
  })
  .meta({ description: '创建合同请求' });

/**
 * 更新合同请求 Schema
 */
export const UpdateContractRequestSchema = ContractSchema.partial({
  contractNo: true,
  title: true,
  contractType: true,
  amount: true,
  partyA: true,
  partyAContact: true,
  partyAPhone: true,
  partyB: true,
  partyBContact: true,
  partyBPhone: true,
  startDate: true,
  endDate: true,
  signDate: true,
  paymentMethod: true,
  paymentPeriods: true,
  paymentTerms: true,
  content: true,
  attachmentUrl: true,
  remarks: true,
  status: true,
  approverId: true,
  approvalComments: true,
  departmentId: true,
}).meta({ description: '更新合同请求（部分字段可选）' });

/**
 * 合同查询参数 Schema
 */
export const ContractQuerySchema = z
  .object({
    skip: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .meta({ description: '跳过记录数（分页）' }),
    take: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .meta({ description: '每页记录数（最大100）' }),
    status: ContractStatusEnum.optional().meta({ description: '按状态筛选' }),
    contractType: ContractTypeEnum.optional().meta({ description: '按合同类型筛选' }),
    departmentId: z.coerce.number().int().positive().optional().meta({ description: '按部门筛选' }),
    createdById: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .meta({ description: '按创建人筛选' }),
    search: z.string().max(100).optional().meta({ description: '搜索关键词（合同编号或标题）' }),
  })
  .meta({ description: '合同查询参数' });

/**
 * 审批合同请求 Schema
 */
export const ApproveContractRequestSchema = z
  .object({
    approved: z.boolean().meta({ description: '是否批准' }),
    comments: z.string().max(500).nullable().meta({ description: '审批意见' }),
  })
  .meta({ description: '合同审批请求' });

/**
 * 合同响应 Schema（不包含敏感信息）
 */
export const ContractResponseSchema = ContractSchema.omit({
  // 可以选择隐藏某些敏感字段
}).meta({ description: '合同响应数据' });

/**
 * 分页合同列表响应 Schema
 */
export const PaginatedContractsResponseSchema = z
  .object({
    data: ContractSchema.array(),
    meta: z.object({
      total: z.number().int().nonnegative(),
      skip: z.number().int().nonnegative(),
      take: z.number().int().positive(),
    }),
  })
  .meta({ description: '分页合同列表响应' });

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type Contract = z.infer<typeof ContractSchema>;
export type CreateContractRequest = z.infer<typeof CreateContractRequestSchema>;
export type UpdateContractRequest = z.infer<typeof UpdateContractRequestSchema>;
export type ContractQuery = z.infer<typeof ContractQuerySchema>;
export type ApproveContractRequest = z.infer<typeof ApproveContractRequestSchema>;
export type ContractResponse = z.infer<typeof ContractResponseSchema>;
export type PaginatedContractsResponse = z.infer<typeof PaginatedContractsResponseSchema>;
