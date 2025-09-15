use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::instructions::*;

declare_id!("8PRQvPo16yG8EP5fESDEuJunZBLJ3UFBGvN6CKLZGBUQ");

pub const TOKEN_ID: Pubkey = pubkey!("BzeqmCjLZvMLSTrge9qZnyV8N2zNKBwAxQcZH2XEzFXG");

#[program]
pub mod wager_program {
    use super::*;

    pub fn create_game_session(
        ctx: Context<CreateGameSession>,
        session_id: String,
        bet_amount: u64,
        game_mode: state::GameMode,
    ) -> Result<()> {
        create_game_session_handler(ctx, session_id, bet_amount, game_mode)
    }

    pub fn join_user(ctx: Context<JoinUser>, session_id: String, team: u8) -> Result<()> {
        join_user_handler(ctx, session_id, team)
    }

    pub fn distribute_winnings<'info>(
        ctx: Context<'_, '_, 'info, 'info, DistributeWinnings<'info>>,
        session_id: String,
        winning_team: u8,
    ) -> Result<()> {
        //if winner takes all, distribute all winnings else distribute winnings for the winners
        if ctx.accounts.game_session.is_pay_to_spawn() {
            distribute_pay_spawn_earnings(ctx, session_id)
        } else {
            distribute_all_winnings_handler(ctx, session_id, winning_team)
        }
    }

    pub fn pay_to_spawn(ctx: Context<PayToSpawn>, session_id: String, team: u8) -> Result<()> {
        pay_to_spawn_handler(ctx, session_id, team)
    }

    pub fn record_kill(
        ctx: Context<RecordKill>,
        session_id: String,
        killer_team: u8,
        killer: Pubkey,
        victim_team: u8,
        victim: Pubkey,
    ) -> Result<()> {
        record_kill_handler(ctx, session_id, killer_team, killer, victim_team, victim)
    }

    pub fn refund_wager<'info>(
        ctx: Context<'_, '_, 'info, 'info, RefundWager<'info>>,
        session_id: String,
    ) -> Result<()> {
        refund_wager_handler(ctx, session_id)
    }
}
