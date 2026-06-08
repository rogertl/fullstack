import { createZodDto } from 'nestjs-zod';
import {
  CreateDepartmentRequestSchema,
  UpdateDepartmentRequestSchema,
  DepartmentResponseSchema,
} from '@contract-management/shared/schemas';

/**
 * 创建部门请求 DTO
 */
export class CreateDepartmentRequestDto extends createZodDto(
  CreateDepartmentRequestSchema,
) {}

/**
 * 更新部门请求 DTO
 */
export class UpdateDepartmentRequestDto extends createZodDto(
  UpdateDepartmentRequestSchema,
) {}

/**
 * 部门响应 DTO
 */
export class DepartmentResponseDto extends createZodDto(
  DepartmentResponseSchema,
) {}
