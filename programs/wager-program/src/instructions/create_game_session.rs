use crate::errors::WagerError;
use crate::state::*;
use crate::TOKEN_ID;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount};

pub fn create_game_session_handler(
    ctx: Context<CreateGameSession>,
    session_id: String,
    bet_amount: u64,
    game_mode: GameMode,
) -> Result<()> {
    let clock = Clock::get()?;
    let game_session = &mut ctx.accounts.game_session;

    game_session.session_id = session_id;
    game_session.authority = ctx.accounts.game_server.key();
    game_session.session_bet = bet_amount;
    game_session.game_mode = game_mode;
    game_session.status = GameStatus::WaitingForPlayers;
    game_session.created_at = clock.unix_timestamp;
    game_session.bump = ctx.bumps.game_session;
    game_session.vault_bump = ctx.bumps.vault;

    // Log all the accounts
    msg!("Game session: {}", game_session.key());
    msg!("Vault: {}", ctx.accounts.vault.key());
    msg!(
        "Vault token account: {}",
        ctx.accounts.vault_token_account.key()
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(session_id: String)]
pub struct CreateGameSession<'info> {
    #[account(mut)]
    pub game_server: Signer<'info>,

    #[account(
        init,
        payer = game_server,
        space = 8 + 4 + 10 + 32 + 8 + 1 + (2 * (32 * 5 + 16 * 5 + 16 * 5 + 8)) + 1 + 8 + 1 + 1 + 1,
        seeds = [b"game_session", session_id.as_bytes()],
        bump
    )]
    pub game_session: Account<'info, GameSession>,

    /// CHECK: This is safe as it's just used to store SOL
    #[account(
        init,
        payer = game_server,
        space = 0,
        seeds = [b"vault", session_id.as_bytes()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(
        init,
        payer = game_server,
        associated_token::mint = mint,
        associated_token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = TOKEN_ID @ WagerError::InvalidMint
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
