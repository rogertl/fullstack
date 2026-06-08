# Axios 异步数据获取配置

## 📁 目录结构

```
apps/frontend/src/
├── lib/
│   ├── axios/
│   │   ├── axios-instance.ts    # Axios 实例配置（拦截器、token 管理）
│   │   └── index.ts
│   ├── api/
│   │   ├── api-client.ts        # 通用 API 客户端
│   │   ├── contract-api.ts      # 合同 API 服务
│   │   ├── auth-api.ts          # 认证 API 服务
│   │   └── index.ts
│   └── react-query/
│       ├── query-provider.tsx   # TanStack Query Provider
│       └── use-api.ts           # 通用 React Query Hooks
└── hooks/
    └── api/
        ├── use-contracts.ts      # 合同相关 Hooks
        ├── use-auth.ts           # 认证相关 Hooks
        └── index.ts
```

## 🔧 核心配置

### 1. Axios 实例（`lib/axios/axios-instance.ts`）

**功能**：
- 基础 URL 配置
- 请求拦截器（自动添加 Bearer token）
- 响应拦截器（自动刷新 token、错误处理）
- Token 存储（LocalStorage）

**关键特性**：
```typescript
// 双 token 模式
- Access Token: 15 分钟有效期
- Refresh Token: 7 天有效期

// 自动刷新
- 401 响应时自动尝试刷新 token
- 刷新成功后重试原始请求
- 刷新失败时清除 token 并跳转登录页
```

### 2. API 客户端（`lib/api/api-client.ts`）

**功能**：
- 封装常用 HTTP 方法（GET/POST/PUT/PATCH/DELETE）
- 与 Zod Schema 集成（类型安全）
- 自动响应验证
- 分页支持

**使用示例**：
```typescript
import { apiClient } from '@/lib/api';
import { ContractSchema } from '@contract-management/shared/schemas';

// 类型安全的 GET 请求
const contract = await apiClient.get(
  '/api/contracts/1',
  ContractSchema, // 自动验证响应类型
);

// 分页请求
const result = await apiClient.getPaginated(
  '/api/contracts',
  { page: 1, limit: 10 },
  ContractSchema,
);
```

### 3. API 服务层（`lib/api/contract-api.ts`, `lib/api/auth-api.ts`）

**合同 API**：
```typescript
import { contractApi } from '@/lib/api';

// CRUD 操作
await contractApi.getList({ page: 1, limit: 10 });
await contractApi.getById(1);
await contractApi.create(data);
await contractApi.update(1, data);
await contractApi.delete(1);
await contractApi.updateStatus(1, 'APPROVED');
```

**认证 API**：
```typescript
import { authApi } from '@/lib/api';

// 认证操作
await authApi.login({ username, password });
await authApi.refreshToken(refreshToken);
await authApi.logout();
await authApi.getCurrentUser();
```

### 4. React Query Hooks（`lib/react-query/`, `hooks/api/`）

**通用 Hooks**：
```typescript
import { useApiQuery, useApiMutation } from '@/hooks';

// Query Hook
const { data, isLoading, error } = useApiQuery(
  ['contracts'],
  () => contractApi.getList(),
);

// Mutation Hook
const createMutation = useApiMutation(
  (data: CreateContractRequest) => contractApi.create(data),
  {
    onSuccess: () => {
      console.log('创建成功');
    },
    invalidateQueries: [['contracts']],
  },
);
```

**专用 Hooks**：
```typescript
import { useContracts, useCreateContract } from '@/hooks';

// 获取合同列表
const { data: contracts, isLoading } = useContracts({ page: 1 });

// 创建合同
const createMutation = useCreateContract({
  onSuccess: (data) => {
    console.log('合同创建成功', data);
  },
});
```

## 🔐 JWT 双 Token 模式

### Token 流程

```
1. 登录
   用户凭据 → API → Access Token + Refresh Token

2. API 请求
   请求头添加: Authorization: Bearer <access_token>

3. Token 过期
   401 响应 → 自动刷新 → 重试原始请求

4. 刷新失败
   清除 token → 跳转登录页
```

### Token 存储

```typescript
// LocalStorage 存储键
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// 获取 token
tokenStorage.getAccessToken();
tokenStorage.getRefreshToken();

// 存储 token
tokenStorage.setTokens(accessToken, refreshToken);

// 清除 token
tokenStorage.clearTokens();
```

## ✅ 类型安全

### 与 Zod Schema 集成

```typescript
// API 响应自动验证
const contract = await apiClient.get(
  '/api/contracts/1',
  ContractSchema, // 如果响应不符合 Zod Schema，抛出错误
);

// 类型自动推导
type Contract = z.infer<typeof ContractSchema>;
// contract 的类型自动为 Contract
```

### 错误处理

```typescript
import { handleApiError, ApiFieldError } from '@/lib/api';

try {
  await apiClient.post('/api/contracts', data);
} catch (error) {
  handleApiError(error);

  // 字段级错误
  if (error instanceof ApiFieldError) {
    console.log(error.fieldErrors);
    // { title: '标题不能为空', amount: '金额必须大于0' }
  }
}
```

## 📊 TanStack Query 配置

### 默认配置

```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 分钟内数据保持新鲜
    gcTime: 10 * 60 * 1000,       // 10 分钟后清除缓存
    retry: 1,                      // 失败重试 1 次
    refetchOnWindowFocus: false,   // 窗口聚焦时不自动重新获取
  },
  mutations: {
    retry: false,                  // 失败不重试
  },
}
```

### 缓存策略

```typescript
// 自动使查询失效
createMutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
  },
});

// 手动使查询失效
import { useInvalidateApi } from '@/hooks';

const { invalidate } = useInvalidateApi();
invalidate(['contracts']);
```

## 🚀 使用示例

### 完整组件示例

```typescript
'use client';

import { useContracts, useCreateContract } from '@/hooks';

export function ContractList() {
  const { data: contracts, isLoading } = useContracts();
  const createMutation = useCreateContract({
    onSuccess: () => {
      alert('创建成功');
    },
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {contracts?.map((contract) => (
        <div key={contract.id}>{contract.title}</div>
      ))}
      <button onClick={() => createMutation.mutate(data)}>
        创建合同
      </button>
    </div>
  );
}
```

## 📋 后续完善

以下功能将在对应阶段完善：

| 功能 | 阶段 | 说明 |
|------|------|------|
| API 端点 | Stage 1 | 根据 OpenAPI 规范完善 API 服务 |
| 请求验证 | Stage 3 | 集成 Zod Schema 验证请求数据 |
| 错误处理 | Stage 3 | 完善错误码和错误消息 |
| 权限控制 | Stage 3 | 添加 RBAC 权限验证 |
| 缓存策略 | Stage 4 | 根据业务需求调整缓存配置 |
