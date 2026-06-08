/**
 * 用户管理 API
 *
 * 契约优先：基于 UserSchema、CreateUserRequestSchema、UpdateUserRequestSchema 实现
 */

import { apiClient } from './api-client'
import { z } from 'zod'
import {
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UserResponseSchema,
} from '@contract-management/shared/schemas'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
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

const PaginatedUserResponseSchema = z.object({
  data: UserSchema.array(),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})

export class UserApi {
  private readonly basePath = '/api/users'

  async getList(params?: PaginationParams): Promise<PaginatedResponse<UserResponse>> {
    return apiClient.get<PaginatedResponse<UserResponse>>(
      this.basePath,
      PaginatedUserResponseSchema,
      { params }
    )
  }

  async getById(id: number): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`${this.basePath}/${id}`, UserResponseSchema)
  }

  async create(data: CreateUserRequest): Promise<UserResponse> {
    const validatedData = CreateUserRequestSchema.parse(data)
    return apiClient.post<UserResponse>(this.basePath, validatedData, UserResponseSchema)
  }

  async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const validatedData = UpdateUserRequestSchema.parse(data)
    return apiClient.patch<UserResponse>(
      `${this.basePath}/${id}`,
      validatedData,
      UserResponseSchema
    )
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const userApi = new UserApi()
