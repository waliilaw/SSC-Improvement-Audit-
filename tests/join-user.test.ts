import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WagerProgram } from "../app/src/app/types/wager_program";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import {
  generateSessionId,
  deriveGameSessionPDA,
  deriveVaultPDA,
  getBalance,
  TOKEN_ID,
  getTokenBalance,
  getVaultTokenAccount
} from "./utils";
import { 
  getAssociatedTokenAddress, 
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";

describe("Join User Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.WagerProgram as Program<WagerProgram>;

  // Load keypairs from files
  const loadKeypair = (path: string) => {
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    return anchor.web3.Keypair.fromSecretKey(new Uint8Array(data));
  };

  const gameServer = loadKeypair('./tests/kps/gameserver.json');
  const user1 = loadKeypair('./tests/kps/user1.json');
  const user2 = loadKeypair('./tests/kps/user2.json');
  
  let user1TokenAccount: PublicKey;
  let user2TokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;

  before(async () => {
    console.log("Setting up test accounts...");
    console.log("GameServer pubkey:", gameServer.publicKey.toString());
    console.log("User1 pubkey:", user1.publicKey.toString());
    console.log("User2 pubkey:", user2.publicKey.toString());

    // Airdrop SOL to accounts
    console.log("\nAirdropping SOL to accounts...");
    const airdropSignature = await provider.connection.requestAirdrop(
      gameServer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    const airdropSignature1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature1);

    const airdropSignature2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature2);

    // Get or create token accounts
    console.log("\nSetting up token accounts...");
    try {
      const user1TokenAccountInfo = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        gameServer, // payer
        TOKEN_ID,
        user1.publicKey
      );
      user1TokenAccount = user1TokenAccountInfo.address;
      console.log("User1 token account:", user1TokenAccount.toString());

      const user2TokenAccountInfo = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        gameServer, // payer
        TOKEN_ID,
        user2.publicKey
      );
      user2TokenAccount = user2TokenAccountInfo.address;
      console.log("User2 token account:", user2TokenAccount.toString());

      // Verify token accounts
      const user1TokenInfo = await getAccount(provider.connection, user1TokenAccount);
      const user2TokenInfo = await getAccount(provider.connection, user2TokenAccount);
      
      console.log("\nToken Account Balances:");
      console.log("User1 token balance:", user1TokenInfo.amount.toString());
      console.log("User2 token balance:", user2TokenInfo.amount.toString());

    } catch (error) {
      console.error("Error setting up token accounts:", error);
      throw error;
    }
  });

  it("Successfully joins users to both teams", async () => {
    console.log("\nStarting join user test...");
    const sessionId = generateSessionId();
    console.log("Session ID:", sessionId);
    
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    console.log("Bet amount:", betAmount.toString());

    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    console.log("Game session PDA:", gameSessionPda.toString());

    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    console.log("Vault PDA:", vaultPda.toString());

    // Get vault token account address
    vaultTokenAccount = await getAssociatedTokenAddress(
      TOKEN_ID,
      vaultPda,
      true // allowOwnerOffCurve
    );
    console.log("Vault token account:", vaultTokenAccount.toString());

    console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
    console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));

    console.log("\nCreating game session...");
    try {
      await program.methods
        .createGameSession(sessionId, betAmount, { winnerTakesAllOneVsOne: {} })
        .accounts({
          gameServer: gameServer.publicKey,
        })
        .signers([gameServer])
        .rpc();
      console.log("Game session created successfully");
    } catch (error) {
      console.error("Error creating game session:", error);
      throw error;
    }

    console.log("\nJoining user1 to team...");
    try {
      console.log("user1 token account: ", user1TokenAccount.toString());
      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));

      await program.methods
        .joinUser(sessionId, 0)
        .accounts({
          user: user1.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user1TokenAccount,
        })
        .signers([user1])
        .rpc();
      console.log("User joined successfully");

      const account = await program.account.gameSession.fetch(gameSessionPda);
      console.log("\nGame session state after join:");
      console.log("Team A players:", account.teamA.players.map(p => p.toString()));
      assert.equal(account.teamA.players[0].toString(), user1.publicKey.toString());
    } catch (error) {
      console.error("Error joining user:", error);
      throw error;
    }

    console.log("\nJoining user2 to team...");
    try {
      await program.methods
        .joinUser(sessionId, 1)
        .accounts({
          user: user2.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user2TokenAccount,
        })
        .signers([user2])
        .rpc();
      console.log("User joined successfully");

      const account = await program.account.gameSession.fetch(gameSessionPda);
      console.log("\nGame session state after join:");
      console.log("Team B players:", account.teamB.players.map(p => p.toString()));
      assert.equal(account.teamB.players[0].toString(), user2.publicKey.toString());
    } catch (error) {
      console.error("Error joining user:", error);
      throw error;
    }
  });

  // Test case for pay-to-spawn 1v1 mode
  it("Successfully joins users to both teams in pay-to-spawn 1v1 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals

    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    console.log("Game session PDA:", gameSessionPda.toString());

    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    console.log("Vault PDA:", vaultPda.toString());

    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);
    console.log("Vault token account:", vaultTokenAccount.toString());

    console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
    console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));

    console.log("\nCreating game session...");
    try {
      await program.methods
        .createGameSession(sessionId, betAmount, { payToSpawnOneVsOne: {} })
        .accounts({
          gameServer: gameServer.publicKey,
        })
        .signers([gameServer])
        .rpc();
      console.log("Game session created successfully");
    } catch (error) {
      console.error("Error creating game session:", error);
      throw error;
    }

    console.log("\nJoining user1 to team...");
    try {
      console.log("user1 token account: ", user1TokenAccount.toString());
      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));

      await program.methods
        .joinUser(sessionId, 0)
        .accounts({
          user: user1.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user1TokenAccount,
        })
        .signers([user1])
        .rpc();
      console.log("User joined successfully");

      const account = await program.account.gameSession.fetch(gameSessionPda);
      console.log("\nGame session state after join:");
      console.log("Team A players:", account.teamA.players.map(p => p.toString()));
      assert.equal(account.teamA.players[0].toString(), user1.publicKey.toString());
    } catch (error) {
      console.error("Error joining user:", error);
      throw error;
    }

    console.log("\nJoining user2 to team...");
    try {
      await program.methods
        .joinUser(sessionId, 1)
        .accounts({
          user: user2.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user2TokenAccount,
        })
        .signers([user2])
        .rpc();
      console.log("User joined successfully");

      const account = await program.account.gameSession.fetch(gameSessionPda);
      console.log("\nGame session state after join:");
      console.log("Team B players:", account.teamB.players.map(p => p.toString()));
      assert.equal(account.teamB.players[0].toString(), user2.publicKey.toString());
    } catch (error) {
      console.error("Error joining user:", error);
      throw error;
    }
  });
}); 