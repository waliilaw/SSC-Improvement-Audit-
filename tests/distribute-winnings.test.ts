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
    getTokenBalance
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
      const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
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
        .createGameSession(sessionId, betAmount, { winnerTakesAllOneVsOne: {} })
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
      console.log("vaultTokenAccount: ", vaultTokenAccount);
      assert(receiveLog !== undefined);
      console.log("Game session created successfully");

      console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));
      console.log("user1 token address: ", user1TokenAccount.toString());
      console.log("user2 token address: ", user2TokenAccount.toString());
      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
      console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));

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
      console.log("User 1 joined successfully with tx: ", joinUser1Tx);

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
      console.log("User 2 joined successfully with tx: ", joinUser2Tx);

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
        ])
        .signers([gameServer])
        .rpc(confirmOptions);

      const transactionDistribute = await provider.connection.getTransaction(txDistribute, {
        commitment: "confirmed",
      });
      console.log("transactionDistribute: ", transactionDistribute );


      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
      console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));
      console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));

      console.log("=== Distribute winnings test completed successfully ===\n");
    });

    it("Successfully distributes winnings to winning team with 2v2", async () => {
      console.log("\n=== Starting distribute winnings test ===");
      const sessionId = generateSessionId();
      const betAmount = new BN(100000000); // 0.1 tokens with 9 decimals
      console.log(`Session ID: ${sessionId}`);
      console.log(`Bet amount: ${betAmount.toString()} (0.1 tokens)`);
      
      console.log("user1 pubkey: ", user1.publicKey.toString());
      console.log("user2 pubkey: ", user2.publicKey.toString());
      console.log("user3 pubkey: ", user3.publicKey.toString());
      console.log("user4 pubkey: ", user4.publicKey.toString());
      console.log("gameServer pubkey: ", gameServer.publicKey.toString());

      // Derive PDAs first since we'll need them multiple times

      const confirmOptions: ConfirmOptions = { commitment: "confirmed" };

      // Create game session and join users
      console.log("\nCreating game session...");
      const tx = await program.methods
        .createGameSession(sessionId, betAmount, { winnerTakesAllThreeVsThree: {} })
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
      console.log("vaultTokenAccount: ", vaultTokenAccount);
      assert(receiveLog !== undefined);
      console.log("Game session created successfully");

      console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));
      console.log("user1 token address: ", user1TokenAccount.toString());
      console.log("user2 token address: ", user2TokenAccount.toString());
      console.log("user3 token address: ", user3TokenAccount.toString());
      console.log("user4 token address: ", user4TokenAccount.toString());
      console.log("user5 token address: ", user5TokenAccount.toString());
      console.log("user6 token address: ", user6TokenAccount.toString());

      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
      console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));
      console.log("user3 balance: ", await getTokenBalance(provider.connection, user3TokenAccount));
      console.log("user4 balance: ", await getTokenBalance(provider.connection, user4TokenAccount));
      console.log("user5 balance: ", await getTokenBalance(provider.connection, user5TokenAccount));
      console.log("user6 balance: ", await getTokenBalance(provider.connection, user6TokenAccount));

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
      console.log("User 1 joined successfully with tx: ", joinUser1Tx);

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
      console.log("User 2 joined successfully with tx: ", joinUser2Tx);

      console.log("\nJoining user 3...");
      const joinUser3Tx = await program.methods
        .joinUser(sessionId, 0)
        .accounts({
          user: user3.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user3TokenAccount,
        })
        .signers([user3])
        .rpc(confirmOptions);
      console.log("User 3 joined successfully with tx: ", joinUser3Tx);

      console.log("\nJoining user 4...");
      const joinUser4Tx = await program.methods
        .joinUser(sessionId, 1)
        .accounts({
          user: user4.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user4TokenAccount,
        })
        .signers([user4])
        .rpc(confirmOptions);
      console.log("User 4 joined successfully with tx: ", joinUser4Tx);

      console.log("Joining user 5...");
      const joinUser5Tx = await program.methods
        .joinUser(sessionId, 0)
        .accounts({
          user: user5.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user5TokenAccount,
        })
        .signers([user5])
        .rpc(confirmOptions);
      console.log("User 5 joined successfully with tx: ", joinUser5Tx);

      const [gameSessionPda] = deriveGameSessionPDA(program.programId, sessionId);
      const account = await program.account.gameSession.fetch(gameSessionPda);
      console.log("\nGame session state after join:");
      console.log("Team A players:", account.teamA.players.map(p => p.toString()));
      assert.equal(account.teamA.players[0].toString(), user1.publicKey.toString());
      console.log("Team B players:", account.teamB.players.map(p => p.toString()));
      assert.equal(account.teamB.players[0].toString(), user2.publicKey.toString());

      console.log("Joining user 6...");
      const joinUser6Tx = await program.methods
        .joinUser(sessionId, 1)
        .accounts({
          user: user6.publicKey,
          gameServer: gameServer.publicKey,
          userTokenAccount: user6TokenAccount,
        })
        .signers([user6])
        .rpc(confirmOptions);
      console.log("User 6 joined successfully with tx: ", joinUser6Tx);


      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
      console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));
      console.log("user3 balance: ", await getTokenBalance(provider.connection, user3TokenAccount));
      console.log("user4 balance: ", await getTokenBalance(provider.connection, user4TokenAccount));
      console.log("user5 balance: ", await getTokenBalance(provider.connection, user5TokenAccount));
      console.log("user6 balance: ", await getTokenBalance(provider.connection, user6TokenAccount));
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
            pubkey: new PublicKey(user3.publicKey),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(user3TokenAccount),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(user5.publicKey),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(user5TokenAccount),
            isSigner: false,
            isWritable: true,
          },
        ])
        .signers([gameServer])
        .rpc(confirmOptions);

      const transactionDistribute = await provider.connection.getTransaction(txDistribute, {
        commitment: "confirmed",
      });
      console.log("transactionDistribute: ", transactionDistribute );


      console.log("user1 balance: ", await getTokenBalance(provider.connection, user1TokenAccount));
      console.log("user2 balance: ", await getTokenBalance(provider.connection, user2TokenAccount));
      console.log("user3 balance: ", await getTokenBalance(provider.connection, user3TokenAccount));
      console.log("user4 balance: ", await getTokenBalance(provider.connection, user4TokenAccount));
      console.log("vault token account: and balance", vaultTokenAccount, await getTokenBalance(provider.connection, new PublicKey(vaultTokenAccount)));

      console.log("=== Distribute winnings test completed successfully ===\n");
    });

  }); 