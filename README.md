# SplitBase - Base Pay 分账应用

SplitBase 是一个基于 Base 区块链的分账支付应用，让用户在聚餐/活动中快速完成分账支付，并利用 Base Pay (USDC) 结算。

## 🎯 产品特色

- **快速分账**: 输入总金额和人数，自动计算每人应付金额
- **Base Pay 支付**: 使用 USDC 在 Base 网络上完成支付
- **实时状态**: 支付状态实时更新，进度一目了然
- **分享功能**: 生成分享链接和二维码，邀请朋友加入
- **NFT 收据**: 分账完成后可生成 NFT 收据作为数字凭证
- **MiniKit 集成**: 优化的移动端体验

## 🛠 技术栈

- [Next.js](https://nextjs.org) - React 框架
- [MiniKit](https://docs.base.org/builderkits/minikit/overview) - Farcaster Mini App 框架
- [OnchainKit](https://www.base.org/builders/onchainkit) - Base 区块链集成
- [Tailwind CSS](https://tailwindcss.com) - 样式框架
- [TypeScript](https://www.typescriptlang.org) - 类型安全
- [Redis](https://redis.io) - 数据存储
- [QRCode.js](https://github.com/soldair/node-qrcode) - 二维码生成

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
```

### 2. 配置环境变量

创建 `.env.local` 文件并配置以下变量：

```bash
# 基础配置
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=SplitBase
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ICON_URL=http://localhost:3000/icon.png
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Frame 元数据
NEXT_PUBLIC_APP_SUBTITLE=聚餐分账新体验
NEXT_PUBLIC_APP_DESCRIPTION=使用 Base Pay 快速完成分账支付，支持 USDC 结算
NEXT_PUBLIC_APP_TAGLINE=Base Pay 分账，轻松结算

# Redis 配置 (可选，用于通知功能)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 核心功能

### 1. 发起分账

- 输入分账标题和描述
- 设置总金额 (USDC) 和参与人数
- 自动计算每人应付金额
- 生成分享链接和二维码

### 2. 参与支付

- 扫描二维码或点击分享链接加入
- 使用 Basename (.base) 身份登录
- 通过 OnchainKit 完成 USDC 转账
- 实时更新支付状态

### 3. 状态管理

- 实时显示支付进度
- 参与者列表和状态跟踪
- 分账完成自动通知
- 生成 NFT 收据 (即将推出)

### 4. 社交分享

- 二维码生成和分享
- 复制分享链接
- 社交媒体分享 (支持原生分享 API)
- 分账完成庆祝动画

## 🏗 项目结构

```
app/
├── api/                    # API 路由
│   ├── split/              # 分账相关 API
│   ├── notify/             # 通知功能
│   └── webhook/            # Webhook 处理
├── components/             # React 组件
│   ├── CreateSplitForm.tsx # 创建分账表单
│   ├── SplitBillDetail.tsx # 分账详情页面
│   ├── PaymentButton.tsx  # 支付按钮
│   ├── ShareModal.tsx     # 分享模态框
│   └── CompletionModal.tsx # 完成庆祝页面
├── split/[billId]/         # 动态分账页面
└── page.tsx               # 首页

lib/
├── types.ts               # TypeScript 类型定义
├── split-utils.ts         # 分账工具函数
├── split-storage.ts       # 数据存储管理
├── notification.ts        # 通知功能
└── redis.ts              # Redis 客户端
```

## 🔧 技术细节

### Base Pay 集成

- 使用 Base 网络的 USDC 合约 (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- 通过 OnchainKit 的 Transaction 组件处理支付
- 支持赞助交易 (Sponsored Transactions)
- 实时交易状态跟踪

### 数据存储

- 使用 Redis 作为临时存储 (可配置过期时间)
- 支持分账数据、参与者信息、交易记录
- 可扩展到持久化数据库 (PostgreSQL/MongoDB)

### MiniKit 优化

- 响应式设计，移动端优先
- 安全区域适配 (Safe Area Insets)
- Frame SDK 集成
- 原生分享功能支持

## 🚀 部署

### Vercel 部署

```bash
npm run build
# 部署到 Vercel
vercel
```

### 环境配置

- 配置 OnchainKit API Key
- 设置 Redis 连接 (Upstash 推荐)
- 配置 Frame 元数据
- 设置域名和 HTTPS

## 📖 了解更多

- [MiniKit 文档](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit 文档](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Base 开发者文档](https://docs.base.org)
- [USDC on Base](https://www.centre.io/usdc-multichain/base)
