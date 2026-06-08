/**
 * 部门管理 API
 *
 * 契约优先：基于 DepartmentSchema、CreateDepartmentRequestSchema、UpdateDepartmentRequestSchema 实现
 */

import { apiClient } from './api-client'
import { z } from 'zod'
import {
  DepartmentSchema,
  CreateDepartmentRequestSchema,
  UpdateDepartmentRequestSchema,
  DepartmentResponseSchema,
} from '@contract-management/shared/schemas'
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
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

const PaginatedDepartmentResponseSchema = z.object({
  data: DepartmentSchema.array(),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})

export class DepartmentApi {
  private readonly basePath = '/api/departments'

  async getList(params?: PaginationParams): Promise<PaginatedResponse<DepartmentResponse>> {
    return apiClient.get<PaginatedResponse<DepartmentResponse>>(
      this.basePath,
      PaginatedDepartmentResponseSchema,
      { params }
    )
  }

  async getById(id: number): Promise<DepartmentResponse> {
    return apiClient.get<DepartmentResponse>(`${this.basePath}/${id}`, DepartmentResponseSchema)
  }

  async create(data: CreateDepartmentRequest): Promise<DepartmentResponse> {
    const validatedData = CreateDepartmentRequestSchema.parse(data)
    return apiClient.post<DepartmentResponse>(
      this.basePath,
      validatedData,
      DepartmentResponseSchema
    )
  }

  async update(id: number, data: UpdateDepartmentRequest): Promise<DepartmentResponse> {
    const validatedData = UpdateDepartmentRequestSchema.parse(data)
    return apiClient.patch<DepartmentResponse>(
      `${this.basePath}/${id}`,
      validatedData,
      DepartmentResponseSchema
    )
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const departmentApi = new DepartmentApi()
