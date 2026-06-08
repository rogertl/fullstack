import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * 密码哈希服务
 */
@Injectable()
export class HashService {
  /**
   * 哈希密码
   */
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}