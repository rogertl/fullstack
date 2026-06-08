import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

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
    // TODO: 在 Stage 3 添加业务模块
    // AuthModule,
    // ContractModule,
    // UserServiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
