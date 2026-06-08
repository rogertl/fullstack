/**
 * 认证 API
 *
 * 契约优先：基于 LoginRequestSchema、LoginResponseSchema 实现
 */

import { apiClient } from './api-client'
import {
  LoginRequestSchema,
  LoginResponseSchema,
  UserResponseSchema,
} from '@contract-management/shared/schemas'
import type { LoginRequest, LoginResponse, UserResponse } from '@contract-management/shared/schemas'

export class AuthApi {
  private readonly basePath = '/api/auth'

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validatedCredentials = LoginRequestSchema.parse(credentials)
    const response = await apiClient.post<LoginResponse>(
      `${this.basePath}/login`,
      validatedCredentials,
      LoginResponseSchema,
      { skipAuth: true }
    )

    // 存储 token
    if (response.accessToken !== undefined) {
      localStorage.setItem('accessToken', response.accessToken)
    }
    if (response.refreshToken !== undefined) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    return response
  }

  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`${this.basePath}/me`, UserResponseSchema)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('accessToken') !== null
  }
}

export const authApi = new AuthApi()
