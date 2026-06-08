import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

/**
 * 扩展 Express Request 类型
 * 添加 user 属性用于 JWT 认证后的用户信息
 */
export interface Request extends ExpressRequest {
  user?: User;
}

/**
 * 扩展 Express Headers 类型
 * 添加 authorization 属性
 */
export interface Headers {
  authorization?: string;
  [key: string]: string | string[] | undefined;
}
