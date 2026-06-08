# 快速恢复开发指南

## 🎯 核心原则

**Zod Schema 是唯一真相来源，所有变更必须从 Schema 开始。**

## 📋 恢复开发的正确流程

### 1️⃣ 快速状态检查（必需）

```bash
./scripts/check-status.sh
```

这会告诉你：
- 当前开发阶段
- Schema同步状态
- 待处理的变更
- 最近的问题记录

### 2️⃣ 根据状态决定下一步

#### 场景A：继续当前阶段
```bash
你："继续后端开发"
我：读取 .contract-state.json，确认当前阶段，继续该阶段工作
```

#### 场景B：开发新功能
```bash
你："进入契约阶段" 或 "开发XX功能"
我：确认需要定义新的Schema，引导你完成Stage 0
```

#### 场景C：有未处理的Schema变更
```bash
你："继续处理Schema变更"
我：检查 SCHEMA_CHANGES.md，逐个验证受影响的轨道
```

## 🔄 Schema变更处理流程

### 当修改了Schema文件后：

1. **立即记录变更**
   ```bash
   # 在 SCHEMA_CHANGES.md 中添加变更记录
   # 更新 .contract-state.json 的 schemaSyncStatus
   ```

2. **按轨道验证**
   ```bash
   # 后端轨道
   - DTO自动更新（nestjs-zod）
   - API验证测试

   # 前端轨道
   - API调用参数更新
   - 表单验证更新

   # 数据库轨道
   - Prisma Schema同步
   - 数据库迁移
   ```

3. **标记完成**
   ```bash
   # 更新 .contract-state.json 中的状态
   # 所有轨道都SYNCED后才能继续新功能
   ```

## 🚨 常见错误避免

### ❌ 错误做法
```bash
你："直接在Controller里修改验证逻辑"
我：❌ 这违反了契约优先原则，必须修改Schema
```

### ✅ 正确做法
```bash
你："修改CreateUserRequestSchema，添加phone字段"
我：✅ 从源头修改，自动影响所有轨道
```

## 📁 关键文件说明

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `.contract-state.json` | 当前开发状态 | 每次恢复开发时 |
| `SCHEMA_CHANGES.md` | Schema变更记录 | 修改Schema后立即查看 |
| `scripts/check-status.sh` | 快速状态检查 | 每次开始工作前运行 |
| `ARCHITECTURE.md` | 阶段详细指导 | 确认当前阶段具体任务 |

## 💪 恢复开发的命令模板

### 模板1：继续之前的工作
```bash
./scripts/check-status.sh          # 1. 检查状态
你："继续后端API开发"            # 2. 明确目标
我：读取状态，继续当前阶段工作     # 3. AI执行
```

### 模板2：处理新需求
```bash
./scripts/check-status.sh          # 1. 检查状态
你："进入契约阶段，开发合同管理功能"  # 2. 明确新功能
我：引导完成Stage 0 Schema定义    # 3. AI引导
```

### 模板3：处理遗留问题
```bash
cat SCHEMA_CHANGES.md             # 1. 查看变更记录
你："继续处理前端同步问题"        # 2. 明确处理任务
我：逐个验证前端轨道              # 3. AI执行
```

## 🎓 核心记忆要点

1. **新功能 = 必须先进入契约阶段（Stage 0）**
2. **修改Schema = 立即记录到SCHEMA_CHANGES.md**
3. **恢复开发 = 先运行check-status.sh**
4. **不确定时 = 说"检查状态"**

田总，这个机制建立完成。下次你只需要：
1. 运行 `./scripts/check-status.sh`
2. 告诉我你要做什么
3. 我会根据状态正确执行

需要我演示一下如何使用这个机制吗？