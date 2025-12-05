import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { mainnet, sepolia, base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { configureFabricSDK } from "@withfabric/protocol-sdks";

export const config = createConfig({
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
  connectors: [
    farcasterFrame(),
    coinbaseWallet(),
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
});

configureFabricSDK({ wagmiConfig: config });

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
