use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer as SplTransfer};

pub fn transfer_spl_tokens<'info>(
    source: &Account<'info, TokenAccount>,
    destination: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    token_program: &Program<'info, token::Token>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = SplTransfer {
        from: source.to_account_info(),
        to: destination.to_account_info(),
        authority: authority.to_account_info(),
    };

    token::transfer(
        CpiContext::new(token_program.to_account_info(), cpi_accounts),
        amount,
    )?;

    Ok(())
}
