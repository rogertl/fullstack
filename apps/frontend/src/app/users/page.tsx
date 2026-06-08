/**
 * 用户管理页面
 *
 * 契约优先：基于 UserSchema、CreateUserRequestSchema、UpdateUserRequestSchema 实现
 */

'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/lib/auth'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userApi } from '@/lib/api'
import type { UserResponse, UserRole, UserStatus } from '@contract-management/shared/schemas'

const USER_ROLE_OPTIONS: Array<UserRole> = ['ADMIN', 'EMPLOYEE']
const USER_STATUS_OPTIONS: Array<UserStatus> = ['ACTIVE', 'INACTIVE', 'LOCKED']

type UserModalMode = 'create' | 'edit'

interface UserModalData {
  id?: number
  username: string
  email: string
  password?: string
  realName: string
  phone?: string
  role: UserRole
  status: UserStatus
}

function UserManagementContent(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [users, setUsers] = useState<Array<UserResponse>>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<UserModalMode>('create')
  const [modalData, setModalData] = useState<UserModalData>({
    username: '',
    email: '',
    realName: '',
    phone: '',
    role: USER_ROLE_OPTIONS[0],
    status: USER_STATUS_OPTIONS[0],
  })
  const [form] = Form.useForm<UserModalData>()

  const statusTextMap: Record<UserStatus, string> = {
    ACTIVE: '正常',
    INACTIVE: '未激活',
    LOCKED: '已锁定',
  }

  const statusColorMap: Record<UserStatus, string> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    LOCKED: 'error',
  }

  const roleTextMap: Record<UserRole, string> = {
    ADMIN: '管理员',
    EMPLOYEE: '普通用户',
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', key: 'realName', width: 120 },
    { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string | null): string => phone ?? '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: UserRole): string => roleTextMap[role],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus): React.JSX.Element => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: UserResponse): React.JSX.Element => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(): void => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个用户吗？"
            onConfirm={(): Promise<void> => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const fetchUsers = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await userApi.getList({ page: 1, limit: 100 })
      setUsers(response.data)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取用户列表
  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = (): void => {
    setModalMode('create')
    setModalData({
      username: '',
      email: '',
      realName: '',
      phone: '',
      role: USER_ROLE_OPTIONS[0],
      status: USER_STATUS_OPTIONS[0],
    })
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: UserResponse): void => {
    setModalMode('edit')
    setModalData({
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone ?? undefined,
      role: user.role,
      status: user.status,
    })
    form.setFieldsValue({
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      await fetchUsers()
    } catch {
      message.error('删除失败')
    }
  }

  const handleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields()

      if (modalMode === 'create') {
        await userApi.create(values)
        message.success('创建成功')
      } else {
        if (modalData.id === undefined) {
          throw new Error('用户 ID 未定义')
        }
        await userApi.update(modalData.id, values)
        message.success('更新成功')
      }

      setModalVisible(false)
      await fetchUsers()
    } catch {
      message.error('操作失败')
    }
  }

  const handleModalCancel = (): void => {
    setModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户管理</h1>
          <p className="text-gray-600">管理系统用户</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建用户
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total: number): string => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新建用户' : '编辑用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form<UserModalData> form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '用户名不能为空' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 50, message: '用户名最多50个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" disabled={modalMode === 'edit'} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '邮箱不能为空' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {modalMode === 'create' && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '密码不能为空' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="realName"
            label="姓名"
            rules={[{ required: true, message: '姓名不能为空' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              {USER_ROLE_OPTIONS.map((role: UserRole) => (
                <Select.Option key={role} value={role}>
                  {roleTextMap[role]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              {USER_STATUS_OPTIONS.map((status: UserStatus) => (
                <Select.Option key={status} value={status}>
                  {statusTextMap[status]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default function UserManagementPage(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <MainLayout>
        <UserManagementContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
