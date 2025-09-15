use crate::{errors::WagerError, state::*, TOKEN_ID};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount};

pub fn distribute_pay_spawn_earnings<'info>(
    ctx: Context<'_, '_, 'info, 'info, DistributeWinnings<'info>>,
    session_id: String,
) -> Result<()> {
    let game_session = &ctx.accounts.game_session;
    msg!("Starting distribution for session: {}", session_id);

    let players = game_session.get_all_players();
    msg!("Number of players: {}", players.len());
    msg!(
        "Number of remaining accounts: {}",
        ctx.remaining_accounts.len()
    );

    // We need at least one player and their token account
    require!(
        !ctx.remaining_accounts.is_empty(),
        WagerError::InvalidRemainingAccounts
    );

    // Make sure remaining accounts are in pairs
    require!(
        ctx.remaining_accounts.len() % 2 == 0,
        WagerError::InvalidRemainingAccounts
    );

    for player in players {
        // Skip players with no kills/spawns
        let kills_and_spawns = game_session.get_kills_and_spawns(player)?;
        if kills_and_spawns == 0 {
            continue;
        }

        let earnings = kills_and_spawns as u64 * game_session.session_bet / 10;
        msg!("Earnings for player {}: {}", player, earnings);

        // Find the player's account and token account in remaining_accounts
        let player_index = ctx
            .remaining_accounts
            .iter()
            .step_by(2) // Skip token accounts to only look at player accounts
            .position(|acc| acc.key() == player)
            .ok_or(WagerError::InvalidPlayer)?;

        // Get player and token account from remaining accounts
        let player_account = &ctx.remaining_accounts[player_index * 2];
        let player_token_account_info = &ctx.remaining_accounts[player_index * 2 + 1];
        let player_token_account = Account::<TokenAccount>::try_from(player_token_account_info)?;

        // Verify player token account constraints
        require!(
            player_token_account.owner == player_account.key(),
            WagerError::InvalidPlayerTokenAccount
        );

        // Verify token account mint
        require!(
            player_token_account.mint == TOKEN_ID,
            WagerError::InvalidTokenMint
        );

        // Get vault balance before transfer
        let vault_balance = ctx.accounts.vault_token_account.amount;
        msg!("Vault balance before transfer: {}", vault_balance);

        if earnings > 0 {
            // Transfer tokens from vault to player
            anchor_spl::token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx.accounts.vault_token_account.to_account_info(),
                        to: player_token_account_info.to_account_info(),
                        authority: ctx.accounts.vault.to_account_info(),
                    },
                    &[&[
                        b"vault",
                        session_id.as_bytes(),
                        &[ctx.accounts.game_session.vault_bump],
                    ]],
                ),
                earnings,
            )?;
        }
    }

    // Mark session as completed
    let game_session = &mut ctx.accounts.game_session;
    game_session.status = GameStatus::Completed;

    Ok(())
}

pub fn distribute_all_winnings_handler<'info>(
    ctx: Context<'_, '_, 'info, 'info, DistributeWinnings<'info>>,
    session_id: String,
    winning_team: u8,
) -> Result<()> {
    let game_session = &ctx.accounts.game_session;
    msg!("Starting distribution for session: {}", session_id);

    // Verify authority
    require!(
        game_session.authority == ctx.accounts.game_server.key(),
        WagerError::UnauthorizedDistribution
    );

    // Validate winning team selection
    require!(
        winning_team == 0 || winning_team == 1,
        WagerError::InvalidWinningTeam
    );

    let players_per_team = game_session.game_mode.players_per_team();

    // Get the winning team
    let winning_players = if winning_team == 0 {
        &game_session.team_a.players[0..players_per_team]
    } else {
        &game_session.team_b.players[0..players_per_team]
    };

    for player in winning_players {
        msg!("Winning player: {}", player);
    }

    // Get winner account and token account from remaining accounts
    require!(
        ctx.remaining_accounts.len() >= 2 * players_per_team,
        WagerError::InvalidRemainingAccounts
    );

    for i in 0..players_per_team {
        // Get winner and winner token account
        let winner = &ctx.remaining_accounts[i * 2];
        let winner_token_account_info = &ctx.remaining_accounts[i * 2 + 1];
        let winner_token_account = Account::<TokenAccount>::try_from(winner_token_account_info)?;

        // Verify winner constraints
        require!(
            winner_token_account.owner == winner.key(),
            WagerError::InvalidWinnerTokenAccount
        );

        // Verify token account mint
        require!(
            winner_token_account.mint == TOKEN_ID,
            WagerError::InvalidTokenMint
        );

        // Verify winner is actually in the winning team
        let winner_pubkey = winner.key();
        require!(
            winning_players
                .iter()
                .take(players_per_team)
                .any(|&p| p == winner_pubkey),
            WagerError::InvalidWinner
        );

        // Get vault balance before transfer
        let vault_balance = ctx.accounts.vault_token_account.amount;
        msg!("Vault balance before transfer: {}", vault_balance);

        // Calculate total pot (sum of both teams' bets)
        let total_pot = game_session.session_bet * players_per_team as u64 * 2;
        msg!("Total pot calculated: {}", total_pot);

        let winning_amount = game_session.session_bet * 2;
        msg!("Winning amount calculated: {}", winning_amount);

        // Transfer tokens from vault to winner
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: winner_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                &[&[
                    b"vault",
                    session_id.as_bytes(),
                    &[ctx.accounts.game_session.vault_bump],
                ]],
            ),
            winning_amount,
        )?;
    }

    // Mark session as completed
    let game_session = &mut ctx.accounts.game_session;
    game_session.status = GameStatus::Completed;

    Ok(())
}

#[derive(Accounts)]
#[instruction(session_id: String)]
pub struct DistributeWinnings<'info> {
    /// The game server authority that created the session
    pub game_server: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game_session", session_id.as_bytes()],
        bump = game_session.bump,
        constraint = game_session.authority == game_server.key() @ WagerError::UnauthorizedDistribution,
    )]
    pub game_session: Account<'info, GameSession>,

    /// CHECK: Vault PDA that holds the funds
    #[account(
        mut,
        seeds = [b"vault", session_id.as_bytes()],
        bump = game_session.vault_bump,
    )]
    pub vault: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = TOKEN_ID,
        associated_token::authority = vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
