import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';

/**
 * 应用程序入口
 * 契约优先：此文件将在后端阶段（Stage 3）根据 Zod Schema 完善模块结构
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('BACKEND_PORT', 3001);

  // 使用 Zod 验证管道（契约优先：确保所有请求与 Zod Schema 一致）
  app.useGlobalPipes(new ZodValidationPipe());

  // CORS 配置（前端开发模式）
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}

void bootstrap();
