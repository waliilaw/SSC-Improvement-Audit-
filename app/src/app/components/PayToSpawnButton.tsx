"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ProgramUtils } from "../utils/program-utils";
import { Connection } from "@solana/web3.js";

interface PayToSpawnButtonProps {
  sessionId: string;
  team: number;
  connection: Connection;
  onSpawnSuccess?: () => void;
}

export function PayToSpawnButton({
  sessionId,
  team,
  connection,
  onSpawnSuccess,
}: PayToSpawnButtonProps) {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayToSpawn = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    try {
      // Create a wallet adapter object that matches the expected interface
      const walletAdapter = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };

      const programUtils = new ProgramUtils(connection, walletAdapter);
      await programUtils.payToSpawn(sessionId, team);
      onSpawnSuccess?.();
    } catch (error) {
      console.error("Error paying to spawn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayToSpawn}
      disabled={isLoading || !wallet.connected}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
    >
      {isLoading ? "Processing..." : "Pay to Spawn"}
    </button>
  );
}
