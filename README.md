# SplitBase - Base Pay Split Bill App

SplitBase is a split-payment app built on the Base blockchain. It helps groups quickly split bills at dinners or events and settle using Base Pay (USDC).

## 🎯 Key Features

- **Fast splitting**: Enter total amount and participants, and get per-person amount automatically
- **Base Pay**: Settle with USDC on the Base network
- **Real-time status**: Live payment status and clear progress
- **Sharing**: Generate share links and QR codes to invite friends
- **NFT receipts**: Optionally mint an NFT receipt after completion
- **MiniKit integration**: Optimized mobile experience

## 🛠 Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [MiniKit](https://docs.base.org/builderkits/minikit/overview) - Farcaster Mini App framework
- [OnchainKit](https://www.base.org/builders/onchainkit) - Base blockchain integration
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Redis](https://redis.io) - Data storage
- [QRCode.js](https://github.com/soldair/node-qrcode) - QR code generation

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure environment variables

Create a `.env.local` file and set:

```bash
# Base config
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=SplitBase
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ICON_URL=http://localhost:3000/icon.png
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Frame metadata
NEXT_PUBLIC_APP_SUBTITLE=A new bill-splitting experience
NEXT_PUBLIC_APP_DESCRIPTION=Quickly split and settle with Base Pay and USDC
NEXT_PUBLIC_APP_TAGLINE=Base Pay splitting, easy settlement

# Redis (optional, for notifications and storage)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
```

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## 📱 Core Flows

### 1. Create a split

- Enter a title and description
- Set total amount (USDC) and participant count
- Auto-calculate per-person amount
- Generate share link and QR code

### 2. Join and pay

- Join via QR or shared link
- Sign in with Basename (.base)
- Pay USDC via OnchainKit
- Status updates in real time

### 3. Status tracking

- Live progress display
- Participant list and status tracking
- Auto notification when completed
- NFT receipt (coming soon)

### 4. Social sharing

- Generate/share QR codes
- Copy share links
- Native share API support
- Celebration animation on completion

## 🏗 Project Structure

```
app/
├── api/                    # API routes
│   ├── split/              # Split-related APIs
│   ├── notify/             # Notifications
│   └── webhook/            # Webhook handling
├── components/             # React components
│   ├── CreateSplitForm.tsx # Create split form
│   ├── SplitBillDetail.tsx # Split detail page
│   ├── PaymentButton.tsx   # Pay button
│   ├── ShareModal.tsx      # Share modal
│   └── CompletionModal.tsx # Completion celebration
├── split/[billId]/         # Dynamic split page
└── page.tsx                # Home

lib/
├── types.ts               # TypeScript types
├── split-utils.ts         # Split utilities
├── split-storage.ts       # Storage management
├── notification.ts        # Notifications
└── redis.ts              # Redis client
```

## 🔧 Technical Details

### Base Pay integration

- Uses USDC contract on Base (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Payments via OnchainKit Transaction component
- Supports Sponsored Transactions
- Real-time transaction tracking

### Data storage

- Redis as temporary storage (with TTL)
- Supports split data, participants, transaction records
- Can be extended to persistent DB (PostgreSQL/MongoDB)

### MiniKit optimizations

- Responsive, mobile-first
- Safe area (insets) support
- Frame SDK integration
- Native sharing support

## 🚀 Deployment

### Vercel

```bash
npm run build
# deploy to Vercel
vercel
```

### Environment

- Configure OnchainKit API key
- Set up Redis (Upstash recommended)
- Configure Frame metadata
- Domain and HTTPS

## 📖 Learn more

- [MiniKit docs](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit docs](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Base developer docs](https://docs.base.org)
- [USDC on Base](https://www.centre.io/usdc-multichain/base)
