import { createZodDto } from 'nestjs-zod'
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
} from '@contract-management/shared/schemas'

/**
 * 登录请求 DTO
 * 自动从 Zod Schema 生成
 */
export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}

/**
 * 登录响应 DTO
 * 自动从 Zod Schema 生成
 */
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

/**
 * 刷新令牌请求 DTO
 * 自动从 Zod Schema 生成
 */
export class RefreshTokenRequestDto extends createZodDto(RefreshTokenRequestSchema) {}

/**
 * 刷新令牌响应 DTO
 * 自动从 Zod Schema 生成
 */
export class RefreshTokenResponseDto extends createZodDto(RefreshTokenResponseSchema) {}

/**
 * 登出请求 DTO
 * 自动从 Zod Schema 生成
 */
export class LogoutRequestDto extends createZodDto(LogoutRequestSchema) {}

/**
 * 登出响应 DTO
 * 自动从 Zod Schema 生成
 */
export class LogoutResponseDto extends createZodDto(LogoutResponseSchema) {}
