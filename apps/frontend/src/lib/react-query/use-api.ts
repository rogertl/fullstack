/**
 * 通用 React Query Hooks
 *
 * 提供 useApiMutation 和 useApiQuery，与 API 客户端集成
 */

'use client';

import {
  UseMutationResult,
  UseQueryResult,
  useMutation as useReactMutation,
  useQuery as useReactQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { handleApiError, ApiFieldError } from '@/lib/api';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * API 异步函数
 */
type ApiFunction<TData, TVariables> = (variables: TVariables) => Promise<TData>;

/**
 * Mutation 选项
 */
export interface UseApiMutationOptions<TData, TVariables, TError = Error> {
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: TError) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: TError | null) => void | Promise<void>;
  invalidateQueries?: unknown[];
}

/**
 * Query 选项
 */
export interface UseApiQueryOptions<TData> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}

// ============================================================================
// useApiMutation Hook
// ============================================================================

/**
 * 使用 API Mutation
 *
 * 自动处理错误、加载状态
 */
export function useApiMutation<TData, TVariables = void>(
  apiFunction: ApiFunction<TData, TVariables>,
  options?: UseApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: apiFunction,
    onSuccess: async (data) => {
      await options?.onSuccess?.(data);

      // 使指定查询失效
      if (options?.invalidateQueries) {
        await Promise.all(
          options.invalidateQueries.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    },
    onError: (error) => {
      // 处理 API 错误
      if (error instanceof Error) {
        handleApiError(error);
      }
      options?.onError?.(error as Error);
    },
    onSettled: options?.onSettled,
  });

  return mutation as UseMutationResult<TData, Error, TVariables>;
}

// ============================================================================
// useApiQuery Hook
// ============================================================================

/**
 * 使用 API Query
 *
 * 自动处理错误、加载状态、缓存
 */
export function useApiQuery<TData>(
  queryKey: unknown[],
  apiFunction: () => Promise<TData>,
  options?: UseApiQueryOptions<TData>,
): UseQueryResult<TData, Error> {
  const query = useReactQuery({
    queryKey,
    queryFn: apiFunction,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });

  return query as UseQueryResult<TData, Error>;
}

// ============================================================================
// useInvalidateApi Hook
// ============================================================================

/**
 * 使查询失效
 */
export function useInvalidateApi() {
  const queryClient = useQueryClient();

  return {
    invalidate: (queryKey: unknown[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
    invalidateMultiple: (queryKeys: unknown[][]) => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
  };
}
