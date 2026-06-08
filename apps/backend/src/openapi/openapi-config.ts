/**
 * 从 Zod Schema 生成 OpenAPI 文档
 *
 * 契约优先开发流程 - Stage 1: 文档阶段
 */

import { z } from 'zod/v4'
import {
  // 用户相关Schema
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  LogoutRequestSchema,
  // 部门相关Schema
  DepartmentSchema,
  CreateDepartmentRequestSchema,
  UpdateDepartmentRequestSchema,
  // 菜单相关Schema
  MenuSchema,
  CreateMenuRequestSchema,
  UpdateMenuRequestSchema,
  // 合同相关Schema
  ContractSchema,
  CreateContractRequestSchema,
  UpdateContractRequestSchema,
  // 通用Schema
  ProblemDetailSchema,
  PaginationMetaSchema,
  PaginatedResponseSchema,
} from '@contract-management/shared/schemas'

// 定义OpenAPI配置
export const registry = {
  openapi: '3.1.0',
  info: {
    title: '合同管理系统 API',
    version: '1.0.0',
    description: '基于Zod契约优先开发的合同管理系统RESTful API',
    contact: {
      name: 'API Support',
      email: 'support@contract-management.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: '开发服务器',
    },
    {
      url: 'https://api.contract-management.com',
      description: '生产服务器',
    },
  ],
  tags: [
    { name: 'auth', description: '认证相关接口' },
    { name: 'users', description: '用户管理接口' },
    { name: 'departments', description: '部门管理接口' },
    { name: 'menus', description: '菜单管理接口' },
    { name: 'contracts', description: '合同管理接口' },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT认证令牌',
      },
    },
    schemas: {
      // 用户相关Schema
      User: UserSchema,
      CreateUserRequest: CreateUserRequestSchema,
      UpdateUserRequest: UpdateUserRequestSchema,
      LoginRequest: LoginRequestSchema,
      LoginResponse: LoginResponseSchema,
      RefreshTokenRequest: RefreshTokenRequestSchema,
      RefreshTokenResponse: RefreshTokenResponseSchema,
      LogoutRequest: LogoutRequestSchema,

      // 部门相关Schema
      Department: DepartmentSchema,
      CreateDepartmentRequest: CreateDepartmentRequestSchema,
      UpdateDepartmentRequest: UpdateDepartmentRequestSchema,

      // 菜单相关Schema
      Menu: MenuSchema,
      CreateMenuRequest: CreateMenuRequestSchema,
      UpdateMenuRequest: UpdateMenuRequestSchema,

      // 合同相关Schema
      Contract: ContractSchema,
      CreateContractRequest: CreateContractRequestSchema,
      UpdateContractRequest: UpdateContractRequestSchema,

      // 通用Schema
      SuccessResponse: SuccessResponseSchema,
      ProblemDetail: ProblemDetailSchema,
      PaginationMeta: PaginationMetaSchema,
      PaginatedResponse: PaginatedResponseSchema,
    },
  },
  paths: {
    // 认证接口
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: '用户登录',
        description: '使用用户名和密码登录系统，返回访问令牌和刷新令牌',
        security: [],
        requestBody: {
          description: '登录凭证',
          required: true,
          content: {
            'application/json': {
              schema: LoginRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': {
                schema: LoginResponseSchema,
              },
            },
          },
          '401': {
            description: '认证失败',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['auth'],
        summary: '刷新访问令牌',
        description: '使用刷新令牌获取新的访问令牌',
        security: [],
        requestBody: {
          description: '刷新令牌',
          required: true,
          content: {
            'application/json': {
              schema: RefreshTokenRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '刷新成功',
            content: {
              'application/json': {
                schema: RefreshTokenResponseSchema,
              },
            },
          },
          '401': {
            description: '刷新令牌无效',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['auth'],
        summary: '用户登出',
        description: '登出系统并失效刷新令牌',
        requestBody: {
          description: '登出请求',
          required: true,
          content: {
            'application/json': {
              schema: LogoutRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '登出成功',
            content: {
              'application/json': {
                schema: SuccessResponseSchema,
              },
            },
          },
          '401': {
            description: '未认证',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },

    // 用户接口
    '/users': {
      get: {
        tags: ['users'],
        summary: '获取用户列表',
        description: '分页获取用户列表，支持搜索和过滤',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '页码',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: '每页数量',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: '搜索关键词（用户名、邮箱、姓名）',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'query',
            description: '用户角色过滤',
            required: false,
            schema: { type: 'string', enum: ['ADMIN', 'EMPLOYEE'] },
          },
          {
            name: 'status',
            in: 'query',
            description: '用户状态过滤',
            required: false,
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: PaginatedResponseSchema,
              },
            },
          },
          '401': {
            description: '未认证',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ['users'],
        summary: '创建用户',
        description: '创建新用户',
        requestBody: {
          description: '用户信息',
          required: true,
          content: {
            'application/json': {
              schema: CreateUserRequestSchema,
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: UserSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '401': {
            description: '未认证',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['users'],
        summary: '获取用户详情',
        description: '根据ID获取单个用户信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '用户ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: UserSchema,
              },
            },
          },
          '404': {
            description: '用户不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      put: {
        tags: ['users'],
        summary: '更新用户',
        description: '更新用户信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '用户ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          description: '更新信息',
          required: true,
          content: {
            'application/json': {
              schema: UpdateUserRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
            content: {
              'application/json': {
                schema: UserSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '404': {
            description: '用户不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ['users'],
        summary: '删除用户',
        description: '删除指定用户',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '用户ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '删除成功',
            content: {
              'application/json': {
                schema: SuccessResponseSchema,
              },
            },
          },
          '404': {
            description: '用户不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },

    // 部门接口
    '/departments': {
      get: {
        tags: ['departments'],
        summary: '获取部门列表',
        description: '获取所有部门列表',
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: z.array(DepartmentSchema),
              },
            },
          },
        },
      },
      post: {
        tags: ['departments'],
        summary: '创建部门',
        description: '创建新部门',
        requestBody: {
          description: '部门信息',
          required: true,
          content: {
            'application/json': {
              schema: CreateDepartmentRequestSchema,
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: DepartmentSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/departments/{id}': {
      get: {
        tags: ['departments'],
        summary: '获取部门详情',
        description: '根据ID获取单个部门信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '部门ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: DepartmentSchema,
              },
            },
          },
          '404': {
            description: '部门不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      put: {
        tags: ['departments'],
        summary: '更新部门',
        description: '更新部门信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '部门ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          description: '更新信息',
          required: true,
          content: {
            'application/json': {
              schema: UpdateDepartmentRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
            content: {
              'application/json': {
                schema: DepartmentSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '404': {
            description: '部门不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ['departments'],
        summary: '删除部门',
        description: '删除指定部门',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '部门ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '删除成功',
            content: {
              'application/json': {
                schema: SuccessResponseSchema,
              },
            },
          },
          '404': {
            description: '部门不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },

    // 菜单接口
    '/menus': {
      get: {
        tags: ['menus'],
        summary: '获取菜单列表',
        description: '获取所有菜单列表',
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: z.array(MenuSchema),
              },
            },
          },
        },
      },
      post: {
        tags: ['menus'],
        summary: '创建菜单',
        description: '创建新菜单',
        requestBody: {
          description: '菜单信息',
          required: true,
          content: {
            'application/json': {
              schema: CreateMenuRequestSchema,
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: MenuSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/menus/{id}': {
      get: {
        tags: ['menus'],
        summary: '获取菜单详情',
        description: '根据ID获取单个菜单信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '菜单ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: MenuSchema,
              },
            },
          },
          '404': {
            description: '菜单不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      put: {
        tags: ['menus'],
        summary: '更新菜单',
        description: '更新菜单信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '菜单ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          description: '更新信息',
          required: true,
          content: {
            'application/json': {
              schema: UpdateMenuRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
            content: {
              'application/json': {
                schema: MenuSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '404': {
            description: '菜单不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ['menus'],
        summary: '删除菜单',
        description: '删除指定菜单',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '菜单ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '删除成功',
            content: {
              'application/json': {
                schema: SuccessResponseSchema,
              },
            },
          },
          '404': {
            description: '菜单不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },

    // 合同接口
    '/contracts': {
      get: {
        tags: ['contracts'],
        summary: '获取合同列表',
        description: '分页获取合同列表，支持搜索和过滤',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '页码',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: '每页数量',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: '搜索关键词',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: PaginatedResponseSchema,
              },
            },
          },
          '401': {
            description: '未认证',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ['contracts'],
        summary: '创建合同',
        description: '创建新合同',
        requestBody: {
          description: '合同信息',
          required: true,
          content: {
            'application/json': {
              schema: CreateContractRequestSchema,
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: ContractSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '401': {
            description: '未认证',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
    '/contracts/{id}': {
      get: {
        tags: ['contracts'],
        summary: '获取合同详情',
        description: '根据ID获取单个合同信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '合同ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: ContractSchema,
              },
            },
          },
          '404': {
            description: '合同不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      put: {
        tags: ['contracts'],
        summary: '更新合同',
        description: '更新合同信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '合同ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          description: '更新信息',
          required: true,
          content: {
            'application/json': {
              schema: UpdateContractRequestSchema,
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
            content: {
              'application/json': {
                schema: ContractSchema,
              },
            },
          },
          '400': {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
          '404': {
            description: '合同不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ['contracts'],
        summary: '删除合同',
        description: '删除指定合同',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: '合同ID',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: '删除成功',
            content: {
              'application/json': {
                schema: SuccessResponseSchema,
              },
            },
          },
          '404': {
            description: '合同不存在',
            content: {
              'application/json': {
                schema: ProblemDetailSchema,
              },
            },
          },
        },
      },
    },
  },
}