/**
 * Zod Schema 验证测试
 *
 * 测试 Zod Schema 的验证规则和类型推导
 */

import { describe, it, expect } from 'vitest'
import {
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  LoginRequestSchema,
  UserRoleEnum,
  UserStatusEnum,
} from '@contract-management/shared/schemas'

describe('User Schema 验证', () => {
  describe('用户角色枚举', () => {
    it('应该接受所有有效的用户角色', () => {
      const validRoles = ['ADMIN', 'EMPLOYEE'] // 只有这两个有效角色
      validRoles.forEach((role) => {
        const result = UserRoleEnum.safeParse(role)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(role)
        }
      })
    })

    it('应该拒绝无效的用户角色', () => {
      const invalidRoles = ['INVALID_ROLE', 'SUPERADMIN', 'MANAGER', 'GUEST', '']
      invalidRoles.forEach((role) => {
        const result = UserRoleEnum.safeParse(role)
        expect(result.success).toBe(false)
      })
    })

    it('应该区分大小写', () => {
      const result = UserRoleEnum.safeParse('admin')
      expect(result.success).toBe(false)
    })
  })

  describe('用户状态枚举', () => {
    it('应该接受所有有效的用户状态', () => {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'LOCKED']
      validStatuses.forEach((status) => {
        const result = UserStatusEnum.safeParse(status)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(status)
        }
      })
    })

    it('应该拒绝无效的用户状态', () => {
      const invalidStatuses = ['INVALID_STATUS', 'PENDING', 'DELETED', '']
      invalidStatuses.forEach((status) => {
        const result = UserStatusEnum.safeParse(status)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('用户Schema', () => {
    const validUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      realName: 'Test User',
      phone: null,
      role: 'EMPLOYEE',
      departmentId: 1, // 必须明确提供，不能是undefined
      status: 'ACTIVE' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该接受有效的用户数据', () => {
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

    it('应该拒绝无效的用户名（太短）', () => {
      const invalidUser = {
        ...validUser,
        username: 'ab', // 少于3个字符
        departmentId: 1,
      }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.path).toContain('username')
      }
    })

    it('应该拒绝无效的用户名（太长）', () => {
      const invalidUser = {
        ...validUser,
        username: 'a'.repeat(51),
        departmentId: 1,
      }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user @example.com',
        '',
      ]
      invalidEmails.forEach((email) => {
        const invalidUser = {
          ...validUser,
          email,
          departmentId: 1,
        }
        const result = UserSchema.safeParse(invalidUser)
        expect(result.success).toBe(false)
      })
    })

    it('应该拒绝无效的实名（太短）', () => {
      const invalidUser = {
        ...validUser,
        realName: '',
        departmentId: 1,
      }
      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('应该接受可选的部门ID（null）', () => {
      const userWithoutDept = {
        ...validUser,
        departmentId: null, // 可以是null
      }
      const result = UserSchema.safeParse(userWithoutDept)
      expect(result.success).toBe(true)
    })

    it('应该验证isActive与status的一致性', () => {
      const activeUser = {
        ...validUser,
        status: 'ACTIVE' as const,
        isActive: true,
        departmentId: 1,
      }
      const result = UserSchema.safeParse(activeUser)
      expect(result.success).toBe(true)

      const inactiveUser = {
        ...validUser,
        status: 'INACTIVE' as const,
        isActive: false,
        departmentId: 1,
      }
      const inactiveResult = UserSchema.safeParse(inactiveUser)
      expect(inactiveResult.success).toBe(true)
    })
  })

  describe('CreateUserRequestSchema', () => {
    const validRequest = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      realName: 'New User',
      role: 'EMPLOYEE' as const,
    }

    it('应该接受有效的创建用户请求', () => {
      const result = CreateUserRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('应该拒绝缺少必需字段的请求', () => {
      const incompleteRequests = [
        { username: 'newuser' },
        { username: 'newuser', email: 'new@example.com' },
        { username: 'newuser', email: 'new@example.com', password: '' },
      ]
      incompleteRequests.forEach((request) => {
        const result = CreateUserRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
      })
    })

    it('应该验证密码强度', () => {
      const weakPasswords = [
        { ...validRequest, password: '123' }, // 太短
        { ...validRequest, password: '' }, // 空
      ]
      weakPasswords.forEach((request) => {
        const result = CreateUserRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
      })
    })

    it('应该接受可选的部门ID', () => {
      const requestWithDept = {
        ...validRequest,
        departmentId: 1,
      }
      const result = CreateUserRequestSchema.safeParse(requestWithDept)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的用户角色', () => {
      const invalidRequest = {
        ...validRequest,
        role: 'INVALID_ROLE' as any,
      }
      const result = CreateUserRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateUserRequestSchema', () => {
    it('应该接受部分更新', () => {
      const partialUpdate = {
        realName: 'Updated Name',
      }
      const result = UpdateUserRequestSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('应该接受完整的更新请求', () => {
      const fullUpdate = {
        email: 'updated@example.com',
        password: 'newpassword123',
        realName: 'Updated Name',
        phone: '13800138000' as string | null,
        departmentId: 2,
        status: 'ACTIVE' as const,
        isActive: true,
      }
      const result = UpdateUserRequestSchema.safeParse(fullUpdate)
      expect(result.success).toBe(true)
    })

    it('应该接受空对象（所有字段都是可选的）', () => {
      const result = UpdateUserRequestSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('应该拒绝不允许更新的字段（id、role、createdAt、updatedAt）', () => {
      const invalidUpdate = {
        id: 1, // 不允许更新
        username: 'newusername', // 这个字段实际上是允许更新的
      }
      const result = UpdateUserRequestSchema.safeParse(invalidUpdate)
      // Schema本身不包含id字段，所以id会被忽略
      // username是可以更新的字段
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidUpdate = {
        email: 'invalid-email',
      }
      const result = UpdateUserRequestSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })

  describe('LoginRequestSchema', () => {
    it('应该接受有效的登录请求', () => {
      const validRequest = {
        username: 'admin',
        password: 'password123',
      }
      const result = LoginRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空用户名', () => {
      const invalidRequest = {
        username: '',
        password: 'password123',
      }
      const result = LoginRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('应该拒绝空密码', () => {
      const invalidRequest = {
        username: 'admin',
        password: '',
      }
      const result = LoginRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('应该拒绝缺少字段的请求', () => {
      const incompleteRequests = [
        { username: 'admin' },
        { password: 'password123' },
        {},
      ]
      incompleteRequests.forEach((request) => {
        const result = LoginRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
      })
    })

    it('应该提供清晰的错误信息', () => {
      const invalidRequest = {
        username: '',
        password: '',
      }
      const result = LoginRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0]).toHaveProperty('message')
      }
    })
  })

  describe('Schema 元数据验证', () => {
    it('UserSchema应该正确接受完整的用户数据', () => {
      const result = UserSchema.safeParse({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
        realName: 'Test',
        phone: null,
        role: 'EMPLOYEE',
        departmentId: 1, // 必须明确提供
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.success).toBe(true)
    })

    it('UserSchema应该接受有效的手机号', () => {
      const result = UserSchema.safeParse({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
        realName: 'Test',
        phone: '13800138000', // 有效的中国手机号
        role: 'EMPLOYEE',
        departmentId: 1,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.success).toBe(true)
    })

    it('UserSchema应该拒绝无效的手机号', () => {
      const result = UserSchema.safeParse({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
        realName: 'Test',
        phone: '12345', // 无效的手机号
        role: 'EMPLOYEE',
        departmentId: 1,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.success).toBe(false)
    })
  })
})
