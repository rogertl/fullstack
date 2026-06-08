import { z } from 'zod/v4';

/**
 * 合同实体 Schema
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 合同类型
 */
export const ContractTypeEnum = z
  .enum(['SERVICE', 'SALES', 'PURCHASE', 'LEASE', 'LABOR', 'OTHER'])
  .meta({ description: '合同类型' });

/**
 * 合同状态
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
  .meta({ description: '合同状态' });

/**
 * 付款方式
 */
export const PaymentMethodEnum = z
  .enum(['LUMP_SUM', 'INSTALLMENT', 'MILESTONE', 'PROGRESS'])
  .meta({ description: '付款方式' });

export type ContractType = z.infer<typeof ContractTypeEnum>;
export type ContractStatus = z.infer<typeof ContractStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 合同实体
 */
export const ContractSchema = z
  .object({
    // 基础字段
    id: z
      .number()
      .int()
      .positive()
      .meta({ description: '合同 ID' }),
    contractNo: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9-]+$/, {
        message: '合同编号只能包含大写字母、数字和连字符',
      })
      .meta({ description: '合同编号' }),
    title: z
      .string()
      .min(1)
      .max(200)
      .meta({ description: '合同标题' }),
    contractType: ContractTypeEnum.meta({ description: '合同类型' }),
    amount: z
      .number()
      .positive()
      .meta({ description: '合同金额' }),

    // 甲乙方信息
    partyA: z
      .string()
      .min(1)
      .max(200)
      .meta({ description: '甲方名称' }),
    partyAContact: z
      .string()
      .max(50)
      .nullable()
      .meta({ description: '甲方联系人' }),
    partyAPhone: z
      .string()
      .max(20)
      .nullable()
      .meta({ description: '甲方联系电话' }),
    partyB: z
      .string()
      .min(1)
      .max(200)
      .meta({ description: '乙方名称' }),
    partyBContact: z
      .string()
      .max(50)
      .nullable()
      .meta({ description: '乙方联系人' }),
    partyBPhone: z
      .string()
      .max(20)
      .nullable()
      .meta({ description: '乙方联系电话' }),

    // 合同期限
    startDate: z.coerce.date().nullable().meta({ description: '合同开始日期' }),
    endDate: z.coerce.date().nullable().meta({ description: '合同结束日期' }),
    signDate: z.coerce.date().nullable().meta({ description: '合同签订日期' }),

    // 付款条款
    paymentMethod: PaymentMethodEnum.nullable().meta({ description: '付款方式' }),
    paymentPeriods: z
      .number()
      .int()
      .nonnegative()
      .nullable()
      .meta({ description: '付款期数' }),
    paymentTerms: z
      .string()
      .max(1000)
      .nullable()
      .meta({ description: '付款条款说明' }),

    // 合同内容
    content: z
      .string()
      .max(10000)
      .nullable()
      .meta({ description: '合同内容' }),
    attachmentUrl: z
      .string()
      .max(500)
      .url()
      .nullable()
      .meta({ description: '附件 URL' }),
    remarks: z
      .string()
      .max(1000)
      .nullable()
      .meta({ description: '备注' }),

    // 状态
    status: ContractStatusEnum.default('DRAFT').meta({ description: '合同状态' }),

    // 审批信息
    approverId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '审批人 ID' }),
    approvalTime: z.coerce.date().nullable().meta({ description: '审批时间' }),
    approvalComments: z
      .string()
      .max(500)
      .nullable()
      .meta({ description: '审批意见' }),

    // 组织关系
    createdById: z
      .number()
      .int()
      .positive()
      .meta({ description: '创建人 ID' }),
    departmentId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '所属部门 ID' }),

    // 时间戳
    createdAt: z.coerce.date().meta({ description: '创建时间' }),
    updatedAt: z.coerce.date().meta({ description: '更新时间' }),
  })
  .meta({ description: '合同实体' });

/**
 * 创建合同请求
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
 * 更新合同请求
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
}).meta({ description: '更新合同请求' });

/**
 * 合同响应
 */
export const ContractResponseSchema = ContractSchema.meta({
  description: '合同响应',
});

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type Contract = z.infer<typeof ContractSchema>;
export type CreateContractRequest = z.infer<typeof CreateContractRequestSchema>;
export type UpdateContractRequest = z.infer<typeof UpdateContractRequestSchema>;
export type ContractResponse = z.infer<typeof ContractResponseSchema>;
