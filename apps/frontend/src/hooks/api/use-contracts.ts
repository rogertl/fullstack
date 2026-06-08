/**
 * 合同相关 React Query Hooks
 *
 * 契约优先：此模块将在前端阶段（Stage 4）根据 Zod Schema 完善
 * 当前状态：模板示例
 */

'use client';

import { useApiQuery, useApiMutation, UseApiMutationOptions } from '../use-api';
import { contractApi } from '@/lib/api';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '@contract-management/shared/schemas';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 获取合同列表
 */
export function useContracts(params?: { page?: number; limit?: number }) {
  return useApiQuery(
    ['contracts', params],
    () => contractApi.getList(params),
    {
      enabled: true,
    },
  );
}

/**
 * 获取单个合同
 */
export function useContract(id: number, enabled = true) {
  return useApiQuery(
    ['contract', id],
    () => contractApi.getById(id),
    { enabled },
  );
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 创建合同
 */
export function useCreateContract(
  options?: UseApiMutationOptions<Contract, CreateContractRequest>,
) {
  return useApiMutation(
    (data: CreateContractRequest) => contractApi.create(data),
    {
      ...options,
      invalidateQueries: [['contracts']],
    },
  );
}

/**
 * 更新合同
 */
export function useUpdateContract(
  options?: UseApiMutationOptions<Contract, { id: number; data: UpdateContractRequest }>,
) {
  return useApiMutation(
    ({ id, data }) => contractApi.update(id, data),
    {
      ...options,
      invalidateQueries: [['contracts'], ['contract']],
    },
  );
}

/**
 * 删除合同
 */
export function useDeleteContract(
  options?: UseApiMutationOptions<void, number>,
) {
  return useApiMutation(
    (id: number) => contractApi.delete(id),
    {
      ...options,
      invalidateQueries: [['contracts']],
    },
  );
}

/**
 * 更新合同状态
 */
export function useUpdateContractStatus(
  options?: UseApiMutationOptions<Contract, { id: number; status: Contract['status'] }>,
) {
  return useApiMutation(
    ({ id, status }) => contractApi.updateStatus(id, status),
    {
      ...options,
      invalidateQueries: [['contracts'], ['contract']],
    },
  );
}
