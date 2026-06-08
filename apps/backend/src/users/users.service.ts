import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * 用户服务
 * 契约优先：数据操作基于 Zod Schema 定义的验证规则
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询所有用户（支持分页和筛选）
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    departmentId?: number;
    role?: string;
  }): Promise<{
    data: Partial<User>[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const { skip = 0, take = 10, status, departmentId, role } = params;

    const where: Prisma.UserWhereInput = {};

    if (status !== undefined && status !== null) {
      where.status = status;
    }

    if (departmentId !== undefined && departmentId !== null) {
      where.departmentId = departmentId;
    }

    if (role !== undefined && role !== null) {
      where.role = role;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          phone: true,
          role: true,
          departmentId: true,
          status: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // 不返回密码
          password: false,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
      },
    };
  }

  /**
   * 查询单个用户
   */
  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        phone: true,
        role: true,
        departmentId: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    return user;
  }

  /**
   * 根据用户名查询用户（用于登录）
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`用户 ${username} 不存在`);
    }

    return user;
  }

  /**
   * 创建用户
   */
  async create(data: {
    username: string;
    email: string;
    password: string;
    realName: string;
    phone?: string | null;
    role: string;
    departmentId?: number | null;
  }): Promise<Partial<User>> {
    // 检查用户名是否存在
    const existingByUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingByUsername) {
      throw new ConflictException(`用户名 ${data.username} 已存在`);
    }

    // 检查邮箱是否存在
    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingByEmail) {
      throw new ConflictException(`邮箱 ${data.email} 已存在`);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        realName: data.realName,
        phone: data.phone ?? null,
        role: data.role,
        departmentId: data.departmentId ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        phone: true,
        role: true,
        departmentId: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * 更新用户
   */
  async update(id: number, data: {
    username?: string;
    email?: string;
    password?: string;
    realName?: string;
    phone?: string | null;
    departmentId?: number | null;
    status?: string;
    isActive?: boolean;
  }): Promise<Partial<User>> {
    // 检查用户是否存在
    await this.findOne(id);

    const updateData: Prisma.UserUpdateInput = { ...data };

    // 如果更新密码，需要加密
    if (data.password !== undefined && data.password !== null) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        phone: true,
        role: true,
        departmentId: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<{ success: boolean }> {
    // 检查用户是否存在
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }
}
