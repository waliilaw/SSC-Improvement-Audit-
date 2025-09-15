const {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} = require("@solana/web3.js");
const {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
} = require("@solana/spl-token");

async function createToken() {
  // Connect to devnet
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // Generate a new wallet keypair for testing
  const payer = Keypair.generate();

  // Request airdrop for testing
  console.log("Requesting airdrop...");
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    1000000000 // 1 SOL
  );
  await connection.confirmTransaction(airdropSignature);

  // Generate a new keypair for token mint
  const mintAuthority = Keypair.generate();
  const freezeAuthority = mintAuthority.publicKey;

  // Create token mint
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority,
    9, // 9 decimals like SOL
    TOKEN_PROGRAM_ID
  );

  console.log("Token created successfully!");
  console.log("Mint address:", mint.publicKey.toString());

  // Create associated token account for the payer
  const tokenAccount = await mint.createAssociatedTokenAccount(payer.publicKey);
  console.log("Associated token account:", tokenAccount.toString());

  // Mint some tokens to the payer's account
  const amount = 1000000000; // 1 token with 9 decimals
  await mint.mintTo(tokenAccount, mintAuthority, [], amount);

  console.log(`Minted ${amount} tokens to ${tokenAccount.toString()}`);

  // Get token supply
  const supply = await mint.getMintInfo();
  console.log("Total supply:", supply.supply.toString());

  // Token metadata
  const tokenInfo = {
    mint: mint.publicKey.toString(),
    mintAuthority: mintAuthority.publicKey.toString(),
    freezeAuthority: freezeAuthority.toString(),
    decimals: 9,
    associatedTokenAccount: tokenAccount.toString(),
    tokenProgramId: TOKEN_PROGRAM_ID.toString(),
  };

  return tokenInfo;
}

// Execute the function
createToken()
  .then((tokenInfo) => {
    console.log("\nToken Information:");
    console.log(JSON.stringify(tokenInfo, null, 2));
  })
  .catch((error) => {
    console.error("Error creating token:", error);
  });
