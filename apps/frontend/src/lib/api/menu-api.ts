/**
 * 菜单管理 API
 *
 * 契约优先：基于 MenuSchema、CreateMenuRequestSchema、UpdateMenuRequestSchema、MenuTreeSchema 实现
 */

import { apiClient } from './api-client'
import { z } from 'zod'
import {
  MenuSchema,
  CreateMenuRequestSchema,
  UpdateMenuRequestSchema,
  MenuTreeSchema,
} from '@contract-management/shared/schemas'
import type {
  Menu,
  CreateMenuRequest,
  UpdateMenuRequest,
  MenuTree,
} from '@contract-management/shared/schemas'

interface PaginationParams {
  page?: number
  limit?: number
}

interface PaginatedResponse<T> {
  data: Array<T>
  meta: {
    total: number
    page: number
    limit: number
  }
}

const PaginatedMenuResponseSchema = z.object({
  data: MenuSchema.array(),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})

export class MenuApi {
  private readonly basePath = '/api/menus'

  async getList(params?: PaginationParams): Promise<PaginatedResponse<Menu>> {
    return apiClient.get<PaginatedResponse<Menu>>(this.basePath, PaginatedMenuResponseSchema, {
      params,
    })
  }

  async getTree(): Promise<Array<MenuTree>> {
    return apiClient.get<Array<MenuTree>>(`${this.basePath}/tree`, MenuTreeSchema.array())
  }

  async getUserMenus(role: 'ADMIN' | 'EMPLOYEE'): Promise<Array<MenuTree>> {
    return apiClient.get<Array<MenuTree>>(`${this.basePath}/user/${role}`, MenuTreeSchema.array())
  }

  async getById(id: number): Promise<Menu> {
    return apiClient.get<Menu>(`${this.basePath}/${id}`, MenuSchema)
  }

  async create(data: CreateMenuRequest): Promise<Menu> {
    const validatedData = CreateMenuRequestSchema.parse(data)
    return apiClient.post<Menu>(this.basePath, validatedData, MenuSchema)
  }

  async update(id: number, data: UpdateMenuRequest): Promise<Menu> {
    const validatedData = UpdateMenuRequestSchema.parse(data)
    return apiClient.patch<Menu>(`${this.basePath}/${id}`, validatedData, MenuSchema)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const menuApi = new MenuApi()
