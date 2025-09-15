use crate::{errors::WagerError, state::*, TOKEN_ID};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount};

pub fn pay_to_spawn_handler(ctx: Context<PayToSpawn>, _session_id: String, team: u8) -> Result<()> {
    let game_session = &mut ctx.accounts.game_session;

    // Check if game status is in progress and if it is a pay to spawn game
    require!(
        game_session.status == GameStatus::InProgress && game_session.is_pay_to_spawn(),
        WagerError::InvalidGameState
    );

    // Validate team number (0 for team A, 1 for team B)
    require!(team == 0 || team == 1, WagerError::InvalidTeamSelection);

    // Check if team is full already
    let player_index = game_session.get_player_index(team, ctx.accounts.user.key())?;

    let session_bet = game_session.session_bet;

    // Transfer SPL tokens from user to vault using user's signature
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        session_bet,
    )?;

    game_session.add_spawns(team, player_index)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(_session_id: String)]
pub struct PayToSpawn<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Game server authority
    pub game_server: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"game_session", _session_id.as_bytes()],
        bump = game_session.bump,
    )]
    pub game_session: Account<'info, GameSession>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == TOKEN_ID
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// CHECK: Vault PDA that holds the funds
    #[account(
        mut,
        seeds = [b"vault", _session_id.as_bytes()],
        bump = game_session.vault_bump,
    )]
    pub vault: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = TOKEN_ID,
        associated_token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
