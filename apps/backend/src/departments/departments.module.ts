import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';

/**
 * 部门模块
 */
@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DepartmentsModule {}
