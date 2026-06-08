import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ProblemDetailSchema } from '@contract-management/shared/schemas';

/**
 * Axios 实例配置
 *
 * 功能：
 * - 基础 URL 配置
 * - 请求拦截器（添加 access token）
 * - 响应拦截器（错误处理、token 刷新）
 * - 与 Zod Schema 集成（类型安全）
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 扩展 Axios 请求配置，添加需要刷新 token 的标识
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuth?: boolean;
}

/**
 * API 错误响应
 */
export interface ApiError {
  response?: {
    data: z.infer<typeof ProblemDetailSchema>;
    status: number;
  };
  message: string;
}

// ============================================================================
// Token 存储（将在 Stage 3 实现完整版本）
// ============================================================================

/**
 * Token 存储接口
 */
interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
}

/**
 * 简单的 Token 存储（localStorage 实现）
 */
class LocalStorageTokenStorage implements TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

export const tokenStorage = new LocalStorageTokenStorage();

// ============================================================================
// Axios 实例创建
// ============================================================================

/**
 * 创建 Axios 实例
 */
export function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器：添加 access token
  instance.interceptors.request.use(
    (config: ExtendedAxiosRequestConfig) => {
      // 如果标记为跳过认证，不添加 token
      if (config.skipAuth) {
        return config;
      }

      // 添加 access token
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器：处理错误和 token 刷新
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      // Token 过期，尝试刷新
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 刷新 token（将在 Stage 3 实现完整逻辑）
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) {
            tokenStorage.clearTokens();
            // 跳转到登录页
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }

          // 调用刷新令牌 API
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // 更新 token
          tokenStorage.setTokens(accessToken, newRefreshToken);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          tokenStorage.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // 其他错误，直接抛出
      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * 默认 Axios 实例
 */
export const axiosInstance = createAxiosInstance();

// ============================================================================
// 错误处理工具
// ============================================================================

/**
 * 判断是否为 API 错误
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'message' in error
  );
}

/**
 * 提取错误详情
 */
export function getErrorDetail(error: ApiError): string {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.response?.data?.title) {
    return error.response.data.title;
  }

  return error.message || '未知错误';
}

/**
 * 提取字段级错误
 */
export function getFieldErrors(error: ApiError): Record<string, string> {
  const errors = error.response?.data?.errors;
  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((acc, err) => {
    if (err.field && err.message) {
      acc[err.field] = err.message;
    }
    return acc;
  }, {} as Record<string, string>);
}
