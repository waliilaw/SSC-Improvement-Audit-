import { Program, AnchorProvider, Idl, setProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { WagerProgram } from "../types/wager_program";
import idl from "../idl/wager_program.json";
import * as anchor from "@coral-xyz/anchor";
import { GameMode } from "../types/game-types";

const TOKEN_ID = new PublicKey("BzeqmCjLZvMLSTrge9qZnyV8N2zNKBwAxQcZH2XEzFXG");

interface IProgramUtils {
  createGameSession(sessionId: string, betAmount: number, gameMode: any): Promise<string>;
  joinUser(sessionId: string, team: number, gameServer: PublicKey): Promise<string>;
  distributeWinnings(sessionId: string, winningTeam: number): Promise<string>;
  getGameSession(sessionId: string): Promise<GameSessionState>;
  payToSpawn(sessionId: string, team: number): Promise<string>;
  recordKill(sessionId: string, killerTeam: number, killer: string, victimTeam: number, victim: string): Promise<string>;
}

interface GameSessionState {
  betAmount: anchor.BN;
  creator: anchor.web3.PublicKey;
  teamA: {
    players: anchor.web3.PublicKey[];
    playerKills: number[];
    playerSpawns: number[];
  };
  teamB: {
    players: anchor.web3.PublicKey[];
    playerKills: number[];
    playerSpawns: number[];
  };
  status: 'waitingForPlayers' | 'inProgress' | 'completed';
}

// Update the type definition for the status parameter
type GameSessionStatus = {
  waitingForPlayers?: {};
  inProgress?: {};
  completed?: {};
};

function mapGameStatus(status: GameSessionStatus): 'waitingForPlayers' | 'inProgress' | 'completed' {
  // Check which enum variant is defined
  if (Object.prototype.hasOwnProperty.call(status, 'waitingForPlayers')) {
    return 'waitingForPlayers';
  }
  if (Object.prototype.hasOwnProperty.call(status, 'inProgress')) {
    return 'inProgress';
  }
  if (Object.prototype.hasOwnProperty.call(status, 'completed')) {
    return 'completed';
  }
  
  // Fallback (should never happen with valid data)
  return 'waitingForPlayers';
}

export class ProgramUtils implements IProgramUtils {
  private program: Program<WagerProgram>;
  private provider: AnchorProvider;
  private readonly PROGRAM_ID = new PublicKey("8PRQvPo16yG8EP5fESDEuJunZBLJ3UFBGvN6CKLZGBUQ");

  constructor(connection: Connection, wallet: any) {
    this.provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(this.provider);
    const programId = new PublicKey(idl.address);
    console.log("Program ID from IDL:", programId.toString());

    this.program = new Program(idl as any, this.provider);
  }

  async createGameSession(sessionId: string, betAmount: number, gameMode: any): Promise<string> {
    try {
      const tx = await this.program.methods
        .createGameSession(sessionId, new BN(betAmount), gameMode)
        .accounts({
          gameServer: this.provider.wallet.publicKey,
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error("Error creating game session:", error);
      throw error;
    }
  }

  async joinUser(sessionId: string, team: number, gameServer: PublicKey): Promise<string> {
    try {
      const [gameSessionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game_session"), Buffer.from(sessionId)],
        this.program.programId
      );
      console.log("gameSessionPDA: ", gameSessionPDA.toString());
      console.log("user: ", this.provider.wallet.publicKey);

      const userTokenAccount = await anchor.utils.token.associatedAddress({
        mint: TOKEN_ID,
        owner: this.provider.wallet.publicKey
      });

      console.log("userTokenAccount: ", userTokenAccount.toString());
      console.log("gameServer: ", gameServer.toString());
      console.log("user: ", this.provider.wallet.publicKey.toString());
      console.log("sessionId: ", sessionId);
      console.log("team: ", team);

      const tx = await this.program.methods
        .joinUser(sessionId, team)
        .accounts({
          user: this.provider.wallet.publicKey,
          gameServer: gameServer,
          userTokenAccount: userTokenAccount,
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  }

  async getGameSession(sessionId: string): Promise<GameSessionState> {
    try {
      const [gameSessionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game_session"), Buffer.from(sessionId)],
        this.program.programId
      );

      const gameSession = await this.program.account.gameSession.fetch(
        gameSessionPDA
      );

      return {
        betAmount: new anchor.BN(gameSession.sessionBet),
        creator: gameSession.authority,
        teamA: {
          players: gameSession.teamA.players.filter((p: any) => p !== null),
          playerKills: gameSession.teamA.playerKills,
          playerSpawns: gameSession.teamA.playerSpawns
        },
        teamB: {
          players: gameSession.teamB.players.filter((p: any) => p !== null),
          playerKills: gameSession.teamB.playerKills,
          playerSpawns: gameSession.teamB.playerSpawns
        },
        status: mapGameStatus(gameSession.status)
      };
    } catch (error) {
      console.error('Error fetching game session:', error);
      throw new Error(`Failed to fetch game session: ${error}`);
    }
  }

  async distributeWinnings(sessionId: string, winningTeam: number): Promise<string> {
    try {
      const [gameSessionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game_session"), Buffer.from(sessionId)],
        this.program.programId
      );

      // Get the game session to find all players
      const gameSession = await this.program.account.gameSession.fetch(gameSessionPDA);
      
      // Get token accounts for all players
      const remainingAccounts = [];
      
      // Add winning team players and their token accounts
      const winningTeamPlayers = winningTeam === 0 ? gameSession.teamA.players : gameSession.teamB.players;
      for (const player of winningTeamPlayers) {
        if (player && player.toString() !== PublicKey.default.toString()) {
          const playerTokenAccount = await anchor.utils.token.associatedAddress({
            mint: TOKEN_ID,
            owner: player
          });

          remainingAccounts.push(
            {
              pubkey: player,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: playerTokenAccount,
              isSigner: false,
              isWritable: true,
            }
          );
        }
      }

      // Add losing team players and their token accounts only if the game mode is pay to spawn
      if (isPayToSpawn(gameSession.gameMode)) {
        const losingTeamPlayers = winningTeam === 0 ? gameSession.teamB.players : gameSession.teamA.players;
        for (const player of losingTeamPlayers) {
          if (player && player.toString() !== PublicKey.default.toString()) {
            const playerTokenAccount = await anchor.utils.token.associatedAddress({
              mint: TOKEN_ID,
              owner: player
            });

            remainingAccounts.push(
              {
                pubkey: player,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: playerTokenAccount,
                isSigner: false,
                isWritable: true,
              }
            );
          }
        }
      }

      console.log("remainingAccounts: ", remainingAccounts);

      const tx = await this.program.methods
        .distributeWinnings(sessionId, winningTeam)
        .accounts({
          gameServer: this.provider.wallet.publicKey,
          
        })
        .remainingAccounts(remainingAccounts)
        .rpc();

      return tx;
    } catch (error) {
      console.error("Error distributing winnings:", error);
      throw error;
    }
  }

  async payToSpawn(sessionId: string, team: number): Promise<string> {
    try {

      console.log("user: ", this.provider.wallet.publicKey.toString());
      console.log("sessionId: ", sessionId);
      console.log("team: ", team);

      const [gameSessionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game_session"), Buffer.from(sessionId)],
        this.program.programId
      );

      const userTokenAccount = await anchor.utils.token.associatedAddress({
        mint: TOKEN_ID,
        owner: this.provider.wallet.publicKey
      });

      const tx = await this.program.methods
        .payToSpawn(sessionId, team)
        .accounts({
          user: this.provider.wallet.publicKey,
          gameServer: this.provider.wallet.publicKey,
          userTokenAccount: userTokenAccount,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error("Error paying to spawn:", error);
      throw error;
    }
  }

  async recordKill(
    sessionId: string, 
    killerTeam: number, 
    killer: string, 
    victimTeam: number, 
    victim: string
  ): Promise<string> {
    try {
      const [gameSessionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game_session"), Buffer.from(sessionId)],
        this.program.programId
      );

      const tx = await this.program.methods
        .recordKill(
          sessionId,
          killerTeam,
          new PublicKey(killer),
          victimTeam,
          new PublicKey(victim)
        )
        .accounts({
          gameServer: this.provider.wallet.publicKey,
          
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error("Error recording kill:", error);
      throw error;
    }
  }
} 

function isPayToSpawn(gameMode: any): boolean {
  console.log("gameMode: ", gameMode);
  const val = Object.prototype.hasOwnProperty.call(gameMode, 'payToSpawnFiveVsFive') ||
              Object.prototype.hasOwnProperty.call(gameMode, 'payToSpawnThreeVsThree') ||
              Object.prototype.hasOwnProperty.call(gameMode, 'payToSpawnOneVsOne');
  console.log("val: ", val);
  return val;
}
