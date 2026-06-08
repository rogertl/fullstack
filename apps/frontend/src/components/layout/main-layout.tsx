/**
 * 主布局组件
 *
 * 包含导航栏、侧边栏菜单和主内容区域
 */

'use client'

import { useState } from 'react'
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  BarsOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import type { ReactNode } from 'react'

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps): React.JSX.Element {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  // TODO: 从 API 加载菜单
  // useEffect(() => {
  //   if (user) {
  //     menuApi.getUserMenus(user.role).then(setMenus);
  //   }
  // }, [user]);

  const handleLogout = (): void => {
    logout()
    router.push('/login')
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      onClick: (): void => router.push('/dashboard'),
    },
    {
      key: 'system-settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'users',
          label: '用户管理',
          onClick: (): void => router.push('/users'),
        },
        {
          key: 'departments',
          label: '部门管理',
          onClick: (): void => router.push('/departments'),
        },
      ],
    },
    {
      key: 'menus',
      icon: <ApartmentOutlined />,
      label: '菜单管理',
      onClick: (): void => router.push('/menus'),
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div className="font-medium">{user?.realName ?? '用户'}</div>
          <div className="text-xs text-gray-500">{user?.username ?? ''}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-lg font-bold text-white">合同管理系统</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[window.location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <Button type="text" icon={<BarsOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" className="flex items-center gap-2">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="font-medium">{user?.realName ?? '用户'}</span>
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content className="bg-gray-50 p-6">{children}</Content>
      </Layout>
    </Layout>
  )
}
