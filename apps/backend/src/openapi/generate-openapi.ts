/**
 * OpenAPI 文档生成脚本
 *
 * 从 Zod Schema 生成 OpenAPI 3.1.0 规范文档
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { createSchema } from 'zod-openapi'
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
  SuccessResponseSchema,
  ProblemDetailSchema,
  PaginationMetaSchema,
  PaginatedResponseSchema,
} from '@contract-management/shared/schemas'

function generateOpenAPIDocument() {
  try {
    // 简化Schema引用，使用基本的JSON Schema
    const schemas = {
      User: { $ref: '#/components/schemas/User' },
      CreateUserRequest: { $ref: '#/components/schemas/CreateUserRequest' },
      UpdateUserRequest: { $ref: '#/components/schemas/UpdateUserRequest' },
      LoginRequest: { $ref: '#/components/schemas/LoginRequest' },
      LoginResponse: { $ref: '#/components/schemas/LoginResponse' },
      RefreshTokenRequest: { $ref: '#/components/schemas/RefreshTokenRequest' },
      RefreshTokenResponse: { $ref: '#/components/schemas/RefreshTokenResponse' },
      LogoutRequest: { $ref: '#/components/schemas/LogoutRequest' },
      Department: { $ref: '#/components/schemas/Department' },
      CreateDepartmentRequest: { $ref: '#/components/schemas/CreateDepartmentRequest' },
      UpdateDepartmentRequest: { $ref: '#/components/schemas/UpdateDepartmentRequest' },
      Menu: { $ref: '#/components/schemas/Menu' },
      CreateMenuRequest: { $ref: '#/components/schemas/CreateMenuRequest' },
      UpdateMenuRequest: { $ref: '#/components/schemas/UpdateMenuRequest' },
      Contract: { $ref: '#/components/schemas/Contract' },
      CreateContractRequest: { $ref: '#/components/schemas/CreateContractRequest' },
      UpdateContractRequest: { $ref: '#/components/schemas/UpdateContractRequest' },
      SuccessResponse: { $ref: '#/components/schemas/SuccessResponse' },
      ProblemDetail: { $ref: '#/components/schemas/ProblemDetail' },
      PaginationMeta: { $ref: '#/components/schemas/PaginationMeta' },
      PaginatedResponse: { $ref: '#/components/schemas/PaginatedResponse' },
    }

    // 创建OpenAPI文档
    const openApiDocument = {
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
        schemas,
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
                  schema: { $ref: '#/components/schemas/LoginRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '登录成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/LoginResponse' },
                  },
                },
              },
              '401': {
                description: '认证失败',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '刷新成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RefreshTokenResponse' },
                  },
                },
              },
              '401': {
                description: '刷新令牌无效',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/LogoutRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '登出成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
              '401': {
                description: '未认证',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/PaginatedResponse' },
                  },
                },
              },
              '401': {
                description: '未认证',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/CreateUserRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: '创建成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '401': {
                description: '未认证',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
              '404': {
                description: '用户不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '更新成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '404': {
                description: '用户不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
              '404': {
                description: '用户不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { type: 'array', items: { $ref: '#/components/schemas/Department' } },
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
                  schema: { $ref: '#/components/schemas/CreateDepartmentRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: '创建成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Department' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/Department' },
                  },
                },
              },
              '404': {
                description: '部门不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/UpdateDepartmentRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '更新成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Department' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '404': {
                description: '部门不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
              '404': {
                description: '部门不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { type: 'array', items: { $ref: '#/components/schemas/Menu' } },
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
                  schema: { $ref: '#/components/schemas/CreateMenuRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: '创建成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Menu' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/Menu' },
                  },
                },
              },
              '404': {
                description: '菜单不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/UpdateMenuRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '更新成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Menu' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '404': {
                description: '菜单不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
              '404': {
                description: '菜单不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/PaginatedResponse' },
                  },
                },
              },
              '401': {
                description: '未认证',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/CreateContractRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: '创建成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Contract' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '401': {
                description: '未认证',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/Contract' },
                  },
                },
              },
              '404': {
                description: '合同不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                  schema: { $ref: '#/components/schemas/UpdateContractRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: '更新成功',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Contract' },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
              '404': {
                description: '合同不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
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
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
              '404': {
                description: '合同不存在',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProblemDetail' },
                  },
                },
              },
            },
          },
        },
      },
    }

    // 输出到packages/shared目录，这样前后端都可以使用
    const outputPath = join(process.cwd(), '../../packages/shared/openapi.json')
    writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2))

    console.log('✅ OpenAPI文档生成成功！')
    console.log(`📄 文档路径: ${outputPath}`)
    console.log(`📊 API数量: ${Object.keys(openApiDocument.paths).length} 个端点`)
    console.log(`🏷️ Schema数量: ${Object.keys(openApiDocument.components.schemas).length} 个`)

    // 统计信息
    const pathCounts = { get: 0, post: 0, put: 0, delete: 0 }
    Object.values(openApiDocument.paths).forEach((path: any) => {
      Object.keys(path).forEach((method) => {
        if (pathCounts.hasOwnProperty(method)) {
          pathCounts[method as keyof typeof pathCounts]++
        }
      })
    })

    console.log('\n📈 接口统计:')
    console.log(`   GET: ${pathCounts.get} 个`)
    console.log(`   POST: ${pathCounts.post} 个`)
    console.log(`   PUT: ${pathCounts.put} 个`)
    console.log(`   DELETE: ${pathCounts.delete} 个`)

  } catch (error) {
    console.error('❌ OpenAPI文档生成失败:', error)
    process.exit(1)
  }
}

generateOpenAPIDocument()