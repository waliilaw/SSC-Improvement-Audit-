//! State accounts for the betting program
use crate::errors::WagerError;
use anchor_lang::prelude::*;

/// Game mode defining the team sizes
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameMode {
    WinnerTakesAllOneVsOne,     // 1v1 game mode
    WinnerTakesAllThreeVsThree, // 3v3 game mode
    WinnerTakesAllFiveVsFive,   // 5v5 game mode
    PayToSpawnOneVsOne,         // 1v1 game mode
    PayToSpawnThreeVsThree,     // 3v3 game mode
    PayToSpawnFiveVsFive,       // 5v5 game mode
}

impl GameMode {
    /// Returns the required number of players per team
    pub fn players_per_team(&self) -> usize {
        match self {
            Self::WinnerTakesAllOneVsOne => 1,
            Self::WinnerTakesAllThreeVsThree => 3,
            Self::WinnerTakesAllFiveVsFive => 5,
            Self::PayToSpawnOneVsOne => 1,
            Self::PayToSpawnThreeVsThree => 3,
            Self::PayToSpawnFiveVsFive => 5,
        }
    }
}

/// Status of a game session
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GameStatus {
    WaitingForPlayers, // Waiting for players to join
    InProgress,        // Game is active with all players joined
    Completed,         // Game has finished and rewards distributed
}

impl Default for GameStatus {
    fn default() -> Self {
        Self::WaitingForPlayers
    }
}

/// Represents a team in the game
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Team {
    pub players: [Pubkey; 5],    // Array of player public keys
    pub total_bet: u64,          // Total amount bet by team (in lamports)
    pub player_spawns: [u16; 5], // Number of spawns remaining for each player
    pub player_kills: [u16; 5],  // Number of kills for each player
}

impl Team {
    /// Finds the first empty slot in the team, if available
    pub fn get_empty_slot(&self, player_count: usize) -> Result<usize> {
        self.players
            .iter()
            .enumerate()
            .find(|(i, player)| **player == Pubkey::default() && *i < player_count)
            .map(|(i, _)| i)
            .ok_or_else(|| error!(WagerError::TeamIsFull))
    }
}

/// Represents a game session between teams with its own pool
#[account]
pub struct GameSession {
    pub session_id: String,  // Unique identifier for the game
    pub authority: Pubkey,   // Creator of the game session
    pub session_bet: u64,    // Required bet amount per player
    pub game_mode: GameMode, // Game configuration (1v1, 2v2, 5v5)
    pub team_a: Team,        // First team
    pub team_b: Team,        // Second team
    pub status: GameStatus,  // Current game state
    pub created_at: i64,     // Creation timestamp
    pub bump: u8,            // PDA bump
    pub vault_bump: u8,      // Add this field for vault PDA bump
    pub vault_token_bump: u8,
}

impl GameSession {
    /// Gets an empty slot for a player in the specified team
    pub fn get_player_empty_slot(&self, team: u8) -> Result<usize> {
        let player_count = self.game_mode.players_per_team();
        match team {
            0 => self.team_a.get_empty_slot(player_count),
            1 => self.team_b.get_empty_slot(player_count),
            _ => Err(error!(WagerError::InvalidTeam)),
        }
    }

    /// Checks if both teams are completely filled
    pub fn check_all_filled(&self) -> Result<bool> {
        let player_count = self.game_mode.players_per_team();

        Ok(matches!(
            (
                self.team_a.get_empty_slot(player_count),
                self.team_b.get_empty_slot(player_count)
            ),
            (Err(e1), Err(e2)) if is_team_full_error(&e1) && is_team_full_error(&e2)
        ))
    }

    pub fn is_pay_to_spawn(&self) -> bool {
        matches!(
            self.game_mode,
            GameMode::PayToSpawnOneVsOne
                | GameMode::PayToSpawnThreeVsThree
                | GameMode::PayToSpawnFiveVsFive
        )
    }

    pub fn get_all_players(&self) -> Vec<Pubkey> {
        let mut players = self.team_a.players.to_vec();
        players.extend(self.team_b.players.to_vec());
        players
    }

    pub fn get_player_index(&self, team: u8, player: Pubkey) -> Result<usize> {
        match team {
            0 => self
                .team_a
                .players
                .iter()
                .position(|p| *p == player)
                .ok_or(error!(WagerError::PlayerNotFound)),
            1 => self
                .team_b
                .players
                .iter()
                .position(|p| *p == player)
                .ok_or(error!(WagerError::PlayerNotFound)),
            _ => return Err(error!(WagerError::InvalidTeam)),
        }
    }

    /// Gets the kill and death difference for a player in a team
    pub fn get_kills_and_spawns(&self, player_pubkey: Pubkey) -> Result<u16> {
        // search in both teams and return the kill and death difference
        let team_a_index = self.team_a.players.iter().position(|p| *p == player_pubkey);
        let team_b_index = self.team_b.players.iter().position(|p| *p == player_pubkey);
        if let Some(team_a_index) = team_a_index {
            Ok(self.team_a.player_kills[team_a_index] as u16
                + self.team_a.player_spawns[team_a_index] as u16)
        } else if let Some(team_b_index) = team_b_index {
            Ok(self.team_b.player_kills[team_b_index] as u16
                + self.team_b.player_spawns[team_b_index] as u16)
        } else {
            return Err(error!(WagerError::PlayerNotFound));
        }
    }

    pub fn add_kill(
        &mut self,
        killer_team: u8,
        killer: Pubkey,
        victim_team: u8,
        victim: Pubkey,
    ) -> Result<()> {
        let killer_player_index: usize = self.get_player_index(killer_team, killer)?;
        let victim_player_index: usize = self.get_player_index(victim_team, victim)?;

        require!(
            self.status == GameStatus::InProgress,
            WagerError::GameNotInProgress
        );

        match killer_team {
            0 => self.team_a.player_kills[killer_player_index] += 1,
            1 => self.team_b.player_kills[killer_player_index] += 1,
            _ => return Err(error!(WagerError::InvalidTeam)),
        }

        match victim_team {
            0 => self.team_a.player_spawns[victim_player_index] -= 1,
            1 => self.team_b.player_spawns[victim_player_index] -= 1,
            _ => return Err(error!(WagerError::InvalidTeam)),
        }

        Ok(())
    }

    pub fn add_spawns(&mut self, team: u8, player_index: usize) -> Result<()> {
        match team {
            0 => self.team_a.player_spawns[player_index] += 10u16,
            1 => self.team_b.player_spawns[player_index] += 10u16,
            _ => return Err(error!(WagerError::InvalidTeam)),
        }
        Ok(())
    }
}

/// Helper function to check if an error is TeamIsFull
fn is_team_full_error(error: &Error) -> bool {
    error.to_string().contains("TeamIsFull")
}
