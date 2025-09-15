"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import WalletModalProvider with ssr disabled
const WalletModalProvider = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletModalProvider
    ),
  { ssr: false }
);

require("@solana/wallet-adapter-react-ui/styles.css");

const NetworkIndicator = ({ endpoint }: { endpoint: string }) => {
  const getNetworkName = () => {
    if (endpoint.includes("127.0.0.1") || endpoint.includes("localhost")) {
      return "Localnet";
    } else if (endpoint.includes("devnet")) {
      return "Devnet";
    } else if (endpoint.includes("mainnet")) {
      return "Mainnet";
    }
    return "Unknown Network";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
      {getNetworkName()}
    </div>
  );
};

export function Providers({ children }: { children: React.ReactNode }) {
  // Configure for localnet (localhost) or devnet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () =>
      // Use localhost for local development, devnet for testing
      process.env.NEXT_PUBLIC_USE_LOCALNET === "true"
        ? "https://api.devnet.solana.com"
        : "https://api.devnet.solana.com",
    [network]
  );
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
          <NetworkIndicator endpoint={endpoint} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
