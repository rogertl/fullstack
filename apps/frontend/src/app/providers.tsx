'use client'

/**
 * Providers 组件
 *
 * 包装所有客户端 providers
 */

import { QueryProvider } from '@/lib/react-query/query-provider'
import { AuthProvider } from '@/lib/auth'

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
