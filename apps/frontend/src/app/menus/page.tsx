/**
 * 菜单管理页面
 *
 * 契约优先：基于 MenuSchema、CreateMenuRequestSchema、UpdateMenuRequestSchema 实现
 */

'use client'

import { useState } from 'react'
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
  Switch,
  InputNumber,
  message,
  Popconfirm,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { menuApi } from '@/lib/api'
import type { Menu, MenuTree, UserRole } from '@contract-management/shared/schemas'

const USER_ROLE_OPTIONS: Array<UserRole> = ['ADMIN', 'EMPLOYEE']

type MenuModalMode = 'create' | 'edit'

interface MenuModalData {
  id?: number
  name: string
  path: string
  icon?: string
  parentId?: number | null
  sortOrder: number
  roleCodes: Array<UserRole>
  isVisible: boolean
  isEnabled: boolean
}

function MenuManagementContent(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [menus, setMenus] = useState<Array<MenuTree>>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<MenuModalMode>('create')
  const [modalData, setModalData] = useState<MenuModalData>({
    name: '',
    path: '',
    icon: '',
    parentId: null,
    sortOrder: 0,
    roleCodes: [USER_ROLE_OPTIONS[0]],
    isVisible: true,
    isEnabled: true,
  })
  const [form] = Form.useForm<MenuModalData>()

  const fetchMenus = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await menuApi.getTree()
      setMenus(response)
    } catch {
      message.error('获取菜单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (): void => {
    setModalMode('create')
    setModalData({
      name: '',
      path: '',
      icon: '',
      parentId: null,
      sortOrder: 0,
      roleCodes: [USER_ROLE_OPTIONS[0]],
      isVisible: true,
      isEnabled: true,
    })
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (menu: MenuTree): void => {
    setModalMode('edit')
    setModalData({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon ?? undefined,
      parentId: menu.parentId ?? undefined,
      sortOrder: menu.sortOrder,
      roleCodes: menu.roleCodes,
      isVisible: menu.isVisible,
      isEnabled: menu.isEnabled,
    })
    form.setFieldsValue({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon ?? '',
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      roleCodes: menu.roleCodes,
      isVisible: menu.isVisible,
      isEnabled: menu.isEnabled,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await menuApi.delete(id)
      message.success('删除成功')
      await fetchMenus()
    } catch {
      message.error('删除失败')
    }
  }

  const handleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields()

      if (modalMode === 'create') {
        await menuApi.create(values)
        message.success('创建成功')
      } else {
        if (modalData.id === undefined) {
          throw new Error('菜单 ID 未定义')
        }
        await menuApi.update(modalData.id, values)
        message.success('更新成功')
      }

      setModalVisible(false)
      await fetchMenus()
    } catch {
      message.error('操作失败')
    }
  }

  const handleModalCancel = (): void => {
    setModalVisible(false)
    form.resetFields()
  }

  const flattenMenus = (
    menuList: Array<MenuTree>,
    parentId: number | null = null
  ): Array<Menu & { children?: undefined }> => {
    const result: Array<Menu & { children?: undefined }> = []
    for (const menu of menuList) {
      result.push({ ...menu, parentId, children: undefined })
      if (menu.children !== undefined && menu.children !== null && menu.children.length > 0) {
        result.push(...flattenMenus(menu.children, menu.id))
      }
    }
    return result
  }

  const roleTextMap: Record<UserRole, string> = {
    ADMIN: '管理员',
    EMPLOYEE: '普通用户',
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '菜单名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon: string | null): string => icon ?? '-',
    },
    {
      title: '上级菜单',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 100,
      render: (parentId: number | null): number | string => parentId ?? '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '可见',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (isVisible: boolean): string => (isVisible ? '是' : '否'),
    },
    {
      title: '启用',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 80,
      render: (isEnabled: boolean): string => (isEnabled ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: MenuTree): React.JSX.Element => (
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
            description="确定要删除这个菜单吗？"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">菜单管理</h1>
          <p className="text-gray-600">管理系统菜单</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建菜单
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={flattenMenus(menus)}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total: number): string => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新建菜单' : '编辑菜单'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form<MenuModalData> form={form} layout="vertical">
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '菜单名称不能为空' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true, message: '路由路径不能为空' }]}
          >
            <Input placeholder="请输入路由路径，如：/users" />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标名称，如：UserOutlined" />
          </Form.Item>

          <Form.Item name="parentId" label="上级菜单">
            <Select
              placeholder="请选择上级菜单"
              allowClear
              options={menus.map((menu): { label: string; value: number } => ({
                label: menu.name,
                value: menu.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序号"
            rules={[{ required: true, message: '排序号不能为空' }]}
          >
            <InputNumber min={0} placeholder="请输入排序号" className="w-full" />
          </Form.Item>

          <Form.Item
            name="roleCodes"
            label="可访问角色"
            rules={[{ required: true, message: '请选择可访问角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择可访问角色"
              options={USER_ROLE_OPTIONS.map((role): { label: string; value: UserRole } => ({
                label: roleTextMap[role],
                value: role,
              }))}
            />
          </Form.Item>

          <Form.Item name="isVisible" label="是否可见" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isEnabled" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default function MenuManagementPage(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <MainLayout>
        <MenuManagementContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
