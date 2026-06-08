import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashService } from './hash.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma';

/**
 * 认证模块
 */
@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtStrategy],
  exports: [AuthService, HashService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
