import { apiClient } from './api-client';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  UserResponseSchema,
} from '@contract-management/shared/schemas';
import { tokenStorage } from '../axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '@contract-management/shared/schemas';

/**
 * 认证 API 服务
 *
 * 功能：
 * - 登录（获取 access token 和 refresh token）
 * - 刷新令牌
 * - 登出
 * - 获取当前用户信息
 */
export class AuthApi {
  private readonly basePath = '/api/auth';

  /**
   * 登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post(
      `${this.basePath}/login`,
      credentials,
      LoginResponseSchema,
      { skipAuth: true },
    );

    // 存储 token
    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    return response;
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post(
      `${this.basePath}/refresh`,
      { refreshToken },
      RefreshTokenResponseSchema,
      { skipAuth: true },
    );

    // 更新 token
    tokenStorage.setTokens(response.accessToken, refreshToken);

    return response;
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    await apiClient.post(
      `${this.basePath}/logout`,
      {},
      undefined,
      { skipAuth: true },
    );

    // 清除 token
    tokenStorage.clearTokens();
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return apiClient.get(
      `${this.basePath}/me`,
      UserResponseSchema,
    );
  }

  /**
   * 检查认证状态
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  }

  /**
   * 获取 access token
   */
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }
}

/**
 * 认证 API 实例
 */
export const authApi = new AuthApi();
