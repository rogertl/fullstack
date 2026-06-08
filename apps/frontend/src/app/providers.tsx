'use client';

/**
 * Providers 组件
 *
 * 包装所有客户端 providers
 */

import { QueryProvider } from '@/lib/react-query/query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}
