import { createZodDto } from 'nestjs-zod';
import {
  CreateContractRequestSchema,
  UpdateContractRequestSchema,
  ContractResponseSchema,
} from '@contract-management/shared';

/**
 * 创建合同请求 DTO
 * 自动从 Zod Schema 生成
 */
export class CreateContractRequestDto extends createZodDto(CreateContractRequestSchema) {}

/**
 * 更新合同请求 DTO
 * 自动从 Zod Schema 生成
 */
export class UpdateContractRequestDto extends createZodDto(UpdateContractRequestSchema) {}

/**
 * 合同响应 DTO
 * 自动从 Zod Schema 生成
 */
export class ContractResponseDto extends createZodDto(ContractResponseSchema) {}
