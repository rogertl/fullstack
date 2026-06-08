/**
 * 部门管理页面
 *
 * 契约优先：基于 DepartmentSchema、CreateDepartmentRequestSchema、UpdateDepartmentRequestSchema 实现
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
import { departmentApi } from '@/lib/api'
import type { DepartmentResponse, DepartmentStatus } from '@contract-management/shared/schemas'

const DEPARTMENT_STATUS_OPTIONS: Array<DepartmentStatus> = ['ACTIVE', 'INACTIVE']

type DepartmentModalMode = 'create' | 'edit'

interface DepartmentModalData {
  id?: number
  name: string
  code: string
  description?: string
  status: DepartmentStatus
}

function DepartmentManagementContent(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [departments, setDepartments] = useState<Array<DepartmentResponse>>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<DepartmentModalMode>('create')
  const [modalData, setModalData] = useState<DepartmentModalData>({
    name: '',
    code: '',
    description: '',
    status: DEPARTMENT_STATUS_OPTIONS[0],
  })
  const [form] = Form.useForm<DepartmentModalData>()

  const fetchDepartments = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await departmentApi.getList({ page: 1, limit: 100 })
      setDepartments(response.data)
    } catch {
      message.error('获取部门列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取部门列表
  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreate = (): void => {
    setModalMode('create')
    setModalData({
      name: '',
      code: '',
      description: '',
      status: DEPARTMENT_STATUS_OPTIONS[0],
    })
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (department: DepartmentResponse): void => {
    setModalMode('edit')
    setModalData({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? undefined,
      status: department.status,
    })
    form.setFieldsValue({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? '',
      status: department.status,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await departmentApi.delete(id)
      message.success('删除成功')
      await fetchDepartments()
    } catch {
      message.error('删除失败')
    }
  }

  const handleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields()

      if (modalMode === 'create') {
        await departmentApi.create(values)
        message.success('创建成功')
      } else {
        if (modalData.id === undefined) {
          throw new Error('部门 ID 未定义')
        }
        await departmentApi.update(modalData.id, values)
        message.success('更新成功')
      }

      setModalVisible(false)
      await fetchDepartments()
    } catch {
      message.error('操作失败')
    }
  }

  const handleModalCancel = (): void => {
    setModalVisible(false)
    form.resetFields()
  }

  const statusTextMap: Record<DepartmentStatus, string> = {
    ACTIVE: '正常',
    INACTIVE: '未激活',
  }

  const statusColorMap: Record<DepartmentStatus, string> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '部门名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: '部门编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string | null): string => description ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: DepartmentStatus): React.JSX.Element => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: DepartmentResponse): React.JSX.Element => (
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
            description="确定要删除这个部门吗？"
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">部门管理</h1>
          <p className="text-gray-600">管理组织部门</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建部门
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total: number): string => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新建部门' : '编辑部门'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form<DepartmentModalData> form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '部门名称不能为空' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="部门编码"
            rules={[
              { required: true, message: '部门编码不能为空' },
              {
                pattern: /^[A-Z0-9_]+$/,
                message: '部门编码只能包含大写字母、数字和下划线',
              },
            ]}
          >
            <Input placeholder="请输入部门编码" disabled={modalMode === 'edit'} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              {DEPARTMENT_STATUS_OPTIONS.map((status: DepartmentStatus) => (
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

export default function DepartmentManagementPage(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <MainLayout>
        <DepartmentManagementContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
