"use client";

import { useState, useMemo, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { ProgramUtils } from "../utils/program-utils";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { GameSession } from "../types/game-types";
import { PayToSpawnButton } from "../components/PayToSpawnButton";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function PlayerView() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [sessionId, setSessionId] = useState("");
  const [gameServerPubkey, setGameServerPubkey] = useState("");
  const [team, setTeam] = useState<number>(0);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

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

  const joinSession = async () => {
    if (!connected || !publicKey || !programUtils) {
      addLog("Please connect your wallet first");
      return;
    }

    try {
      const tx = await programUtils.joinUser(
        sessionId,
        team,
        new PublicKey(gameServerPubkey)
      );
      addLog(`Joined game session. Transaction: ${tx}`);
      await refreshGameSession();
    } catch (error: any) {
      addLog(`Error joining session: ${error?.message || "Unknown error"}`);
    }
  };

  const refreshGameSession = async () => {
    if (!programUtils || !sessionId) return;

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
    } catch (error: any) {
      addLog(`Error refreshing session: ${error?.message || "Unknown error"}`);
    }
  };

  const fetchExistingSession = async () => {
    if (!programUtils || !sessionId) {
      addLog("Please enter a session ID");
      return;
    }

    try {
      await refreshGameSession();
      addLog(`Successfully fetched session ${sessionId}`);
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
            Player Dashboard
          </h1>
          <WalletMultiButton />
        </div>

        {connected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Join Game Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Join or Fetch Game</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Session ID"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  value={gameServerPubkey}
                  onChange={(e) => setGameServerPubkey(e.target.value)}
                  placeholder="Game Server Public Key"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <select
                  value={team}
                  onChange={(e) => setTeam(Number(e.target.value))}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value={0}>Team A</option>
                  <option value={1}>Team B</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={joinSession}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                  >
                    Join Game
                  </button>
                  <button
                    onClick={fetchExistingSession}
                    className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                  >
                    Fetch Session
                  </button>
                </div>
              </div>
            </div>

            {/* Game Status Panel */}
            {gameSession && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Game Status</h2>
                <div className="p-4 border rounded space-y-4">
                  <div>
                    <p>Session ID: {gameSession.id}</p>
                    <p>Status: {gameSession.status}</p>
                    <p>Bet Amount: {gameSession.betAmount} SOL</p>
                  </div>

                  {/* Team A Stats */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <h3 className="font-semibold">Team A</h3>
                    <div className="mt-2 space-y-2">
                      {gameSession.teamA.players
                        .filter(
                          (player) =>
                            player.toString() !== PublicKey.default.toString()
                        )
                        .map((player, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">
                              {player.toString() === publicKey?.toString()
                                ? "You"
                                : `Player ${index + 1}`}
                            </p>
                            <p>Kills: {gameSession.teamA.playerKills[index]}</p>
                            <p>
                              Spawns Left:{" "}
                              {gameSession.teamA.playerSpawns[index]}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Team B Stats */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <h3 className="font-semibold">Team B</h3>
                    <div className="mt-2 space-y-2">
                      {gameSession.teamB.players
                        .filter(
                          (player) =>
                            player.toString() !== PublicKey.default.toString()
                        )
                        .map((player, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">
                              {player.toString() === publicKey?.toString()
                                ? "You"
                                : `Player ${index + 1}`}
                            </p>
                            <p>Kills: {gameSession.teamB.playerKills[index]}</p>
                            <p>
                              Spawns Left:{" "}
                              {gameSession.teamB.playerSpawns[index]}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Pay to Spawn Button */}
                  {gameSession.status === "inProgress" && (
                    <div className="mt-4">
                      <PayToSpawnButton
                        sessionId={sessionId}
                        team={team}
                        connection={connection}
                        onSpawnSuccess={() => {
                          addLog("Successfully paid to spawn");
                          refreshGameSession();
                        }}
                      />
                    </div>
                  )}
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
