# SplitBase - Base Pay Split Bill App

SplitBase is a split-payment app built on the Base blockchain. It helps groups quickly split bills at dinners or events and settle using Base Pay (USDC).

## 🎯 Key Features

- **Fast splitting**: Enter total amount and participants, and get per-person amount automatically
- **Base Pay**: Settle with USDC on the Base network
- **Real-time status**: Live payment status and clear progress
- **Sharing**: Generate share links and QR codes to invite friends
- **NFT receipts**: Optionally mint an NFT receipt after completion
- **MiniKit integration**: Optimized mobile experience

## 🏗 Technical Architecture

### Frontend Architecture

#### Core Framework

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with modern hooks and concurrent features
- **TypeScript 5** - Type-safe development with strict mode

#### UI Components & Styling

- **Tailwind CSS 3.4** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible, unstyled UI primitives
  - Dialog, Alert Dialog, Select, Switch, Tabs, Tooltip, Progress
- **Custom Design System** - Brand-specific colors, gradients, and animations
- **Responsive Design** - Mobile-first approach with MiniKit optimizations

#### State Management & Data Fetching

- **React Query (TanStack Query)** - Server state management and caching
- **React Hook Form** - Form handling with Zod validation
- **Custom Hooks** - Reusable logic for split bills, payments, and notifications

#### Animation & Interactions

- **Motion (Framer Motion)** - Smooth animations and transitions
- **Custom Animations** - Brand-specific keyframes and transitions
- **Interactive Elements** - Hover effects, loading states, and micro-interactions

### Backend Architecture

#### API Layer

- **Next.js API Routes** - RESTful API endpoints
- **Route Structure**:
  ```
  /api/
  ├── bills/           # Bill management
  ├── friends/         # Friend management
  ├── nft/            # NFT operations
  ├── notify/         # Push notifications
  ├── split/          # Split bill operations
  └── webhook/        # External integrations
  ```

#### Data Storage

- **Redis (Upstash)** - In-memory data store with TTL
  - Temporary storage for active splits
  - Session management
  - Real-time data caching
- **Data Models**:
  - SplitBill, Participant, Friend, PaymentTransaction
  - NFTReceipt, NotificationPayload

#### Business Logic

- **Split Utilities** - Bill calculation and participant management
- **Friend Management** - Contact list and social features
- **Notification System** - Real-time updates and push notifications
- **NFT Generation** - Receipt minting and metadata handling

### Blockchain Integration

#### Base Network Support

- **Multi-Network Configuration**:
  - Base Mainnet (Chain ID: 8453)
  - Base Sepolia Testnet (Chain ID: 84532)
- **USDC Contract Integration**:
  - Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
  - Testnet: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

#### Wallet & Transaction Management

- **OnchainKit** - Base blockchain integration
  - USDC transfer functionality
  - Sponsored transactions support
  - Transaction status tracking
- **Wagmi + Viem** - Ethereum wallet integration
  - Multi-wallet support
  - Transaction signing and broadcasting

#### MiniKit Integration

- **Farcaster Mini App SDK** - Social app framework
- **Frame SDK** - Farcaster Frame integration
- **Mobile Optimizations** - Safe area handling, native sharing

### Data Flow Architecture

```
User Action → UI Component → API Route → Business Logic → Storage/Blockchain
     ↓              ↓           ↓           ↓              ↓
  Form Input → State Update → HTTP Request → Validation → Redis/Contract
     ↓              ↓           ↓           ↓              ↓
  Real-time → WebSocket → Notification → UI Update → Success State
```

#### State Management Flow

1. **Local State** - Form inputs, UI interactions
2. **Server State** - API data, caching, real-time updates
3. **Blockchain State** - Transaction status, USDC balances
4. **Global State** - User preferences, app configuration

### Security & Validation

#### Input Validation

- **Zod Schema Validation** - Type-safe data validation
- **Sanitization** - XSS prevention and input cleaning
- **Rate Limiting** - API abuse prevention

#### Blockchain Security

- **Transaction Verification** - Hash validation and confirmation
- **Address Validation** - Ethereum address format checking
- **Amount Validation** - USDC decimal precision handling

### Performance Optimizations

#### Frontend Performance

- **Code Splitting** - Dynamic imports and lazy loading
- **Image Optimization** - Next.js Image component
- **Bundle Optimization** - Tree shaking and dead code elimination

#### Backend Performance

- **Redis Caching** - Fast data retrieval
- **Connection Pooling** - Efficient database connections
- **Async Operations** - Non-blocking I/O operations

#### Mobile Optimizations

