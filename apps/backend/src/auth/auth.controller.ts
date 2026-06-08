import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, RefreshTokenRequestDto, LoginResponseDto, RefreshTokenResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from '../types/express';

/**
 * 认证控制器
 * 处理登录、刷新 token、登出等认证操作
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   * POST /api/auth/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  /**
   * 刷新访问令牌
   * POST /api/auth/refresh
   */
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshAccessToken(refreshDto.refreshToken);
  }

  /**
   * 登出
   * POST /api/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() logoutDto: { refreshToken: string }): Promise<{ success: boolean }> {
    return this.authService.logout(logoutDto.refreshToken);
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request): Promise<Record<string, unknown>> {
    return req.user ? { ...req.user } : {};
  }
}
