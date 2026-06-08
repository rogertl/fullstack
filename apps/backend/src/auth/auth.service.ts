import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import type { LoginResponseDto, RefreshTokenResponseDto } from './dto';

/**
 * 认证服务
 * 处理登录、刷新 token 等认证相关功能
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
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
        password: true,
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
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 tokens
    const payload = { sub: user.id, username: user.username, role: user.role };
    const jwtSecret = process.env['JWT_SECRET'] ?? 'your-secret-key-change-in-production';
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env['JWT_ACCESS_EXPIRATION'] ?? '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: process.env['JWT_REFRESH_EXPIRATION'] ?? '7d',
    });

    // 保存 refresh token 到数据库
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // 返回用户信息（不含密码）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user;

    // 类型转换：将 Prisma 返回的 string 转换为 Zod 期望的字面量类型
    const typedUser = {
      ...userWithoutPassword,
      status: userWithoutPassword.status as 'ACTIVE' | 'INACTIVE' | 'LOCKED',
      role: userWithoutPassword.role as 'ADMIN' | 'EMPLOYEE',
    };

    return {
      user: typedUser,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 分钟，单位秒
    };
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    try {
      const jwtSecret = process.env['JWT_SECRET'] ?? 'your-secret-key-change-in-production';
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtSecret,
      }) as { sub: number; username: string; role: string };

      // 检查 refresh token 是否在数据库中
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('刷新令牌无效');
      }

      // 检查是否过期
      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { token: refreshToken },
        });
        throw new UnauthorizedException('刷新令牌已过期，请重新登录');
      }

      // 获取用户信息
      const user = await this.usersService.findOne(payload.sub);

      // 生成新的 access token
      const newPayload = { sub: user.id, username: user.username, role: user.role };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: process.env['JWT_ACCESS_EXPIRATION'] ?? '15m',
      });

      return {
        accessToken,
        expiresIn: 15 * 60,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  /**
   * 登出（删除 refresh token）
   */
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return { success: true };
  }
}
