/**
 * 受保护路由组件
 *
 * 确保未认证用户重定向到登录页
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuth } from './auth-context'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }): React.JSX.Element {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading === false && isAuthenticated === false) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (isAuthenticated === false) {
    return <div />
  }

  return <>{children}</>
}
