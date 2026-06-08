import { createZodDto } from 'nestjs-zod';
import {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UserResponseSchema,
} from '@contract-management/shared';

/**
 * 创建用户请求 DTO
 * 自动从 Zod Schema 生成
 */
export class CreateUserRequestDto extends createZodDto(CreateUserRequestSchema) {}

/**
 * 更新用户请求 DTO
 * 自动从 Zod Schema 生成
 */
export class UpdateUserRequestDto extends createZodDto(UpdateUserRequestSchema) {}

/**
 * 用户响应 DTO
 * 自动从 Zod Schema 生成
 */
export class UserResponseDto extends createZodDto(UserResponseSchema) {}
