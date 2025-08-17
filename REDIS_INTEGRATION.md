# Redis 集成说明

## 概述

SplitBase 的好友功能现在支持 Redis 存储，提供更好的数据持久化和跨设备同步能力。

## 架构设计

### 存储策略

1. **Redis 优先**: 优先从 Redis 获取数据，提供更好的性能和跨设备访问
2. **localStorage 备份**: 当 Redis 不可用时，自动回退到 localStorage
3. **双重写入**: 数据同时保存到 Redis 和 localStorage，确保数据安全

### 数据流

```
用户操作 → 验证数据 → 保存到 Redis → 保存到 localStorage → 返回结果
```

## 环境配置

### 必需的环境变量

```bash
# .env.local
REDIS_URL=your_redis_url_here
REDIS_TOKEN=your_redis_token_here
```

### Redis 配置示例

```typescript
// lib/redis.ts
export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});
```

## API 端点

### GET /api/friends?address={address}

从 Redis 获取用户的好友列表

```typescript
// 响应示例
{
  "success": true,
  "data": [
    {
      "id": "1234567890",
      "address": "0x1234...",
      "basename": "alice.base",
      "nickname": "Alice",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "isFavorite": true
    }
  ]
}
```

### POST /api/friends

添加新好友到 Redis

```typescript
// 请求体
{
  "address": "0x1234...",
  "basename": "bob.base",
  "nickname": "Bob"
}

// 响应示例
{
  "success": true,
  "data": { /* 新好友对象 */ },
  "message": "Friend added successfully"
}
```

## 客户端使用

### 同步版本（兼容现有代码）

```typescript
import {
  getFriendsFromStorageSync,
  saveFriendsToStorageSync,
  addFriend,
} from "@/lib/friend-utils";

// 获取好友列表
const friends = getFriendsFromStorageSync(userAddress);

// 添加好友
const newFriend = addFriend(userAddress, friendData);
```

### 异步版本（Redis 支持）

```typescript
import {
  getFriendsFromStorage,
  saveFriendsToStorage,
  addFriendAsync,
} from "@/lib/friend-utils";

// 获取好友列表（支持 Redis）
const friends = await getFriendsFromStorage(userAddress);

// 添加好友（支持 Redis）
const newFriend = await addFriendAsync(userAddress, friendData);
```

## 数据同步

### 跨设备同步

- 用户在不同设备上登录时，好友数据会自动从 Redis 同步
- 支持离线使用，数据会缓存在 localStorage 中

### 数据一致性

- Redis 作为主数据源
- localStorage 作为本地缓存和离线备份
- 写入操作同时更新两个存储

## 性能优化

### Redis 缓存策略

- 好友数据设置 30 天过期时间
- 支持 Redis 集群和读写分离
- 自动处理 Redis 连接失败的情况

### 离线支持

- 当 Redis 不可用时，自动使用 localStorage
- 网络恢复后，数据会自动同步到 Redis

## 错误处理

### Redis 连接失败

```typescript
try {
  if (redis) {
    await redis.set(key, data);
  } else {
    // 回退到 localStorage
    localStorage.setItem(key, JSON.stringify(data));
  }
} catch (error) {
  console.error("Redis operation failed:", error);
  // 使用 localStorage 作为备份
}
```

### 数据验证

- 所有输入数据都经过验证
- 以太坊地址格式检查
- 数据类型和结构验证

## 监控和日志

### 关键指标

- Redis 连接状态
- 数据读写性能
- 错误率和失败原因

### 日志记录

```typescript
console.log("Friends data saved to Redis:", redisKey);
console.warn("Redis unavailable, using localStorage");
console.error("Failed to save friends data:", error);
```

## 未来改进

### 计划功能

- [ ] Redis 集群支持
- [ ] 数据压缩和优化
- [ ] 实时数据同步
- [ ] 数据备份和恢复

### 性能优化

- [ ] Redis 连接池
- [ ] 批量操作支持
- [ ] 智能缓存策略

## 故障排除

### 常见问题

1. **Redis 连接失败**
   - 检查环境变量配置
   - 验证网络连接
   - 检查 Redis 服务状态

2. **数据不同步**
   - 清除 localStorage 缓存
   - 重新登录触发数据同步
   - 检查 Redis 数据完整性

3. **性能问题**
   - 监控 Redis 连接池
   - 检查数据大小和过期策略
   - 优化查询模式

## 总结

Redis 集成为 SplitBase 的好友功能提供了：

- **更好的性能**: 快速的数据访问和查询
- **跨设备同步**: 用户数据在不同设备间保持一致
- **数据持久化**: 可靠的长期数据存储
- **离线支持**: 网络不可用时的备用方案
- **扩展性**: 支持未来的功能扩展和性能优化
