import { z } from 'zod';

/**
 * 用户实体 Schema
 *
 * 契约优先：此 Schema 将在 Stage 0 根据用户故事和领域模型正式定义
 *
 * 当前状态：模板占位，等待 Stage 0 定义
 */

// ============================================================================
// 状态枚举（Status Enums）
// ============================================================================

/**
 * 用户角色
 */
export const UserRoleEnum = z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
  description: '用户角色',
  errorMap: () => ({ message: '用户角色无效' }),
});

export type UserRole = z.infer<typeof UserRoleEnum>;

// ============================================================================
// 主实体 Schema（Main Entity Schema）
// ============================================================================

/**
 * 用户实体
 */
export const UserSchema = z
  .object({
    // 基础字段
    id: z.number().int().positive().describe('用户 ID'),
    username: z.string().min(3).max(50).describe('用户名'),
    email: z.string().email().describe('邮箱地址'),
    role: UserRoleEnum.describe('用户角色'),
    isActive: z.boolean().default(true).describe('是否激活'),

    // 时间戳
    createdAt: z.coerce.date().describe('创建时间'),
    updatedAt: z.coerce.date().describe('更新时间'),
  })
  .describe('用户实体');

/**
 * 创建用户请求
 */
export const CreateUserRequestSchema = UserSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
}).required({
  username: true,
  email: true,
  role: true,
});

/**
 * 更新用户请求
 */
export const UpdateUserRequestSchema = UserSchema.partial({
  username: true,
  email: true,
  role: true,
  isActive: true,
}).describe('更新用户请求');

/**
 * 用户响应
 */
export const UserResponseSchema = UserSchema.describe('用户响应');

// ============================================================================
// 认证相关 Schema（Auth Schemas）
// ============================================================================

/**
 * 登录请求
 */
export const LoginRequestSchema = z.object({
  username: z.string().min(1).describe('用户名'),
  password: z.string().min(6).describe('密码'),
});

/**
 * 登录响应（双 token 模式）
 */
export const LoginResponseSchema = z.object({
  user: UserResponseSchema.describe('用户信息'),
  accessToken: z.string().describe('访问令牌'),
  refreshToken: z.string().describe('刷新令牌'),
  expiresIn: z.number().describe('访问令牌过期时间（秒）'),
});

/**
 * 刷新令牌请求
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().describe('刷新令牌'),
});

/**
 * 刷新令牌响应
 */
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string().describe('新的访问令牌'),
  expiresIn: z.number().describe('访问令牌过期时间（秒）'),
});

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
