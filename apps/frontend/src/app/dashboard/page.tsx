/**
 * 仪表板页面
 */

'use client'

import { ProtectedRoute } from '@/lib/auth'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, Row, Col, Statistic } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

function DashboardContent(): React.JSX.Element {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">仪表板</h1>
        <p className="text-gray-600">欢迎回来，这是您的工作台</p>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="部门总数"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="菜单总数"
              value={0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="系统状态"
              value="正常"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="快捷操作">
        <p className="text-gray-500">快捷操作功能开发中...</p>
      </Card>
    </div>
  )
}

export default function DashboardPage(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
