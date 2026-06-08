import { z } from 'zod/v4';

/**
 * 部门实体 Schema
 *
 * 契约优先：此 Schema 将在 Stage 0 定义，作为数据阶段的唯一真相来源
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 部门状态
 */
export const DepartmentStatusEnum = z.enum(['ACTIVE', 'INACTIVE']).meta({
  description: '部门状态',
});

export type DepartmentStatus = z.infer<typeof DepartmentStatusEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 部门实体
 */
export const DepartmentSchema = z
  .object({
    // 基础字段
    id: z
      .number()
      .int()
      .positive()
      .meta({ description: '部门 ID' }),
    name: z
      .string()
      .min(1)
      .max(100)
      .meta({ description: '部门名称' }),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9_]+$/, {
        message: '部门编码只能包含大写字母、数字和下划线',
      })
      .meta({ description: '部门编码' }),
    description: z
      .string()
      .max(500)
      .nullable()
      .meta({ description: '部门描述' }),

    // 组织关系
    parentId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '上级部门 ID' }),
    managerId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '部门负责人 ID' }),

    // 状态
    status: DepartmentStatusEnum.meta({ description: '部门状态' }),

    // 时间戳
    createdAt: z.coerce.date().meta({ description: '创建时间' }),
    updatedAt: z.coerce.date().meta({ description: '更新时间' }),
  })
  .meta({ description: '部门实体' });

/**
 * 创建部门请求
 */
export const CreateDepartmentRequestSchema = DepartmentSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  description: true,
  status: true,
  parentId: true,
  managerId: true,
})
  .required({
    name: true,
    code: true,
  })
  .meta({ description: '创建部门请求' });

/**
 * 更新部门请求
 */
export const UpdateDepartmentRequestSchema = DepartmentSchema.partial({
  name: true,
  description: true,
  parentId: true,
  managerId: true,
  status: true,
}).meta({ description: '更新部门请求' });

/**
 * 部门响应
 */
export const DepartmentResponseSchema = DepartmentSchema.meta({
  description: '部门响应',
});

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type Department = z.infer<typeof DepartmentSchema>;
export type CreateDepartmentRequest = z.infer<typeof CreateDepartmentRequestSchema>;
export type UpdateDepartmentRequest = z.infer<typeof UpdateDepartmentRequestSchema>;
export type DepartmentResponse = z.infer<typeof DepartmentResponseSchema>;
