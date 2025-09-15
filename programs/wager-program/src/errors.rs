use anchor_lang::prelude::*;

#[error_code]
pub enum WagerError {
    #[msg("Game session is not in the correct state")]
    InvalidGameState,

    #[msg("Invalid team selection. Team must be 0 or 1")]
    InvalidTeamSelection,

    #[msg("Team is already full")]
    TeamIsFull,

    #[msg("Insufficient funds to join the game")]
    InsufficientFunds,

    #[msg("Invalid number of players for this game mode")]
    InvalidPlayerCount,

    #[msg("All players not joined")]
    NotAllPlayersJoined,

    #[msg("Game is not in completed state")]
    GameNotCompleted,

    #[msg("Only the game authority can distribute winnings")]
    UnauthorizedDistribution,

    #[msg("Invalid winning team selection")]
    InvalidWinningTeam,

    #[msg("Failed to calculate total pot due to arithmetic overflow")]
    TotalPotCalculationError,

    #[msg("No winners found in the winning team")]
    NoWinnersFound,

    #[msg("Failed to calculate per-player winnings")]
    WinningsCalculationError,

    #[msg("Failed to distribute all funds from game session")]
    IncompleteDistribution,

    #[msg("Invalid team")]
    InvalidTeam,

    #[msg("Player account not found in winners")]
    PlayerAccountNotFound,

    #[msg("Invalid winning team selection")]
    InvalidWinner,

    #[msg("Arithmetic error")]
    ArithmeticError,

    #[msg("Invalid mint address provided")]
    InvalidMint,

    #[msg("Invalid remaining accounts provided")]
    InvalidRemainingAccounts,

    #[msg("Invalid winner token account owner")]
    InvalidWinnerTokenAccount,

    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Invalid spawns")]
    InvalidSpawns,

    #[msg("Unauthorized kill")]
    UnauthorizedKill,

    #[msg("Unauthorized pay to spawn")]
    UnauthorizedPayToSpawn,

    #[msg("Player not found")]
    PlayerNotFound,

    #[msg("Invalid player token account")]
    InvalidPlayerTokenAccount,

    #[msg("Invalid player")]
    InvalidPlayer,

    #[msg("Player has no spawns")]
    PlayerHasNoSpawns,

    #[msg("Game is not in progress")]
    GameNotInProgress,
}
