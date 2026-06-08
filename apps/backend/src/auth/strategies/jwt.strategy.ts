import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import type { User } from '@prisma/client';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

/**
 * JWT 认证策略
 * 验证 JWT Token 并解析用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);

    if (user === undefined || user.isActive === false) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 验证返回的用户包含必需的字段
    if (user.id === undefined || user.id === null || user.username === undefined || user.username === null || user.email === undefined || user.email === null) {
      throw new UnauthorizedException('用户信息不完整');
    }

    // 返回完整的 User 对象（Partial<User> 的类型断言）
    return user as User;
  }
}
