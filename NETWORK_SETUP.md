# Network Configuration Guide

## Overview

This project supports both Base mainnet and Base Sepolia testnet. You can easily switch between networks by modifying the configuration.

## Current Configuration

The project is currently configured to use **Base Sepolia Testnet**.

## Network Details

### Base Sepolia Testnet (Current)

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **USDC Contract**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **Status**: Testnet

### Base Mainnet

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **USDC Contract**: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
- **Status**: Mainnet

## How to Switch Networks

### 1. Switch to Base Sepolia Testnet

```typescript
// In lib/config.ts
export const CURRENT_NETWORK = NETWORK_CONFIG.baseSepolia;
```

```typescript
// In app/providers.tsx
import { baseSepolia } from "wagmi/chains";
// ...
chain = { baseSepolia };
```

### 2. Switch to Base Mainnet

```typescript
// In lib/config.ts
export const CURRENT_NETWORK = NETWORK_CONFIG.base;
```

```typescript
// In app/providers.tsx
import { base } from "wagmi/chains";
// ...
chain = { base };
```

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Base Sepolia Testnet
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CHAIN_NAME="Base Sepolia"
NEXT_PUBLIC_RPC_URL="https://sepolia.base.org"
NEXT_PUBLIC_EXPLORER_URL="https://sepolia.basescan.org"

# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="SplitBase"
NEXT_PUBLIC_ICON_URL="/icon.png"

# App Configuration
NEXT_PUBLIC_URL="http://localhost:3000"
```

## Testing on Base Sepolia

### Getting Test USDC

1. Visit the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request test USDC

### Getting Test ETH

1. Visit the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request test ETH for gas fees

## Important Notes

1. **Testnet vs Mainnet**: Always test on Sepolia before deploying to mainnet
2. **Contract Addresses**: Different networks have different contract addresses
3. **Gas Fees**: Testnet transactions are free but mainnet requires real ETH
4. **Data Persistence**: Testnet data is not persistent and may be reset

## Troubleshooting

### Common Issues

1. **Wrong Network**: Ensure your wallet is connected to the correct network
2. **Contract Not Found**: Verify the contract address matches the selected network
3. **Transaction Failed**: Check if you have sufficient test tokens

### Reset Configuration

If you encounter issues, you can reset to the default configuration:

```bash
git checkout -- lib/config.ts
git checkout -- app/providers.tsx
```
