import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { DepartmentsModule } from './departments';

/**
 * 根模块
 * 契约优先：业务模块将在契约阶段（Stage 0）定义 Zod Schema 后，在后端阶段（Stage 3）添加
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    // TODO: 添加其他业务模块
    // MenusModule,
  ],
  controllers: [],
  providers: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
