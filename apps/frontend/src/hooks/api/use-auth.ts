/**
 * 认证相关 React Query Hooks
 *
 * 功能：
 * - 登录
 * - 登出
 * - 获取当前用户
 * - 检查认证状态
 */

'use client';

import { useApiQuery, useApiMutation, UseApiMutationOptions } from '@/lib/react-query/use-api';
import { authApi } from '@/lib/api';
import type { LoginRequest, LoginResponse } from '@contract-management/shared/schemas';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 获取当前用户
 */
export function useCurrentUser(enabled = true) {
  return useApiQuery(
    ['currentUser'],
    () => authApi.getCurrentUser(),
    {
      enabled: enabled && authApi.isAuthenticated(),
      refetchOnWindowFocus: false,
    },
  );
}

/**
 * 检查是否已认证
 */
export function useIsAuthenticated() {
  const { data, isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!data,
    isLoading,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 登录
 */
export function useLogin(
  options?: UseApiMutationOptions<LoginResponse, LoginRequest>,
) {
  return useApiMutation(
    (credentials: LoginRequest) => authApi.login(credentials),
    {
      ...options,
      invalidateQueries: [['currentUser']],
    },
  );
}

/**
 * 登出
 */
export function useLogout(options?: UseApiMutationOptions<void, void>) {
  return useApiMutation(
    () => authApi.logout(),
    {
      ...options,
      onSuccess: async (data) => {
        // 清除所有查询缓存
        const queryClient = await import('@tanstack/react-query').then((m) => m.useQueryClient());
        // 清除缓存后跳转到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        await options?.onSuccess?.(data);
      },
    },
  );
}

/**
 * 刷新令牌
 */
export function useRefreshToken(
  options?: UseApiMutationOptions<{ accessToken: string; expiresIn: number }, string>,
) {
  return useApiMutation(
    (refreshToken: string) => authApi.refreshToken(refreshToken),
    options,
  );
}
