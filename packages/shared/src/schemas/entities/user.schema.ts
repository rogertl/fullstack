import { z } from 'zod/v4';

/**
 * 用户实体 Schema
 *
 * 契约优先：此 Schema 将在 Stage 0 定义，作为数据阶段的唯一真相来源
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 用户角色
 */
export const UserRoleEnum = z.enum(['ADMIN', 'EMPLOYEE']).meta({
  description: '用户角色（ADMIN=管理员，EMPLOYEE=普通用户）',
});

/**
 * 用户状态
 */
export const UserStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).meta({
  description: '用户状态',
});

export type UserRole = z.infer<typeof UserRoleEnum>;
export type UserStatus = z.infer<typeof UserStatusEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 用户实体
 */
export const UserSchema = z
  .object({
    // 基础字段
    id: z
      .number()
      .int()
      .positive()
      .meta({ description: '用户 ID' }),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: '用户名只能包含字母、数字和下划线',
      })
      .meta({ description: '用户名（登录用）' }),
    email: z
      .string()
      .email('邮箱格式不正确')
      .meta({ description: '邮箱地址' }),
    password: z
      .string()
      .min(6)
      .max(100)
      .optional()
      .meta({ description: '密码（仅创建/更新时需要）' }),
    realName: z
      .string()
      .min(1)
      .max(50)
      .meta({ description: '真实姓名' }),
    phone: z
      .string()
      .max(20)
      .regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
      .nullable()
      .meta({ description: '手机号码' }),

    // 角色和部门
    role: UserRoleEnum.meta({ description: '用户角色' }),
    departmentId: z
      .number()
      .int()
      .positive()
      .nullable()
      .meta({ description: '所属部门 ID' }),

    // 状态
    status: UserStatusEnum.default('ACTIVE').meta({ description: '用户状态' }),
    isActive: z
      .boolean()
      .default(true)
      .meta({ description: '是否激活' }),

    // 时间戳
    createdAt: z.coerce.date().meta({ description: '创建时间' }),
    updatedAt: z.coerce.date().meta({ description: '更新时间' }),
  })
  .meta({ description: '用户实体' });

/**
 * 创建用户请求
 */
export const CreateUserRequestSchema = UserSchema.partial({
  id: true,
  phone: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  status: true,
})
  .required({
    username: true,
    email: true,
    password: true,
    realName: true,
    role: true,
  })
  .meta({ description: '创建用户请求' });

/**
 * 更新用户请求
 */
export const UpdateUserRequestSchema = UserSchema.omit({
  id: true,
  role: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .meta({ description: '更新用户请求' });

/**
 * 用户响应（不包含密码）
 */
export const UserResponseSchema = UserSchema.omit({ password: true }).meta({
  description: '用户响应',
});

// ============================================================================
// 认证相关 Schema（Auth Schemas）
// ============================================================================

/**
 * 登录请求
 */
export const LoginRequestSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: '用户名不能为空' })
      .meta({ description: '用户名' }),
    password: z
      .string()
      .min(1, { message: '密码不能为空' })
      .meta({ description: '密码' }),
  })
  .meta({ description: '登录请求' });

/**
 * 登录响应（双 token 模式）
 */
export const LoginResponseSchema = z
  .object({
    user: UserResponseSchema.meta({ description: '用户信息' }),
    accessToken: z.string().meta({ description: '访问令牌' }),
    refreshToken: z.string().meta({ description: '刷新令牌' }),
    expiresIn: z.number().meta({ description: '访问令牌过期时间（秒）' }),
  })
  .meta({ description: '登录响应' });

/**
 * 刷新令牌请求
 */
export const RefreshTokenRequestSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, { message: '刷新令牌不能为空' })
      .meta({ description: '刷新令牌' }),
  })
  .meta({ description: '刷新令牌请求' });

/**
 * 刷新令牌响应
 */
export const RefreshTokenResponseSchema = z
  .object({
    accessToken: z.string().meta({ description: '新的访问令牌' }),
    expiresIn: z.number().meta({ description: '访问令牌过期时间（秒）' }),
  })
  .meta({ description: '刷新令牌响应' });

/**
 * 登出请求
 */
export const LogoutRequestSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, { message: '刷新令牌不能为空' })
      .meta({ description: '刷新令牌' }),
  })
  .meta({ description: '登出请求' });

/**
 * 登出响应
 */
export const LogoutResponseSchema = z
  .object({
    success: z.boolean().meta({ description: '是否成功' }),
  })
  .meta({ description: '登出响应' });

// ============================================================================
// 类型推导（Type Inference）
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
