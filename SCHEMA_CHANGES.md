# Schema 变更追踪

## 变更记录

### 2026-06-08 UpdateUserRequestSchema 变更
**时间**: 2026-06-08 19:00
**修改内容**:
1. 重构 `UpdateUserRequestSchema` 使用 `.omit()` 替代 `.partial()`
2. 移除 `id`、`role`、`createdAt`、`updatedAt` 字段
3. 所有更新字段设为可选（`.partial()`）

**影响范围**:
- ✅ Backend: DTO自动更新
- ✅ Backend: PUT /users/:id API修复
- ✅ Database: 无需修改（系统字段不可更新）
- ⏳ Frontend: 待检查API调用是否需要更新

**修改原因**: PUT /users/:id 验证失败，试图验证不应出现在请求体中的系统字段

**验证状态**:
- ✅ 后端API测试通过（更新用户realName成功）
- ✅ Schema编译成功
- ⏳ 前端集成测试待进行

**变更前**:
```typescript
export const UpdateUserRequestSchema = UserSchema.partial({
  username: true, email: true, password: true, realName: true,
  phone: true, departmentId: true, status: true, isActive: true,
})
```

**变更后**:
```typescript
export const UpdateUserRequestSchema = UserSchema.omit({
  id: true, role: true, createdAt: true, updatedAt: true,
}).partial()
```

---

### 2026-06-08 Logout 端点修复
**时间**: 2026-06-08 19:00
**修改内容**:
1. 新增 `LogoutRequestSchema` 和 `LogoutResponseSchema`
2. 修改 AuthController 使用 `refreshToken` 替代从 header 提取 token

**影响范围**:
- ✅ Backend: POST /auth/logout API修复
- ✅ Database: 正确删除refreshToken记录
- ⏳ Frontend: 待检查登出API调用

**修改原因**: logout 功能使用 accessToken 而非 refreshToken，无法正确删除数据库中的 refresh token

**验证状态**:
- ✅ 后端API测试通过（logout返回success:true）
- ✅ Schema编译成功
- ⏳ 前端集成测试待进行

---

### 2026-06-08 CreateUserRequestSchema 变更
**时间**: 2026-06-08 15:00
**修改内容**: 将 `phone`、`departmentId` 添加到 `.partial()` 列表
**影响范围**:
- ✅ Backend: DTO自动更新（nestjs-zod）
- ✅ Backend: API验证更新
- ✅ Database: 已同步
- ⏳ Frontend: 待检查API调用是否需要更新

**修改原因**: 创建用户时phone和departmentId应该是可选字段，但Zod验证失败

**验证状态**:
- ✅ 后端API测试通过
- ✅ 创建用户（不含可选字段）成功
- ⏳ 前端集成测试待进行

---

## 变更检查清单

当修改Schema后，按此顺序检查：

### 1. 后端轨道 (Backend)
- [ ] DTO自动更新（nestjs-zod）
- [ ] API验证测试
- [ ] 业务逻辑适配

### 2. 前端轨道 (Frontend)
- [ ] API调用参数更新
- [ ] 类型定义更新
- [ ] UI表单验证更新

### 3. 数据库轨道 (Database)
- [ ] Prisma Schema同步
- [ ] 数据库迁移
- [ ] 数据完整性验证

### 4. 文档轨道 (Documentation)
- [ ] OpenAPI规范更新
- [ ] API文档更新
- [ ] Mock服务器更新

---

## 快速恢复命令

```bash
# 查看最近的Schema变更
git diff packages/shared/src/schemas/

# 查看当前同步状态
cat .contract-state.json | jq '.schemaSyncStatus'

# 检查待处理的变更
cat SCHEMA_CHANGES.md | grep "待检查"
```
