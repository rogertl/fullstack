# 开发规范明确（技术标准）

## 🎯 目的
避免开发过程中因配置不一致、规范不明确导致的返工和问题。

## 🔧 TypeScript 配置规范

### 各包的 tsconfig.json 标准配置

### 根目录 tsconfig.json
```json
{
  "compilerOptions": {
    // 通用配置，供子包继承
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    // 注意：不要设置module和moduleResolution，让各子包自行决定
  }
}
```

### apps/backend tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    // 必须明确指定，避免冲突
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "."
  }
}
```

### packages/shared tsconfig.json
```json
{
  // 不extends根配置，避免module冲突
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "commonjs",      // 明确使用CommonJS
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### packages/database tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 🚨 ESLint 配置规范

### 严格模式要求
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-module-boundary-types": "warn"
  }
}
```

### 禁止事项
❌ **禁止在代码中使用 `any` 类型**
❌ **禁止临时使用 `@ts-ignore` 绕过类型检查**
❌ **禁止提交包含 `any` 的代码**

### 处理流程
```bash
# 1. 开发前检查
npm run lint

# 2. 提交前检查
npm run typecheck && npm run lint

# 3. CI中强制检查
npm run typecheck && npm run lint && npm run test
```

## 📦 Module 类型规范

### package.json type 字段标准

```json
// apps/backend - CommonJS项目
{
  "name": "@contract-management/backend",
  // 不设置type字段，默认为CommonJS
}

// packages/shared - 需要被CommonJS导入
{
  "name": "@contract-management/shared",
  // 不设置type字段，保持CommonJS
}

// apps/frontend - ESM项目
{
  "name": "@contract-management/frontend",
  "type": "module"  // 明确使用ESM
}
```

### 关键原则
- **后端相关包**：不设置type，使用CommonJS
- **前端相关包**：设置type为module
- **共享包**：不设置type，确保CommonJS兼容

## 🔌 NestJS 配置规范

### nest-cli.json 标准配置
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.json"
  }
}
```

### 禁止的插件
❌ **禁止使用 @nestjs/swagger 插件**
- 原因：会生成错误的绝对路径引用
- 替代：使用手动装饰器或第三方方案

## 🔐 环境变量命名规范

### 标准命名格式
```bash
# JWT配置
JWT_ACCESS_SECRET="..."      # Access token密钥
JWT_REFRESH_SECRET="..."    # Refresh token密钥
JWT_ACCESS_EXPIRATION="15m"  # Access token过期时间
JWT_REFRESH_EXPIRATION="7d"  # Refresh token过期时间

# 数据库配置
DATABASE_URL="..."

# 端口配置
BACKEND_PORT="3001"
FRONTEND_PORT="3000"
```

### 禁止的命名
❌ **禁止使用**：
- `JWT_SECRET`（容易与ACCESS/REFRESH混淆）
- `PORT`（不明确是哪个服务）
- `SECRET`（过于通用）

### 统一使用
```typescript
// 代码中访问
process.env['JWT_ACCESS_SECRET']
process.env['JWT_REFRESH_SECRET']
```

## 🚪 端口管理规范（CRITICAL）

### 固定端口配置
```bash
# 后端端口 - 固定为 3001
BACKEND_PORT="3001"

# 前端端口 - 固定为 3000
FRONTEND_PORT="3000"

# 数据库端口 - PostgreSQL 默认 5432
DATABASE_PORT="5432"
```

### 🚨 绝对禁止的行为
❌ **禁止随意修改端口号**
❌ **禁止因端口占用而改用其他端口**
❌ **禁止在代码中硬编码动态端口**

### ✅ 正确的端口冲突处理流程

当遇到端口占用问题时，**必须**按以下步骤操作：

```bash
# 1. 查找占用端口的进程
lsof -i :3001        # 查找后端端口占用
lsof -i :3000        # 查找前端端口占用

# 2. 结束占用端口的进程
kill -9 <PID>        # 强制结束进程
# 或使用更安全的命令
kill <PID>           # 先尝试正常结束

# 3. 验证端口已释放
lsof -i :3001        # 确认无输出
lsof -i :3000        # 确认无输出

# 4. 启动服务
npm run dev          # 端口应该是固定的
```

### 常用端口管理命令

```bash
# 查找并结束占用后端端口的进程
lsof -ti :3001 | xargs kill -9

# 查找并结束占用前端端口的进程
lsof -ti :3000 | xargs kill -9

# 查看所有 Node.js 进程
ps aux | grep node

# 结束所有 nest 进程
pkill -f nest

# 结束所有 next 进程
pkill -f next
```

