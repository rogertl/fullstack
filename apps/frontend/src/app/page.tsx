/**
 * 首页
 *
 * 契约优先：UI 组件将在前端阶段（Stage 4）根据 Zod Schema 实现
 * 当前状态：展示 axios + TanStack Query 集成示例
 */

'use client';

import { useContracts } from '@/hooks';

export default function HomePage() {
  const { data: contracts, isLoading, error } = useContracts({ page: 1, limit: 10 });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            合同管理系统
          </h1>
          <p className="text-gray-600 mb-6">
            用来管理华道的业务合同
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>开发进度：</strong>项目已初始化，等待进入契约阶段（Stage 0）定义 Zod Schema
            </p>
          </div>

          {/* Axios + TanStack Query 集成示例 */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              数据获取示例（使用 axios + TanStack Query）
            </h2>

            {isLoading ? (
              <div className="text-gray-500">加载中...</div>
            ) : error ? (
              <div className="text-red-500">
                {error instanceof Error ? error.message : '加载失败'}
              </div>
            ) : (
              <div className="space-y-2">
                {contracts && contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="p-3 bg-gray-50 rounded border"
                    >
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-sm text-gray-600">
                        状态: {contract.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">
                    暂无合同数据（等待 Stage 0 定义 Zod Schema 后实现）
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
