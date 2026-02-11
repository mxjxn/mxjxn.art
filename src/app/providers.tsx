"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { APP_URL } from "@/constants";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode } from "react";
import { type State, WagmiProvider } from "wagmi";
import { config } from "@/wagmi";

// AuthKit configuration for web-based Farcaster sign-in
// Using function to defer window access until runtime
function getAuthKitConfig() {
  return {
    rpcUrl: process.env.NEXT_PUBLIC_OP_RPC_URL || "https://mainnet.optimism.io",
    domain: typeof window !== "undefined" ? window.location.host : "localhost:3000",
    siweUri: APP_URL,
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const queryClient = getQueryClient();
  const authKitConfig = getAuthKitConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config} initialState={props.initialState}>
        <AuthKitProvider config={authKitConfig}>
          {props.children}
        </AuthKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
