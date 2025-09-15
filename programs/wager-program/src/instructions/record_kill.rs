use crate::{errors::WagerError, state::*};
use anchor_lang::prelude::*;

pub fn record_kill_handler(
    ctx: Context<RecordKill>,
    _session_id: String,
    killer_team: u8,
    killer: Pubkey,
    victim_team: u8,
    victim: Pubkey,
) -> Result<()> {
    let game_session = &mut ctx.accounts.game_session;
    game_session.add_kill(killer_team, killer, victim_team, victim)?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(_session_id: String)]
pub struct RecordKill<'info> {
    #[account(
        mut,
        seeds = [b"game_session", _session_id.as_bytes()],
        bump = game_session.bump,
        constraint = game_session.authority == game_server.key() @ WagerError::UnauthorizedKill,
    )]
    pub game_session: Account<'info, GameSession>,

    pub game_server: Signer<'info>,
}
