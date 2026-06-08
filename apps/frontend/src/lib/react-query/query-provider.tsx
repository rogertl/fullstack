/**
 * TanStack Query Provider 配置
 *
 * 契约优先：此配置将在前端阶段（Stage 4）根据需求完善
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * 创建 Query Client
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据保持新鲜 5 分钟
        staleTime: 5 * 60 * 1000,
        // 缓存时间 10 分钟
        gcTime: 10 * 60 * 1000,
        // 失败重试 1 次
        retry: 1,
        // 窗口聚焦时自动重新获取
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 失败不重试
        retry: false,
      },
    },
  });
}

/**
 * Query Client Provider 组件
 */
interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
}

export function QueryProvider({ children, client }: QueryProviderProps) {
  const queryClient = client || createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
