import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { 
  getAssociatedTokenAddress, 
  getOrCreateAssociatedTokenAccount,
  getAccount,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";

export const TOKEN_ID = new PublicKey("BzeqmCjLZvMLSTrge9qZnyV8N2zNKBwAxQcZH2XEzFXG");

export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateSessionId(): string {
  return "game" + String(randomIntFromInterval(0, 1000000000));
}

export async function getBalance(connection: anchor.web3.Connection, publicKey: PublicKey): Promise<number> {
  return await connection.getBalance(publicKey);
}

export async function airdropToAccount(
  connection: anchor.web3.Connection,
  publicKey: PublicKey,
  amount: number = LAMPORTS_PER_SOL
): Promise<void> {
  const signature = await connection.requestAirdrop(publicKey, amount);
  await connection.confirmTransaction(signature);
}

export async function createAndFundAccount(
  connection: anchor.web3.Connection,
  amount: number = LAMPORTS_PER_SOL
): Promise<Keypair> {
  const account = Keypair.generate();
  await airdropToAccount(connection, account.publicKey, amount);
  return account;
}

export function deriveGameSessionPDA(programId: PublicKey, sessionId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("game_session"), Buffer.from(sessionId)],
    programId
  );
}

export function deriveVaultPDA(programId: PublicKey, gameSessionPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gameSessionPda.toBuffer()],
    programId
  );
}

export function loadKeypair(path: string): Keypair {
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  return anchor.web3.Keypair.fromSecretKey(new Uint8Array(data));
}

export async function setupTokenAccount(
  connection: Connection,
  payer: Keypair,
  tokenMint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const tokenAccountInfo = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    owner
  );
  return tokenAccountInfo.address;
}

export async function getVaultTokenAccount(
  tokenMint: PublicKey,
  vaultPda: PublicKey,
): Promise<PublicKey> {
  return await getAssociatedTokenAddress(
    tokenMint,
    vaultPda,
    true // allowOwnerOffCurve
  );
}

export async function setupTestAccounts(
  connection: Connection,
  accounts: Keypair[],
  solAmount: number = 2 * LAMPORTS_PER_SOL
): Promise<void> {
  for (const account of accounts) {
    const signature = await connection.requestAirdrop(
      account.publicKey,
      solAmount
    );
    await connection.confirmTransaction(signature);
  }
}


export async function getTokenBalance(connection: Connection, tokenAccount: PublicKey): Promise<number> {
  const info = await connection.getTokenAccountBalance(tokenAccount);
  if (info.value.uiAmount == null) throw new Error('No balance found');
  return info.value.uiAmount;
} 

export const printGameState = async (
    gameState: any,
    message: string,
    vaultTokenAccount?: string,
    connection?: Connection
) => {
    console.log(`\n${message}:`);
    console.log("\nTeam A:");
    gameState.teamA.players.forEach((player: PublicKey, index: number) => {
        if (player.toString() !== PublicKey.default.toString()) {
            console.log(`Player ${player.toString()}:`);
            console.log(`  Kills: ${gameState.teamA.playerKills[index]}`);
            console.log(`  Spawns remaining: ${gameState.teamA.playerSpawns[index]}`);
        }
    });
    
    console.log("\nTeam B:");
    gameState.teamB.players.forEach((player: PublicKey, index: number) => {
        if (player.toString() !== PublicKey.default.toString()) {
            console.log(`Player ${player.toString()}:`);
            console.log(`  Kills: ${gameState.teamB.playerKills[index]}`);
            console.log(`  Spawns remaining: ${gameState.teamB.playerSpawns[index]}`);
        }
    });
    
    console.log("Game status:", gameState.status);
    
    if (vaultTokenAccount && connection) {
        const vaultBalance = await getTokenBalance(connection, new PublicKey(vaultTokenAccount));
        console.log("Vault balance:", vaultBalance);
    }
}; 