"use client";

import { type ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { createConfig, WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { coinbaseWallet } from 'wagmi/connectors';
// Create a client
const queryClient = new QueryClient();

// Create wagmi config
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    coinbaseWallet({
      appName: 'onchainkit',
    }),
  ],
  // Enable connection persistence
  ssr: true,
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: "auto",
              theme: "snake",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
            wallet: {
              display: "modal",
              preference: "smartWalletOnly",
            },
          }}
        >
          {props.children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
