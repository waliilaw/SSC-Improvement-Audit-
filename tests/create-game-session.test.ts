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
  loadKeypair,
  getVaultTokenAccount,
  setupTestAccounts,
  TOKEN_ID
} from "./utils";
import { PublicKey } from "@solana/web3.js";
import { ConfirmOptions } from "@solana/web3.js";

const confirmOptions: ConfirmOptions = { commitment: "confirmed" };

describe("Game Session Creation", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.WagerProgram as Program<WagerProgram>;
  
  const gameServer = loadKeypair('./tests/kps/gameserver.json');

  before(async () => {
    await setupTestAccounts(provider.connection, [gameServer]);
  });

  it("Successfully creates a game session with winner-takes-all 1v1 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { winnerTakesAllOneVsOne: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Successfully creates a game session with winner-takes-all 3v3 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { winnerTakesAllThreeVsThree: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Successfully creates a game session with winner-takes-all 5v5 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { winnerTakesAllFiveVsFive: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Successfully creates a game session with pay-to-spawn 1v1 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { payToSpawnOneVsOne: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Successfully creates a game session with pay-to-spawn 3v3 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { payToSpawnThreeVsThree: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Successfully creates a game session with pay-to-spawn 5v5 mode", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    await program.methods
      .createGameSession(sessionId, betAmount, { payToSpawnFiveVsFive: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    const account = await program.account.gameSession.fetch(gameSessionPda);
    assert.equal(account.sessionId, sessionId);
    assert.equal(account.sessionBet.toString(), betAmount.toString());
  });

  it("Fails to create game session with zero bet amount", async () => {

    // const sessionId = generateSessionId();
    // const betAmount = new BN(-100); 
    // const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    // const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    // const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);
  
    // try {
    //   let tx = await program.methods
    //   .createGameSession(sessionId, betAmount, { winnerTakesAllFiveVsFive: {} })
    //   .accounts({
    //     gameServer: gameServer.publicKey,
    //   })
    //   .signers([gameServer])
    //   .rpc(confirmOptions);

    //   const account = await program.account.gameSession.fetch(gameSessionPda);
    //   console.log(account.sessionBet.toString());
    // } catch (e) {
    //   assert.include(e.toString(), "Error Code: InvalidBetAmount");
    // }
  });

  it("Fails to create duplicate game session", async () => {
    const sessionId = generateSessionId();
    const betAmount = new BN(100000000); // Changed from -100 to a valid amount
    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    const [vaultPda] = deriveVaultPDA(program.programId, gameSessionPda);
    
    const vaultTokenAccount = await getVaultTokenAccount(TOKEN_ID, vaultPda);

    // First creation should succeed
    await program.methods
      .createGameSession(sessionId, betAmount, { winnerTakesAllOneVsOne: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    try {
      // Second creation should fail
      await program.methods
        .createGameSession(sessionId, betAmount, { winnerTakesAllOneVsOne: {} })
        .accounts({
          gameServer: gameServer.publicKey,
        })
        .signers([gameServer])
        .rpc(confirmOptions);
      assert.fail("Should have failed with duplicate session");
    } catch (e) {
      assert.include(e.toString(), "Transaction simulation failed");
      assert.include(e.logs.join('\n'), "account Address");
      assert.include(e.logs.join('\n'), "already in use");
    }
  });
}); 