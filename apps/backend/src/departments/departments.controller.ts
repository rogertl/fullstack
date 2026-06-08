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
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentRequestDto, UpdateDepartmentRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 部门控制器
 * 契约优先：API 基于用户故事和 Zod Schema 定义
 */
@Controller('api/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /**
   * 获取部门列表
   * GET /departments
   */
  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
  ): Promise<ReturnType<DepartmentsService['findAll']>> {
    return this.departmentsService.findAll({
      skip: skip !== undefined && skip !== null ? Number(skip) : 0,
      take: take !== undefined && take !== null ? Number(take) : 10,
      status,
      parentId: parentId !== undefined && parentId !== null ? Number(parentId) : undefined,
    });
  }

  /**
   * 获取单个部门
   * GET /departments/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReturnType<DepartmentsService['findOne']>> {
    return this.departmentsService.findOne(id);
  }

  /**
   * 创建部门
   * POST /departments
   */
  @Post()
  @Roles('ADMIN')
  async create(@Body() createDepartmentDto: CreateDepartmentRequestDto): Promise<ReturnType<DepartmentsService['create']>> {
    return this.departmentsService.create(createDepartmentDto);
  }

  /**
   * 更新部门
   * PUT /departments/:id
   */
  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentRequestDto,
  ): Promise<ReturnType<DepartmentsService['update']>> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  /**
   * 删除部门
   * DELETE /departments/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ReturnType<DepartmentsService['remove']>> {
    return this.departmentsService.remove(id);
  }
}
