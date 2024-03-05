"use client";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

function ConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isDisconnected, chain } = useAccount();
  const shortAddy = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="space-x-4">
      <button className="border border-white hover:border-blue-200 p-3 rounded-xl" onClick={() => open()}>
        {isConnecting ? "Connecting..." : isDisconnected ? "Connect" : shortAddy}
      </button>
    </div>
  );
}
export { ConnectButton };
