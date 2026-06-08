import { apiClient, PaginationParams } from './api-client';
import {
  ContractSchema,
  CreateContractRequestSchema,
  UpdateContractRequestSchema,
  SuccessResponseSchema,
  PaginatedResponseSchema,
} from '@contract-management/shared/schemas';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '@contract-management/shared/schemas';

/**
 * 合同 API 服务
 *
 * 契约优先：此服务将在文档阶段（Stage 1）根据 OpenAPI 规范完善
 * 当前状态：模板示例
 */
export class ContractApi {
  private readonly basePath = '/api/contracts';

  /**
   * 获取合同列表（分页）
   */
  async getList(params?: PaginationParams) {
    return apiClient.getPaginated(
      this.basePath,
      params || {},
      ContractSchema,
    );
  }

  /**
   * 获取单个合同
   */
  async getById(id: number) {
    return apiClient.get(
      `${this.basePath}/${id}`,
      ContractSchema,
    );
  }

  /**
   * 创建合同
   */
  async create(data: CreateContractRequest) {
    return apiClient.post(
      this.basePath,
      data,
      ContractSchema,
    );
  }

  /**
   * 更新合同
   */
  async update(id: number, data: UpdateContractRequest) {
    return apiClient.patch(
      `${this.basePath}/${id}`,
      data,
      ContractSchema,
    );
  }

  /**
   * 删除合同
   */
  async delete(id: number) {
    return apiClient.delete(
      `${this.basePath}/${id}`,
    );
  }

  /**
   * 更新合同状态
   */
  async updateStatus(id: number, status: Contract['status']) {
    return apiClient.patch(
      `${this.basePath}/${id}/status`,
      { status },
      ContractSchema,
    );
  }
}

/**
 * 合同 API 实例
 */
export const contractApi = new ContractApi();
