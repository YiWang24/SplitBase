// Network configuration for different environments
export const NETWORK_CONFIG = {
  // Base Sepolia Testnet
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    usdcContractAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isTestnet: true,
  },
  // Base Mainnet
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    usdcContractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    isTestnet: false,
  },
} as const;

// Current network configuration
export const CURRENT_NETWORK = NETWORK_CONFIG.baseSepolia;

// Export current network settings
export const {
  chainId,
  name: chainName,
  rpcUrl,
  explorerUrl,
  usdcContractAddress,
  isTestnet,
} = CURRENT_NETWORK;
