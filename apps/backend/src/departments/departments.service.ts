import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma, Department } from '@prisma/client';

/**
 * 部门服务
 * 契约优先：数据操作基于 Zod Schema 定义的验证规则
 */
@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询所有部门（支持分页和筛选）
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    parentId?: number;
  }): Promise<{
    data: Partial<Department>[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const { skip = 0, take = 10, status, parentId } = params;

    const where: Prisma.DepartmentWhereInput = {};

    if (status !== undefined && status !== null) {
      where.status = status;
    }

    if (parentId !== undefined && parentId !== null) {
      where.parentId = parentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          parentId: true,
          managerId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.department.count({ where }),
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
   * 查询单个部门
   */
  async findOne(id: number): Promise<Partial<Department>> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        parentId: true,
        managerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`部门 ID ${id} 不存在`);
    }

    return department;
  }

  /**
   * 创建部门
   */
  async create(data: any): Promise<Partial<Department>> {
    // 检查部门编码是否存在
    const existingByCode = await this.prisma.department.findUnique({
      where: { code: data.code },
    });

    if (existingByCode) {
      throw new ConflictException(`部门编码 ${data.code} 已存在`);
    }

    const department = await this.prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        managerId: data.managerId ?? null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        parentId: true,
        managerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return department;
  }

  /**
   * 更新部门
   */
  async update(id: number, data: any): Promise<Partial<Department>> {
    // 检查部门是否存在
    await this.findOne(id);

    const department = await this.prisma.department.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        parentId: true,
        managerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return department;
  }

  /**
   * 删除部门
   */
  async remove(id: number): Promise<{ success: boolean }> {
    // 检查部门是否存在
    await this.findOne(id);

    // 检查是否有子部门
    const childCount = await this.prisma.department.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new ConflictException('无法删除有子部门的部门');
    }

    // 检查是否有用户
    const userCount = await this.prisma.user.count({
      where: { departmentId: id },
    });

    if (userCount > 0) {
      throw new ConflictException('无法删除有用户的部门');
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }
}
