/**
 * Zod Schema 验证测试
 *
 * Stage 5: 验证阶段 - 手动创建基于Zod Schema的测试用例
 */

import { describe, it, expect } from 'vitest'
import {
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  LogoutRequestSchema,
  UserRoleEnum,
  UserStatusEnum,
} from '@contract-management/shared/schemas'

describe('Zod Schema 验证测试', () => {
  describe('用户Schema验证', () => {
    const validUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      realName: 'Test User',
      phone: '13800138000',
      role: 'EMPLOYEE',
      departmentId: 1,
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该接受完整的有效用户数据', () => {
      const result = UserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          username: 'testuser',
          email: 'test@example.com',
          role: 'EMPLOYEE',
        })
      }
    })

    it('应该拒绝过短的用户名', () => {
      const invalidUser = { ...validUser, username: 'ab' }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidUser = { ...validUser, email: 'invalid-email' }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的手机号', () => {
      const invalidUser = { ...validUser, phone: '12345' }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('应该接受null的手机号', () => {
      const validUserNullPhone = { ...validUser, phone: null }
      const result = UserSchema.safeParse(validUserNullPhone)
      expect(result.success).toBe(true)
    })

    it('应该接受null的部门ID', () => {
      const validUserNullDept = { ...validUser, departmentId: null }
      const result = UserSchema.safeParse(validUserNullDept)
      expect(result.success).toBe(true)
    })
  })

  describe('CreateUserRequestSchema验证', () => {
    const validRequest = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      realName: 'New User',
      role: 'EMPLOYEE',
    }

    it('应该接受有效的创建用户请求', () => {
      const result = CreateUserRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('应该拒绝缺少必需字段', () => {
      const incompleteRequest = { username: 'test' }
      const result = CreateUserRequestSchema.safeParse(incompleteRequest)
      expect(result.success).toBe(false)
    })

    it('应该拒绝过短的密码', () => {
      const invalidRequest = { ...validRequest, password: '123' }
      const result = CreateUserRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('应该接受可选的phone字段', () => {
      const requestWithPhone = { ...validRequest, phone: '13800138000' }
      const result = CreateUserRequestSchema.safeParse(requestWithPhone)
      expect(result.success).toBe(true)
    })

    it('应该接受可选的departmentId字段', () => {
      const requestWithDept = { ...validRequest, departmentId: 1 }
      const result = CreateUserRequestSchema.safeParse(requestWithDept)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateUserRequestSchema验证', () => {
    it('应该接受部分更新', () => {
      const partialUpdate = { realName: 'Updated Name' }
      const result = UpdateUserRequestSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('应该接受完整更新', () => {
      const fullUpdate = {
        email: 'updated@example.com',
        password: 'newpassword123',
        realName: 'Updated Name',
        phone: '13800138000',
        departmentId: 2,
        status: 'ACTIVE' as const,
        isActive: true,
      }
      const result = UpdateUserRequestSchema.safeParse(fullUpdate)
      expect(result.success).toBe(true)
    })

    it('应该接受空对象', () => {
      const result = UpdateUserRequestSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidUpdate = { email: 'invalid-email' }
      const result = UpdateUserRequestSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })

  describe('LoginRequestSchema验证', () => {
    const validLogin = {
      username: 'admin',
      password: 'password123',
    }

    it('应该接受有效的登录请求', () => {
      const result = LoginRequestSchema.safeParse(validLogin)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空用户名', () => {
      const invalidLogin = { ...validLogin, username: '' }
      const result = LoginRequestSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })

    it('应该拒绝空密码', () => {
      const invalidLogin = { ...validLogin, password: '' }
      const result = LoginRequestSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })

    it('应该拒绝缺少字段的请求', () => {
      const result = LoginRequestSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('RefreshTokenRequestSchema验证', () => {
    const validRefresh = {
      refreshToken: 'valid_refresh_token_string',
    }

    it('应该接受有效的刷新令牌请求', () => {
      const result = RefreshTokenRequestSchema.safeParse(validRefresh)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空的刷新令牌', () => {
      const invalidRefresh = { refreshToken: '' }
      const result = RefreshTokenRequestSchema.safeParse(invalidRefresh)
      expect(result.success).toBe(false)
    })

    it('应该拒绝缺少refreshToken字段', () => {
      const result = RefreshTokenRequestSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('LogoutRequestSchema验证', () => {
    const validLogout = {
      refreshToken: 'valid_refresh_token_string',
    }

    it('应该接受有效的登出请求', () => {
      const result = LogoutRequestSchema.safeParse(validLogout)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空的刷新令牌', () => {
      const invalidLogout = { refreshToken: '' }
      const result = LogoutRequestSchema.safeParse(invalidLogout)
      expect(result.success).toBe(false)
    })

    it('应该拒绝缺少refreshToken字段', () => {
      const result = LogoutRequestSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('枚举Schema验证', () => {
    describe('UserRoleEnum', () => {
      it('应该接受所有有效角色', () => {
        const validRoles = ['ADMIN', 'EMPLOYEE']
        validRoles.forEach((role) => {
          const result = UserRoleEnum.safeParse(role)
          expect(result.success).toBe(true)
        })
      })

      it('应该拒绝无效角色', () => {
        const result = UserRoleEnum.safeParse('SUPERADMIN')
        expect(result.success).toBe(false)
      })

      it('应该区分大小写', () => {
        const result = UserRoleEnum.safeParse('admin')
        expect(result.success).toBe(false)
      })
    })

    describe('UserStatusEnum', () => {
      it('应该接受所有有效状态', () => {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'LOCKED']
        validStatuses.forEach((status) => {
          const result = UserStatusEnum.safeParse(status)
          expect(result.success).toBe(true)
        })
      })

      it('应该拒绝无效状态', () => {
        const result = UserStatusEnum.safeParse('PENDING')
        expect(result.success).toBe(false)
      })
    })
  })
})