### 端口固定原则

**为什么端口必须固定？**
1. **环境一致性**：开发、测试、生产环境端口保持一致
2. **API 调用稳定**：前端配置的 API 地址不需要动态调整
3. **文档准确性**：API 文档中的端口示例永远有效
4. **团队协作**：所有开发者使用相同端口，避免配置差异

**配置示例**：
```typescript
// apps/backend/src/main.ts
app.use(await NestFactory.create(AppModule));
await app.listen(3001);  // 固定端口

// apps/frontend/next.config.js
export default {
  devServer: {
    port: 3000,  // 固定端口
  }
};
```

### 端口变更审批流程

**只有在以下极端情况下才允许变更端口**：
1. 端口与其他系统级服务冲突（如系统服务、数据库）
2. 安全审计要求必须更改默认端口
3. 变更必须经过：
   - 技术负责人审批
   - 更新所有相关文档
   - 通知所有开发人员
   - 更新环境变量配置文件

### 快速诊断命令

```bash
# 一键检查所有服务端口状态
echo "Backend Port (3001):" && lsof -i :3001 || echo "✅ Available"
echo "Frontend Port (3000):" && lsof -i :3000 || echo "✅ Available"
```

## 🗂️ 文件结构规范

### TypeScript 输出文件
```gitignore
# 编译输出必须忽略
dist/
build/
*.js
*.js.map
*.d.ts
*.d.ts.map

# 但要保留源文件
!packages/shared/src/**/*.ts
!apps/backend/src/**/*.ts
```

### 增量编译文件
```gitignore
# TypeScript增量编译缓存
*.tsbuildinfo
```

## 🔄 Git 提交规范

### 提交前检查
```bash
# 强制要求
npm run typecheck
npm run lint
npm run test  # 如有测试

# 只有全部通过才能提交
```

### Pre-commit 钩子（推荐）
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run typecheck && npm run lint"
    }
  }
}
```

## 🧪 开发时的验证清单

### 修改Schema后必须执行
```bash
# 1. 检查TypeScript编译
npm run typecheck

# 2. 检查ESLint
npm run lint

# 3. 重新构建shared包
cd packages/shared && npm run build

# 4. 重新构建backend
cd apps/backend && npm run build

# 5. 测试API
# 手动测试相关API端点
```

### 修改配置文件后必须执行
```bash
# 1. 重新构建相关包
npm run build

# 2. 重启开发服务器
npm run dev

# 3. 验证配置生效
# 检查相关功能是否正常
```

## 📝 配置文件变更记录

### 变更时必须更新
当修改以下文件时，必须更新 DEVELOPMENT_STANDARDS.md：

1. `tsconfig.json` - TypeScript配置变更
2. `eslint.config.js` - ESLint规则变更
3. `package.json` - 依赖或脚本变更
4. `.env.example` - 环境变量变更

### 变更记录格式
```markdown
### YYYY-MM-DD 配置文件变更
**修改文件**: tsconfig.json
**修改原因**: 解决moduleResolution冲突
**影响范围**: 所有TypeScript编译
**验证状态**: ✅ 已验证
```

---

## 📝 配置文件变更记录

### 2026-06-08 端口管理规范
**修改文件**: DEVELOPMENT_STANDARDS.md, package.json, scripts/manage-ports.sh
**修改原因**: 建立端口固定规则，禁止因端口占用随意更改端口
**影响范围**: 所有开发环境
**验证状态**: ✅ 已验证

**新增功能**:
- ✅ 端口管理规范章节（DEVELOPMENT_STANDARDS.md）
- ✅ 端口管理脚本（scripts/manage-ports.sh）
- ✅ npm 命令快捷方式（package.json）

**固定端口**:
- 后端: 3001
- 前端: 3000
- 数据库: 5432

**新增 npm 命令**:
```bash
npm run ports:check           # 检查所有端口状态
npm run ports:free            # 释放所有端口
npm run ports:free-backend    # 仅释放后端端口
npm run ports:free-frontend   # 仅释放前端端口
npm run ports:free-db         # 仅释放数据库端口
```

**绝对禁止**:
- ❌ 禁止随意修改端口号
- ❌ 禁止因端口占用而改用其他端口
- ❌ 禁止在代码中硬编码动态端口

**正确处理方式**:
```bash
# 当端口占用时，执行以下命令
npm run ports:free            # 释放所有端口
# 或
npm run ports:free-backend    # 仅释放后端端口
# 然后重新启动服务
npm run dev
```
