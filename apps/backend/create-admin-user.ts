import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // 删除现有的admin用户
  await prisma.user.deleteMany({ where: { username: 'admin' } });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      realName: '管理员',
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
    },
  });

  console.log('Admin user recreated:', admin.username);

  // 验证密码
  const isValid = await bcrypt.compare('admin123', admin.password);
  console.log('Password verification test:', isValid);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
