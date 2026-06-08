import { z } from 'zod/v4';

import { UserRoleEnum } from './user.schema';

/**
 * 菜单实体 Schema
 *
 * 契约优先：此 Schema 将在 Stage 0 定义，作为数据阶段的唯一真相来源
 */

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 菜单实体
 */
export const MenuSchema = z
  .object({
    // 基础字段
    id: z
      .number()
      .int()
      .positive()
      .meta({ description: '菜单 ID' }),
    name: z
      .string()
      .min(1)
      .max(50)
      .meta({ description: '菜单名称' }),
    path: z
      .string()
      .min(1)
      .max(200)
      .meta({ description: '路由路径' }),
    icon: z
      .string()
      .max(50)
      .nullable()
      .meta({ description: '图标名称' }),

    // 层级关系
    parentId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '上级菜单 ID' }),
    sortOrder: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '排序号' }),

    // 权限关联（基于角色的粗粒度权限）
    roleCodes: z
      .array(z.enum(['ADMIN', 'EMPLOYEE']))
      .meta({ description: '可访问此菜单的角色列表' }),

    // 显示控制
    isVisible: z
      .boolean()
      .default(true)
      .meta({ description: '是否可见' }),
    isEnabled: z
      .boolean()
      .default(true)
      .meta({ description: '是否启用' }),

    // 时间戳
    createdAt: z.coerce.date().meta({ description: '创建时间' }),
    updatedAt: z.coerce.date().meta({ description: '更新时间' }),
  })
  .meta({ description: '菜单实体' });

/**
 * 创建菜单请求
 */
export const CreateMenuRequestSchema = MenuSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .required({
    name: true,
    path: true,
  })
  .meta({ description: '创建菜单请求' });

/**
 * 更新菜单请求
 */
export const UpdateMenuRequestSchema = MenuSchema.partial({
  name: true,
  path: true,
  icon: true,
  parentId: true,
  roleCodes: true,
  isVisible: true,
  isEnabled: true,
}).meta({ description: '更新菜单请求' });

/**
 * 菜单响应
 */
export const MenuResponseSchema = MenuSchema.meta({
  description: '菜单响应',
});

// 树形结构菜单（用于前端渲染）
export const MenuTreeSchema: z.ZodType<{
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  roleCodes: Array<'ADMIN' | 'EMPLOYEE'>;
  isVisible: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: MenuTree[];
}> = MenuSchema.extend({
  children: z.array(z.lazy(() => MenuTreeSchema)).optional(),
});

// ============================================================================
// 用户菜单查询请求
// ============================================================================

/**
 * 根据用户角色获取菜单请求
 */
export const GetUserMenusRequestSchema = z
  .object({
    role: UserRoleEnum.meta({ description: '用户角色' }),
  })
  .meta({ description: '获取用户菜单请求' });

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type Menu = z.infer<typeof MenuSchema>;
export type CreateMenuRequest = z.infer<typeof CreateMenuRequestSchema>;
export type UpdateMenuRequest = z.infer<typeof UpdateMenuRequestSchema>;
export type MenuResponse = z.infer<typeof MenuResponseSchema>;
export type MenuTree = z.infer<typeof MenuTreeSchema>;
export type GetUserMenusRequest = z.infer<typeof GetUserMenusRequestSchema>;
