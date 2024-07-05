use anchor_lang::prelude::*;
use anchor_lang::system_program;
declare_id!("3jTdr2xdnCvzPEehRwoNarvhxh2m5W7YJwyJBk4ts8ng");

#[program]
pub mod sol_donate {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CampaignPlatform>,
        name: String,
        description: String,
        target_donation: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;

        campaign.name = name;
        campaign.description = description;
        campaign.target_donation = target_donation;
        campaign.total_donation = 0;
        campaign.owner = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn donate(
        ctx: Context<Donate>,
        amount: u64
    ) -> Result<()>{
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer{
                from:ctx.accounts.user.to_account_info(),
                to:ctx.accounts.campaign.to_account_info(),
        });
        system_program::transfer(cpi_context,amount)?;

        let campaign = &mut ctx.accounts.campaign;
        campaign.total_donation += amount;

        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;

        if campaign.owner != *user.key {
            return Err(ErrorCode::InvalidOwner.into());
        }

        **campaign.to_account_info().try_borrow_mut_lamports()? -= campaign.total_donation;
        **user.to_account_info().try_borrow_mut_lamports()? += campaign.total_donation;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CampaignPlatform<'info>{
    #[account(
        init,
        seeds = [
            b"campaign".as_ref(),
            user.key.as_ref(),
        ],
        bump,
        payer = user,
        space = 9000
    )]
    pub campaign: Account<'info,Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user:Signer<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user:Signer<'info>,

    pub system_program: Program<'info, System>
}


#[account]
pub struct Campaign {
    pub name: String,
    pub description: String,
    pub target_donation: u64,
    pub total_donation: u64,
    pub owner: Pubkey,
}

#[error_code]
pub enum ErrorCode{
    #[msg("anda bukan pemilik campaign")]
    InvalidOwner
}
