/**
 * 登录页面
 *
 * 契约优先：基于 LoginRequestSchema 实现
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import type { LoginRequest } from '@contract-management/shared/schemas'

const { Title } = Typography

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '登录失败，请检查用户名和密码'
}

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const [form] = Form.useForm<LoginRequest>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const handleSubmit = async (values: LoginRequest): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await login(values.username, values.password)
      router.push('/dashboard')
    } catch (err) {
      setLoading(false)
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <Title level={2} className="mb-2">
              合同管理系统
            </Title>
            <p className="text-gray-600">登录以继续</p>
          </div>

          {error !== null && (
            <Alert message="登录失败" description={error} type="error" showIcon className="mb-6" />
          )}

          <Form<LoginRequest>
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            autoComplete="off"
            initialValues={{
              username: 'admin',
              password: 'admin123',
            }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '用户名不能为空' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '密码不能为空' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-4 text-center text-sm text-gray-500">默认账号：admin / admin123</div>
        </Card>
      </div>
    </div>
  )
}
