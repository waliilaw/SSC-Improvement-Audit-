"use client";

import { useState, useMemo, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { ProgramUtils } from "../utils/program-utils";
import { PublicKey } from "@solana/web3.js";
import { GameSession } from "../types/game-types";
import { GameMode } from "../types/game-types";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

interface KillRecord {
  killerTeam: number;
  killerAddress: string;
  victimTeam: number;
  victimAddress: string;
}

export default function GameServerView() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState("0.1");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(
    GameMode.payToSpawnOneVsOne
  );
  const [mounted, setMounted] = useState(false);
  const [killRecord, setKillRecord] = useState<KillRecord>({
    killerTeam: 0,
    killerAddress: "",
    victimTeam: 1,
    victimAddress: "",
  });
  const [fetchSessionId, setFetchSessionId] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const programUtils = useMemo(() => {
    if (connection && typeof window !== "undefined" && window.solana) {
      return new ProgramUtils(connection, window.solana);
    }
    return undefined;
  }, [connection]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const createGameSession = async () => {
    if (!connected || !publicKey || !programUtils) {
      addLog("Please connect your wallet first");
      return;
    }

    try {
      const sessionId = `game${Math.floor(Math.random() * 1000)}`;
      const betAmountLamports = new anchor.BN(
        Math.floor(parseFloat(betAmount) * LAMPORTS_PER_SOL)
      );

      // Create the game mode object based on the selected mode
      const gameMode = { [selectedGameMode]: {} };

      const tx = await programUtils.createGameSession(
        sessionId,
        betAmountLamports.toNumber(),
        gameMode
      );

      addLog(`Created game session ${sessionId}`);
      addLog(`Transaction signature: ${tx}`);

      // Wait for transaction confirmation
      addLog("Waiting for transaction confirmation...");
      const confirmation = await connection.confirmTransaction(tx);

      if (confirmation.value.err) {
        addLog("Error confirming transaction");
        return;
      }

      addLog("Transaction confirmed");

      // Add small additional delay to ensure account is available
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now refresh the game session
      await refreshGameSession(sessionId);
    } catch (error: any) {
      addLog(
        `Error creating game session: ${error?.message || "Unknown error"}`
      );
      console.error(error);
    }
  };

  const refreshGameSession = async (sessionId: string) => {
    if (!programUtils) {
      addLog("Program not initialized");
      return;
    }

    try {
      const sessionData = await programUtils.getGameSession(sessionId);

      // Add detailed console logging
      console.log("Game Session Data:", {
        id: sessionId,
        betAmount: sessionData.betAmount.toNumber() / LAMPORTS_PER_SOL,
        creator: sessionData.creator.toString(),
        status: sessionData.status,
        teamA: {
          players: sessionData.teamA.players.map((p) => p.toString()),
          kills: sessionData.teamA.playerKills,
          spawns: sessionData.teamA.playerSpawns,
          activePlayers: sessionData.teamA.players.filter(
            (p) => p.toString() !== PublicKey.default.toString()
          ).length,
          totalKills: sessionData.teamA.playerKills.reduce((a, b) => a + b, 0),
        },
        teamB: {
          players: sessionData.teamB.players.map((p) => p.toString()),
          kills: sessionData.teamB.playerKills,
          spawns: sessionData.teamB.playerSpawns,
          activePlayers: sessionData.teamB.players.filter(
            (p) => p.toString() !== PublicKey.default.toString()
          ).length,
          totalKills: sessionData.teamB.playerKills.reduce((a, b) => a + b, 0),
        },
      });

      setGameSession({
        id: sessionId,
        betAmount: sessionData.betAmount.toNumber() / LAMPORTS_PER_SOL,
        creator: sessionData.creator.toString(),
        teamA: {
          players: sessionData.teamA.players.map((p) => p.toString()),
          playerKills: sessionData.teamA.playerKills,
          playerSpawns: sessionData.teamA.playerSpawns,
        },
        teamB: {
          players: sessionData.teamB.players.map((p) => p.toString()),
          playerKills: sessionData.teamB.playerKills,
          playerSpawns: sessionData.teamB.playerSpawns,
        },
        status: sessionData.status,
      });
      addLog("Game session refreshed");
    } catch (error: any) {
      addLog(`Error refreshing session: ${error?.message || "Unknown error"}`);
    }
  };

  const recordKill = async (
    sessionId: string,
    killerTeam: number,
    killerAddress: string,
    victimTeam: number,
    victimAddress: string
  ) => {
    if (!programUtils) return;

    try {
      const tx = await programUtils.recordKill(
        sessionId,
        killerTeam,
        killerAddress,
        victimTeam,
        victimAddress
      );
      addLog(`Kill recorded. Transaction: ${tx}`);
      await refreshGameSession(sessionId);
    } catch (error: any) {
      addLog(`Error recording kill: ${error?.message || "Unknown error"}`);
    }
  };

  const distributeWinnings = async (sessionId: string, winningTeam: number) => {
    if (!programUtils) return;

    try {
      const tx = await programUtils.distributeWinnings(sessionId, winningTeam);
      addLog(`Winnings distributed to team ${winningTeam}. Transaction: ${tx}`);
      await refreshGameSession(sessionId);
    } catch (error: any) {
      addLog(
        `Error distributing winnings: ${error?.message || "Unknown error"}`
      );
    }
  };

  const handleRecordKill = async () => {
    if (!gameSession) return;

    try {
      const tx = await programUtils?.recordKill(
        gameSession.id,
        killRecord.killerTeam,
        killRecord.killerAddress,
        killRecord.victimTeam,
        killRecord.victimAddress
      );

      addLog(`Kill recorded. Transaction: ${tx}`);
      await refreshGameSession(gameSession.id);
    } catch (error: any) {
      addLog(`Error recording kill: ${error?.message || "Unknown error"}`);
    }
  };

  const fetchExistingSession = async () => {
    if (!programUtils || !fetchSessionId) {
      addLog("Please enter a session ID");
      return;
    }

    try {
      await refreshGameSession(fetchSessionId);
      addLog(`Successfully fetched session ${fetchSessionId}`);
    } catch (error: any) {
      addLog(`Error fetching session: ${error?.message || "Unknown error"}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Game Server Dashboard
          </h1>
          <WalletMultiButton />
        </div>

        {connected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Game Creation Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Create New Game</h2>
              <div className="space-y-2">
                <select
                  value={selectedGameMode}
                  onChange={(e) =>
                    setSelectedGameMode(e.target.value as GameMode)
                  }
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {Object.values(GameMode).map((mode: GameMode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  step="0.1"
                  min="0.1"
                />
                <button
                  onClick={createGameSession}
                  className="w-full bg-blue-600 text-white p-2 rounded"
                >
                  Create Game Session
                </button>
              </div>
            </div>

            {/* Fetch Existing Session Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Fetch Existing Game</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  value={fetchSessionId}
                  onChange={(e) => setFetchSessionId(e.target.value)}
                  placeholder="Enter Session ID"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={fetchExistingSession}
                  className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                >
                  Fetch Session
                </button>
              </div>
            </div>

            {/* Game Status Panel */}
            {gameSession && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Active Game Session</h2>
                  <button
                    onClick={() => refreshGameSession(gameSession.id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="p-4 border rounded">
                  <p>Session ID: {gameSession.id}</p>
                  <p>Status: {gameSession.status}</p>
                  <p>Bet Amount: {gameSession.betAmount} SOL</p>

                  {/* Team Statistics */}
                  <div className="mt-4 space-y-4">
                    <div className="p-4 border rounded">
                      <h3 className="font-semibold text-lg">Team A</h3>
                      <div className="mt-2">
                        <h4 className="font-medium">Players:</h4>
                        {gameSession.teamA.players
                          .filter(
                            (player) =>
                              player.toString() !== PublicKey.default.toString()
                          )
                          .map((player, index) => (
                            <div key={index} className="ml-2 text-sm">
                              <p>Address: {player.toString()}</p>
                              <p>
                                Kills: {gameSession.teamA.playerKills[index]}
                              </p>
                              <p>
                                Spawns Left:{" "}
                                {gameSession.teamA.playerSpawns[index]}
                              </p>
                            </div>
                          ))}
                      </div>
                      <p className="mt-2">
                        Total Players:{" "}
                        {
                          gameSession.teamA.players.filter(
                            (player) =>
                              player.toString() !== PublicKey.default.toString()
                          ).length
                        }
                      </p>
                      <p>
                        Total Kills:{" "}
                        {gameSession.teamA.playerKills.reduce(
                          (a, b) => a + b,
                          0
                        )}
                      </p>
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-semibold text-lg">Team B</h3>
                      <div className="mt-2">
                        <h4 className="font-medium">Players:</h4>
                        {gameSession.teamB.players
                          .filter(
                            (player) =>
                              player.toString() !== PublicKey.default.toString()
                          )
                          .map((player, index) => (
                            <div key={index} className="ml-2 text-sm">
                              <p>Address: {player.toString()}</p>
                              <p>
                                Kills: {gameSession.teamB.playerKills[index]}
                              </p>
                              <p>
                                Spawns Left:{" "}
                                {gameSession.teamB.playerSpawns[index]}
                              </p>
                            </div>
                          ))}
                      </div>
                      <p className="mt-2">
                        Total Players:{" "}
                        {
                          gameSession.teamB.players.filter(
                            (player) =>
                              player.toString() !== PublicKey.default.toString()
                          ).length
                        }
                      </p>
                      <p>
                        Total Kills:{" "}
                        {gameSession.teamB.playerKills.reduce(
                          (a, b) => a + b,
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Record Kill Form */}
                  <div className="mt-6 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Record Kill</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Killer Team
                          </label>
                          <select
                            value={killRecord.killerTeam}
                            onChange={(e) =>
                              setKillRecord((prev) => ({
                                ...prev,
                                killerTeam: Number(e.target.value),
                              }))
                            }
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value={0}>Team A</option>
                            <option value={1}>Team B</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Killer Address
                          </label>
                          <input
                            type="text"
                            value={killRecord.killerAddress}
                            onChange={(e) =>
                              setKillRecord((prev) => ({
                                ...prev,
                                killerAddress: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Enter killer's public key"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Victim Team
                          </label>
                          <select
                            value={killRecord.victimTeam}
                            onChange={(e) =>
                              setKillRecord((prev) => ({
                                ...prev,
                                victimTeam: Number(e.target.value),
                              }))
                            }
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value={0}>Team A</option>
                            <option value={1}>Team B</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Victim Address
                          </label>
                          <input
                            type="text"
                            value={killRecord.victimAddress}
                            onChange={(e) =>
                              setKillRecord((prev) => ({
                                ...prev,
                                victimAddress: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Enter victim's public key"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleRecordKill}
                        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
                      >
                        Record Kill
                      </button>
                    </div>
                  </div>

                  {/* Game Controls */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => distributeWinnings(gameSession.id, 0)}
                      className="w-full bg-green-600 text-white p-2 rounded"
                    >
                      Team A Wins
                    </button>
                    <button
                      onClick={() => distributeWinnings(gameSession.id, 1)}
                      className="w-full bg-green-600 text-white p-2 rounded"
                    >
                      Team B Wins
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Logs */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4">Transaction Logs</h2>
              <div className="h-48 overflow-y-auto border rounded p-4">
                {logs.map((log, i) => (
                  <div key={i} className="text-sm">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl">Please connect your wallet to continue</p>
          </div>
        )}
      </main>
    </div>
  );
}
