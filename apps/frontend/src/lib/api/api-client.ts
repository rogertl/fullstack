/**
 * API 客户端
 *
 * 基于 axios 的 HTTP 客户端
 * 契约优先：直接使用 Zod Schema 定义的格式，不添加额外包裹层
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { z } from 'zod'

// 请求配置扩展
interface ApiRequestConfig extends Omit<AxiosRequestConfig, 'validateStatus'> {
  skipAuth?: boolean
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('accessToken')
        if (token !== null && config.skipAuth !== true) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config as ApiRequestConfig & {
          _retry?: boolean
        }

        if (error.response?.status === 401 && originalRequest._retry !== true) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken !== null) {
              // TODO: 刷新 token
              // const newToken = await this.refreshToken(refreshToken);
              // localStorage.setItem('accessToken', newToken);
              return this.client(originalRequest)
            }
          } catch {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, schema: z.ZodType<T>, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get<T>(url, config)
    return schema.parse(response.data)
  }

  async post<T>(
    url: string,
    data: unknown,
    schema: z.ZodType<T>,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post<T>(url, data, config)
    return schema.parse(response.data)
  }

  async patch<T>(
    url: string,
    data: unknown,
    schema: z.ZodType<T>,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config)
    return schema.parse(response.data)
  }

  async delete(url: string, config?: ApiRequestConfig): Promise<void> {
    await this.client.delete(url, config)
  }
}

export const apiClient = new ApiClient()