- **MiniKit Optimizations** - Frame-specific performance
- **Progressive Web App** - Offline capabilities
- **Responsive Images** - Adaptive image loading

## 🛠 Tech Stack

### Core Technologies

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [React 18](https://react.dev) - UI library
- [TypeScript 5](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS 3.4](https://tailwindcss.com) - Styling framework

### Blockchain & Web3

- [OnchainKit](https://www.base.org/builders/onchainkit) - Base blockchain integration
- [MiniKit](https://docs.base.org/builderkits/minikit/overview) - Farcaster Mini App framework
- [Wagmi](https://wagmi.sh) - React hooks for Ethereum
- [Viem](https://viem.sh) - TypeScript interface for Ethereum

### UI & Components

- [Radix UI](https://www.radix-ui.com) - Accessible UI primitives
- [Lucide React](https://lucide.dev) - Icon library
- [Motion](https://motion.dev) - Animation library
- [React Hook Form](https://react-hook-form.com) - Form handling

### Data & State

- [React Query](https://tanstack.com/query) - Server state management
- [Redis (Upstash)](https://upstash.com) - Data storage
- [Zod](https://zod.dev) - Schema validation

### Development Tools

- [ESLint](https://eslint.org) - Code linting
- [Prettier](https://prettier.io) - Code formatting
- [PostCSS](https://postcss.org) - CSS processing

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
SplitBase/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── bills/               # Bill management APIs
│   │   │   ├── participant/     # Participant operations
│   │   │   └── user/           # User bill operations
│   │   ├── friends/             # Friend management API
│   │   ├── nft/                # NFT operations API
│   │   │   ├── create/         # NFT creation
│   │   │   ├── list/           # NFT listing
│   │   │   └── [nftId]/        # Individual NFT operations
│   │   ├── notify/             # Notification API
│   │   ├── split/              # Split bill API
│   │   │   ├── create/         # Create split
│   │   │   └── [billId]/       # Individual split operations
│   │   └── webhook/            # Webhook handling
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── bottom-navigation.tsx
│   │   │   ├── create-split-form.tsx
│   │   │   ├── friend-modal.tsx
│   │   │   ├── nft-card.tsx
│   │   │   ├── payment-button.tsx
│   │   │   ├── receipt-detail.tsx
│   │   │   ├── split-bill-detail.tsx
│   │   │   └── wallet-modal.tsx
│   │   ├── AppLayout.tsx       # Main app layout
│   │   └── DemoComponents.tsx  # Development components
│   ├── bills/                  # Bills page
│   ├── create/                 # Create split page
│   ├── friends/                # Friends management
│   │   └── leaderboard/        # Friends leaderboard
│   ├── nfts/                   # NFT management
│   │   └── [nftId]/           # Individual NFT page
│   ├── receipts/               # Receipt viewing
│   │   └── [billId]/          # Individual receipt
│   ├── split/                  # Split bill management
│   │   └── [billId]/          # Individual split
│   ├── AppContent.tsx          # Main app content
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── providers.tsx           # Context providers
│   └── theme.css               # Theme configuration
├── components/                  # Shared components
│   ├── magicui/               # Custom UI components
│   │   ├── animated-gradient-text.tsx
│   │   ├── aurora-text.tsx
│   │   ├── border-beam.tsx
│   │   ├── magic-card.tsx
│   │   ├── neon-gradient-card.tsx
│   │   ├── particles.tsx
│   │   ├── pulsating-button.tsx
│   │   ├── rainbow-button.tsx
│   │   └── typing-animation.tsx
│   └── ui/                     # Base UI components
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...                 # Other UI primitives
├── lib/                         # Utility libraries
│   ├── config.ts               # Network configuration
│   ├── friend-utils.ts         # Friend management utilities
│   ├── nft-compositor.ts       # NFT composition logic
│   ├── nft-generation.ts       # NFT generation utilities
│   ├── nft-storage.ts          # NFT storage management
│   ├── nft-types.ts            # NFT type definitions
│   ├── notification-client.ts  # Notification client
│   ├── notification.ts         # Notification utilities
│   ├── redis.ts                # Redis client configuration
│   ├── split-storage.ts        # Split bill storage
│   ├── split-utils.ts          # Split bill utilities
│   ├── types.ts                # Core type definitions
│   └── utils.ts                # General utilities
├── public/                      # Static assets
│   ├── hero.png                # Hero image
│   ├── icon.png                # App icon
│   ├── logo.png                # App logo
│   ├── screenshot.png          # App screenshot
│   └── splash.png              # Splash screen
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # UI components configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

### Key Architectural Patterns

#### 1. **App Router Architecture**

- **File-based routing** with dynamic segments
- **Layout composition** for consistent UI structure
- **API routes** for backend functionality
- **Server and client components** separation

#### 2. **Component Architecture**

- **Atomic design** principles with reusable UI components
- **Compound components** for complex interactions
- **Custom hooks** for business logic encapsulation
- **Context providers** for global state management

#### 3. **Data Flow Architecture**

- **API-first design** with RESTful endpoints
- **Real-time updates** via Redis pub/sub
- **Optimistic updates** for better UX
- **Error boundaries** for graceful failure handling

#### 4. **Blockchain Integration**

- **Multi-network support** with configuration-driven approach
- **Contract abstraction** for USDC operations
- **Transaction management** with status tracking
- **Wallet integration** via OnchainKit and Wagmi

## ✨ Technical Highlights

### 🚀 **Innovative Features**

#### **Base L2 Integration**

- **First L2-native bill splitting app** on Base network
- **USDC-first approach** with precise 6-decimal calculations
- **Sponsored transactions** for seamless user experience
- **Real-time blockchain state** synchronization

#### **Social-First Design**

- **Farcaster Mini App** integration for social discovery
- **Friend management system** with leaderboards
- **Social sharing** with QR codes and deep links
- **Community-driven** features and interactions

#### **Advanced UX Patterns**

- **Progressive Web App** capabilities for mobile experience
- **Real-time collaboration** with live updates
- **Smart notifications** with contextual awareness
- **Accessibility-first** design with Radix UI primitives

### 🎯 **Technical Innovations**

#### **Hybrid Architecture**

- **Serverless API** with Redis caching layer
- **Edge computing** via Vercel deployment
- **Real-time sync** between frontend and blockchain
- **Optimistic updates** for instant user feedback

#### **Blockchain UX Optimization**

- **Gas fee optimization** through transaction batching
- **Fallback mechanisms** for network issues
- **Transaction status tracking** with user-friendly updates
- **Multi-wallet support** for maximum compatibility

#### **Performance Engineering**

- **Code splitting** with dynamic imports
- **Image optimization** with WebP and responsive loading
- **Bundle optimization** through tree shaking
- **Mobile-first** performance optimizations

## 🔮 Future Roadmap

### 🚀 **Planned Features**

#### **Multi-chain Expansion**

- **Ethereum Mainnet** integration for broader adoption
- **Polygon** for lower gas fees
- **Arbitrum** for high-performance transactions
- **Cross-chain bridges** for seamless asset movement

#### **Advanced Social Features**

- **Friend leaderboards** and achievement systems
- **Social payments** with social media integration
- **Group management** with roles and permissions
- **Event planning** with bill splitting integration

#### **Enhanced Analytics**

- **Payment analytics** with spending insights
- **Group spending patterns** and trends
- **Personal finance tracking** and budgeting
- **Tax reporting** and export capabilities

#### **Mobile Applications**

- **Native iOS app** with Apple Pay integration
- **Android app** with Google Pay support
- **Offline capabilities** with local storage
- **Push notifications** for real-time updates

### 🏗 **Technical Improvements**

#### **Infrastructure Scaling**

- **PostgreSQL migration** for persistent data storage
- **Microservices architecture** for better scalability
- **GraphQL API** for flexible data querying
- **CDN optimization** for global performance

#### **Blockchain Enhancements**

- **Smart contract upgrades** with new features
- **Layer 3 solutions** for ultra-low fees
- **Privacy features** with zero-knowledge proofs
- **DeFi integration** for yield generation

#### **AI & Machine Learning**

- **Smart bill categorization** with ML
- **Fraud detection** using AI algorithms
- **Personalized recommendations** for users
- **Predictive analytics** for spending patterns

#### **Developer Experience**

- **SDK development** for third-party integrations
- **API documentation** with interactive examples
- **Developer portal** with analytics and tools
- **Plugin system** for extensibility

### 🌐 **Ecosystem Integration**

#### **DeFi Partnerships**

- **Lending protocols** for bill financing
- **Yield farming** with USDC deposits
- **Insurance products** for payment protection
- **Staking rewards** for active users

#### **Enterprise Solutions**

- **B2B bill splitting** for corporate expenses
- **API access** for business integrations
- **White-label solutions** for partners
- **Enterprise security** and compliance features

#### **Global Expansion**

- **Multi-language support** for international users
- **Local payment methods** integration
- **Regional compliance** and regulations
- **Cultural adaptations** for different markets

## 🔧 Technical Details

### Base Pay Integration

#### USDC Contract Integration

- **Contract Addresses**:
  - Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
  - Testnet: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Token Standard**: ERC-20 USDC with 6 decimal places
- **Network**: Base (L2 Ethereum rollup)

#### Payment Flow

1. **Amount Calculation**: Precise USDC amount calculation with 6 decimal precision
2. **Transaction Building**: USDC transfer call data generation
3. **Wallet Integration**: Multi-wallet support via OnchainKit
4. **Transaction Monitoring**: Real-time status tracking and confirmation
5. **Receipt Generation**: Optional NFT receipt minting

#### Sponsored Transactions

- **Gas Fee Coverage**: Optional gas fee sponsorship for users
- **Transaction Optimization**: Batch transactions for cost efficiency
- **Fallback Handling**: Graceful degradation for non-sponsored transactions

### Data Storage Architecture

#### Redis Implementation

- **Storage Strategy**: Temporary storage with TTL (Time To Live)
- **Data Types**: Strings, Hashes, Lists, Sets
- **Key Patterns**:
  - `split:{billId}` - Split bill data
  - `participants:{billId}` - Participant list
  - `transactions:{billId}` - Transaction records
  - `friends:{address}` - User friend list

#### Data Models & Relationships

```typescript
// Core entities and relationships
SplitBill (1) ←→ (N) Participant
Participant (1) ←→ (1) PaymentTransaction
Participant (1) ←→ (1) NFTReceipt
User (1) ←→ (N) Friend
```

#### Caching Strategy

- **Hot Data**: Active splits and recent transactions
- **Warm Data**: User preferences and friend lists
- **Cold Data**: Completed splits and historical data
- **TTL Management**: Automatic expiration for temporary data

### Notification System

#### Real-time Updates

- **WebSocket Integration**: Real-time status updates
- **Push Notifications**: Mobile push for important events
- **Email Integration**: Optional email notifications
- **In-app Notifications**: Toast messages and status updates

#### Notification Types

- **Payment Received**: When a participant pays
- **Bill Completed**: When all participants have paid
- **Payment Reminder**: Automated reminders for pending payments
- **Friend Activity**: Social notifications for friend interactions

### NFT Receipt System

#### Generation Process

1. **Metadata Creation**: Bill details and participant information
2. **Image Composition**: Dynamic receipt image generation
3. **IPFS Storage**: Decentralized metadata storage
4. **Contract Minting**: ERC-721 token creation
5. **Verification**: On-chain receipt verification

#### NFT Features

- **Dynamic Content**: Real-time bill information
- **Verification**: On-chain proof of payment
- **Sharing**: Social media integration
- **Collection**: User receipt gallery

### Performance Optimizations

#### Frontend Performance

- **Code Splitting**: Dynamic imports for route-based code splitting
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Lazy Loading**: Component and route lazy loading

#### Backend Performance

- **Connection Pooling**: Efficient Redis connection management
- **Query Optimization**: Optimized data retrieval patterns
- **Caching Layers**: Multi-level caching strategy
- **Async Operations**: Non-blocking I/O operations

#### Mobile Optimizations

- **MiniKit Integration**: Frame-specific performance optimizations
- **Touch Interactions**: Optimized touch event handling
- **Safe Area**: Proper mobile safe area handling
- **Progressive Enhancement**: Graceful degradation for older devices

### Security Implementation

#### Input Validation & Sanitization

- **Zod Schemas**: Type-safe validation for all inputs
- **XSS Prevention**: Input sanitization and output encoding
- **SQL Injection**: Parameterized queries and input validation
- **Rate Limiting**: API abuse prevention with rate limiting

#### Blockchain Security

- **Address Validation**: Ethereum address format verification
- **Amount Validation**: USDC decimal precision validation
- **Transaction Verification**: Hash validation and confirmation
- **Contract Verification**: Verified smart contract interactions

#### Data Security

- **Encryption**: Sensitive data encryption at rest
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive activity logging
- **Data Privacy**: GDPR-compliant data handling

## 🚀 Deployment

### Production Deployment

#### Vercel (Recommended)

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Or use Vercel CLI
vercel
```

#### Environment Configuration

```bash
# Required environment variables
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=SplitBase
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_ICON_URL=https://your-domain.com/icon.png
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key

# Frame metadata
NEXT_PUBLIC_APP_SUBTITLE=A new bill-splitting experience
NEXT_PUBLIC_APP_DESCRIPTION=Quickly split and settle with Base Pay and USDC
NEXT_PUBLIC_APP_TAGLINE=Base Pay splitting, easy settlement

# Redis configuration
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

#### Infrastructure Requirements

- **Domain**: Custom domain with HTTPS
- **CDN**: Global content delivery network
- **Redis**: Upstash Redis for data storage
- **Monitoring**: Vercel Analytics and Speed Insights
- **SSL**: Automatic HTTPS via Vercel

### Development Environment

#### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Development Tools

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Hot Reload**: Fast development iteration

## 🔧 Development Workflow

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation

### Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing
- **Performance Tests**: Load and stress testing

### CI/CD Pipeline

- **GitHub Actions**: Automated testing and deployment
- **Vercel Integration**: Automatic deployments on push
- **Environment Management**: Staging and production separation
- **Rollback Strategy**: Quick rollback capabilities

## 📊 Monitoring & Analytics

### Performance Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: Webpack bundle size monitoring
- **Error Tracking**: Sentry integration for error monitoring
- **User Analytics**: Anonymous usage analytics

### Blockchain Monitoring

- **Transaction Success Rate**: Payment success tracking
- **Gas Fee Analysis**: Cost optimization monitoring
- **Network Health**: Base network status monitoring
- **Contract Events**: Smart contract interaction tracking

## 🔮 Future Roadmap

### 🚀 **Planned Features**

#### **Multi-chain Expansion**

- **Ethereum Mainnet** integration for broader adoption
- **Polygon** for lower gas fees
- **Arbitrum** for high-performance transactions
- **Cross-chain bridges** for seamless asset movement

#### **Advanced Social Features**

- **Friend leaderboards** and achievement systems
- **Social payments** with social media integration
- **Group management** with roles and permissions
- **Event planning** with bill splitting integration

#### **Enhanced Analytics**

- **Payment analytics** with spending insights
- **Group spending patterns** and trends
- **Personal finance tracking** and budgeting
- **Tax reporting** and export capabilities

#### **Mobile Applications**

- **Native iOS app** with Apple Pay integration
- **Android app** with Google Pay support
- **Offline capabilities** with local storage
- **Push notifications** for real-time updates

### 🏗 **Technical Improvements**

#### **Infrastructure Scaling**

- **PostgreSQL migration** for persistent data storage
- **Microservices architecture** for better scalability
- **GraphQL API** for flexible data querying
- **CDN optimization** for global performance

#### **Blockchain Enhancements**

- **Smart contract upgrades** with new features
- **Layer 3 solutions** for ultra-low fees
- **Privacy features** with zero-knowledge proofs
- **DeFi integration** for yield generation

#### **AI & Machine Learning**

- **Smart bill categorization** with ML
- **Fraud detection** using AI algorithms
- **Personalized recommendations** for users
- **Predictive analytics** for spending patterns

#### **Developer Experience**

- **SDK development** for third-party integrations
- **API documentation** with interactive examples
- **Developer portal** with analytics and tools
- **Plugin system** for extensibility

### 🌐 **Ecosystem Integration**

#### **DeFi Partnerships**

- **Lending protocols** for bill financing
- **Yield farming** with USDC deposits
- **Insurance products** for payment protection
- **Staking rewards** for active users

#### **Enterprise Solutions**

- **B2B bill splitting** for corporate expenses
- **API access** for business integrations
- **White-label solutions** for partners
- **Enterprise security** and compliance features

#### **Global Expansion**

- **Multi-language support** for international users
- **Local payment methods** integration
- **Regional compliance** and regulations
- **Cultural adaptations** for different markets

## 📖 Learn More

### Official Documentation

- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview) - Farcaster Mini App framework
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/getting-started) - Base blockchain integration
- [Base Developer Docs](https://docs.base.org) - Base network development
- [USDC on Base](https://www.centre.io/usdc-multichain/base) - USDC token information

### Community Resources

- [Base Discord](https://discord.gg/base) - Developer community
- [Farcaster Discord](https://discord.gg/farcaster) - Social protocol community
- [Base Builders](https://www.base.org/builders) - Builder resources and grants

### Related Projects

- [Base Pay](https://www.base.org/base-pay) - Base payment solution
- [Farcaster](https://farcaster.xyz) - Decentralized social protocol
- [Mini Apps](https://docs.base.org/builderkits/minikit/overview) - Mini application ecosystem

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Base Team** - For building an amazing L2 ecosystem
- **Farcaster Team** - For the social protocol infrastructure
- **OnchainKit Team** - For the blockchain integration tools
- **Open Source Community** - For the amazing tools and libraries

---

**SplitBase** - Making bill splitting simple, social, and secure on Base. 🚀
