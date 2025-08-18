# Quick Start Guide - Base Sepolia Testnet

## 🚀 Quick Network Switch

Your project is now configured to use **Base Sepolia Testnet**! Here's what you need to know:

### ✅ What's Already Done

- ✅ Network configuration updated to Base Sepolia
- ✅ USDC contract address updated for testnet
- ✅ Wagmi chain configuration updated
- ✅ Network switching scripts created

### 🔄 How to Switch Networks (if needed)

#### Option 1: Using npm scripts (Recommended)

```bash
# Switch to Base Sepolia testnet
npm run network:sepolia

# Switch to Base mainnet
npm run network:mainnet

# Check current network
npm run network:status
```

#### Option 2: Using the script directly

```bash
# Switch to Base Sepolia testnet
node scripts/switch-network.js sepolia

# Switch to Base mainnet
node scripts/switch-network.js mainnet

# Check current network
node scripts/switch-network.js
```

### 🧪 Testing on Base Sepolia

#### 1. Get Test USDC

Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) to get free test USDC.

#### 2. Get Test ETH

Same faucet provides free test ETH for gas fees.

#### 3. Connect Your Wallet

Make sure your wallet is connected to Base Sepolia testnet (Chain ID: 84532).

### 🚨 Important Notes

1. **Testnet vs Mainnet**: You're now on testnet - transactions are free but data may be reset
2. **Contract Addresses**: Different from mainnet - testnet has its own USDC contract
3. **Token Values**: Testnet tokens have no real value
4. **Data Persistence**: Testnet data is not permanent

### 🔧 Development Workflow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Test Features**: Create split bills, add friends, test payments
3. **Switch to Mainnet**: When ready for production, use `npm run network:mainnet`

### 📱 Wallet Configuration

#### MetaMask

- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

#### Coinbase Wallet

- Automatically detects Base Sepolia when connecting

### 🐛 Troubleshooting

#### Common Issues

1. **Wrong Network**: Ensure wallet is on Base Sepolia (84532)
2. **No Test Tokens**: Get free tokens from the faucet
3. **Transaction Failed**: Check if you have test ETH for gas

#### Reset Configuration

If something goes wrong:

```bash
git checkout -- lib/config.ts
git checkout -- app/providers.tsx
```

### 📚 Next Steps

1. **Test the App**: Create split bills and test all features
2. **Get Feedback**: Test with friends and gather feedback
3. **Deploy**: When ready, switch to mainnet and deploy

### 🌐 Network Information

- **Current Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **USDC Contract**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

---

**Happy Testing! 🎉**

Remember: Testnet is for development and testing only. Never use real funds on testnet!
