/**
 * 合同管理模块 - Zod Schemas 导出
 *
 * 独立模块，不依赖其他业务模块
 */

export {
  ContractTypeEnum,
  ContractStatusEnum,
  PaymentMethodEnum,
  ContractSchema,
  CreateContractRequestSchema,
  UpdateContractRequestSchema,
  ContractQuerySchema,
  ApproveContractRequestSchema,
  ContractResponseSchema,
  PaginatedContractsResponseSchema,
  // 类型推导
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  ContractQuery,
  ApproveContractRequest,
  ContractResponse,
  PaginatedContractsResponse,
  ContractType,
  ContractStatus,
  PaymentMethod,
} from './contract.schema';
