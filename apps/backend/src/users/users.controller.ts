import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto, UpdateUserRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from '../types/express';

/**
 * 用户控制器
 * 契约优先：API 基于用户故事和 Zod Schema 定义
 */
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取用户列表
   * GET /users
   */
  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('role') role?: string,
  ): Promise<ReturnType<UsersService['findAll']>> {
    return this.usersService.findAll({
      skip: skip !== undefined && skip !== null ? Number(skip) : 0,
      take: take !== undefined && take !== null ? Number(take) : 10,
      status,
      departmentId: departmentId !== undefined && departmentId !== null ? Number(departmentId) : undefined,
      role,
    });
  }

  /**
   * 获取当前用户信息
   * GET /users/profile
   */
  @Get('profile')
  async getProfile(@Req() req: Request): Promise<ReturnType<UsersService['findOne']>> {
    if (!req.user) {
      throw new Error('未认证用户');
    }
    return this.usersService.findOne(req.user.id);
  }

  /**
   * 获取单个用户
   * GET /users/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReturnType<UsersService['findOne']>> {
    return this.usersService.findOne(id);
  }

  /**
   * 创建用户
   * POST /users
   */
  @Post()
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserRequestDto): Promise<ReturnType<UsersService['create']>> {
    return this.usersService.create(createUserDto);
  }

  /**
   * 更新用户
   * PUT /users/:id
   */
  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserRequestDto,
  ): Promise<ReturnType<UsersService['update']>> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * 删除用户
   * DELETE /users/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ReturnType<UsersService['remove']>> {
    return this.usersService.remove(id);
  }
}
