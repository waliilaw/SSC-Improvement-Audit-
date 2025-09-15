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
  setupTokenAccount,
  setupTestAccounts,
  getBalance,
  getVaultTokenAccount,
  TOKEN_ID,
  getTokenBalance,
  printGameState
} from "./utils";
import { PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";
import { ConfirmOptions } from "@solana/web3.js";
import {AccountLayout, TOKEN_PROGRAM_ID} from "@solana/spl-token";

describe("Distribute Winnings Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.WagerProgram as Program<WagerProgram>;

  const gameServer = loadKeypair('./tests/kps/gameserver.json');
  const user1 = loadKeypair('./tests/kps/user1.json');
  const user2 = loadKeypair('./tests/kps/user2.json');
  const user3 = loadKeypair('./tests/kps/user3.json');
  const user4 = loadKeypair('./tests/kps/user4.json');
  const user5 = loadKeypair('./tests/kps/user5.json');
  const user6 = loadKeypair('./tests/kps/user6.json');
  const user7 = loadKeypair('./tests/kps/user7.json');
  const user8 = loadKeypair('./tests/kps/user8.json');
  const user9 = loadKeypair('./tests/kps/user9.json');
  const user10 = loadKeypair('./tests/kps/user10.json');

  let user1TokenAccount: PublicKey;
  let user2TokenAccount: PublicKey;
  let user3TokenAccount: PublicKey;
  let user4TokenAccount: PublicKey;
  let user5TokenAccount: PublicKey;
  let user6TokenAccount: PublicKey;
  let user7TokenAccount: PublicKey;
  let user8TokenAccount: PublicKey;
  let user9TokenAccount: PublicKey;
  let user10TokenAccount: PublicKey;

  before(async () => {
    await setupTestAccounts(provider.connection, [gameServer, user1, user2]);
    
    user1TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user1.publicKey
    );
    
    user2TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user2.publicKey
    );

    user3TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user3.publicKey
    );

    user4TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user4.publicKey
    );

    user5TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user5.publicKey
    );

    user6TokenAccount = await setupTokenAccount(
      provider.connection,
      gameServer,
      TOKEN_ID,
      user6.publicKey
    );
  });

  it("Successfully distributes winnings to winning team", async () => {
    console.log("\n=== Starting distribute winnings test ===");
    const sessionId = generateSessionId();
    const betAmount = new BN(1000000000); // 0.1 tokens with 9 decimals
    console.log(`Session ID: ${sessionId}`);
    console.log(`Bet amount: ${betAmount.toString()} (0.1 tokens)`);
    
    console.log("user1 pubkey: ", user1.publicKey.toString());
    console.log("user2 pubkey: ", user2.publicKey.toString());
    console.log("gameServer pubkey: ", gameServer.publicKey.toString());

    // Derive PDAs first since we'll need them multiple times

    const confirmOptions: ConfirmOptions = { commitment: "confirmed" };

    // Create game session and join users
    console.log("\nCreating game session...");
    const tx = await program.methods
      .createGameSession(sessionId, betAmount, { payToSpawnOneVsOne: {} })
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc(confirmOptions);

    console.log("tx: ", tx);
    

    const transaction = await provider.connection.getTransaction(tx, {
      commitment: "confirmed",
    });
    console.log("transaction: ", transaction);

    // get the log message that contains the vault token account
    let receiveLog = transaction.meta.logMessages.find(
      (log) => log.includes("Vault token account:")
    );

    const vaultTokenAccount = receiveLog.split("Vault token account: ")[1];
    assert(receiveLog !== undefined);
    console.log("Game session created successfully");

    const user1initBalance = await getTokenBalance(provider.connection, user1TokenAccount);
    const user2initBalance = await getTokenBalance(provider.connection, user2TokenAccount);

    console.log("user1 balance before joining: ", user1initBalance);
    console.log("user2 balance before joining: ", user2initBalance);

    // Join users
    console.log("\nJoining user 1...");
    const joinUser1Tx = await program.methods
      .joinUser(sessionId, 0)
      .accounts({
        user: user1.publicKey,
        gameServer: gameServer.publicKey,
        userTokenAccount: user1TokenAccount,
      })
      .signers([user1])
      .rpc(confirmOptions);

    console.log("\nJoining user 2...");
    const joinUser2Tx = await program.methods
      .joinUser(sessionId, 1)
      .accounts({
        user: user2.publicKey,
        gameServer: gameServer.publicKey,
        userTokenAccount: user2TokenAccount,
      })
      .signers([user2])
      .rpc(confirmOptions);

    console.log("user1 balance after joining: ", await getTokenBalance(provider.connection, user1TokenAccount));
    console.log("user2 balance after joining: ", await getTokenBalance(provider.connection, user2TokenAccount));
    console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));

    const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
    console.log("Game session PDA:", gameSessionPda.toString());
    const account = await program.account.gameSession.fetch(gameSessionPda);

    console.log("Simulating game...");
    const gameStateJoin = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameStateJoin, "Game stats after join:", vaultTokenAccount, provider.connection);


    const killTx1 = await program.methods.recordKill(sessionId, 0, user1.publicKey, 1, user2.publicKey).accounts({
      gameServer: gameServer.publicKey,
    })
    .signers([gameServer])
    .rpc(confirmOptions);
    
    // Get and print stats after first kill
    const gameState1 = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameState1, "Game stats after kill 1", vaultTokenAccount, provider.connection);

    for (let i = 1; i < 10; i++) {
        const killTx2 = await program.methods.recordKill(sessionId, 0, user1.publicKey, 1, user2.publicKey).accounts({
            gameServer: gameServer.publicKey,
        })
        .signers([gameServer])
        .rpc(confirmOptions);
    }       
    const gameState2 = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameState2, "Game stats after kill 10", vaultTokenAccount, provider.connection);

    const txspawn1 = await program.methods.payToSpawn(sessionId, 1).accounts({
        user: user2.publicKey,
        gameServer: gameServer.publicKey,
        userTokenAccount: user2TokenAccount,
    })
    .signers([user2])
    .rpc(confirmOptions);

    // Get and print stats after user2 spawns
    const gameStateSpawn1 = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameStateSpawn1, "Player pays to spawn, Game stats after that:", vaultTokenAccount, provider.connection);

    for (let i = 0; i < 10; i++) {
        const killTx2 = await program.methods.recordKill(sessionId, 0, user1.publicKey, 1, user2.publicKey).accounts({
            gameServer: gameServer.publicKey,
        })
        .signers([gameServer])
        .rpc(confirmOptions);
    }

    // Get and print stats after third kill
    const gameState3 = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameState3, "Game stats after player kills player B 10 times", vaultTokenAccount, provider.connection);
   
    console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
    console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));
    console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));
    
    // Distribute winnings
    console.log("\nDistributing winnings...");
    const txDistribute = await program.methods
      .distributeWinnings(sessionId, 0)
      .accounts({
        gameServer: gameServer.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(user1.publicKey),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(user1TokenAccount),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(user2.publicKey),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(user2TokenAccount),
          isSigner: false,
          isWritable: true,
        },
      ])
      .signers([gameServer])
      .rpc(confirmOptions);

      // Get and print stats after third kill
    const gameStateFinal = await program.account.gameSession.fetch(gameSessionPda);
    await printGameState(gameStateFinal, "Final game stats", vaultTokenAccount, provider.connection);

    const user1finalBalance = await getTokenBalance(provider.connection, user1TokenAccount);
    const user2finalBalance = await getTokenBalance(provider.connection, user2TokenAccount);

    console.log("user1 init balance: ", user1initBalance);
    console.log("user2 init balance: ", user2initBalance);
    console.log("user1 final balance: ", user1finalBalance);
    console.log("user2 final balance: ", user2finalBalance);
    console.log("user1 winning: ", user1finalBalance - user1initBalance);
    console.log("user2 winning: ", user2finalBalance - user2initBalance);

    console.log("=== Distribute winnings test completed successfully ===\n");
  });


}); 