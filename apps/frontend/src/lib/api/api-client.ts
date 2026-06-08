import { axiosInstance, isApiError, getErrorDetail, getFieldErrors } from '../axios';
import { z } from 'zod';

/**
 * API 客户端
 *
 * 提供类型安全的 API 请求方法，与 Zod Schema 集成
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * API 请求配置
 */
export interface ApiRequestConfig {
  skipAuth?: boolean;
  signal?: AbortSignal;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API 客户端类
// ============================================================================

/**
 * 通用 API 客户端
 */
export class ApiClient {
  /**
   * GET 请求
   */
  async get<TSchema extends z.ZodTypeAny>(
    url: string,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<z.infer<TSchema>> {
    const response = await axiosInstance.get(url, config);
    if (schema) {
      return schema.parse(response.data);
    }
    return response.data as z.infer<TSchema>;
  }

  /**
   * POST 请求
   */
  async post<TSchema extends z.ZodTypeAny>(
    url: string,
    data: unknown,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<z.infer<TSchema>> {
    const response = await axiosInstance.post(url, data, config);
    if (schema) {
      return schema.parse(response.data);
    }
    return response.data as z.infer<TSchema>;
  }

  /**
   * PUT 请求
   */
  async put<TSchema extends z.ZodTypeAny>(
    url: string,
    data: unknown,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<z.infer<TSchema>> {
    const response = await axiosInstance.put(url, data, config);
    if (schema) {
      return schema.parse(response.data);
    }
    return response.data as z.infer<TSchema>;
  }

  /**
   * PATCH 请求
   */
  async patch<TSchema extends z.ZodTypeAny>(
    url: string,
    data: unknown,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<z.infer<TSchema>> {
    const response = await axiosInstance.patch(url, data, config);
    if (schema) {
      return schema.parse(response.data);
    }
    return response.data as z.infer<TSchema>;
  }

  /**
   * DELETE 请求
   */
  async delete<TSchema extends z.ZodTypeAny>(
    url: string,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<z.infer<TSchema>> {
    const response = await axiosInstance.delete(url, config);
    if (schema) {
      return schema.parse(response.data);
    }
    return response.data as z.infer<TSchema>;
  }

  /**
   * 分页 GET 请求
   */
  async getPaginated<TSchema extends z.ZodTypeAny>(
    url: string,
    params: PaginationParams,
    schema?: TSchema,
    config?: ApiRequestConfig,
  ): Promise<PaginatedResponse<z.infer<TSchema>>> {
    const response = await axiosInstance.get(url, {
      ...config,
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder || 'asc',
      },
    });

    if (schema) {
      return {
        data: response.data.data.map((item: unknown) => schema.parse(item)),
        meta: response.data.meta,
      };
    }

    return response.data;
  }
}

/**
 * 默认 API 客户端实例
 */
export const apiClient = new ApiClient();

// ============================================================================
// 错误处理工具
// ============================================================================

/**
 * 处理 API 错误
 */
export function handleApiError(error: unknown): never {
  if (isApiError(error)) {
    const message = getErrorDetail(error);
    const fieldErrors = getFieldErrors(error);

    // 如果有字段级错误，抛出字段错误
    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiFieldError(message, fieldErrors);
    }

    // 否则抛出普通错误
    throw new Error(message);
  }

  // 非 API 错误
  if (error instanceof Error) {
    throw error;
  }

  throw new Error('未知错误');
}

/**
 * API 字段错误
 */
export class ApiFieldError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiFieldError';
  }
}
