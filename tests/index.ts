import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WagerProgram } from "../app/src/app/types/wager_program";
import { describe } from "mocha";

describe("wager-program", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.WagerProgram as Program<WagerProgram>;

  // Create a game session
  require("./create-game-session.test");

  // Join a user to the game session
  require("./join-user.test");

  // Distribute winnings
  require("./distribute-winnings.test");

  // Pay-to-spawn 1v1 mode
  require("./pay-to-spawn.test");

  // Refund wager
  require("./refund.test");
  
  before(async () => {
    // Add any setup that should run before all tests
    console.log("Setting up tests...");
  });

  after(async () => {
    // Add any cleanup that should run after all tests
    console.log("Cleaning up...");
  });
});
