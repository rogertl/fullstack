/**
 * 首页
 * 根据认证状态重定向到相应的页面
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Spin, Card, Typography } from 'antd'

const { Title, Text } = Typography

export default function HomePage(): React.JSX.Element {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="text-center shadow-lg rounded-xl">
        <Spin size="large" />
        <div className="mt-6">
          <Title level={4} className="mb-2">
            正在加载...
          </Title>
          <Text type="secondary">系统正在为您准备最佳体验</Text>
        </div>
      </Card>
    </div>
  )
}
