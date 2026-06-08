import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 认证守卫
 * 使用 Passport JWT 策略验证请求
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  override handleRequest(err: unknown, user: any, info: any): any {
    // 如果有错误或没有用户信息，抛出401异常
    if (err !== null || user === null) {
      throw new UnauthorizedException('认证失败，请重新登录');
    }

    // 如果有info信息（如token过期等），也抛出异常
    if (info !== null && info !== undefined) {
      throw new UnauthorizedException(`认证失败: ${info.name ?? '无效的令牌'}`);
    }

    return user;
  }
}
